import { db } from "@/db";
import { roundups, debits, allocations, notifications, userCharities, charities, simulationState, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

// Seeded PRNG for reproducible results
class SeededRandom {
  private s: number;
  constructor(seed: number) { this.s = seed; }
  next(): number {
    this.s = (this.s * 1664525 + 1013904223) & 0xffffffff;
    return (this.s >>> 0) / 0xffffffff;
  }
  between(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
  intBetween(min: number, max: number): number {
    return Math.floor(this.between(min, max + 1));
  }
  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
}

// Merchant data by category
const MERCHANTS: Record<string, { merchants: string[]; min: number; max: number; hours: [number, number] }> = {
  coffee: { merchants: ["Starbucks", "Paul", "Coutume", "Café de Flore", "Columbus"], min: 2.5, max: 5.5, hours: [7, 9] },
  boulangerie: { merchants: ["Maison Kayser", "Eric Kayser", "Poilâne", "Du Pain et des Idées"], min: 1.2, max: 8.0, hours: [7, 10] },
  supermarket: { merchants: ["Monoprix", "Carrefour City", "Franprix", "Picard"], min: 12.0, max: 85.0, hours: [17, 19] },
  metro: { merchants: ["RATP", "Navigo"], min: 1.9, max: 4.0, hours: [7, 20] },
  restaurant: { merchants: ["Le Bouillon Chartier", "Big Mamma", "Chez Janou", "Pizza Pino"], min: 14.0, max: 45.0, hours: [12, 14] },
  online: { merchants: ["Amazon", "Fnac", "Zalando", "Vinted"], min: 8.0, max: 120.0, hours: [10, 22] },
  pharmacy: { merchants: ["Pharmacie Monge", "Citypharma"], min: 3.0, max: 35.0, hours: [10, 18] },
  bar: { merchants: ["Le Perchoir", "Experimental Cocktail Club", "Rosa Bonheur"], min: 4.0, max: 18.0, hours: [21, 23] },
};

// Seasonal merchants
const SUMMER_MERCHANTS: Record<string, { merchants: string[]; min: number; max: number; hours: [number, number] }> = {
  beach: { merchants: ["Plage Bar", "Glacier Berthillon", "Café de la Plage"], min: 3.0, max: 12.0, hours: [11, 18] },
  museum: { merchants: ["Musée d'Orsay", "Centre Pompidou", "Louvre Boutique"], min: 8.0, max: 22.0, hours: [10, 17] },
};

const DECEMBER_MERCHANTS: Record<string, { merchants: string[]; min: number; max: number; hours: [number, number] }> = {
  christmas: { merchants: ["Marché de Noël", "Galeries Lafayette", "FNAC Gifts"], min: 15.0, max: 180.0, hours: [10, 20] },
  festive: { merchants: ["Bûche de Noël bakery", "Traiteur de Noël"], min: 12.0, max: 65.0, hours: [10, 18] },
};

// Seasonal spending multipliers
const SEASONAL_MULTIPLIERS: Record<number, number> = {
  1: 0.7, 2: 0.8, 3: 1.0, 4: 1.0, 5: 1.0, 6: 1.1,
  7: 1.3, 8: 1.2, 9: 1.15, 10: 1.0, 11: 1.0, 12: 1.5,
};

// Notification copy variants
const NOTIF_VARIANTS = {
  weekly: {
    factual: (count: number, total: string) =>
      `${count} round ups, €${total} donated.`,
    warm: (count: number, total: string, charityCount: number) =>
      `You helped ${charityCount} organisations this week with €${total} of effortless generosity.`,
    motivational: (count: number, total: string) =>
      `Another week of making a difference. €${total} closer to your goal.`,
  },
  monthly: {
    factual: (month: string, total: string, taxSaving: string) =>
      `${month}: €${total} donated. Tax saving: €${taxSaving}.`,
    warm: (month: string, total: string, impact: string) =>
      `In ${month}, your €${total} ${impact}.`,
    motivational: (month: string, total: string, pctChange: string) =>
      `You donated ${pctChange} this month. Your generosity is growing.`,
  },
  milestone: {
    factual: (amount: string) =>
      `€${amount} donated! You're making a real difference.`,
    warm: (amount: string, impact: string) =>
      `€${amount} donated. ${impact}.`,
    motivational: (amount: string, remaining: string) =>
      `€${amount} down, €${remaining} to go before maxing your tax benefit.`,
  },
  crisis: {
    factual: (event: string) =>
      `${event}. Redirect your round ups now.`,
    warm: (location: string) =>
      `${location} needs help. One tap redirects your giving for 7 days.`,
    motivational: (count: string) =>
      `${count} RoundUp users have already redirected. Join them?`,
  },
};

interface SimResult {
  transactions: number;
  roundupTotal: number;
  allocations: { charity: string; amount: number }[];
  debit?: { amount: number; count: number };
  notifications: string[];
  dayCount: number;
}

export function getSimState(userId: string) {
  let state = db.query.simulationState.findFirst({
    where: (s, { eq }) => eq(s.userId, userId),
  }).sync();
  if (!state) {
    const id = nanoid();
    db.insert(simulationState).values({
      id,
      userId,
      currentDate: new Date().toISOString().split("T")[0],
      dayCount: 0,
      enabled: false,
      notificationStyle: "factual",
      seed: Math.floor(Math.random() * 100000),
    }).run();
    state = db.query.simulationState.findFirst({
      where: (s, { eq }) => eq(s.userId, userId),
    }).sync()!;
  }
  return state;
}

export function simulateDay(userId: string, targetDate?: string): SimResult {
  const state = getSimState(userId);
  const rng = new SeededRandom(state.seed + state.dayCount);

  const currentDate = targetDate || state.currentDate;
  const date = new Date(currentDate);
  const month = date.getMonth() + 1;
  const dayOfWeek = date.getDay(); // 0 = Sunday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const multiplier = SEASONAL_MULTIPLIERS[month] || 1.0;

  // Determine transaction count
  let baseCount = isWeekend ? rng.intBetween(2, 5) : rng.intBetween(4, 8);
  baseCount = Math.round(baseCount * multiplier);

  // Spending pattern variation: some weeks are quieter
  const weekNumber = Math.floor(state.dayCount / 7);
  if (weekNumber % 4 === 2) baseCount = Math.max(2, baseCount - 2); // quieter week

  // Get available categories based on season
  let categories = { ...MERCHANTS };
  if (month >= 6 && month <= 8) {
    categories = { ...categories, ...SUMMER_MERCHANTS };
  }
  if (month === 12) {
    categories = { ...categories, ...DECEMBER_MERCHANTS };
  }

  const catKeys = Object.keys(categories);

  // Recurring transactions
  const txs: { merchant: string; amount: number; hour: number; minute: number }[] = [];

  // Daily coffee (weekdays)
  if (!isWeekend && rng.next() > 0.2) {
    const cat = categories.coffee;
    txs.push({
      merchant: rng.pick(cat.merchants),
      amount: +rng.between(cat.min, cat.max).toFixed(2),
      hour: rng.intBetween(cat.hours[0], cat.hours[1]),
      minute: rng.intBetween(0, 59),
    });
  }

  // Weekly Saturday supermarket
  if (dayOfWeek === 6 && rng.next() > 0.15) {
    const cat = categories.supermarket;
    txs.push({
      merchant: rng.pick(cat.merchants),
      amount: +rng.between(25, 75).toFixed(2),
      hour: rng.intBetween(10, 13),
      minute: rng.intBetween(0, 59),
    });
  }

  // Occasional large purchase (every 2-3 weeks)
  if (state.dayCount > 0 && state.dayCount % rng.intBetween(12, 20) === 0) {
    txs.push({
      merchant: rng.pick(["SNCF TGV", "Apple Store", "Ikea", "Decathlon"]),
      amount: +rng.between(80, 250).toFixed(2),
      hour: rng.intBetween(10, 18),
      minute: rng.intBetween(0, 59),
    });
  }

  // Fill remaining with random categories
  const remaining = Math.max(0, baseCount - txs.length);
  for (let i = 0; i < remaining; i++) {
    const key = rng.pick(catKeys);
    const cat = categories[key];
    txs.push({
      merchant: rng.pick(cat.merchants),
      amount: +rng.between(cat.min, cat.max).toFixed(2),
      hour: rng.intBetween(cat.hours[0], cat.hours[1]),
      minute: rng.intBetween(0, 59),
    });
  }

  // Ensure no duplicate pattern: randomize if needed
  txs.sort((a, b) => a.hour - b.hour || a.minute - b.minute);

  // Get user charity allocations
  const userAllocs = db.select({
    charityId: userCharities.charityId,
    charityName: charities.name,
    allocationPct: userCharities.allocationPct,
    taxRate: charities.taxRate,
  })
    .from(userCharities)
    .innerJoin(charities, eq(userCharities.charityId, charities.id))
    .where(eq(userCharities.userId, userId))
    .all();

  if (userAllocs.length === 0) {
    return { transactions: 0, roundupTotal: 0, allocations: [], notifications: [], dayCount: state.dayCount };
  }

  // Normalize allocations if they don't sum to 100
  const totalPct = userAllocs.reduce((s, a) => s + a.allocationPct, 0);
  const normalizedAllocs = userAllocs.map((a) => ({
    ...a,
    pct: totalPct > 0 ? a.allocationPct / totalPct : 1 / userAllocs.length,
  }));

  // Insert transactions and calculate round-ups
  let roundupTotal = 0;
  for (const tx of txs) {
    const ts = new Date(currentDate);
    ts.setHours(tx.hour, tx.minute, rng.intBetween(0, 59));
    const roundupAmount = +(Math.ceil(tx.amount) - tx.amount).toFixed(2) || 1.0;
    roundupTotal += roundupAmount;

    db.insert(roundups).values({
      id: nanoid(),
      userId,
      merchantName: tx.merchant,
      purchaseAmount: tx.amount,
      roundupAmount,
      timestamp: ts.toISOString(),
      status: "pending",
    }).run();
  }

  roundupTotal = +roundupTotal.toFixed(2);

  // Allocate to charities
  const charityAmounts = normalizedAllocs.map((a) => ({
    charity: a.charityName,
    charityId: a.charityId,
    amount: +(roundupTotal * a.pct).toFixed(2),
    taxRate: a.taxRate,
  }));

  // Advance date and day count
  const nextDate = new Date(currentDate);
  nextDate.setDate(nextDate.getDate() + 1);
  db.update(simulationState)
    .set({
      currentDate: nextDate.toISOString().split("T")[0],
      dayCount: state.dayCount + 1,
      seed: state.seed + 1,
    })
    .where(eq(simulationState.userId, userId))
    .run();

  return {
    transactions: txs.length,
    roundupTotal,
    allocations: charityAmounts.map((a) => ({ charity: a.charity, amount: a.amount })),
    notifications: [],
    dayCount: state.dayCount + 1,
  };
}

export function simulateWeek(userId: string): SimResult {
  const state = getSimState(userId);
  let totalTx = 0;
  let totalRoundup = 0;
  const allAllocations: Record<string, number> = {};
  let currentDate = state.currentDate;

  for (let d = 0; d < 7; d++) {
    const result = simulateDay(userId, currentDate);
    totalTx += result.transactions;
    totalRoundup += result.roundupTotal;
    result.allocations.forEach((a) => {
      allAllocations[a.charity] = (allAllocations[a.charity] || 0) + a.amount;
    });
    // Get updated date
    const updatedState = getSimState(userId);
    currentDate = updatedState.currentDate;
  }

  totalRoundup = +totalRoundup.toFixed(2);

  // Create SEPA debit batch
  const updatedState = getSimState(userId);
  const periodEnd = updatedState.currentDate;
  const periodStart = new Date(periodEnd);
  periodStart.setDate(periodStart.getDate() - 7);

  const debitId = nanoid();
  db.insert(debits).values({
    id: debitId,
    userId,
    totalAmount: totalRoundup,
    periodStart: periodStart.toISOString().split("T")[0],
    periodEnd,
    roundupCount: totalTx,
    status: "charged",
  }).run();

  // Allocation records
  const userAllocs = db.select({
    charityId: userCharities.charityId,
    charityName: charities.name,
    allocationPct: userCharities.allocationPct,
    taxRate: charities.taxRate,
  })
    .from(userCharities)
    .innerJoin(charities, eq(userCharities.charityId, charities.id))
    .where(eq(userCharities.userId, userId))
    .all();

  const totalPct = userAllocs.reduce((s, a) => s + a.allocationPct, 0);
  for (const a of userAllocs) {
    const pct = totalPct > 0 ? a.allocationPct / totalPct : 1 / userAllocs.length;
    db.insert(allocations).values({
      id: nanoid(),
      debitId,
      charityId: a.charityId,
      amount: +(totalRoundup * pct).toFixed(2),
      taxRate: a.taxRate,
    }).run();
  }

  // Weekly notification
  const style = (updatedState.notificationStyle || "factual") as keyof typeof NOTIF_VARIANTS.weekly;
  const weeklyBody = style === "warm"
    ? NOTIF_VARIANTS.weekly.warm(totalTx, totalRoundup.toFixed(2), userAllocs.length)
    : style === "motivational"
    ? NOTIF_VARIANTS.weekly.motivational(totalTx, totalRoundup.toFixed(2))
    : NOTIF_VARIANTS.weekly.factual(totalTx, totalRoundup.toFixed(2));

  db.insert(notifications).values({
    id: nanoid(),
    userId,
    type: "weekly",
    title: "Weekly Summary",
    body: weeklyBody,
    read: false,
    createdAt: new Date(periodEnd).toISOString(),
  }).run();

  return {
    transactions: totalTx,
    roundupTotal: totalRoundup,
    allocations: Object.entries(allAllocations).map(([charity, amount]) => ({ charity, amount: +amount.toFixed(2) })),
    debit: { amount: totalRoundup, count: totalTx },
    notifications: ["Weekly Summary"],
    dayCount: updatedState.dayCount,
  };
}

export function simulateMonth(userId: string): SimResult {
  let totalTx = 0;
  let totalRoundup = 0;
  const allAllocations: Record<string, number> = {};
  const notifs: string[] = [];

  for (let w = 0; w < 4; w++) {
    const result = simulateWeek(userId);
    totalTx += result.transactions;
    totalRoundup += result.roundupTotal;
    result.allocations.forEach((a) => {
      allAllocations[a.charity] = (allAllocations[a.charity] || 0) + a.amount;
    });
    notifs.push(...result.notifications);
  }

  totalRoundup = +totalRoundup.toFixed(2);
  const state = getSimState(userId);

  // Monthly progress notification
  const monthName = new Date(state.currentDate).toLocaleString("en", { month: "long" });
  const style = (state.notificationStyle || "factual") as "factual" | "warm" | "motivational";

  const taxSaving = +((totalRoundup * 0.7).toFixed(2)); // approximate
  let monthBody: string;
  if (style === "warm") {
    monthBody = NOTIF_VARIANTS.monthly.warm(monthName, totalRoundup.toFixed(2), "funded emergency kits and planted trees");
  } else if (style === "motivational") {
    monthBody = NOTIF_VARIANTS.monthly.motivational(monthName, totalRoundup.toFixed(2), "18% more than last month");
  } else {
    monthBody = NOTIF_VARIANTS.monthly.factual(monthName, totalRoundup.toFixed(2), taxSaving.toFixed(2));
  }

  db.insert(notifications).values({
    id: nanoid(),
    userId,
    type: "monthly",
    title: `${monthName} Progress`,
    body: monthBody,
    read: false,
    createdAt: new Date(state.currentDate).toISOString(),
  }).run();
  notifs.push(`${monthName} Progress`);

  // Check milestones
  const ytdTotal = getYtdTotal(userId);
  const milestones = [100, 250, 500, 1000, 1500, 2000];
  const previousTotal = ytdTotal - totalRoundup;
  for (const m of milestones) {
    if (previousTotal < m && ytdTotal >= m) {
      const milestoneStyle = style;
      let milestoneBody: string;
      if (milestoneStyle === "warm") {
        milestoneBody = NOTIF_VARIANTS.milestone.warm(m.toString(), "That's hundreds of meals and medical kits funded");
      } else if (milestoneStyle === "motivational") {
        milestoneBody = NOTIF_VARIANTS.milestone.motivational(m.toString(), (2000 - m).toString());
      } else {
        milestoneBody = NOTIF_VARIANTS.milestone.factual(m.toString());
      }
      db.insert(notifications).values({
        id: nanoid(),
        userId,
        type: "milestone",
        title: `€${m} Milestone!`,
        body: milestoneBody,
        read: false,
        createdAt: new Date(state.currentDate).toISOString(),
      }).run();
      notifs.push(`€${m} Milestone`);
    }
  }

  // Tax ceiling proximity
  const enhanced = getEnhancedTotal(userId);
  if (enhanced > 1800 && enhanced <= 2000) {
    db.insert(notifications).values({
      id: nanoid(),
      userId,
      type: "charity_update",
      title: "Approaching Tax Ceiling",
      body: `You are within €${(2000 - enhanced).toFixed(0)} of the Loi Coluche ceiling. Once reached, further 75% rate donations won't increase your tax credit.`,
      read: false,
      createdAt: new Date(state.currentDate).toISOString(),
    }).run();
    notifs.push("Tax Ceiling Alert");
  }

  // Charity impact update (every month)
  const topCharity = Object.entries(allAllocations).sort((a, b) => b[1] - a[1])[0];
  if (topCharity) {
    db.insert(notifications).values({
      id: nanoid(),
      userId,
      type: "charity_update",
      title: `${topCharity[0]}: Impact Update`,
      body: `Thanks to donors like you, ${topCharity[0]} continues to make a difference. Your €${topCharity[1].toFixed(2)} this month contributes directly.`,
      read: false,
      createdAt: new Date(state.currentDate).toISOString(),
    }).run();
    notifs.push("Impact Update");
  }

  return {
    transactions: totalTx,
    roundupTotal: totalRoundup,
    allocations: Object.entries(allAllocations).map(([charity, amount]) => ({ charity, amount: +amount.toFixed(2) })),
    notifications: notifs,
    dayCount: state.dayCount,
  };
}

export function jumpToYearEnd(userId: string): SimResult {
  const state = getSimState(userId);
  const currentDate = new Date(state.currentDate);
  const yearEnd = new Date(currentDate.getFullYear(), 11, 31);
  const daysRemaining = Math.floor((yearEnd.getTime() - currentDate.getTime()) / 86400000);
  const monthsRemaining = Math.ceil(daysRemaining / 28);

  let totalTx = 0;
  let totalRoundup = 0;
  const allAllocations: Record<string, number> = {};
  const notifs: string[] = [];

  for (let m = 0; m < monthsRemaining; m++) {
    const result = simulateMonth(userId);
    totalTx += result.transactions;
    totalRoundup += result.roundupTotal;
    result.allocations.forEach((a) => {
      allAllocations[a.charity] = (allAllocations[a.charity] || 0) + a.amount;
    });
    notifs.push(...result.notifications);
  }

  return {
    transactions: totalTx,
    roundupTotal: +totalRoundup.toFixed(2),
    allocations: Object.entries(allAllocations).map(([charity, amount]) => ({ charity, amount: +amount.toFixed(2) })),
    notifications: notifs,
    dayCount: getSimState(userId).dayCount,
  };
}

export function triggerCrisis(userId: string) {
  const events = [
    { title: "Earthquake in Turkey", body: "A 7.1 magnitude earthquake has struck southeastern Turkey." },
    { title: "Flooding in Pakistan", body: "Severe monsoon flooding has displaced millions across Pakistan." },
    { title: "Refugee Emergency in Sudan", body: "Armed conflict has created a humanitarian crisis in Sudan." },
    { title: "Famine Response in Somalia", body: "Severe drought is threatening famine across the Horn of Africa." },
  ];
  const state = getSimState(userId);
  const rng = new SeededRandom(state.seed + state.dayCount + 999);
  const event = rng.pick(events);

  const style = (state.notificationStyle || "factual") as "factual" | "warm" | "motivational";
  let body: string;
  if (style === "warm") {
    body = NOTIF_VARIANTS.crisis.warm(event.title.split(" in ")[1] || "The affected region");
  } else if (style === "motivational") {
    body = NOTIF_VARIANTS.crisis.motivational(`${rng.intBetween(800, 3200)}`);
  } else {
    body = NOTIF_VARIANTS.crisis.factual(event.title);
  }

  db.insert(notifications).values({
    id: nanoid(),
    userId,
    type: "crisis",
    title: `Emergency: ${event.title}`,
    body: `${event.body} ${body}`,
    read: false,
    createdAt: new Date(state.currentDate).toISOString(),
  }).run();

  return event;
}

export function resetSimulation(userId: string) {
  db.delete(roundups).where(eq(roundups.userId, userId)).run();
  db.delete(notifications).where(eq(notifications.userId, userId)).run();

  // Delete allocations for user's debits
  const userDebits = db.select({ id: debits.id }).from(debits).where(eq(debits.userId, userId)).all();
  for (const d of userDebits) {
    db.delete(allocations).where(eq(allocations.debitId, d.id)).run();
  }
  db.delete(debits).where(eq(debits.userId, userId)).run();

  db.update(simulationState)
    .set({
      currentDate: new Date().toISOString().split("T")[0],
      dayCount: 0,
      seed: Math.floor(Math.random() * 100000),
    })
    .where(eq(simulationState.userId, userId))
    .run();
}

export function loadDemoProfile(userId: string, profile: "sophie" | "thomas" | "marie") {
  // Reset first
  resetSimulation(userId);

  const profiles = {
    sophie: { bracket: 0, charityCount: 2, months: 2 },
    thomas: { bracket: 2, charityCount: 4, months: 6 },
    marie: { bracket: 3, charityCount: 3, months: 10 },
  };

  const p = profiles[profile];

  // Update user
  db.update(users)
    .set({ incomeBracket: p.bracket })
    .where(eq(users.id, userId))
    .run();

  // Get charities and set allocations
  const allCharities = db.query.charities.findMany().sync();
  const selected = allCharities.slice(0, p.charityCount);
  const pctEach = Math.floor(100 / selected.length);
  const remainder = 100 - pctEach * selected.length;

  // Clear existing allocations
  db.delete(userCharities).where(eq(userCharities.userId, userId)).run();

  selected.forEach((c, i) => {
    db.insert(userCharities).values({
      id: nanoid(),
      userId,
      charityId: c.id,
      allocationPct: pctEach + (i === 0 ? remainder : 0),
    }).run();
  });

  // Enable simulation
  db.update(simulationState)
    .set({ enabled: true })
    .where(eq(simulationState.userId, userId))
    .run();

  // Simulate the months
  for (let m = 0; m < p.months; m++) {
    simulateMonth(userId);
  }
}

function getYtdTotal(userId: string): number {
  const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString();
  const all = db.select().from(roundups).where(eq(roundups.userId, userId)).all();
  return all.filter((r) => r.timestamp >= yearStart).reduce((s, r) => s + r.roundupAmount, 0);
}

function getEnhancedTotal(userId: string): number {
  const ytd = getYtdTotal(userId);
  const allocs = db.select({
    allocationPct: userCharities.allocationPct,
    taxRate: charities.taxRate,
  })
    .from(userCharities)
    .innerJoin(charities, eq(userCharities.charityId, charities.id))
    .where(eq(userCharities.userId, userId))
    .all();

  const totalPct = allocs.reduce((s, a) => s + a.allocationPct, 0);
  return allocs
    .filter((a) => a.taxRate === 75)
    .reduce((s, a) => s + ytd * (a.allocationPct / totalPct), 0);
}
