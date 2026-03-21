import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );

  if (!session.isLoggedIn || !session.userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .get();

  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  return Response.json({
    email: user.email,
    name: user.name,
    jurisdiction: user.jurisdiction ?? 'FR',
    createdAt: user.created_at,
    themePreference: user.theme_preference ?? 'dark',
    hapticEnabled: user.haptic_enabled === 1,
    referralCode: user.referral_code,
    userLevel: user.user_level ?? 1,
    debitFrequency: user.debit_frequency ?? 'weekly',
    onboardingCompleted: user.onboarding_completed === 1,
  });
}

export async function PUT(request: Request) {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );

  if (!session.isLoggedIn || !session.userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  // Map allowed fields
  if (body.themePreference !== undefined) {
    updates.theme_preference = body.themePreference;
  }
  if (body.hapticEnabled !== undefined) {
    updates.haptic_enabled = body.hapticEnabled ? 1 : 0;
  }
  if (body.debitFrequency !== undefined) {
    updates.debit_frequency = body.debitFrequency;
  }
  if (body.onboardingCompleted !== undefined) {
    updates.onboarding_completed = body.onboardingCompleted ? 1 : 0;
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  db.update(users)
    .set(updates)
    .where(eq(users.id, session.userId))
    .run();

  return Response.json({ ok: true });
}
