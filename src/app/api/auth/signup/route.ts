import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { hash } from 'bcryptjs';
import { nanoid } from 'nanoid';
import { sessionOptions, SessionData } from '@/lib/session';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  const { email, password, name } = await request.json();

  if (!email || !password || !name) {
    return Response.json({ error: 'Email, password, and name are required' }, { status: 400 });
  }

  if (password.length < 8) {
    return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  // Check email uniqueness
  const existing = db.select().from(users).where(eq(users.email, email)).get();
  if (existing) {
    return Response.json({ error: 'An account with this email already exists' }, { status: 409 });
  }

  // Hash password and create user
  const passwordHash = await hash(password, 12);
  const userId = nanoid();
  const referralCode = nanoid(8).toUpperCase();

  db.insert(users).values({
    id: userId,
    email,
    password_hash: passwordHash,
    name,
    referral_code: referralCode,
    jurisdiction: 'FR',
    income_bracket: 0,
    debit_frequency: 'weekly',
    onboarding_completed: 0,
    onboarding_step_reached: 0,
    is_admin: 0,
    user_level: 1,
    theme_preference: 'dark',
    haptic_enabled: 1,
    created_at: new Date().toISOString(),
  }).run();

  // Create session
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  session.userId = userId;
  session.email = email;
  session.name = name;
  session.isAdmin = false;
  session.jurisdiction = 'FR';
  session.isLoggedIn = true;
  await session.save();

  return Response.json({
    isLoggedIn: true,
    userId,
    email,
    name,
    isAdmin: false,
    jurisdiction: 'FR',
    onboardingCompleted: false,
    onboardingStepReached: 0,
    referralCode,
  });
}
