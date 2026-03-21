import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { db } from '@/db';
import { users, roundups, simulation_state, notifications } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MERCHANTS = [
  { name: 'Monoprix', category: 'groceries' },
  { name: 'Carrefour', category: 'groceries' },
  { name: 'SNCF', category: 'transport' },
  { name: 'Uber', category: 'transport' },
  { name: 'Netflix', category: 'entertainment' },
  { name: 'Spotify', category: 'entertainment' },
  { name: 'Boulangerie Saint Honore', category: 'food' },
  { name: 'Pharmacie Lafayette', category: 'health' },
  { name: 'Fnac', category: 'shopping' },
  { name: 'Zara', category: 'shopping' },
  { name: 'Total Energies', category: 'utilities' },
  { name: 'Cafe de Flore', category: 'food' },
];

function randomRoundup() {
  const merchant = MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];
  return {
    amount: +(Math.random() * 0.99 + 0.01).toFixed(2),
    merchant_name: merchant.name,
    category: merchant.category,
  };
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// ─── Demo profiles ──────────────────────────────────────────────────────────

const PROFILES: Record<string, { avgPerDay: number; daysActive: number }> = {
  sophie: { avgPerDay: 3, daysActive: 120 },
  thomas: { avgPerDay: 5, daysActive: 45 },
  marie: { avgPerDay: 2, daysActive: 300 },
};

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
    const today = new Date().toISOString().split('T')[0];
    db.insert(simulation_state)
      .values({
        id: nanoid(),
        user_id: userId,
        current_date: today,
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

  switch (action) {
    case 'day': {
      const newDate = addDays(currentDate, 1);
      const txCount = Math.floor(Math.random() * 4) + 1;
      for (let i = 0; i < txCount; i++) {
        const r = randomRoundup();
        db.insert(roundups)
          .values({
            id: nanoid(),
            user_id: userId,
            amount: r.amount,
            merchant_name: r.merchant_name,
            category: r.category,
            timestamp: `${newDate}T${String(8 + i * 3).padStart(2, '0')}:00:00Z`,
          })
          .run();
      }
      db.update(simulation_state)
        .set({ current_date: newDate, day_count: currentDayCount + 1 })
        .where(eq(simulation_state.user_id, userId))
        .run();
      return Response.json({ ok: true, date: newDate, transactions: txCount });
    }

    case 'week': {
      let totalTx = 0;
      let date = currentDate;
      for (let d = 0; d < 7; d++) {
        date = addDays(date, 1);
        const txCount = Math.floor(Math.random() * 4) + 1;
        totalTx += txCount;
        for (let i = 0; i < txCount; i++) {
          const r = randomRoundup();
          db.insert(roundups)
            .values({
              id: nanoid(),
              user_id: userId,
              amount: r.amount,
              merchant_name: r.merchant_name,
              category: r.category,
              timestamp: `${date}T${String(8 + i * 3).padStart(2, '0')}:00:00Z`,
            })
            .run();
        }
      }
      db.update(simulation_state)
        .set({ current_date: date, day_count: currentDayCount + 7 })
        .where(eq(simulation_state.user_id, userId))
        .run();
      return Response.json({ ok: true, date, transactions: totalTx });
    }

    case 'month': {
      let totalTx = 0;
      let date = currentDate;
      for (let d = 0; d < 30; d++) {
        date = addDays(date, 1);
        const txCount = Math.floor(Math.random() * 5) + 1;
        totalTx += txCount;
        for (let i = 0; i < txCount; i++) {
          const r = randomRoundup();
          db.insert(roundups)
            .values({
              id: nanoid(),
              user_id: userId,
              amount: r.amount,
              merchant_name: r.merchant_name,
              category: r.category,
              timestamp: `${date}T${String(8 + i * 3).padStart(2, '0')}:00:00Z`,
            })
            .run();
        }
      }
      db.update(simulation_state)
        .set({ current_date: date, day_count: currentDayCount + 30 })
        .where(eq(simulation_state.user_id, userId))
        .run();
      return Response.json({ ok: true, date, transactions: totalTx });
    }

    case 'year-end': {
      let totalTx = 0;
      let date = currentDate;
      const daysLeft = Math.max(1, 365 - currentDayCount);
      for (let d = 0; d < daysLeft; d++) {
        date = addDays(date, 1);
        const txCount = Math.floor(Math.random() * 4) + 1;
        totalTx += txCount;
        for (let i = 0; i < txCount; i++) {
          const r = randomRoundup();
          db.insert(roundups)
            .values({
              id: nanoid(),
              user_id: userId,
              amount: r.amount,
              merchant_name: r.merchant_name,
              category: r.category,
              timestamp: `${date}T${String(8 + i * 3).padStart(2, '0')}:00:00Z`,
            })
            .run();
        }
      }
      db.update(simulation_state)
        .set({ current_date: date, day_count: currentDayCount + daysLeft })
        .where(eq(simulation_state.user_id, userId))
        .run();
      return Response.json({ ok: true, date, transactions: totalTx, daysSimulated: daysLeft });
    }

    case 'reset': {
      // Delete all roundups for this user
      db.delete(roundups).where(eq(roundups.user_id, userId)).run();
      // Reset simulation state
      const today = new Date().toISOString().split('T')[0];
      db.update(simulation_state)
        .set({ current_date: today, day_count: 0 })
        .where(eq(simulation_state.user_id, userId))
        .run();
      // Reset user level
      db.update(users)
        .set({ user_level: 1 })
        .where(eq(users.id, userId))
        .run();
      return Response.json({ ok: true, message: 'Data reset' });
    }

    case 'crisis': {
      db.insert(notifications)
        .values({
          id: nanoid(),
          user_id: userId,
          type: 'crisis',
          title: 'Emergency Response Needed',
          body: 'A humanitarian crisis has been declared. Your chosen charities are mobilizing resources. Consider increasing your round ups this week.',
          read: 0,
          created_at: new Date().toISOString(),
        })
        .run();
      return Response.json({ ok: true, message: 'Crisis event triggered' });
    }

    case 'profile': {
      if (!profile || !PROFILES[profile]) {
        return Response.json({ error: 'Invalid profile' }, { status: 400 });
      }
      const p = PROFILES[profile];
      // Reset first
      db.delete(roundups).where(eq(roundups.user_id, userId)).run();
      const startDate = new Date().toISOString().split('T')[0];
      let date = startDate;
      let totalTx = 0;
      for (let d = 0; d < p.daysActive; d++) {
        date = addDays(date, 1);
        const txCount = Math.max(1, Math.floor(Math.random() * p.avgPerDay) + 1);
        totalTx += txCount;
        for (let i = 0; i < txCount; i++) {
          const r = randomRoundup();
          db.insert(roundups)
            .values({
              id: nanoid(),
              user_id: userId,
              amount: r.amount,
              merchant_name: r.merchant_name,
              category: r.category,
              timestamp: `${date}T${String(8 + i * 3).padStart(2, '0')}:00:00Z`,
            })
            .run();
        }
      }
      db.update(simulation_state)
        .set({ current_date: date, day_count: p.daysActive })
        .where(eq(simulation_state.user_id, userId))
        .run();
      return Response.json({ ok: true, profile, transactions: totalTx, daysSimulated: p.daysActive });
    }

    case 'notification-style': {
      if (!notificationStyle || !['factual', 'warm', 'motivational'].includes(notificationStyle)) {
        return Response.json({ error: 'Invalid notification style' }, { status: 400 });
      }
      db.update(simulation_state)
        .set({ notification_style: notificationStyle })
        .where(eq(simulation_state.user_id, userId))
        .run();
      return Response.json({ ok: true, notificationStyle });
    }

    default:
      return Response.json({ error: 'Unknown action' }, { status: 400 });
  }
}
