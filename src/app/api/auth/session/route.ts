import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  if (!session.isLoggedIn || !session.userId) {
    return Response.json({ isLoggedIn: false });
  }

  // Fetch fresh user data from DB
  const user = db.select().from(users).where(eq(users.id, session.userId)).get();

  if (!user) {
    return Response.json({ isLoggedIn: false });
  }

  return Response.json({
    isLoggedIn: true,
    userId: user.id,
    email: user.email,
    name: user.name,
    isAdmin: user.is_admin === 1,
    jurisdiction: user.jurisdiction,
    incomeBracket: user.income_bracket,
    userLevel: user.user_level,
    onboardingCompleted: user.onboarding_completed === 1,
    onboardingStepReached: user.onboarding_step_reached,
    themePreference: user.theme_preference,
    hapticEnabled: user.haptic_enabled === 1,
    referralCode: user.referral_code,
    totalDonated: 0, // Will be calculated from roundups
    createdAt: user.created_at,
  });
}
