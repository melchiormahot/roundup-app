import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { db } from '@/db';
import { users, simulation_state, user_charities, charities } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { createNotificationForce } from '@/lib/notifications';
import {
  type SimulationSummary,
  simulateDays,
  resetSimulationData,
  CRISIS_TEMPLATES,
  DEMO_PROFILES,
} from '@/lib/simulation';

// ─── POST handler ───────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );

  if (!session.isLoggedIn || !session.userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { action, profile, notificationStyle } = body;
  const userId = session.userId;

  // Get or create simulation state
  let simState = db
    .select()
    .from(simulation_state)
    .where(eq(simulation_state.user_id, userId))
    .get();

  if (!simState) {
    const user = db
      .select({ createdAt: users.created_at })
      .from(users)
      .where(eq(users.id, userId))
      .get();

    const startDate = user?.createdAt
      ? user.createdAt.split('T')[0]
      : new Date().toISOString().split('T')[0];

    db.insert(simulation_state)
      .values({
        id: nanoid(),
        user_id: userId,
        current_date: startDate,
        day_count: 0,
        notification_style: 'warm',
      })
      .run();

    simState = db
      .select()
      .from(simulation_state)
      .where(eq(simulation_state.user_id, userId))
      .get();
  }

  const currentDate = simState?.current_date ?? new Date().toISOString().split('T')[0];
  const currentDayCount = simState?.day_count ?? 0;
  const style = (simState?.notification_style ?? 'warm') as 'factual' | 'warm' | 'motivational';

  // Ensure user has charities before simulating
  function ensureUserHasCharities(count = 3) {
    const existing = db.select().from(user_charities).where(eq(user_charities.user_id, userId)).all();
    if (existing.length > 0) return;
    const userRow = db.select({ jurisdiction: users.jurisdiction }).from(users).where(eq(users.id, userId)).get();
    const jurisdiction = userRow?.jurisdiction || 'FR';
    const allCharities = db.select().from(charities).all();
    const available = allCharities.filter((c) => {
      const dc = JSON.parse(c.display_countries || '[]');
      return dc.includes(jurisdiction);
    });
    const toAssign = available.slice(0, count);
    const pctEach = Math.floor(100 / toAssign.length);
    toAssign.forEach((c, i) => {
      db.insert(user_charities).values({
        id: nanoid(),
        user_id: userId,
        charity_id: c.id,
        allocation_pct: i === toAssign.length - 1 ? 100 - pctEach * (toAssign.length - 1) : pctEach,
      }).run();
    });
  }

  switch (action) {
    // ─── Simulate One Day ─────────────────────────────────────────────────────
    case 'day': {
      ensureUserHasCharities();
      const summary = simulateDays({
        userId,
        daysToSimulate: 1,
        startDate: currentDate,
        startDayCount: currentDayCount,
        notificationStyle: style,
      });

      return Response.json({ success: true, summary });
    }

    // ─── Simulate One Week ────────────────────────────────────────────────────
    case 'week': {
      ensureUserHasCharities();
      const summary = simulateDays({
        userId,
        daysToSimulate: 7,
        startDate: currentDate,
        startDayCount: currentDayCount,
        notificationStyle: style,
      });

      return Response.json({ success: true, summary });
    }

    // ─── Simulate One Month ───────────────────────────────────────────────────
    case 'month': {
      ensureUserHasCharities();
      const summary = simulateDays({
        userId,
        daysToSimulate: 30,
        startDate: currentDate,
        startDayCount: currentDayCount,
        notificationStyle: style,
      });

      return Response.json({ success: true, summary });
    }

    // ─── Simulate to Year End ─────────────────────────────────────────────────
    case 'year-end': {
      ensureUserHasCharities();
      // Calculate days remaining until Dec 31 of the current sim year
      const simYear = new Date(currentDate).getFullYear();
      const dec31 = `${simYear}-12-31`;
      const currentDateObj = new Date(currentDate);
      const endDateObj = new Date(dec31);
      const daysRemaining = Math.max(
        1,
        Math.ceil((endDateObj.getTime() - currentDateObj.getTime()) / (1000 * 60 * 60 * 24)),
      );

      const summary = simulateDays({
        userId,
        daysToSimulate: daysRemaining,
        startDate: currentDate,
        startDayCount: currentDayCount,
        notificationStyle: style,
      });

      return Response.json({ success: true, summary });
    }

    // ─── Reset Simulation ─────────────────────────────────────────────────────
    case 'reset': {
      resetSimulationData(userId);

      const summary: SimulationSummary = {
        daysSimulated: 0,
        transactionsGenerated: 0,
        totalRoundups: 0,
        notificationsCreated: 0,
        debitsProcessed: 0,
        newLevel: null,
        milestonesReached: [],
      };

      return Response.json({ success: true, summary });
    }

    // ─── Crisis Event ─────────────────────────────────────────────────────────
    case 'crisis': {
      const crisis = CRISIS_TEMPLATES[
        Math.floor(Math.random() * CRISIS_TEMPLATES.length)
      ];

      createNotificationForce(
        userId,
        'crisis',
        crisis.title,
        crisis.body,
      );

      const summary: SimulationSummary = {
        daysSimulated: 0,
        transactionsGenerated: 0,
        totalRoundups: 0,
        notificationsCreated: 1,
        debitsProcessed: 0,
        newLevel: null,
        milestonesReached: [],
      };

      return Response.json({ success: true, summary });
    }

    // ─── Load Demo Profile ────────────────────────────────────────────────────
    case 'profile': {
      if (!profile || !DEMO_PROFILES[profile]) {
        return Response.json({ error: 'Invalid profile. Use: sophie, thomas, marie' }, { status: 400 });
      }

      const p = DEMO_PROFILES[profile];

      // Reset all data first
      resetSimulationData(userId);

      // Ensure user has charities assigned (needed for allocation)
      ensureUserHasCharities(p.charityCount);

      // Get user created_at for the start date
      const user = db
        .select({ createdAt: users.created_at })
        .from(users)
        .where(eq(users.id, userId))
        .get();

      const startDate = user?.createdAt
        ? user.createdAt.split('T')[0]
        : new Date().toISOString().split('T')[0];

      // Update simulation state to start from user creation
      db.update(simulation_state)
        .set({ current_date: startDate, day_count: 0 })
        .where(eq(simulation_state.user_id, userId))
        .run();

      // Simulate the profile's days
      const summary = simulateDays({
        userId,
        daysToSimulate: p.daysActive,
        startDate,
        startDayCount: 0,
        notificationStyle: style,
        txMin: p.txPerDayMin,
        txMax: p.txPerDayMax,
        amountMultiplier: p.amountMultiplier,
      });

      return Response.json({ success: true, profile: p.name, summary });
    }

    // ─── Set Notification Style ───────────────────────────────────────────────
    case 'notification-style': {
      if (
        !notificationStyle ||
        !['factual', 'warm', 'motivational'].includes(notificationStyle)
      ) {
        return Response.json(
          { error: 'Invalid notification style. Use: factual, warm, motivational' },
          { status: 400 },
        );
      }

      db.update(simulation_state)
        .set({ notification_style: notificationStyle })
        .where(eq(simulation_state.user_id, userId))
        .run();

      return Response.json({
        success: true,
        summary: {
          daysSimulated: 0,
          transactionsGenerated: 0,
          totalRoundups: 0,
          notificationsCreated: 0,
          debitsProcessed: 0,
          newLevel: null,
          milestonesReached: [],
        },
      });
    }

    // ─── Unknown Action ───────────────────────────────────────────────────────
    default:
      return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
}
