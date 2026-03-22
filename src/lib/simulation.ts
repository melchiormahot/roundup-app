import { db } from '@/db';
import {
  users,
  roundups,
  debits,
  allocations,
  notifications,
  simulation_state,
  user_charities,
  charities,
} from '@/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { createNotificationForce } from '@/lib/notifications';
import { calculateUserLevel } from '@/lib/levels';
import { getCeiling } from '@/lib/tax';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SimulationSummary {
  daysSimulated: number;
  transactionsGenerated: number;
  totalRoundups: number;
  notificationsCreated: number;
  debitsProcessed: number;
  newLevel: number | null;
  milestonesReached: string[];
}

export interface SimulationContext {
  userId: string;
  currentDate: string;
  dayCount: number;
  notificationStyle: string;
  preferredCoffeeShop: string;
  preferredSupermarket: string;
}

type NotificationStyle = 'factual' | 'warm' | 'motivational';

// ─── French Merchant Categories ─────────────────────────────────────────────

interface MerchantCategory {
  category: string;
  merchants: string[];
  minAmount: number;
  maxAmount: number;
  timeWindows: [number, number][]; // [startHour, endHour] pairs
  weekendWeight: number; // probability multiplier on weekends
}

const MERCHANT_CATEGORIES: MerchantCategory[] = [
  {
    category: 'coffee',
    merchants: ['Starbucks', 'Paul', 'Café de Flore', 'Columbus Café'],
    minAmount: 2.5,
    maxAmount: 5.5,
    timeWindows: [[7, 9]],
    weekendWeight: 0.5,
  },
  {
    category: 'boulangerie',
    merchants: ['Paul', 'La Mie Câline', 'Maison Kayser', 'Eric Kayser'],
    minAmount: 1.2,
    maxAmount: 8.0,
    timeWindows: [[7, 10], [16, 18]],
    weekendWeight: 1.2,
  },
  {
    category: 'supermarket',
    merchants: ['Monoprix', 'Carrefour', 'Franprix', 'Auchan', 'Lidl'],
    minAmount: 12,
    maxAmount: 85,
    timeWindows: [[10, 20]],
    weekendWeight: 1.5,
  },
  {
    category: 'metro',
    merchants: ['RATP', 'Navigo', 'SNCF'],
    minAmount: 1.9,
    maxAmount: 4.0,
    timeWindows: [[7, 9], [17, 19]],
    weekendWeight: 0.2,
  },
  {
    category: 'restaurant',
    merchants: ['Big Mamma', 'Flunch', 'Hippopotamus', 'Local bistro'],
    minAmount: 14,
    maxAmount: 45,
    timeWindows: [[12, 14], [19, 22]],
    weekendWeight: 1.3,
  },
  {
    category: 'online',
    merchants: ['Amazon', 'Fnac', 'Cdiscount', 'ASOS', 'Vinted'],
    minAmount: 8,
    maxAmount: 120,
    timeWindows: [[0, 24]], // anytime
    weekendWeight: 1.0,
  },
  {
    category: 'pharmacy',
    merchants: ['Pharmacie Lafayette', 'Parapharmacie'],
    minAmount: 3,
    maxAmount: 35,
    timeWindows: [[10, 19]],
    weekendWeight: 0.6,
  },
  {
    category: 'bar',
    merchants: ['Le Comptoir', 'PMU', 'Café Oz'],
    minAmount: 4,
    maxAmount: 18,
    timeWindows: [[18, 23]],
    weekendWeight: 2.0,
  },
];

const DECEMBER_MERCHANTS = ['Galeries Lafayette', 'FNAC Noel', 'Marché de Noël'];

// ─── Seasonal Modifiers ─────────────────────────────────────────────────────

const SEASONAL_MODIFIERS: Record<number, number> = {
  1: 0.7,   // January: post-holiday belt tightening
  2: 0.9,
  3: 0.9,
  4: 1.0,
  5: 1.0,
  6: 1.0,
  7: 1.3,   // July: summer spending
  8: 1.1,
  9: 1.0,
  10: 1.0,
  11: 1.0,
  12: 1.5,  // December: holiday spending
};

// ─── Milestone Thresholds ───────────────────────────────────────────────────

const MILESTONE_THRESHOLDS = [10, 25, 50, 100, 250, 500, 1000, 1500, 2000];

// ─── Crisis Templates ───────────────────────────────────────────────────────

export const CRISIS_TEMPLATES = [
  {
    title: 'Earthquake in Turkey',
    body: 'A devastating earthquake has struck southeastern Turkey. The Red Cross is mobilizing emergency relief. Consider redirecting your round-ups to support the response.',
    charity: 'Red Cross',
  },
  {
    title: 'Flooding in Bangladesh',
    body: 'Catastrophic flooding has displaced millions in Bangladesh. MSF teams are providing emergency medical care and clean water. Your support can save lives.',
    charity: 'MSF',
  },
  {
    title: 'Refugee Emergency in Sudan',
    body: 'A refugee crisis is unfolding in Sudan as conflict forces families to flee. UNICEF is providing emergency supplies for children. Every cent helps.',
    charity: 'UNICEF',
  },
  {
    title: 'Famine in East Africa',
    body: 'A severe famine threatens millions across East Africa. Food aid organizations are racing to deliver supplies. Your round-ups can help feed families in need.',
    charity: 'Welthungerhilfe',
  },
];

// ─── Demo Profile Definitions ───────────────────────────────────────────────

export interface DemoProfile {
  name: string;
  daysActive: number;
  txPerDayMin: number;
  txPerDayMax: number;
  amountMultiplier: number;
  targetLevel: number;
  charityCount: number;
}

export const DEMO_PROFILES: Record<string, DemoProfile> = {
  sophie: {
    name: 'Sophie',
    daysActive: 60,
    txPerDayMin: 3,
    txPerDayMax: 5,
    amountMultiplier: 0.7, // student, lower spending
    targetLevel: 2,
    charityCount: 2,
  },
  thomas: {
    name: 'Thomas',
    daysActive: 180,
    txPerDayMin: 5,
    txPerDayMax: 7,
    amountMultiplier: 1.0,
    targetLevel: 3,
    charityCount: 3,
  },
  marie: {
    name: 'Marie',
    daysActive: 300,
    txPerDayMin: 6,
    txPerDayMax: 9,
    amountMultiplier: 1.4, // executive, higher spending
    targetLevel: 4,
    charityCount: 3,
  },
};

// ─── Utility Functions ──────────────────────────────────────────────────────

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function getMonth(dateStr: string): number {
  return new Date(dateStr).getMonth() + 1; // 1-based
}

function getDayOfWeek(dateStr: string): number {
  return new Date(dateStr).getDay(); // 0=Sunday, 6=Saturday
}

function isWeekend(dateStr: string): boolean {
  const day = getDayOfWeek(dateStr);
  return day === 0 || day === 6;
}

function isSaturday(dateStr: string): boolean {
  return getDayOfWeek(dateStr) === 6;
}

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomInRange(min, max + 1));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Deterministic-ish preferred merchant based on userId */
function pickPreferred(merchants: string[], userId: string, salt: string): string {
  let hash = 0;
  const s = userId + salt;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
  }
  return merchants[Math.abs(hash) % merchants.length];
}

// ─── Transaction Generation ─────────────────────────────────────────────────

interface GeneratedTransaction {
  amount: number;
  merchantName: string;
  category: string;
  timestamp: string;
}

/**
 * Generate realistic transactions for a single day.
 */
export function generateDayTransactions(
  dateStr: string,
  context: SimulationContext,
  options?: { txMin?: number; txMax?: number; amountMultiplier?: number },
): GeneratedTransaction[] {
  const weekend = isWeekend(dateStr);
  const month = getMonth(dateStr);
  const seasonalMod = SEASONAL_MODIFIERS[month] ?? 1.0;
  const amountMult = (options?.amountMultiplier ?? 1.0) * seasonalMod;

  // Determine transaction count
  const baseMin = options?.txMin ?? (weekend ? 2 : 4);
  const baseMax = options?.txMax ?? (weekend ? 5 : 8);
  const txCount = randomInt(baseMin, baseMax);

  const transactions: GeneratedTransaction[] = [];

  // Build weighted category pool based on time-of-day and weekend
  const categoryPool: { cat: MerchantCategory; hour: number }[] = [];

  for (let i = 0; i < txCount; i++) {
    // Pick a random hour to target
    const hour = randomInt(7, 22);

    // Filter categories available at this hour
    const available = MERCHANT_CATEGORIES.filter((cat) => {
      const inWindow = cat.timeWindows.some(([start, end]) => hour >= start && hour < end);
      if (!inWindow) return false;
      // Weekend weight check - probability of inclusion
      if (weekend && Math.random() > cat.weekendWeight) return false;
      return true;
    });

    if (available.length === 0) continue;
    categoryPool.push({ cat: pick(available), hour });
  }

  // Recurring patterns
  const coffeeShop = context.preferredCoffeeShop;
  const supermarket = context.preferredSupermarket;

  // Saturday weekly supermarket trip
  if (isSaturday(dateStr)) {
    const superCat = MERCHANT_CATEGORIES.find((c) => c.category === 'supermarket')!;
    const amt = +(randomInRange(superCat.minAmount, superCat.maxAmount) * amountMult).toFixed(2);
    transactions.push({
      amount: amt,
      merchantName: supermarket,
      category: 'supermarket',
      timestamp: `${dateStr}T${String(randomInt(10, 12)).padStart(2, '0')}:${String(randomInt(0, 59)).padStart(2, '0')}:00Z`,
    });
  }

  for (const { cat, hour } of categoryPool) {
    let merchantName: string;

    // Use preferred coffee shop on weekday mornings
    if (cat.category === 'coffee' && !weekend) {
      merchantName = coffeeShop;
    } else if (cat.category === 'supermarket') {
      // Usually same supermarket
      merchantName = Math.random() < 0.8 ? supermarket : pick(cat.merchants);
    } else {
      merchantName = pick(cat.merchants);
    }

    // December seasonal merchants
    if (month === 12 && Math.random() < 0.2) {
      merchantName = pick(DECEMBER_MERCHANTS);
    }

    const baseAmount = randomInRange(cat.minAmount, cat.maxAmount);
    const amount = +(baseAmount * amountMult).toFixed(2);
    const minute = randomInt(0, 59);

    transactions.push({
      amount,
      merchantName,
      category: cat.category,
      timestamp: `${dateStr}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00Z`,
    });
  }

  // Sort by timestamp
  transactions.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  return transactions;
}

// ─── Round-up Calculation ───────────────────────────────────────────────────

export interface RoundupResult {
  purchaseAmount: number;
  roundupAmount: number;
  merchantName: string;
  category: string;
  timestamp: string;
}

/**
 * Calculate roundup for a transaction.
 * Returns null if amount is a whole number (roundup would be 0).
 */
export function calculateRoundup(tx: GeneratedTransaction): RoundupResult | null {
  const roundup = +(Math.ceil(tx.amount) - tx.amount).toFixed(2);
  if (roundup <= 0) return null;

  return {
    purchaseAmount: tx.amount,
    roundupAmount: roundup,
    merchantName: tx.merchantName,
    category: tx.category,
    timestamp: tx.timestamp,
  };
}

// ─── Allocation Processing ──────────────────────────────────────────────────

interface UserCharity {
  charityId: string;
  allocationPct: number;
  taxRate: number | null;
}

/**
 * Get user's charity allocations.
 */
export function getUserCharities(userId: string): UserCharity[] {
  const rows = db
    .select({
      charityId: user_charities.charity_id,
      allocationPct: user_charities.allocation_pct,
      taxRate: charities.tax_rate,
    })
    .from(user_charities)
    .leftJoin(charities, eq(user_charities.charity_id, charities.id))
    .where(eq(user_charities.user_id, userId))
    .all();

  return rows.map((r) => ({
    charityId: r.charityId!,
    allocationPct: r.allocationPct ?? 0,
    taxRate: r.taxRate,
  }));
}

// ─── Debit Batching ─────────────────────────────────────────────────────────

interface DebitResult {
  debitId: string;
  totalAmount: number;
  roundupCount: number;
  allocationCount: number;
}

/**
 * Process a debit batch: sum roundups in period, create debit + allocations.
 */
export function processDebitBatch(
  userId: string,
  periodStart: string,
  periodEnd: string,
  userCharityList: UserCharity[],
): DebitResult | null {
  // Sum roundups in period
  const periodRoundups = db
    .select({
      total: sql<number>`COALESCE(SUM(${roundups.amount}), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(roundups)
    .where(
      and(
        eq(roundups.user_id, userId),
        gte(roundups.timestamp, periodStart),
        lte(roundups.timestamp, periodEnd + 'T23:59:59Z'),
      ),
    )
    .get();

  const totalAmount = periodRoundups?.total ?? 0;
  const roundupCount = periodRoundups?.count ?? 0;

  if (totalAmount <= 0 || roundupCount === 0) return null;

  const debitId = nanoid();

  // Create debit record
  db.insert(debits)
    .values({
      id: debitId,
      user_id: userId,
      total_amount: +totalAmount.toFixed(2),
      period_start: periodStart,
      period_end: periodEnd,
      roundup_count: roundupCount,
      status: 'completed',
    })
    .run();

  // Create allocation records
  let allocationCount = 0;
  if (userCharityList.length > 0) {
    for (const uc of userCharityList) {
      const allocAmount = +(totalAmount * (uc.allocationPct / 100)).toFixed(2);
      if (allocAmount > 0) {
        db.insert(allocations)
          .values({
            id: nanoid(),
            debit_id: debitId,
            charity_id: uc.charityId,
            amount: allocAmount,
            tax_rate: uc.taxRate ?? 66,
          })
          .run();
        allocationCount++;
      }
    }
  }

  return {
    debitId,
    totalAmount: +totalAmount.toFixed(2),
    roundupCount,
    allocationCount,
  };
}

// ─── Milestone Checking ─────────────────────────────────────────────────────

/**
 * Check if any milestones were newly crossed.
 * Returns the list of milestone amounts crossed.
 */
export function checkMilestones(
  userId: string,
  previousTotal: number,
  currentTotal: number,
): number[] {
  const crossed: number[] = [];

  for (const threshold of MILESTONE_THRESHOLDS) {
    if (previousTotal < threshold && currentTotal >= threshold) {
      crossed.push(threshold);
    }
  }

  return crossed;
}

/**
 * Create milestone notifications.
 */
export function createMilestoneNotifications(
  userId: string,
  milestones: number[],
  dateStr: string,
): number {
  let count = 0;
  for (const m of milestones) {
    createNotificationForce(
      userId,
      'milestone',
      `Milestone reached: €${m}!`,
      `Congratulations! You have donated a total of €${m} through round-ups. Your generosity is making a real difference.`,
    );
    count++;
  }
  return count;
}

// ─── Notification Generation ────────────────────────────────────────────────

interface WeeklyStats {
  roundupCount: number;
  totalAmount: number;
  charityCount: number;
}

export function generateWeeklySummary(
  style: NotificationStyle,
  stats: WeeklyStats,
): { title: string; body: string } {
  const amt = stats.totalAmount.toFixed(2);

  switch (style) {
    case 'factual':
      return {
        title: 'Weekly Summary',
        body: `This week: ${stats.roundupCount} round-ups totaling €${amt} across ${stats.charityCount} charities.`,
      };
    case 'warm':
      return {
        title: 'Your Week in Giving',
        body: `Your spare change made a difference this week. €${amt} contributed across ${stats.charityCount} charities.`,
      };
    case 'motivational':
      return {
        title: 'Another Great Week!',
        body: `Another week of impact! €${amt} in spare change, ${stats.charityCount} charities supported. Keep it going!`,
      };
    default:
      return {
        title: 'Weekly Summary',
        body: `This week: ${stats.roundupCount} round-ups totaling €${amt} across ${stats.charityCount} charities.`,
      };
  }
}

interface MonthlyStats {
  roundupCount: number;
  totalAmount: number;
  charityCount: number;
  daysActive: number;
}

export function generateMonthlySummary(
  style: NotificationStyle,
  stats: MonthlyStats,
): { title: string; body: string } {
  const amt = stats.totalAmount.toFixed(2);

  switch (style) {
    case 'factual':
      return {
        title: 'Monthly Progress',
        body: `This month: ${stats.roundupCount} round-ups totaling €${amt} across ${stats.charityCount} charities over ${stats.daysActive} active days.`,
      };
    case 'warm':
      return {
        title: 'A Month of Giving',
        body: `What a month! Your spare change contributed €${amt} to ${stats.charityCount} charities. Every cent made a difference.`,
      };
    case 'motivational':
      return {
        title: 'Monthly Impact Report',
        body: `${stats.daysActive} days, ${stats.roundupCount} round-ups, €${amt} donated. You are building a habit of generosity. Keep going!`,
      };
    default:
      return {
        title: 'Monthly Progress',
        body: `This month: ${stats.roundupCount} round-ups totaling €${amt} across ${stats.charityCount} charities.`,
      };
  }
}

export function generateTaxCeilingNotification(
  remaining: number,
): { title: string; body: string } {
  return {
    title: 'Approaching Tax Deduction Ceiling',
    body: `You are within €${remaining.toFixed(2)} of your annual tax deduction ceiling. Donations beyond this limit will not be tax-deductible this year.`,
  };
}

// ─── Level Progression ──────────────────────────────────────────────────────

/**
 * Recalculate and update user level.
 * Returns the new level if it changed, null otherwise.
 */
export function updateUserLevel(
  userId: string,
  totalDonated: number,
  simDateStr: string,
): number | null {
  const user = db
    .select({
      userLevel: users.user_level,
      levelUnlockedAt: users.level_unlocked_at,
      createdAt: users.created_at,
    })
    .from(users)
    .where(eq(users.id, userId))
    .get();

  if (!user) return null;

  const createdAt = user.createdAt ? new Date(user.createdAt) : new Date();
  const simDate = new Date(simDateStr);
  const daysSinceCreation = Math.floor(
    (simDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
  );

  const levelUnlockedAt: Record<number, string> = user.levelUnlockedAt
    ? JSON.parse(user.levelUnlockedAt)
    : {};

  const currentLevel = user.userLevel ?? 1;

  const newLevel = calculateUserLevel({
    daysSinceCreation,
    totalDonated,
    currentLevel,
    levelUnlockedAt,
  });

  if (newLevel > currentLevel) {
    levelUnlockedAt[newLevel] = simDateStr;
    db.update(users)
      .set({
        user_level: newLevel,
        level_unlocked_at: JSON.stringify(levelUnlockedAt),
      })
      .where(eq(users.id, userId))
      .run();
    return newLevel;
  }

  return null;
}

// ─── Tax Ceiling Check ──────────────────────────────────────────────────────

export function checkTaxCeiling(
  userId: string,
  totalDonated: number,
): number | null {
  const user = db
    .select({
      jurisdiction: users.jurisdiction,
      incomeBracket: users.income_bracket,
    })
    .from(users)
    .where(eq(users.id, userId))
    .get();

  if (!user) return null;

  const ceiling = getCeiling(user.jurisdiction ?? 'FR', user.incomeBracket ?? 0);
  if (ceiling === Infinity) return null;

  const remaining = ceiling - totalDonated;
  if (remaining > 0 && remaining <= 200) {
    return remaining;
  }
  return null;
}

// ─── Get Total Donated ──────────────────────────────────────────────────────

export function getTotalDonated(userId: string): number {
  const result = db
    .select({
      total: sql<number>`COALESCE(SUM(${roundups.amount}), 0)`,
    })
    .from(roundups)
    .where(eq(roundups.user_id, userId))
    .get();

  return result?.total ?? 0;
}

// ─── Get Roundup Stats for Period ───────────────────────────────────────────

export function getRoundupStatsForPeriod(
  userId: string,
  startDate: string,
  endDate: string,
): { count: number; total: number } {
  const result = db
    .select({
      count: sql<number>`COUNT(*)`,
      total: sql<number>`COALESCE(SUM(${roundups.amount}), 0)`,
    })
    .from(roundups)
    .where(
      and(
        eq(roundups.user_id, userId),
        gte(roundups.timestamp, startDate),
        lte(roundups.timestamp, endDate + 'T23:59:59Z'),
      ),
    )
    .get();

  return {
    count: result?.count ?? 0,
    total: result?.total ?? 0,
  };
}

// ─── Core Simulation: Simulate N Days ───────────────────────────────────────

export interface SimulateOptions {
  userId: string;
  daysToSimulate: number;
  startDate: string;
  startDayCount: number;
  notificationStyle: NotificationStyle;
  txMin?: number;
  txMax?: number;
  amountMultiplier?: number;
}

export function simulateDays(options: SimulateOptions): SimulationSummary {
  const {
    userId,
    daysToSimulate,
    startDate,
    startDayCount,
    notificationStyle,
    txMin,
    txMax,
    amountMultiplier,
  } = options;

  // Build context
  const coffeeCat = MERCHANT_CATEGORIES.find((c) => c.category === 'coffee')!;
  const superCat = MERCHANT_CATEGORIES.find((c) => c.category === 'supermarket')!;

  const context: SimulationContext = {
    userId,
    currentDate: startDate,
    dayCount: startDayCount,
    notificationStyle,
    preferredCoffeeShop: pickPreferred(coffeeCat.merchants, userId, 'coffee'),
    preferredSupermarket: pickPreferred(superCat.merchants, userId, 'super'),
  };

  // Get user charities
  const userCharityList = getUserCharities(userId);
  const charityCount = userCharityList.length;

  let totalTransactions = 0;
  let totalRoundupAmount = 0;
  let totalNotifications = 0;
  let totalDebits = 0;
  const milestonesReached: string[] = [];
  let lastLevelChange: number | null = null;

  let currentDate = startDate;
  let dayCount = startDayCount;
  let weekDayCounter = 0; // days within current week cycle
  let monthDayCounter = 0; // days within current month cycle
  let weekStartDate = startDate;
  let monthStartDate = startDate;

  // Track total donated before simulation for milestone detection
  let previousTotal = getTotalDonated(userId);

  for (let d = 0; d < daysToSimulate; d++) {
    currentDate = addDays(currentDate, 1);
    dayCount++;
    weekDayCounter++;
    monthDayCounter++;

    // Generate transactions for this day
    const transactions = generateDayTransactions(currentDate, context, {
      txMin,
      txMax,
      amountMultiplier,
    });

    // Process each transaction
    for (const tx of transactions) {
      const roundup = calculateRoundup(tx);
      if (roundup) {
        db.insert(roundups)
          .values({
            id: nanoid(),
            user_id: userId,
            amount: roundup.roundupAmount,
            merchant_name: roundup.merchantName,
            category: roundup.category,
            timestamp: roundup.timestamp,
          })
          .run();

        totalTransactions++;
        totalRoundupAmount += roundup.roundupAmount;
      }
    }

    // Check milestones after each day
    const currentTotal = previousTotal + totalRoundupAmount;
    const newMilestones = checkMilestones(userId, previousTotal + totalRoundupAmount - (transactions.reduce((sum, tx) => {
      const r = calculateRoundup(tx);
      return sum + (r?.roundupAmount ?? 0);
    }, 0)), currentTotal);

    if (newMilestones.length > 0) {
      const notifCount = createMilestoneNotifications(userId, newMilestones, currentDate);
      totalNotifications += notifCount;
      for (const m of newMilestones) {
        milestonesReached.push(`€${m}`);
      }
    }

    // Weekly processing (every 7 days)
    if (weekDayCounter >= 7) {
      // Debit batch
      const debitResult = processDebitBatch(userId, weekStartDate, currentDate, userCharityList);
      if (debitResult) {
        totalDebits++;
      }

      // Weekly summary notification
      const weekStats = getRoundupStatsForPeriod(userId, weekStartDate, currentDate);
      const summary = generateWeeklySummary(notificationStyle, {
        roundupCount: weekStats.count,
        totalAmount: weekStats.total,
        charityCount,
      });
      createNotificationForce(userId, 'weekly_summary', summary.title, summary.body);
      totalNotifications++;

      weekDayCounter = 0;
      weekStartDate = currentDate;
    }

    // Monthly processing (every ~30 days)
    if (monthDayCounter >= 30) {
      const monthStats = getRoundupStatsForPeriod(userId, monthStartDate, currentDate);
      const monthlySummary = generateMonthlySummary(notificationStyle, {
        roundupCount: monthStats.count,
        totalAmount: monthStats.total,
        charityCount,
        daysActive: monthDayCounter,
      });
      createNotificationForce(userId, 'monthly_progress', monthlySummary.title, monthlySummary.body);
      totalNotifications++;

      monthDayCounter = 0;
      monthStartDate = currentDate;
    }

    // Level progression check (daily)
    const totalDonatedNow = getTotalDonated(userId);
    const levelChange = updateUserLevel(userId, totalDonatedNow, currentDate);
    if (levelChange !== null) {
      lastLevelChange = levelChange;
      createNotificationForce(
        userId,
        'milestone',
        `Level ${levelChange} Unlocked!`,
        `You have reached level ${levelChange}! New features are now available.`,
      );
      totalNotifications++;
    }

    // Tax ceiling proximity check
    const ceilingRemaining = checkTaxCeiling(userId, totalDonatedNow);
    if (ceilingRemaining !== null) {
      const ceilingNotif = generateTaxCeilingNotification(ceilingRemaining);
      createNotificationForce(userId, 'charity_update', ceilingNotif.title, ceilingNotif.body);
      totalNotifications++;
    }
  }

  // Update simulation state
  db.update(simulation_state)
    .set({
      current_date: currentDate,
      day_count: dayCount,
    })
    .where(eq(simulation_state.user_id, userId))
    .run();

  return {
    daysSimulated: daysToSimulate,
    transactionsGenerated: totalTransactions,
    totalRoundups: +totalRoundupAmount.toFixed(2),
    notificationsCreated: totalNotifications,
    debitsProcessed: totalDebits,
    newLevel: lastLevelChange,
    milestonesReached,
  };
}

// ─── Reset All User Simulation Data ─────────────────────────────────────────

export function resetSimulationData(userId: string): void {
  // Delete allocations for user's debits
  const userDebits = db
    .select({ id: debits.id })
    .from(debits)
    .where(eq(debits.user_id, userId))
    .all();

  for (const d of userDebits) {
    db.delete(allocations).where(eq(allocations.debit_id, d.id)).run();
  }

  // Delete debits
  db.delete(debits).where(eq(debits.user_id, userId)).run();

  // Delete roundups
  db.delete(roundups).where(eq(roundups.user_id, userId)).run();

  // Delete notifications
  db.delete(notifications).where(eq(notifications.user_id, userId)).run();

  // Reset simulation state
  const today = new Date().toISOString().split('T')[0];
  db.update(simulation_state)
    .set({ current_date: today, day_count: 0 })
    .where(eq(simulation_state.user_id, userId))
    .run();

  // Reset user level
  db.update(users)
    .set({
      user_level: 1,
      level_unlocked_at: JSON.stringify({ '1': today }),
    })
    .where(eq(users.id, userId))
    .run();
}
