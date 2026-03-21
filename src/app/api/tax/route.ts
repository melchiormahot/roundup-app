import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { db } from '@/db';
import { users, roundups, charities, user_charities } from '@/db/schema';
import { eq, sum } from 'drizzle-orm';
import { calculateFullTax, getCeiling, getProjection } from '@/lib/tax';

// ─── Jurisdiction metadata ──────────────────────────────────────────────────

const JURISDICTION_META: Record<string, {
  name: string;
  currencySymbol: string;
  breakdownLabels: (bracket: number) => { rate: number; label: string }[];
}> = {
  FR: {
    name: 'France',
    currencySymbol: '\u20ac',
    breakdownLabels: () => [
      { rate: 66, label: 'Standard deduction (66%)' },
      { rate: 75, label: 'Loi Coluche (75%)' },
    ],
  },
  UK: {
    name: 'United Kingdom',
    currencySymbol: '\u00a3',
    breakdownLabels: (bracket) => {
      const labels = [{ rate: 25, label: 'Gift Aid basic rate (25%)' }];
      if (bracket >= 3) {
        labels.push({ rate: 25, label: 'Additional rate relief (25%)' });
      } else if (bracket >= 2) {
        labels.push({ rate: 20, label: 'Higher rate relief (20%)' });
      }
      return labels;
    },
  },
  DE: {
    name: 'Germany',
    currencySymbol: '\u20ac',
    breakdownLabels: (bracket) => {
      const rates: Record<number, number> = { 0: 14, 1: 30, 2: 42, 3: 45 };
      const rate = rates[bracket] ?? 14;
      return [{ rate, label: `Sonderausgaben (${rate}%)` }];
    },
  },
  BE: {
    name: 'Belgium',
    currencySymbol: '\u20ac',
    breakdownLabels: () => [
      { rate: 30, label: 'Tax reduction (30%)' },
    ],
  },
  ES: {
    name: 'Spain',
    currencySymbol: '\u20ac',
    breakdownLabels: () => [
      { rate: 80, label: 'First \u20ac250 (80%)' },
      { rate: 35, label: 'Above \u20ac250 (35%)' },
    ],
  },
};

export async function GET() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  if (!session.isLoggedIn || !session.userId) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const userId = session.userId;

  const user = db.select().from(users).where(eq(users.id, userId)).get();
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  const jurisdiction = user.jurisdiction ?? 'FR';
  const incomeBracket = user.income_bracket ?? 0;
  const meta = JURISDICTION_META[jurisdiction] ?? JURISDICTION_META.FR;

  // ── Total donated ──────────────────────────────────────────────────────────

  const totalResult = db
    .select({ total: sum(roundups.amount) })
    .from(roundups)
    .where(eq(roundups.user_id, userId))
    .get();

  const totalDonated = Number(totalResult?.total ?? 0);

  // ── Determine standard vs enhanced donations ─────────────────────────────
  // For France, check if any charity is Loi Coluche eligible
  // For simplicity, we split based on charity allocations

  let standardDonations = totalDonated;
  let enhancedDonations = 0;

  if (jurisdiction === 'FR') {
    const userCharityRows = db
      .select({
        allocation_pct: user_charities.allocation_pct,
        loi_coluche_eligible: charities.loi_coluche_eligible,
      })
      .from(user_charities)
      .innerJoin(charities, eq(user_charities.charity_id, charities.id))
      .where(eq(user_charities.user_id, userId))
      .all();

    let enhancedPct = 0;
    let standardPct = 0;
    for (const row of userCharityRows) {
      if (row.loi_coluche_eligible === 1) {
        enhancedPct += row.allocation_pct ?? 0;
      } else {
        standardPct += row.allocation_pct ?? 0;
      }
    }

    const totalPct = enhancedPct + standardPct;
    if (totalPct > 0) {
      enhancedDonations = Math.round(totalDonated * (enhancedPct / totalPct) * 100) / 100;
      standardDonations = Math.round(totalDonated * (standardPct / totalPct) * 100) / 100;
    }
  }

  // ── Build donation entries for full tax calculation ───────────────────────

  const donations: { amount: number; charityType: 'standard' | 'enhanced' }[] = [];
  if (standardDonations > 0) {
    donations.push({ amount: standardDonations, charityType: 'standard' });
  }
  if (enhancedDonations > 0) {
    donations.push({ amount: enhancedDonations, charityType: 'enhanced' });
  }
  if (donations.length === 0) {
    donations.push({ amount: 0, charityType: 'standard' });
  }

  const taxCalc = calculateFullTax(donations, jurisdiction, incomeBracket);

  // ── Ceiling ──────────────────────────────────────────────────────────────

  const ceiling = getCeiling(jurisdiction, incomeBracket);

  // ── Projection ───────────────────────────────────────────────────────────

  const now = new Date();
  const monthsRemaining = 12 - (now.getMonth() + 1);
  const projectionCalc = getProjection(totalDonated, monthsRemaining, jurisdiction, incomeBracket);

  // Compute projected total donations from projection
  const monthsElapsed = 12 - monthsRemaining;
  const monthlyAvg = monthsElapsed > 0 ? totalDonated / monthsElapsed : 0;
  const projectedTotalDonations = Math.round((totalDonated + monthlyAvg * monthsRemaining) * 100) / 100;

  // ── Assemble breakdown with labels ───────────────────────────────────────

  const labelDefs = meta.breakdownLabels(incomeBracket);

  // Group raw breakdown by rate and merge with labels
  const rateMap = new Map<number, { amount: number; deduction: number }>();
  for (const item of taxCalc.breakdown) {
    const existing = rateMap.get(item.rate);
    if (existing) {
      existing.amount += item.amount;
      existing.deduction += item.deduction;
    } else {
      rateMap.set(item.rate, { amount: item.amount, deduction: item.deduction });
    }
  }

  const breakdown = Array.from(rateMap.entries()).map(([rate, data]) => {
    const labelDef = labelDefs.find((l) => l.rate === rate);
    return {
      rate,
      label: labelDef?.label ?? `${rate}% deduction`,
      amount: Math.round(data.amount * 100) / 100,
      deduction: Math.round(data.deduction * 100) / 100,
    };
  });

  return Response.json({
    jurisdiction,
    jurisdictionName: meta.name,
    incomeBracket,
    totalDonated: Math.round(totalDonated * 100) / 100,
    standardDonations: Math.round(standardDonations * 100) / 100,
    enhancedDonations: Math.round(enhancedDonations * 100) / 100,
    taxSaving: taxCalc.totalDeduction,
    ceiling: ceiling === Infinity ? null : Math.round(ceiling * 100) / 100,
    ceilingUsed: taxCalc.ceilingUsed,
    ceilingRemaining: taxCalc.ceilingRemaining === Infinity ? null : taxCalc.ceilingRemaining,
    ceilingPct: taxCalc.ceilingPct,
    projection: {
      totalDonations: projectedTotalDonations,
      taxSaving: projectionCalc.totalDeduction,
      monthsRemaining,
    },
    breakdown,
    currencySymbol: meta.currencySymbol,
  });
}

export async function PUT(request: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  if (!session.isLoggedIn || !session.userId) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const userId = session.userId;
  const body = await request.json();

  const updates: Record<string, unknown> = {};

  if (typeof body.incomeBracket === 'number' && body.incomeBracket >= 0 && body.incomeBracket <= 3) {
    updates.income_bracket = body.incomeBracket;
  }

  const validJurisdictions = ['FR', 'UK', 'DE', 'BE', 'ES'];
  if (typeof body.jurisdiction === 'string' && validJurisdictions.includes(body.jurisdiction)) {
    updates.jurisdiction = body.jurisdiction;
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  db.update(users).set(updates).where(eq(users.id, userId)).run();

  // Update session if jurisdiction changed
  if (updates.jurisdiction) {
    session.jurisdiction = updates.jurisdiction as string;
    await session.save();
  }

  return Response.json({ ok: true });
}
