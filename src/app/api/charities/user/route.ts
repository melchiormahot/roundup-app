import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { db } from '@/db';
import { user_charities, charities, allocations, debits } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export const dynamic = 'force-dynamic';

// ─── GET: user's selected charities with allocations ─────────────────────────

export async function GET() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );

  if (!session.isLoggedIn || !session.userId) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const rows = db
    .select({
      id: user_charities.id,
      charityId: user_charities.charity_id,
      allocationPct: user_charities.allocation_pct,
      charityName: charities.name,
      charityIcon: charities.icon,
      charityCategory: charities.category,
      charityBrandColor: charities.brand_color,
      charityCountryCode: charities.country_code,
      charityTaxRate: charities.tax_rate,
    })
    .from(user_charities)
    .leftJoin(charities, eq(user_charities.charity_id, charities.id))
    .where(eq(user_charities.user_id, session.userId))
    .all();

  // Calculate total donated per charity from allocations table
  const donatedRows = db
    .select({
      charityId: allocations.charity_id,
      totalDonated: sql<number>`COALESCE(SUM(${allocations.amount}), 0)`,
    })
    .from(allocations)
    .innerJoin(debits, eq(allocations.debit_id, debits.id))
    .where(eq(debits.user_id, session.userId))
    .groupBy(allocations.charity_id)
    .all();

  const donatedMap = new Map(
    donatedRows.map((r) => [r.charityId, r.totalDonated]),
  );

  const result = rows.map((r) => ({
    id: r.id,
    charityId: r.charityId,
    allocationPct: r.allocationPct,
    name: r.charityName,
    icon: r.charityIcon,
    category: r.charityCategory,
    brandColor: r.charityBrandColor,
    countryCode: r.charityCountryCode,
    taxRate: r.charityTaxRate,
    totalDonated: donatedMap.get(r.charityId) ?? 0,
  }));

  return Response.json({ charities: result });
}

// ─── POST: add or remove a charity ──────────────────────────────────────────

export async function POST(request: Request) {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );

  if (!session.isLoggedIn || !session.userId) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await request.json();
  const { charityId, action } = body as {
    charityId: string;
    action: 'add' | 'remove';
  };

  if (!charityId || !action) {
    return Response.json(
      { error: 'charityId and action are required' },
      { status: 400 },
    );
  }

  if (action === 'add') {
    // Check if already exists
    const existing = db
      .select()
      .from(user_charities)
      .where(
        and(
          eq(user_charities.user_id, session.userId),
          eq(user_charities.charity_id, charityId),
        ),
      )
      .get();

    if (existing) {
      return Response.json({ message: 'Already added' });
    }

    // Count existing charities to set default allocation
    const currentCharities = db
      .select()
      .from(user_charities)
      .where(eq(user_charities.user_id, session.userId))
      .all();

    const count = currentCharities.length;
    const newPct = Math.floor(100 / (count + 1));

    // Insert new charity
    db.insert(user_charities)
      .values({
        id: nanoid(),
        user_id: session.userId,
        charity_id: charityId,
        allocation_pct: newPct,
      })
      .run();

    // Rebalance existing allocations evenly
    if (count > 0) {
      const remaining = 100 - newPct;
      const perCharity = Math.floor(remaining / count);
      let leftover = remaining - perCharity * count;

      for (let i = 0; i < currentCharities.length; i++) {
        const pct = perCharity + (i < leftover ? 1 : 0);
        db.update(user_charities)
          .set({ allocation_pct: pct })
          .where(eq(user_charities.id, currentCharities[i].id))
          .run();
      }
    }

    return Response.json({ message: 'Charity added' });
  }

  if (action === 'remove') {
    db.delete(user_charities)
      .where(
        and(
          eq(user_charities.user_id, session.userId),
          eq(user_charities.charity_id, charityId),
        ),
      )
      .run();

    // Rebalance remaining charities evenly
    const remaining = db
      .select()
      .from(user_charities)
      .where(eq(user_charities.user_id, session.userId))
      .all();

    if (remaining.length > 0) {
      const perCharity = Math.floor(100 / remaining.length);
      let leftover = 100 - perCharity * remaining.length;

      for (let i = 0; i < remaining.length; i++) {
        const pct = perCharity + (i < leftover ? 1 : 0);
        db.update(user_charities)
          .set({ allocation_pct: pct })
          .where(eq(user_charities.id, remaining[i].id))
          .run();
      }
    }

    return Response.json({ message: 'Charity removed' });
  }

  return Response.json({ error: 'Invalid action' }, { status: 400 });
}

// ─── PUT: update allocations ────────────────────────────────────────────────

export async function PUT(request: Request) {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );

  if (!session.isLoggedIn || !session.userId) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await request.json();
  const { allocations: allocs } = body as {
    allocations: { charityId: string; pct: number }[];
  };

  if (!allocs || !Array.isArray(allocs)) {
    return Response.json(
      { error: 'allocations array is required' },
      { status: 400 },
    );
  }

  // Validate total = 100
  const total = allocs.reduce((sum, a) => sum + a.pct, 0);
  if (total !== 100) {
    return Response.json(
      { error: `Allocations must sum to 100, got ${total}` },
      { status: 400 },
    );
  }

  for (const alloc of allocs) {
    db.update(user_charities)
      .set({ allocation_pct: alloc.pct })
      .where(
        and(
          eq(user_charities.user_id, session.userId),
          eq(user_charities.charity_id, alloc.charityId),
        ),
      )
      .run();
  }

  return Response.json({ message: 'Allocations updated' });
}
