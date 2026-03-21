import { NextResponse } from "next/server";
import { db } from "@/db";
import { getSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { roundups, userCharities, charities, users } from "@/db/schema";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.userId;
  const user = db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, userId) }).sync();
  const taxRules = db.query.jurisdictionTaxRules.findFirst({
    where: (t, { eq }) => eq(t.countryCode, user?.jurisdiction || "FR"),
  }).sync();

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

  const enhancedCeiling = taxRules?.enhancedCeiling || 2000;

  // Split by rate
  const rate75 = allocData
    .filter((a) => a.taxRate === 75)
    .map((a) => ({
      ...a,
      donated: +(ytdTotal * (a.allocationPct / 100)).toFixed(2),
    }));

  const rate66 = allocData
    .filter((a) => a.taxRate === 66)
    .map((a) => ({
      ...a,
      donated: +(ytdTotal * (a.allocationPct / 100)).toFixed(2),
    }));

  const total75 = rate75.reduce((s, a) => s + a.donated, 0);
  const total66 = rate66.reduce((s, a) => s + a.donated, 0);

  const taxSaving75 = Math.min(total75, enhancedCeiling) * 0.75;
  const taxSaving66 = total66 * 0.66;
  const totalTaxSaving = +(taxSaving75 + taxSaving66).toFixed(2);

  // Year-end projection (linear)
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86400000
  );
  const projectedTotal = dayOfYear > 0 ? +((ytdTotal / dayOfYear) * 365).toFixed(2) : 0;
  const projectedTaxSaving = +((totalTaxSaving / dayOfYear) * 365).toFixed(2) || 0;
  const roomToGive = Math.max(0, +(enhancedCeiling - total75).toFixed(2));

  return NextResponse.json({
    totalTaxSaving,
    rate75: {
      charities: rate75,
      totalDonated: +total75.toFixed(2),
      taxSaving: +taxSaving75.toFixed(2),
      ceiling: enhancedCeiling,
    },
    rate66: {
      charities: rate66,
      totalDonated: +total66.toFixed(2),
      taxSaving: +taxSaving66.toFixed(2),
    },
    projection: {
      projectedTotal,
      projectedTaxSaving,
      roomToGive,
    },
    user: {
      jurisdiction: user?.jurisdiction || "FR",
      incomeBracket: user?.incomeBracket || 0,
      debitFrequency: user?.debitFrequency || "weekly",
    },
  });
}
