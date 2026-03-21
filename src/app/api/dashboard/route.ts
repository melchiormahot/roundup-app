import { NextResponse } from "next/server";
import { db } from "@/db";
import { getSession } from "@/lib/session";
import { eq, and, gte, desc } from "drizzle-orm";
import { roundups, userCharities, charities } from "@/db/schema";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.userId;

  // All roundups for this user
  const allRoundups = db
    .select()
    .from(roundups)
    .where(eq(roundups.userId, userId))
    .orderBy(desc(roundups.timestamp))
    .all();

  // Year to date total
  const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString();
  const ytdRoundups = allRoundups.filter((r) => r.timestamp >= yearStart);
  const ytdTotal = ytdRoundups.reduce((sum, r) => sum + r.roundupAmount, 0);

  // This week
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekRoundups = allRoundups.filter((r) => r.timestamp >= weekStart.toISOString());
  const weekTotal = weekRoundups.reduce((sum, r) => sum + r.roundupAmount, 0);

  // Next Monday for debit
  const nextMonday = new Date();
  nextMonday.setDate(nextMonday.getDate() + ((8 - nextMonday.getDay()) % 7 || 7));

  // User charity allocations
  const allocations = db
    .select({
      charityName: charities.name,
      charityIcon: charities.icon,
      charityId: charities.id,
      allocationPct: userCharities.allocationPct,
      taxRate: charities.taxRate,
    })
    .from(userCharities)
    .innerJoin(charities, eq(userCharities.charityId, charities.id))
    .where(eq(userCharities.userId, userId))
    .all();

  const charityAllocations = allocations.map((a) => ({
    ...a,
    amountDonated: +(ytdTotal * (a.allocationPct / 100)).toFixed(2),
  }));

  // Tax info
  const taxRules = db.query.jurisdictionTaxRules.findFirst({
    where: (t, { eq }) => eq(t.countryCode, "FR"),
  }).sync();

  const enhancedTotal = charityAllocations
    .filter((a) => a.taxRate === 75)
    .reduce((sum, a) => sum + a.amountDonated, 0);
  const standardTotal = charityAllocations
    .filter((a) => a.taxRate === 66)
    .reduce((sum, a) => sum + a.amountDonated, 0);

  const enhancedCeiling = taxRules?.enhancedCeiling || 2000;
  const taxSaving =
    Math.min(enhancedTotal, enhancedCeiling) * 0.75 +
    standardTotal * 0.66;

  // Last week total for delta
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekRoundups = allRoundups.filter(
    (r) => r.timestamp >= lastWeekStart.toISOString() && r.timestamp < weekStart.toISOString()
  );
  const lastWeekTotal = lastWeekRoundups.reduce((sum, r) => sum + r.roundupAmount, 0);
  const weekDelta = +(weekTotal - lastWeekTotal).toFixed(2);

  // Daily breakdown for sparkline (7 days)
  const dailyTotals: number[] = [];
  for (let d = 6; d >= 0; d--) {
    const dayStart = new Date(weekStart);
    dayStart.setDate(weekStart.getDate() + (6 - d) - 6 + new Date().getDay());
    const start = new Date();
    start.setDate(start.getDate() - d);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const dayTotal = allRoundups
      .filter((r) => r.timestamp >= start.toISOString() && r.timestamp < end.toISOString())
      .reduce((sum, r) => sum + r.roundupAmount, 0);
    dailyTotals.push(+dayTotal.toFixed(2));
  }

  // Giving streak (consecutive weeks with roundups)
  let streak = 0;
  const checkDate = new Date();
  while (true) {
    const wkStart = new Date(checkDate);
    wkStart.setDate(wkStart.getDate() - wkStart.getDay() - streak * 7);
    wkStart.setHours(0, 0, 0, 0);
    const wkEnd = new Date(wkStart);
    wkEnd.setDate(wkEnd.getDate() + 7);
    const hasRoundups = allRoundups.some(
      (r) => r.timestamp >= wkStart.toISOString() && r.timestamp < wkEnd.toISOString()
    );
    if (hasRoundups) {
      streak++;
    } else {
      break;
    }
    if (streak > 52) break;
  }

  // Impact statement based on top charity
  const topCharity = charityAllocations.sort((a, b) => b.amountDonated - a.amountDonated)[0];
  const impactStatements: Record<string, string> = {
    "Médecins Sans Frontières": `Your €${topCharity?.amountDonated.toFixed(0) || 0} to MSF helped fund ${Math.max(1, Math.floor((topCharity?.amountDonated || 0) / 15))} emergency medical kits`,
    "WWF France": `Your €${topCharity?.amountDonated.toFixed(0) || 0} to WWF helped protect ${Math.max(1, Math.floor((topCharity?.amountDonated || 0) / 5))} hectares of marine habitat`,
    "Ligue contre le cancer": `Your €${topCharity?.amountDonated.toFixed(0) || 0} contributed to cancer research funding this year`,
    "Restos du Cœur": `Your €${topCharity?.amountDonated.toFixed(0) || 0} to Restos du Cœur helped provide ${Math.max(1, Math.floor((topCharity?.amountDonated || 0) / 0.8))} meals`,
    "Amnesty International": `Your €${topCharity?.amountDonated.toFixed(0) || 0} supported human rights investigations worldwide`,
    "Secours Populaire": `Your €${topCharity?.amountDonated.toFixed(0) || 0} to Secours Populaire helped ${Math.max(1, Math.floor((topCharity?.amountDonated || 0) / 10))} people access essential support`,
  };
  const impactStatement = topCharity ? (impactStatements[topCharity.charityName] || `Your donations are making a difference`) : null;

  // Check if user donates to Restos du Coeur (for Coluche story card)
  const donatesToRestos = charityAllocations.some((a) => a.charityName === "Restos du Cœur" && a.amountDonated > 0);

  return NextResponse.json({
    userName: session.name,
    donatesToRestos,
    ytdTotal: +ytdTotal.toFixed(2),
    taxSaving: +taxSaving.toFixed(2),
    enhancedCeiling,
    enhancedTotal: +enhancedTotal.toFixed(2),
    weekRoundupCount: weekRoundups.length,
    weekTotal: +weekTotal.toFixed(2),
    weekDelta,
    dailyTotals,
    givingStreak: streak,
    impactStatement,
    nextDebitDate: nextMonday.toISOString().split("T")[0],
    weekTransactions: weekRoundups.slice(0, 10).map((r) => ({
      id: r.id,
      merchant: r.merchantName,
      purchase: r.purchaseAmount,
      roundup: r.roundupAmount,
      time: r.timestamp,
    })),
    charityAllocations,
  });
}
