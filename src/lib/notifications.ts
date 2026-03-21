import { db } from '@/db';
import { notifications } from '@/db/schema';
import { eq, and, gte, desc, count } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// ─── Types ──────────────────────────────────────────────────────────────────

export type NotificationType =
  | 'weekly_summary'
  | 'monthly_progress'
  | 'milestone'
  | 'crisis'
  | 'charity_update'
  | 'debit_processed';

export interface NotificationRule {
  maxPerWeek: number;       // 3-5
  quietHoursStart: number;  // 22 (10pm)
  quietHoursEnd: number;    // 8 (8am)
  cooldownMinutes: number;  // 240 (4 hours)
}

const DEFAULT_RULES: NotificationRule = {
  maxPerWeek: 4,
  quietHoursStart: 22,
  quietHoursEnd: 8,
  cooldownMinutes: 240,
};

// ─── Cadence checks ─────────────────────────────────────────────────────────

function isWithinQuietHours(rules: NotificationRule): boolean {
  const hour = new Date().getHours();
  if (rules.quietHoursStart > rules.quietHoursEnd) {
    // Wraps around midnight (e.g. 22 to 8)
    return hour >= rules.quietHoursStart || hour < rules.quietHoursEnd;
  }
  return hour >= rules.quietHoursStart && hour < rules.quietHoursEnd;
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}

function getWeeklyNotificationCount(userId: string): number {
  const weekStart = getWeekStart();
  const result = db
    .select({ count: count() })
    .from(notifications)
    .where(
      and(
        eq(notifications.user_id, userId),
        gte(notifications.created_at, weekStart),
      ),
    )
    .get();
  return result?.count ?? 0;
}

function getLastNotificationTime(userId: string, type: string): Date | null {
  const result = db
    .select({ created_at: notifications.created_at })
    .from(notifications)
    .where(
      and(
        eq(notifications.user_id, userId),
        eq(notifications.type, type),
      ),
    )
    .orderBy(desc(notifications.created_at))
    .limit(1)
    .get();

  if (!result?.created_at) return null;
  return new Date(result.created_at);
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Determines whether a notification should be sent based on cadence rules.
 * Checks quiet hours, weekly cap, and per-type cooldown.
 */
export function shouldSendNotification(
  userId: string,
  type: string,
  rules?: NotificationRule,
): boolean {
  const r = rules ?? DEFAULT_RULES;

  // Check quiet hours
  if (isWithinQuietHours(r)) {
    return false;
  }

  // Check weekly cap
  const weeklyCount = getWeeklyNotificationCount(userId);
  if (weeklyCount >= r.maxPerWeek) {
    return false;
  }

  // Check per-type cooldown
  const lastSent = getLastNotificationTime(userId, type);
  if (lastSent) {
    const minutesSince = (Date.now() - lastSent.getTime()) / (1000 * 60);
    if (minutesSince < r.cooldownMinutes) {
      return false;
    }
  }

  return true;
}

/**
 * Creates a notification after checking cadence rules.
 * Silently skips if the cadence check fails.
 */
export function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
): void {
  if (!shouldSendNotification(userId, type)) {
    return;
  }

  db.insert(notifications)
    .values({
      id: nanoid(),
      user_id: userId,
      type,
      title,
      body,
      read: 0,
      created_at: new Date().toISOString(),
    })
    .run();
}

/**
 * Force-creates a notification without cadence checks.
 * Used for system-critical notifications or simulation.
 */
export function createNotificationForce(
  userId: string,
  type: string,
  title: string,
  body: string,
): void {
  db.insert(notifications)
    .values({
      id: nanoid(),
      user_id: userId,
      type,
      title,
      body,
      read: 0,
      created_at: new Date().toISOString(),
    })
    .run();
}
