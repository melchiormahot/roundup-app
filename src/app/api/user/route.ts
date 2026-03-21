import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/session";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, session.userId!),
  }).sync();

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      jurisdiction: user.jurisdiction,
      incomeBracket: user.incomeBracket,
      debitFrequency: user.debitFrequency,
      onboardingCompleted: user.onboardingCompleted,
      referralCode: user.referralCode,
      createdAt: user.createdAt,
    },
  });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const allowed: Record<string, unknown> = {};
  if (body.jurisdiction !== undefined) allowed.jurisdiction = body.jurisdiction;
  if (body.incomeBracket !== undefined) allowed.incomeBracket = body.incomeBracket;
  if (body.debitFrequency !== undefined) allowed.debitFrequency = body.debitFrequency;
  if (body.onboardingCompleted !== undefined) allowed.onboardingCompleted = body.onboardingCompleted;

  if (Object.keys(allowed).length > 0) {
    db.update(users).set(allowed).where(eq(users.id, session.userId)).run();
  }

  return NextResponse.json({ success: true });
}
