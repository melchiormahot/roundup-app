import { NextResponse } from "next/server";
import { db } from "@/db";
import { userCharities, roundups, charities as charitiesTable } from "@/db/schema";
import { getSession } from "@/lib/session";
import { eq, and } from "drizzle-orm";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const charity = db.query.charities.findFirst({
    where: (c, { eq }) => eq(c.id, id),
  }).sync();

  if (!charity) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const session = await getSession();
  let allocation = null;
  if (session.isLoggedIn && session.userId) {
    allocation = db.query.userCharities.findFirst({
      where: (uc, { eq: e, and: a }) => a(e(uc.userId, session.userId!), e(uc.charityId, id)),
    }).sync();
  }

  // Calculate donated amount for impact calculator
  let donatedAmount = 0;
  if (session.isLoggedIn && session.userId && allocation) {
    const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString();
    const allRoundups = db.select().from(roundups).where(eq(roundups.userId, session.userId)).all().filter(r => r.timestamp >= yearStart);
    const ytdTotal = allRoundups.reduce((s, r) => s + r.roundupAmount, 0);

    const allAllocs = db.select().from(userCharities).where(eq(userCharities.userId, session.userId)).all();
    const totalPct = allAllocs.reduce((s, a) => s + a.allocationPct, 0);
    donatedAmount = totalPct > 0 ? +(ytdTotal * (allocation.allocationPct / totalPct)).toFixed(2) : 0;
  }

  return NextResponse.json({
    charity: {
      ...charity,
      impact: JSON.parse(charity.impact),
      howMoneyHelps: charity.howMoneyHelps ? JSON.parse(charity.howMoneyHelps) : [],
      milestones: charity.milestones ? JSON.parse(charity.milestones) : [],
      financialBreakdown: charity.financialBreakdown ? JSON.parse(charity.financialBreakdown) : null,
      certifications: charity.certifications ? JSON.parse(charity.certifications) : [],
      jurisdictionsEligible: charity.jurisdictionsEligible ? JSON.parse(charity.jurisdictionsEligible) : [],
    },
    allocation: allocation?.allocationPct ?? 0,
    donatedAmount,
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allocationPct } = await req.json();

  const existing = db.query.userCharities.findFirst({
    where: (uc, { eq: e, and: a }) => a(e(uc.userId, session.userId!), e(uc.charityId, id)),
  }).sync();

  if (existing) {
    db.update(userCharities)
      .set({ allocationPct })
      .where(and(eq(userCharities.userId, session.userId), eq(userCharities.charityId, id)))
      .run();
  }

  return NextResponse.json({ success: true });
}
