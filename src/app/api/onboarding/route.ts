import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { db } from '@/db';
import { users, user_charities } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  if (!session.isLoggedIn || !session.userId) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await request.json();
  const { step, country, charityIds } = body as {
    step: string;
    country?: string;
    charityIds?: string[];
  };

  const userId = session.userId;

  try {
    if (step === 'country' && country) {
      // Update user jurisdiction and advance step
      db.update(users)
        .set({
          jurisdiction: country,
          onboarding_step_reached: 2,
        })
        .where(eq(users.id, userId))
        .run();

      // Update session jurisdiction
      session.jurisdiction = country;
      await session.save();

      return Response.json({ success: true, step: 2 });
    }

    if (step === 'charities' && charityIds && charityIds.length > 0) {
      // Remove existing user_charities for this user
      db.delete(user_charities)
        .where(eq(user_charities.user_id, userId))
        .run();

      // Calculate equal allocation
      const allocationPct = Math.floor(100 / charityIds.length);

      // Insert new allocations
      const values = charityIds.map((charityId, index) => ({
        id: nanoid(),
        user_id: userId,
        charity_id: charityId,
        // Give the remainder to the last charity so it sums to 100
        allocation_pct:
          index === charityIds.length - 1
            ? 100 - allocationPct * (charityIds.length - 1)
            : allocationPct,
      }));

      db.insert(user_charities).values(values).run();

      // Advance step
      db.update(users)
        .set({ onboarding_step_reached: 3 })
        .where(eq(users.id, userId))
        .run();

      return Response.json({ success: true, step: 3 });
    }

    if (step === 'complete') {
      db.update(users)
        .set({
          onboarding_completed: 1,
          onboarding_step_reached: 4,
        })
        .where(eq(users.id, userId))
        .run();

      return Response.json({ success: true, step: 4 });
    }

    return Response.json({ error: 'Invalid step or missing data' }, { status: 400 });
  } catch (error) {
    console.error('Onboarding error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
