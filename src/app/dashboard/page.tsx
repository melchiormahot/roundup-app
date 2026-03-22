'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, TrendingUp, Share2, AlertTriangle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Card, Badge, AnimatedNumber, BottomNav, ProgressBar } from '@/components/ui';
import { useAppStore } from '@/store';
import { getFeatureAccess } from '@/lib/levels';

// ─── Types ──────────────────────────────────────────────────────────────────

interface CharityData {
  id: string;
  name: string;
  icon: string | null;
  category: string | null;
  allocation_pct: number;
  brand_color: string | null;
  story: string | null;
  totalReceived: number;
}

interface Transaction {
  id: string;
  merchant_name: string | null;
  category: string | null;
  amount: number | null;
  timestamp: string | null;
}

interface Milestone {
  amount: number;
  reached: boolean;
  reachedAt?: string;
}

interface DashboardData {
  totalDonated: number;
  totalRoundups: number;
  charities: CharityData[];
  weeklyStats: { count: number; total: number; previousWeekTotal: number };
  recentTransactions: Transaction[];
  milestones: Milestone[];
  currentStreak: { startDate: string; days: number };
  activeCrisis: { id: string; name: string; description: string; charity_id: string } | null;
  taxPreview: {
    estimatedSaving: number;
    jurisdiction: string;
    ceilingUsed: number;
    ceilingTotal: number | null;
    ceilingPct: number;
  };
  socialProof: { donorsToday: number };
  nextMilestone: { amount: number; remaining: number } | null;
  nextBatchDate: string | null;
}

interface SessionData {
  isLoggedIn: boolean;
  userId?: string;
  name?: string;
  userLevel?: number;
  jurisdiction?: string;
  incomeBracket?: number;
  createdAt?: string;
  onboardingCompleted?: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const firstName = name.split(' ')[0];
  if (hour < 12) return `Good morning, ${firstName}`;
  if (hour < 18) return `Good afternoon, ${firstName}`;
  return `Good evening, ${firstName}`;
}

function getMealsCount(amount: number): number {
  return Math.floor(amount / 2.5);
}

function formatCurrency(amount: number): string {
  return amount.toFixed(2);
}

function getRelativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

function getMonthYear(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

const CATEGORY_VARIANTS: Record<string, 'green' | 'blue' | 'purple' | 'red' | 'yellow' | 'orange'> = {
  'Children & Youth': 'blue',
  'Environment': 'green',
  'Hunger & Poverty': 'orange',
  'Health': 'red',
  'Animal Welfare': 'purple',
  'Education': 'yellow',
  'Human Rights': 'red',
  'Social Services': 'blue',
};

function getCategoryVariant(category: string | null): 'green' | 'blue' | 'purple' | 'red' | 'yellow' | 'orange' {
  if (!category) return 'green';
  return CATEGORY_VARIANTS[category] ?? 'green';
}

// ─── Day tracker for first week ─────────────────────────────────────────────

function getFirstWeekDays(createdAt: string): { label: string; filled: boolean; isToday: boolean }[] {
  const created = new Date(createdAt);
  const now = new Date();
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Find the Monday of the creation week
  const createdDay = created.getDay();
  const mondayOffset = createdDay === 0 ? 6 : createdDay - 1;
  const weekMonday = new Date(created);
  weekMonday.setDate(created.getDate() - mondayOffset);
  weekMonday.setHours(0, 0, 0, 0);

  return dayLabels.map((label, i) => {
    const dayDate = new Date(weekMonday);
    dayDate.setDate(weekMonday.getDate() + i);
    const dayStart = new Date(dayDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayDate);
    dayEnd.setHours(23, 59, 59, 999);

    const isPast = dayEnd <= now && dayStart >= new Date(created.setHours(0, 0, 0, 0));
    const isToday =
      dayStart.toDateString() === now.toDateString();

    return {
      label,
      filled: isPast || isToday,
      isToday,
    };
  });
}

function isWithinFirstWeek(createdAt: string | undefined): boolean {
  if (!createdAt) return false;
  const created = new Date(createdAt);
  const now = new Date();
  const diff = now.getTime() - created.getTime();
  return diff < 7 * 24 * 60 * 60 * 1000;
}

// ─── Dashboard Page Component ───────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [weeklyExpanded, setWeeklyExpanded] = useState(false);
  const [celebratingMilestone, setCelebratingMilestone] = useState<number | null>(null);

  const {
    showWarmGlow,
    warmGlowMessage,
    warmGlowColor,
    dismissWarmGlow,
    unreadCount,
    setUser,
  } = useAppStore();

  // ── Fetch session + dashboard data ─────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [sessionRes, dashboardRes] = await Promise.all([
          fetch('/api/auth/session'),
          fetch('/api/dashboard'),
        ]);

        if (!sessionRes.ok || !dashboardRes.ok) {
          if (!cancelled) router.push('/login');
          return;
        }

        const sessionData: SessionData = await sessionRes.json();
        const dashboardData: DashboardData = await dashboardRes.json();

        if (!sessionData.isLoggedIn) {
          if (!cancelled) router.push('/login');
          return;
        }

        if (!cancelled) {
          setSession(sessionData);
          setData(dashboardData);
          setUser({
            id: sessionData.userId!,
            name: sessionData.name!,
            level: sessionData.userLevel ?? 1,
            jurisdiction: sessionData.jurisdiction ?? 'FR',
            incomeBracket: sessionData.incomeBracket ?? 0,
          });
          setLoading(false);
        }
      } catch {
        if (!cancelled) router.push('/login');
      }
    }

    load();
    return () => { cancelled = true; };
  }, [router, setUser]);

  // ── Auto-dismiss warm glow ────────────────────────────────────────────────

  useEffect(() => {
    if (!showWarmGlow) return;
    const timer = setTimeout(() => dismissWarmGlow(), 3000);
    return () => clearTimeout(timer);
  }, [showWarmGlow, dismissWarmGlow]);

  // ── Milestone celebration ─────────────────────────────────────────────────

  useEffect(() => {
    if (!data) return;
    const justReached = data.milestones.find(
      (m) => m.reached && m.amount === data.totalDonated
    );
    // Check for the highest reached milestone that's "close" to total
    const closeMatch = data.milestones
      .filter((m) => m.reached)
      .reverse()
      .find((m) => data.totalDonated - m.amount < 1);

    if (closeMatch) {
      setCelebratingMilestone(closeMatch.amount);
      const timer = setTimeout(() => setCelebratingMilestone(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [data]);

  // ── Derived state ─────────────────────────────────────────────────────────

  const level = session?.userLevel ?? 1;
  const features = useMemo(() => getFeatureAccess(level), [level]);
  const showFirstWeek = isWithinFirstWeek(session?.createdAt);

  // ── Loading skeleton ──────────────────────────────────────────────────────

  if (loading || !session || !data) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <div className="mx-auto max-w-[480px] px-4 pt-safe-top">
          <div className="safe-top pb-24 pt-6">
            <div className="space-y-3">
              {/* Greeting skeleton */}
              <div className="h-8 w-48 animate-pulse rounded-lg bg-bg-card" />
              {/* Total donated skeleton */}
              <div className="h-32 animate-pulse rounded-2xl bg-bg-card" />
              {/* Charity cards skeleton */}
              <div className="h-24 animate-pulse rounded-2xl bg-bg-card" />
              <div className="h-24 animate-pulse rounded-2xl bg-bg-card" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const meals = getMealsCount(data.totalDonated);
  const weeklyDelta = data.weeklyStats.total - data.weeklyStats.previousWeekTotal;
  const firstWeekDays = session.createdAt ? getFirstWeekDays(session.createdAt) : [];

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="mx-auto max-w-[480px] px-4">
        <div className="safe-top pb-24 pt-6">
          <div className="flex flex-col gap-3">

            {/* ─── Level 3: Crisis Banner ─────────────────────────── */}
            {level >= 3 && data.activeCrisis && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-2xl border border-accent-orange/30 bg-accent-orange/10 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-accent-orange/20 p-1.5">
                    <AlertTriangle size={18} style={{ color: 'var(--accent-orange)' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-text-primary">{data.activeCrisis.name}</p>
                    <p className="mt-0.5 text-xs text-text-secondary">{data.activeCrisis.description}</p>
                    <button
                      className="mt-2 min-h-[44px] text-xs font-semibold"
                      style={{ color: 'var(--accent-orange)' }}
                    >
                      Redirect round-ups
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── Greeting ───────────────────────────────────────── */}
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-bold tracking-tight text-text-primary"
            >
              {getGreeting(session.name ?? 'there')}
            </motion.h1>

            {/* ─── Level 1: Total Donated Card ────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              <Card className="relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-xs font-medium uppercase tracking-wider text-text-dim">
                    Your total impact
                  </p>
                  <div className="mt-2 flex items-baseline gap-1">
                    <AnimatedNumber
                      value={data.totalDonated}
                      prefix="€"
                      decimals={2}
                      duration={1000}
                      className="text-4xl font-bold tracking-tight text-accent-green"
                    />
                  </div>
                  <p className="mt-1.5 text-sm text-text-secondary">
                    {meals > 0
                      ? `That's about ${meals.toLocaleString()} meals funded`
                      : 'Every cent adds up to something meaningful'}
                  </p>

                  {/* Level 4: Monthly total with share */}
                  {level >= 4 && (
                    <div className="mt-3 flex items-center justify-between border-t border-border-primary pt-3">
                      <div>
                        <p className="text-xs text-text-dim">This month</p>
                        <p className="text-lg font-semibold text-text-primary">
                          €{formatCurrency(data.weeklyStats.total)}
                        </p>
                      </div>
                      <button
                        className="flex min-h-[44px] items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
                        style={{
                          backgroundColor: 'var(--bg-card-inner)',
                          color: 'var(--text-secondary)',
                        }}
                        aria-label="Share your impact"
                      >
                        <Share2 size={14} />
                        Share
                      </button>
                    </div>
                  )}
                </div>
                {/* Decorative gradient glow */}
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-3xl"
                  style={{ backgroundColor: 'var(--accent-green)' }}
                />
              </Card>
            </motion.div>

            {/* ─── Level 1: First Week Journey Tracker ─────────────── */}
            {showFirstWeek && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Card>
                  <p className="text-xs font-medium uppercase tracking-wider text-text-dim">
                    Your first week
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    {firstWeekDays.map((day) => (
                      <div key={day.label} className="flex flex-col items-center gap-1.5">
                        <div
                          className={[
                            'flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-all',
                            day.isToday
                              ? 'ring-2 ring-offset-2'
                              : '',
                            day.filled
                              ? 'text-bg-primary'
                              : 'border border-border-primary text-text-dim',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          style={
                            {
                              backgroundColor: day.filled ? 'var(--accent-green)' : undefined,
                              '--tw-ring-offset-color': 'var(--bg-card)',
                              '--tw-ring-color': day.isToday ? 'var(--accent-green)' : 'transparent',
                            } as React.CSSProperties
                          }
                        >
                          {day.filled ? '✓' : ''}
                        </div>
                        <span className={[
                          'text-[10px] font-medium',
                          day.isToday ? 'text-text-primary' : 'text-text-dim',
                        ].join(' ')}>
                          {day.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ─── Level 1: Charity List ──────────────────────────── */}
            {data.charities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="flex flex-col gap-2"
              >
                <p className="text-xs font-medium uppercase tracking-wider text-text-dim">
                  Your charities
                </p>
                {data.charities.map((charity) => (
                  <Card key={charity.id} className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg"
                      style={{
                        backgroundColor: charity.brand_color
                          ? `${charity.brand_color}20`
                          : 'var(--bg-card-inner)',
                      }}
                    >
                      {charity.icon ?? '💚'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-text-primary">
                          {charity.name}
                        </p>
                        <Badge variant={getCategoryVariant(charity.category)}>
                          {charity.category ?? 'Charity'}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-text-secondary">
                        {charity.allocation_pct}% of your round-ups
                      </p>
                    </div>
                  </Card>
                ))}
              </motion.div>
            )}

            {/* ─── Level 2: Weekly Summary Card ──────────────────── */}
            {level >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Card
                  onClick={() => setWeeklyExpanded((p) => !p)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-wider text-text-dim">
                      This week
                    </p>
                    {weeklyExpanded ? (
                      <ChevronUp size={16} className="text-text-dim" />
                    ) : (
                      <ChevronDown size={16} className="text-text-dim" />
                    )}
                  </div>
                  <div className="mt-2 flex items-baseline gap-4">
                    <div>
                      <p className="text-2xl font-bold text-text-primary">
                        €{formatCurrency(data.weeklyStats.total)}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {data.weeklyStats.count} round-up{data.weeklyStats.count !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Level 3: Delta indicator */}
                    {level >= 3 && weeklyDelta !== 0 && (
                      <span
                        className="flex items-center gap-0.5 text-xs font-medium"
                        style={{
                          color: weeklyDelta > 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                        }}
                      >
                        <TrendingUp
                          size={12}
                          style={{
                            transform: weeklyDelta < 0 ? 'rotate(180deg)' : undefined,
                          }}
                        />
                        {weeklyDelta > 0 ? '+' : ''}€{formatCurrency(Math.abs(weeklyDelta))} vs last week
                      </span>
                    )}
                  </div>

                  {data.nextBatchDate && (
                    <p className="mt-1 text-xs text-text-dim">
                      Next batch: {new Date(data.nextBatchDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  )}

                  {/* Expanded: Recent transactions */}
                  <AnimatePresence>
                    {weeklyExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 border-t border-border-primary pt-3">
                          <p className="mb-2 text-xs font-medium text-text-dim">Recent transactions</p>
                          <div className="flex flex-col gap-2">
                            {data.recentTransactions.slice(0, 8).map((tx) => (
                              <div
                                key={tx.id}
                                className="flex items-center justify-between"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm text-text-primary">
                                    {tx.merchant_name ?? 'Unknown merchant'}
                                  </p>
                                  <p className="text-[10px] text-text-dim">
                                    {tx.timestamp ? getRelativeTime(tx.timestamp) : ''}
                                  </p>
                                </div>
                                <p className="ml-3 text-sm font-medium" style={{ color: 'var(--accent-green)' }}>
                                  +€{formatCurrency(tx.amount ?? 0)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            )}

            {/* ─── Level 2: Tax Preview ──────────────────────────── */}
            {level >= 2 && data.taxPreview.estimatedSaving > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
              >
                <Card
                  onClick={() => router.push('/tax')}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-text-dim">
                        Estimated tax saving
                      </p>
                      <p
                        className="mt-1 text-xl font-bold"
                        style={{ color: 'var(--accent-blue)' }}
                      >
                        €{formatCurrency(data.taxPreview.estimatedSaving)}
                      </p>
                    </div>
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-full"
                      style={{ backgroundColor: 'var(--accent-blue)', opacity: 0.15 }}
                    >
                      <span style={{ color: 'var(--accent-blue)' }}>→</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ─── Level 2: Milestone Celebration ────────────────── */}
            {level >= 2 && celebratingMilestone !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <Card className="overflow-hidden border-accent-green/30 bg-accent-green/5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-green/15">
                      <Sparkles size={24} style={{ color: 'var(--accent-green)' }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary">
                        Milestone reached!
                      </p>
                      <p className="text-xs text-text-secondary">
                        You've contributed €{celebratingMilestone} in spare change. That's real impact.
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ─── Level 2: Social Proof ──────────────────────────── */}
            {level >= 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="py-1 text-center"
              >
                <p className="text-xs text-text-dim">
                  {data.socialProof.donorsToday.toLocaleString()} people contributed today
                </p>
              </motion.div>
            )}

            {/* ─── Level 3: Consistency Counter ──────────────────── */}
            {level >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Card>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-full"
                      style={{ backgroundColor: 'var(--accent-purple)', opacity: 0.15 }}
                    >
                      <Calendar size={18} style={{ color: 'var(--accent-purple)' }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        Giving since {getMonthYear(data.currentStreak.startDate)}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {data.currentStreak.days} days of making a difference
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ─── Level 3: Impact Story Card ────────────────────── */}
            {level >= 3 && data.charities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
              >
                {(() => {
                  // Rotate weekly among user's charities
                  const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
                  const charityIndex = weekNumber % data.charities.length;
                  const featured = data.charities[charityIndex];

                  return (
                    <Card className="relative overflow-hidden">
                      <p className="text-xs font-medium uppercase tracking-wider text-text-dim">
                        Your impact in action
                      </p>
                      <div className="mt-3 flex items-start gap-3">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base"
                          style={{
                            backgroundColor: featured.brand_color
                              ? `${featured.brand_color}20`
                              : 'var(--bg-card-inner)',
                          }}
                        >
                          {featured.icon ?? '💚'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-primary">
                            {featured.name}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                            {featured.story ??
                              `Your spare change is supporting ${featured.name}'s mission to create lasting change.`}
                          </p>
                        </div>
                      </div>
                      {/* Decorative brand color accent */}
                      <div
                        className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full opacity-10 blur-2xl"
                        style={{
                          backgroundColor: featured.brand_color ?? 'var(--accent-green)',
                        }}
                      />
                    </Card>
                  );
                })()}
              </motion.div>
            )}

            {/* ─── Level 4: Tax Ceiling Progress ─────────────────── */}
            {level >= 4 && data.taxPreview.ceilingTotal !== null && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
              >
                <Card>
                  <p className="text-xs font-medium uppercase tracking-wider text-text-dim">
                    Tax ceiling progress
                  </p>
                  <div className="mt-3 flex items-center gap-4">
                    {/* Circular progress */}
                    <div className="relative h-16 w-16 shrink-0">
                      <svg
                        className="h-full w-full -rotate-90"
                        viewBox="0 0 36 36"
                      >
                        <circle
                          cx="18"
                          cy="18"
                          r="15.5"
                          fill="none"
                          stroke="var(--progress-track)"
                          strokeWidth="3"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15.5"
                          fill="none"
                          stroke="var(--accent-blue)"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={`${data.taxPreview.ceilingPct * 0.974} 97.4`}
                          className="transition-all duration-700"
                        />
                      </svg>
                      <span
                        className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                        style={{ color: 'var(--accent-blue)' }}
                      >
                        {data.taxPreview.ceilingPct}%
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        €{formatCurrency(data.taxPreview.ceilingUsed)} used
                      </p>
                      <p className="text-xs text-text-secondary">
                        €{formatCurrency(data.taxPreview.ceilingTotal - data.taxPreview.ceilingUsed)} remaining in your tax ceiling
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ─── Level 4: Next Milestone Accelerator ────────────── */}
            {level >= 4 && data.nextMilestone && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <Card className="border-accent-yellow/20">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-full"
                      style={{ backgroundColor: 'var(--accent-yellow)', opacity: 0.15 }}
                    >
                      <TrendingUp size={16} style={{ color: 'var(--accent-yellow)' }} />
                    </div>
                    <p className="text-sm text-text-primary">
                      <span className="font-bold" style={{ color: 'var(--accent-yellow)' }}>
                        €{formatCurrency(data.nextMilestone.remaining)}
                      </span>
                      {' '}more to reach €{data.nextMilestone.amount}
                    </p>
                  </div>
                  <div className="mt-2">
                    <ProgressBar
                      value={((data.nextMilestone.amount - data.nextMilestone.remaining) / data.nextMilestone.amount) * 100}
                      color="var(--accent-yellow)"
                      label={`Progress toward €${data.nextMilestone.amount} milestone`}
                    />
                  </div>
                </Card>
              </motion.div>
            )}

          </div>
        </div>
      </div>

      {/* ─── Bottom Navigation ─────────────────────────────────────── */}
      <BottomNav level={level} unreadCount={unreadCount} currentPath="/dashboard" />

      {/* ─── Warm Glow Overlay ─────────────────────────────────────── */}
      <AnimatePresence>
        {showWarmGlow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            onClick={() => dismissWarmGlow()}
            role="dialog"
            aria-label="Contribution confirmation"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl border border-border-primary bg-bg-card p-8 text-center shadow-2xl"
            >
              {/* Gradient glow */}
              <div
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                  background: `radial-gradient(circle at center, ${warmGlowColor} 0%, transparent 70%)`,
                }}
              />
              <div className="relative z-10">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-green/15">
                  <span className="text-3xl">✨</span>
                </div>
                <p className="text-lg font-bold leading-snug text-text-primary">
                  {warmGlowMessage}
                </p>
                <p className="mt-2 text-xs text-text-dim">
                  Every round-up adds up
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
