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

  return NextResponse.json({
    userName: session.name,
    ytdTotal: +ytdTotal.toFixed(2),
    taxSaving: +taxSaving.toFixed(2),
    enhancedCeiling,
    enhancedTotal: +enhancedTotal.toFixed(2),
    weekRoundupCount: weekRoundups.length,
    weekTotal: +weekTotal.toFixed(2),
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
