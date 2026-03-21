import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { db } from '@/db';
import { users, roundups, user_charities, charities, debits } from '@/db/schema';
import { eq, and, gte, sql, sum, count, desc } from 'drizzle-orm';
import { calculateDeduction, getCeiling } from '@/lib/tax';

// ─── Milestone thresholds ────────────────────────────────────────────────────

const MILESTONE_AMOUNTS = [10, 25, 50, 100, 250, 500, 1000];

// ─── Deterministic daily "social proof" number ───────────────────────────────

function getSocialProofCount(): number {
  const today = new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = (hash * 31 + today.charCodeAt(i)) | 0;
  }
  // Range: 800 - 2400
  return 800 + Math.abs(hash % 1600);
}

// ─── Week boundaries (Monday-based) ─────────────────────────────────────────

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun
  const diff = day === 0 ? 6 : day - 1; // Monday offset
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}

function getPreviousWeekRange(): { start: string; end: string } {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() - diff);
  thisMonday.setHours(0, 0, 0, 0);

  const prevMonday = new Date(thisMonday);
  prevMonday.setDate(thisMonday.getDate() - 7);

  return {
    start: prevMonday.toISOString(),
    end: thisMonday.toISOString(),
  };
}

export async function GET() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  if (!session.isLoggedIn || !session.userId) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const userId = session.userId;

  // Fetch user
  const user = db.select().from(users).where(eq(users.id, userId)).get();
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  // ── Total donated ──────────────────────────────────────────────────────────

  const totalResult = db
    .select({ total: sum(roundups.amount) })
    .from(roundups)
    .where(eq(roundups.user_id, userId))
    .get();

  const totalDonated = Number(totalResult?.total ?? 0);

  // ── Total roundup count ────────────────────────────────────────────────────

  const countResult = db
    .select({ count: count() })
    .from(roundups)
    .where(eq(roundups.user_id, userId))
    .get();

  const totalRoundups = countResult?.count ?? 0;

  // ── User charities with allocation info ────────────────────────────────────

  const userCharityRows = db
    .select({
      id: charities.id,
      name: charities.name,
      icon: charities.icon,
      category: charities.category,
      allocation_pct: user_charities.allocation_pct,
      brand_color: charities.brand_color,
      story: charities.story,
    })
    .from(user_charities)
    .innerJoin(charities, eq(user_charities.charity_id, charities.id))
    .where(eq(user_charities.user_id, userId))
    .all();

  // Calculate total received per charity (allocation_pct * totalDonated)
  const charitiesData = userCharityRows.map((c) => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
    category: c.category,
    allocation_pct: c.allocation_pct ?? 0,
    brand_color: c.brand_color,
    story: c.story,
    totalReceived: Math.round(totalDonated * ((c.allocation_pct ?? 0) / 100) * 100) / 100,
  }));

  // ── Weekly stats ───────────────────────────────────────────────────────────

  const weekStart = getWeekStart();

  const weeklyResult = db
    .select({
      count: count(),
      total: sum(roundups.amount),
    })
    .from(roundups)
    .where(and(eq(roundups.user_id, userId), gte(roundups.timestamp, weekStart)))
    .get();

  const prevWeek = getPreviousWeekRange();
  const prevWeekResult = db
    .select({ total: sum(roundups.amount) })
    .from(roundups)
    .where(
      and(
        eq(roundups.user_id, userId),
        gte(roundups.timestamp, prevWeek.start),
        sql`${roundups.timestamp} < ${prevWeek.end}`,
      ),
    )
    .get();

  const weeklyStats = {
    count: weeklyResult?.count ?? 0,
    total: Number(weeklyResult?.total ?? 0),
    previousWeekTotal: Number(prevWeekResult?.total ?? 0),
  };

  // ── Recent transactions ────────────────────────────────────────────────────

  const recentTransactions = db
    .select({
      id: roundups.id,
      merchant_name: roundups.merchant_name,
      category: roundups.category,
      amount: roundups.amount,
      timestamp: roundups.timestamp,
    })
    .from(roundups)
    .where(eq(roundups.user_id, userId))
    .orderBy(desc(roundups.timestamp))
    .limit(20)
    .all();

  // ── Milestones ─────────────────────────────────────────────────────────────

  const milestones = MILESTONE_AMOUNTS.map((amount) => ({
    amount,
    reached: totalDonated >= amount,
    reachedAt: totalDonated >= amount ? new Date().toISOString() : undefined,
  }));

  // ── Current streak (days since first roundup) ─────────────────────────────

  const firstRoundup = db
    .select({ timestamp: roundups.timestamp })
    .from(roundups)
    .where(eq(roundups.user_id, userId))
    .orderBy(roundups.timestamp)
    .limit(1)
    .get();

  const startDate = firstRoundup?.timestamp ?? user.created_at ?? new Date().toISOString();
  const streakDays = Math.max(
    1,
    Math.floor(
      (Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24),
    ) + 1,
  );

  const currentStreak = {
    startDate,
    days: streakDays,
  };

  // ── Active crisis (placeholder: no crisis table yet, return null) ──────────

  const activeCrisis: { id: string; name: string; description: string; charity_id: string } | null = null;

  // ── Tax preview ────────────────────────────────────────────────────────────

  const jurisdiction = user.jurisdiction ?? 'FR';
  const incomeBracket = user.income_bracket ?? 0;

  // Simple estimate: use standard deduction rate for the jurisdiction
  const estimatedSaving = calculateDeduction(totalDonated, 'standard', jurisdiction, incomeBracket);

  const ceiling = getCeiling(jurisdiction, incomeBracket);

  const taxPreview = {
    estimatedSaving: Math.round(estimatedSaving * 100) / 100,
    jurisdiction,
    ceilingUsed: Math.min(totalDonated, ceiling),
    ceilingTotal: ceiling === Infinity ? null : ceiling,
    ceilingPct: ceiling === Infinity ? 0 : Math.round((Math.min(totalDonated, ceiling) / ceiling) * 100),
  };

  // ── Social proof ──────────────────────────────────────────────────────────

  const socialProof = {
    donorsToday: getSocialProofCount(),
  };

  // ── Next milestone ────────────────────────────────────────────────────────

  const nextUnreached = MILESTONE_AMOUNTS.find((m) => totalDonated < m);
  const nextMilestone = nextUnreached
    ? {
        amount: nextUnreached,
        remaining: Math.round((nextUnreached - totalDonated) * 100) / 100,
      }
    : null;

  // ── Next batch date ───────────────────────────────────────────────────────

  const pendingDebit = db
    .select({ period_end: debits.period_end })
    .from(debits)
    .where(and(eq(debits.user_id, userId), eq(debits.status, 'pending')))
    .orderBy(desc(debits.period_end))
    .limit(1)
    .get();

  const nextBatchDate = pendingDebit?.period_end ?? null;

  return Response.json({
    totalDonated,
    totalRoundups,
    charities: charitiesData,
    weeklyStats,
    recentTransactions,
    milestones,
    currentStreak,
    activeCrisis,
    taxPreview,
    socialProof,
    nextMilestone,
    nextBatchDate,
  });
}
