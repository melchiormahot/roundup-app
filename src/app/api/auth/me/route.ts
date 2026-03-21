import { NextResponse } from "next/server";
import { db } from "@/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, session.userId!),
  }).sync();

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
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
