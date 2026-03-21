import { NextResponse } from "next/server";
import { db } from "@/db";
import { getSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { roundups, userCharities, charities } from "@/db/schema";
import { getJurisdiction, calculateDeduction, isCharityEligible } from "@/lib/tax-engine";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.userId;
  const user = db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, userId) }).sync();
  const jurisdiction = user?.jurisdiction || "FR";
  const bracket = user?.incomeBracket || 0;
  const config = getJurisdiction(jurisdiction);

  // YTD roundups
  const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString();
  const allRoundups = db
    .select()
    .from(roundups)
    .where(eq(roundups.userId, userId))
    .all()
    .filter((r) => r.timestamp >= yearStart);

  const ytdTotal = allRoundups.reduce((sum, r) => sum + r.roundupAmount, 0);

  // Allocations
  const allocData = db
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

  const totalPct = allocData.reduce((s, a) => s + a.allocationPct, 0);

  // Split donations by rate tier (for France: 75% vs 66%; for others: flat)
  let enhancedTotal = 0;
  let standardTotal = 0;

  const charityDetails = allocData.map((a) => {
    const donated = totalPct > 0 ? +(ytdTotal * (a.allocationPct / totalPct)).toFixed(2) : 0;
    const eligible = isCharityEligible(a.charityName, jurisdiction);
    if (a.taxRate === 75 && jurisdiction === "FR") {
      enhancedTotal += donated;
    } else {
      standardTotal += donated;
    }
    return { ...a, donated, eligible };
  });

  // For non-FR jurisdictions, all donations go through the same rate
  if (jurisdiction !== "FR") {
    enhancedTotal = 0;
    standardTotal = ytdTotal;
  }

  const taxResult = calculateDeduction(ytdTotal, enhancedTotal, standardTotal, jurisdiction, bracket);

  // Year-end projection
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86400000
  );
  const projectedTotal = dayOfYear > 0 ? +((ytdTotal / dayOfYear) * 365).toFixed(2) : 0;
  const projectedResult = calculateDeduction(projectedTotal, projectedTotal * (enhancedTotal / Math.max(ytdTotal, 1)), projectedTotal * (standardTotal / Math.max(ytdTotal, 1)), jurisdiction, bracket);

  return NextResponse.json({
    totalTaxSaving: taxResult.totalSaving,
    tiers: taxResult.tiers,
    effectiveCostPer10: taxResult.effectiveCostPer10,
    charities: charityDetails,
    projection: {
      projectedTotal,
      projectedTaxSaving: projectedResult.totalSaving,
      roomToGive: jurisdiction === "FR" ? Math.max(0, +(2000 - enhancedTotal).toFixed(2)) : null,
    },
    jurisdiction: {
      code: config.code,
      name: config.name,
      currency: config.currency,
      currencySymbol: config.currencySymbol,
      taxLabels: config.taxLabels,
      receiptLabel: config.receiptLabel,
      ceilingNote: config.ceilingNote,
      carryForward: config.carryForward,
    },
    user: {
      jurisdiction,
      incomeBracket: bracket,
      bracketLabel: config.brackets[bracket]?.label || "",
      debitFrequency: user?.debitFrequency || "weekly",
    },
  });
}
