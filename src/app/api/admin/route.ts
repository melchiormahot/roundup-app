import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { db } from '@/db';
import {
  users,
  roundups,
  charities,
  user_charities,
  allocations,
  notifications,
  early_access,
  jurisdiction_tax_rules,
} from '@/db/schema';
import { eq, sql, sum, count, desc, avg } from 'drizzle-orm';

// ─── Auth check ─────────────────────────────────────────────────────────────

async function verifyAdmin() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  );
  if (!session.isLoggedIn || !session.userId) return null;

  const user = db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .get();

  if (!user || user.is_admin !== 1) return null;
  return user;
}

// ─── Handler ────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const view = searchParams.get('view') ?? 'overview';

  switch (view) {
    case 'overview':
      return Response.json(getOverviewData());
    case 'users':
      return Response.json(getUsersData());
    case 'onboarding':
      return Response.json(getOnboardingData());
    case 'donations':
      return Response.json(getDonationsData());
    case 'charities':
      return Response.json(getCharitiesData());
    case 'tax':
      return Response.json(getTaxData());
    case 'notifications':
      return Response.json(getNotificationsData());
    case 'early-access':
      return Response.json(getEarlyAccessData());
    case 'progression':
      return Response.json(getProgressionData());
    default:
      return Response.json({ error: 'Unknown view' }, { status: 400 });
  }
}

// ─── Overview ───────────────────────────────────────────────────────────────

function getOverviewData() {
  const totalUsersResult = db.select({ count: count() }).from(users).get();
  const totalUsers = totalUsersResult?.count ?? 0;

  const totalDonatedResult = db
    .select({ total: sum(roundups.amount) })
    .from(roundups)
    .get();
  const totalDonated = Number(totalDonatedResult?.total ?? 0);

  const avgDonationResult = db
    .select({ avg: avg(roundups.amount) })
    .from(roundups)
    .get();
  const avgDonation = Number(avgDonationResult?.avg ?? 0);

  const completedResult = db
    .select({ count: count() })
    .from(users)
    .where(eq(users.onboarding_completed, 1))
    .get();
  const onboardingCompleted = completedResult?.count ?? 0;
  const onboardingPct =
    totalUsers > 0 ? Math.round((onboardingCompleted / totalUsers) * 100) : 0;

  // Active users in last 7 days
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();
  const activeResult = db
    .select({ count: sql<number>`COUNT(DISTINCT ${roundups.user_id})` })
    .from(roundups)
    .where(sql`${roundups.timestamp} >= ${sevenDaysAgo}`)
    .get();
  const activeUsers7d = activeResult?.count ?? 0;

  // Sparkline data: last 14 days of daily totals
  const fourteenDaysAgo = new Date(
    Date.now() - 14 * 24 * 60 * 60 * 1000
  ).toISOString();
  const dailyTotals = db
    .select({
      day: sql<string>`date(${roundups.timestamp})`,
      total: sum(roundups.amount),
    })
    .from(roundups)
    .where(sql`${roundups.timestamp} >= ${fourteenDaysAgo}`)
    .groupBy(sql`date(${roundups.timestamp})`)
    .orderBy(sql`date(${roundups.timestamp})`)
    .all();

  const sparklineData = dailyTotals.map((d) => ({
    day: d.day,
    value: Number(d.total ?? 0),
  }));

  // Daily user signups for sparkline
  const dailySignups = db
    .select({
      day: sql<string>`date(${users.created_at})`,
      count: count(),
    })
    .from(users)
    .where(sql`${users.created_at} >= ${fourteenDaysAgo}`)
    .groupBy(sql`date(${users.created_at})`)
    .orderBy(sql`date(${users.created_at})`)
    .all();

  return {
    totalUsers,
    totalDonated: Math.round(totalDonated * 100) / 100,
    avgDonation: Math.round(avgDonation * 100) / 100,
    onboardingPct,
    activeUsers7d,
    sparklines: {
      donations: sparklineData,
      users: dailySignups.map((d) => ({ day: d.day, value: d.count })),
    },
  };
}

// ─── Users ──────────────────────────────────────────────────────────────────

function getUsersData() {
  const allUsers = db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      jurisdiction: users.jurisdiction,
      user_level: users.user_level,
      income_bracket: users.income_bracket,
      created_at: users.created_at,
    })
    .from(users)
    .orderBy(desc(users.created_at))
    .all();

  // Total donated per user
  const userDonations = db
    .select({
      user_id: roundups.user_id,
      total: sum(roundups.amount),
    })
    .from(roundups)
    .groupBy(roundups.user_id)
    .all();

  const donationMap = new Map(
    userDonations.map((d) => [d.user_id, Number(d.total ?? 0)])
  );

  const usersWithDonations = allUsers.map((u) => ({
    ...u,
    totalDonated: Math.round((donationMap.get(u.id) ?? 0) * 100) / 100,
  }));

  // Jurisdiction distribution
  const jurisdictionDist = db
    .select({
      jurisdiction: users.jurisdiction,
      count: count(),
    })
    .from(users)
    .groupBy(users.jurisdiction)
    .all();

  // Income bracket distribution
  const incomeDist = db
    .select({
      bracket: users.income_bracket,
      count: count(),
    })
    .from(users)
    .groupBy(users.income_bracket)
    .all();

  const bracketLabels: Record<number, string> = {
    0: '<25k',
    1: '25k-50k',
    2: '50k-100k',
    3: '>100k',
  };

  return {
    users: usersWithDonations,
    jurisdictionDistribution: jurisdictionDist.map((j) => ({
      name: j.jurisdiction ?? 'Unknown',
      value: j.count,
    })),
    incomeBracketDistribution: incomeDist.map((i) => ({
      name: bracketLabels[i.bracket ?? 0] ?? 'Unknown',
      value: i.count,
    })),
  };
}

// ─── Onboarding ─────────────────────────────────────────────────────────────

function getOnboardingData() {
  const totalResult = db.select({ count: count() }).from(users).get();
  const total = totalResult?.count ?? 0;

  // Count users who reached each step
  const steps = [1, 2, 3, 4];
  const stepCounts = steps.map((step) => {
    const result = db
      .select({ count: count() })
      .from(users)
      .where(sql`${users.onboarding_step_reached} >= ${step}`)
      .get();
    return { step, count: result?.count ?? 0 };
  });

  const completedResult = db
    .select({ count: count() })
    .from(users)
    .where(eq(users.onboarding_completed, 1))
    .get();
  const completed = completedResult?.count ?? 0;

  const conversionRate =
    total > 0 ? Math.round((completed / total) * 100) : 0;

  const funnel = stepCounts.map((s, i) => ({
    step: s.step,
    label: `Step ${s.step}`,
    count: s.count,
    dropOff:
      i === 0
        ? total - s.count
        : (stepCounts[i - 1]?.count ?? 0) - s.count,
    dropOffPct:
      i === 0
        ? total > 0
          ? Math.round(((total - s.count) / total) * 100)
          : 0
        : (stepCounts[i - 1]?.count ?? 0) > 0
          ? Math.round(
              (((stepCounts[i - 1]?.count ?? 0) - s.count) /
                (stepCounts[i - 1]?.count ?? 0)) *
                100
            )
          : 0,
  }));

  return {
    totalSignups: total,
    completed,
    conversionRate,
    funnel,
  };
}

// ─── Donations ──────────────────────────────────────────────────────────────

function getDonationsData() {
  // Daily donation totals (last 30 days)
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  const dailyDonations = db
    .select({
      day: sql<string>`date(${roundups.timestamp})`,
      total: sum(roundups.amount),
      count: count(),
    })
    .from(roundups)
    .where(sql`${roundups.timestamp} >= ${thirtyDaysAgo}`)
    .groupBy(sql`date(${roundups.timestamp})`)
    .orderBy(sql`date(${roundups.timestamp})`)
    .all();

  // Donations per charity
  const charityDonations = db
    .select({
      charity_name: charities.name,
      total: sum(allocations.amount),
    })
    .from(allocations)
    .innerJoin(charities, eq(allocations.charity_id, charities.id))
    .groupBy(charities.name)
    .orderBy(desc(sum(allocations.amount)))
    .all();

  // By tax rate
  const byTaxRate = db
    .select({
      tax_rate: allocations.tax_rate,
      total: sum(allocations.amount),
    })
    .from(allocations)
    .groupBy(allocations.tax_rate)
    .all();

  // Donation size distribution (buckets)
  const allAmounts = db
    .select({ amount: roundups.amount })
    .from(roundups)
    .all();

  const buckets = [
    { label: '0-0.25', min: 0, max: 0.25 },
    { label: '0.25-0.50', min: 0.25, max: 0.5 },
    { label: '0.50-0.75', min: 0.5, max: 0.75 },
    { label: '0.75-1.00', min: 0.75, max: 1.0 },
  ];

  const histogram = buckets.map((b) => ({
    label: b.label,
    count: allAmounts.filter(
      (a) => (a.amount ?? 0) >= b.min && (a.amount ?? 0) < b.max
    ).length,
  }));

  // Top donors
  const topDonors = db
    .select({
      user_id: roundups.user_id,
      total: sum(roundups.amount),
      roundup_count: count(),
    })
    .from(roundups)
    .groupBy(roundups.user_id)
    .orderBy(desc(sum(roundups.amount)))
    .limit(10)
    .all();

  // Get user names for top donors
  const topDonorsWithNames = topDonors.map((d) => {
    const user = db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, d.user_id!))
      .get();

    // Count charities
    const charityCount = db
      .select({ count: count() })
      .from(user_charities)
      .where(eq(user_charities.user_id, d.user_id!))
      .get();

    return {
      name: user?.name ?? 'Unknown',
      total: Math.round(Number(d.total ?? 0) * 100) / 100,
      roundupCount: d.roundup_count,
      charityCount: charityCount?.count ?? 0,
    };
  });

  return {
    dailyDonations: dailyDonations.map((d) => ({
      day: d.day,
      total: Math.round(Number(d.total ?? 0) * 100) / 100,
      count: d.count,
    })),
    charityDonations: charityDonations.map((c) => ({
      name: c.charity_name,
      total: Math.round(Number(c.total ?? 0) * 100) / 100,
    })),
    byTaxRate: byTaxRate.map((t) => ({
      name: `${t.tax_rate ?? 0}%`,
      value: Math.round(Number(t.total ?? 0) * 100) / 100,
    })),
    histogram,
    topDonors: topDonorsWithNames,
  };
}

// ─── Charities ──────────────────────────────────────────────────────────────

function getCharitiesData() {
  const charityStats = db
    .select({
      id: charities.id,
      name: charities.name,
      category: charities.category,
    })
    .from(charities)
    .all();

  const statsWithData = charityStats.map((c) => {
    const donationResult = db
      .select({ total: sum(allocations.amount) })
      .from(allocations)
      .where(eq(allocations.charity_id, c.id))
      .get();

    const userCountResult = db
      .select({ count: count() })
      .from(user_charities)
      .where(eq(user_charities.charity_id, c.id))
      .get();

    const avgAllocResult = db
      .select({ avg: avg(user_charities.allocation_pct) })
      .from(user_charities)
      .where(eq(user_charities.charity_id, c.id))
      .get();

    return {
      id: c.id,
      name: c.name,
      category: c.category,
      totalReceived: Math.round(Number(donationResult?.total ?? 0) * 100) / 100,
      userCount: userCountResult?.count ?? 0,
      avgAllocation: Math.round(Number(avgAllocResult?.avg ?? 0)),
    };
  });

  // Sort by total received descending
  statsWithData.sort((a, b) => b.totalReceived - a.totalReceived);

  // Most loved = highest avg allocation with at least 1 user
  const mostLoved = statsWithData
    .filter((c) => c.userCount > 0)
    .sort((a, b) => b.avgAllocation - a.avgAllocation)[0] ?? null;

  return {
    charities: statsWithData,
    mostLovedId: mostLoved?.id ?? null,
  };
}

// ─── Tax ────────────────────────────────────────────────────────────────────

function getTaxData() {
  // Savings by jurisdiction: total donated * approximate deduction rate
  const jurisdictionData = db
    .select({
      jurisdiction: users.jurisdiction,
      totalDonated: sum(roundups.amount),
      userCount: count(),
    })
    .from(users)
    .leftJoin(roundups, eq(users.id, roundups.user_id))
    .groupBy(users.jurisdiction)
    .all();

  // Approximate deduction rates by jurisdiction
  const deductionRates: Record<string, number> = {
    FR: 0.66,
    UK: 0.25,
    DE: 0.3,
    ES: 0.35,
    BE: 0.3,
  };

  const byJurisdiction = jurisdictionData.map((j) => {
    const total = Number(j.totalDonated ?? 0);
    const rate = deductionRates[j.jurisdiction ?? 'FR'] ?? 0.2;
    return {
      jurisdiction: j.jurisdiction ?? 'Unknown',
      totalDonated: Math.round(total * 100) / 100,
      estimatedSavings: Math.round(total * rate * 100) / 100,
      userCount: j.userCount,
    };
  });

  // Savings by income bracket
  const bracketData = db
    .select({
      bracket: users.income_bracket,
      totalDonated: sum(roundups.amount),
      userCount: count(),
    })
    .from(users)
    .leftJoin(roundups, eq(users.id, roundups.user_id))
    .groupBy(users.income_bracket)
    .all();

  const bracketLabels: Record<number, string> = {
    0: '<25k',
    1: '25k-50k',
    2: '50k-100k',
    3: '>100k',
  };

  const byBracket = bracketData.map((b) => ({
    bracket: bracketLabels[b.bracket ?? 0] ?? 'Unknown',
    totalDonated: Math.round(Number(b.totalDonated ?? 0) * 100) / 100,
    userCount: b.userCount,
  }));

  // Users approaching ceiling (donated > 80% of ceiling placeholder)
  const approachingCeiling = 0; // Would need per-user calculation

  return {
    byJurisdiction,
    byBracket,
    approachingCeiling,
    pdfDownloads: 0, // Placeholder
  };
}

// ─── Notifications ──────────────────────────────────────────────────────────

function getNotificationsData() {
  // Sent count by type
  const byType = db
    .select({
      type: notifications.type,
      sent: count(),
      read: sql<number>`SUM(CASE WHEN ${notifications.read} = 1 THEN 1 ELSE 0 END)`,
    })
    .from(notifications)
    .groupBy(notifications.type)
    .all();

  // Timeline: daily notification count
  const timeline = db
    .select({
      day: sql<string>`date(${notifications.created_at})`,
      count: count(),
    })
    .from(notifications)
    .groupBy(sql`date(${notifications.created_at})`)
    .orderBy(sql`date(${notifications.created_at})`)
    .all();

  return {
    byType: byType.map((t) => ({
      type: t.type ?? 'unknown',
      sent: t.sent,
      read: t.read ?? 0,
      readRate: t.sent > 0 ? Math.round(((t.read ?? 0) / t.sent) * 100) : 0,
    })),
    timeline: timeline.map((t) => ({
      day: t.day,
      count: t.count,
    })),
  };
}

// ─── Early Access ───────────────────────────────────────────────────────────

function getEarlyAccessData() {
  const signups = db
    .select()
    .from(early_access)
    .orderBy(desc(early_access.created_at))
    .all();

  // By country
  const byCountry = db
    .select({
      country: early_access.country,
      count: count(),
    })
    .from(early_access)
    .groupBy(early_access.country)
    .all();

  // Conversion: early access emails that became users
  const earlyEmails = signups.map((s) => s.email);
  let converted = 0;
  if (earlyEmails.length > 0) {
    for (const email of earlyEmails) {
      const user = db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email!))
        .get();
      if (user) converted++;
    }
  }

  const conversionRate =
    signups.length > 0
      ? Math.round((converted / signups.length) * 100)
      : 0;

  return {
    signups: signups.map((s) => ({
      id: s.id,
      email: s.email,
      country: s.country,
      createdAt: s.created_at,
    })),
    byCountry: byCountry.map((c) => ({
      name: c.country ?? 'Unknown',
      value: c.count,
    })),
    totalSignups: signups.length,
    converted,
    conversionRate,
  };
}

// ─── Progression ────────────────────────────────────────────────────────────

function getProgressionData() {
  // Level distribution
  const levelDist = db
    .select({
      level: users.user_level,
      count: count(),
    })
    .from(users)
    .groupBy(users.user_level)
    .all();

  // Feature unlock rates
  const totalResult = db.select({ count: count() }).from(users).get();
  const total = totalResult?.count ?? 0;

  const featureUnlocks = [
    { feature: 'Tax Dashboard (L2)', level: 2 },
    { feature: 'Weekly Summary (L2)', level: 2 },
    { feature: 'Crisis Response (L3)', level: 3 },
    { feature: 'Sparklines (L3)', level: 3 },
    { feature: 'PDF Generation (L4)', level: 4 },
    { feature: 'Referral Program (L4)', level: 4 },
  ].map((f) => {
    const result = db
      .select({ count: count() })
      .from(users)
      .where(sql`${users.user_level} >= ${f.level}`)
      .get();
    return {
      feature: f.feature,
      level: f.level,
      unlocked: result?.count ?? 0,
      rate: total > 0 ? Math.round(((result?.count ?? 0) / total) * 100) : 0,
    };
  });

  // Drop-off by level: users who stopped at each level
  const dropOff = [1, 2, 3, 4].map((level) => {
    const atLevel = db
      .select({ count: count() })
      .from(users)
      .where(eq(users.user_level, level))
      .get();
    return {
      level,
      count: atLevel?.count ?? 0,
    };
  });

  return {
    levelDistribution: levelDist.map((l) => ({
      level: `Level ${l.level ?? 1}`,
      count: l.count,
    })),
    featureUnlocks,
    dropOff,
  };
}
