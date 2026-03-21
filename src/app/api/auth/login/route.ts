import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { compare } from 'bcryptjs';
import { sessionOptions, SessionData } from '@/lib/session';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return Response.json({ error: 'Email and password are required' }, { status: 400 });
  }

  // Find user by email
  const user = db.select().from(users).where(eq(users.email, email)).get();

  if (!user) {
    return Response.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  // Verify password
  const valid = await compare(password, user.password_hash);
  if (!valid) {
    return Response.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  // Create session
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  session.userId = user.id;
  session.email = user.email;
  session.name = user.name;
  session.isAdmin = user.is_admin === 1;
  session.jurisdiction = user.jurisdiction ?? 'FR';
  session.isLoggedIn = true;
  await session.save();

  return Response.json({
    isLoggedIn: true,
    userId: user.id,
    email: user.email,
    name: user.name,
    isAdmin: user.is_admin === 1,
    jurisdiction: user.jurisdiction,
    onboardingCompleted: user.onboarding_completed === 1,
    onboardingStepReached: user.onboarding_step_reached,
  });
}
