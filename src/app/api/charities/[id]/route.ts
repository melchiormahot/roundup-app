import { NextResponse } from "next/server";
import { db } from "@/db";
import { userCharities } from "@/db/schema";
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

  return NextResponse.json({
    charity: { ...charity, impact: JSON.parse(charity.impact) },
    allocation: allocation?.allocationPct ?? 0,
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
