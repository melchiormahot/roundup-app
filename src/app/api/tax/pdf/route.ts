import { NextResponse } from "next/server";
import { db } from "@/db";
import { getSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { roundups, userCharities, charities } from "@/db/schema";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "summary";
  const userId = session.userId;

  const user = db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, userId) }).sync();
  const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString();

  const allRoundups = db
    .select()
    .from(roundups)
    .where(eq(roundups.userId, userId))
    .all()
    .filter((r) => r.timestamp >= yearStart);

  const ytdTotal = allRoundups.reduce((sum, r) => sum + r.roundupAmount, 0);

  const allocData = db
    .select({
      charityName: charities.name,
      allocationPct: userCharities.allocationPct,
      taxRate: charities.taxRate,
    })
    .from(userCharities)
    .innerJoin(charities, eq(userCharities.charityId, charities.id))
    .where(eq(userCharities.userId, userId))
    .all();

  // Generate PDF data (JSON for client-side rendering with @react-pdf/renderer)
  const charityBreakdown = allocData.map((a) => ({
    name: a.charityName,
    percentage: a.allocationPct,
    donated: +(ytdTotal * (a.allocationPct / 100)).toFixed(2),
    taxRate: a.taxRate,
    taxCredit: +(ytdTotal * (a.allocationPct / 100) * (a.taxRate / 100)).toFixed(2),
  }));

  // Monthly breakdown
  const months: Record<string, number> = {};
  for (let m = 0; m < 12; m++) {
    const monthName = new Date(2026, m).toLocaleString("en", { month: "long" });
    months[monthName] = 0;
  }
  allRoundups.forEach((r) => {
    const monthName = new Date(r.timestamp).toLocaleString("en", { month: "long" });
    months[monthName] = +(months[monthName] + r.roundupAmount).toFixed(2);
  });

  const total75 = charityBreakdown.filter((c) => c.taxRate === 75).reduce((s, c) => s + c.donated, 0);
  const total66 = charityBreakdown.filter((c) => c.taxRate === 66).reduce((s, c) => s + c.donated, 0);

  return NextResponse.json({
    type,
    userName: user?.name || "User",
    userEmail: user?.email || "",
    jurisdiction: user?.jurisdiction || "FR",
    year: new Date().getFullYear(),
    totalDonated: +ytdTotal.toFixed(2),
    totalTaxCredit: +(Math.min(total75, 2000) * 0.75 + total66 * 0.66).toFixed(2),
    charityBreakdown,
    monthlyBreakdown: Object.entries(months)
      .filter(([, v]) => v > 0)
      .map(([month, amount]) => ({ month, amount })),
    rate75: { total: +total75.toFixed(2), ceiling: 2000, taxCredit: +(Math.min(total75, 2000) * 0.75).toFixed(2) },
    rate66: { total: +total66.toFixed(2), taxCredit: +(total66 * 0.66).toFixed(2) },
  });
}
