'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Info } from 'lucide-react';
import { Card, BottomNav } from '@/components/ui';
import { useAppStore } from '@/store';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  read: number;
  created_at: string;
}

interface SessionData {
  isLoggedIn: boolean;
  userId?: string;
  name?: string;
  userLevel?: number;
  jurisdiction?: string;
  incomeBracket?: number;
}

// ─── Color map ──────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  weekly_summary: 'var(--accent-blue)',
  monthly_progress: 'var(--accent-green)',
  milestone: 'var(--accent-yellow)',
  crisis: 'var(--accent-red)',
  charity_update: 'var(--accent-purple)',
  debit_processed: 'var(--accent-green)',
};

function getDotColor(type: string): string {
  return TYPE_COLORS[type] ?? 'var(--accent-blue)';
}

// ─── Relative time ──────────────────────────────────────────────────────────

function getRelativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return '1 week ago';
  return `${weeks} weeks ago`;
}

// ─── Notifications Page ─────────────────────────────────────────────────────

export default function NotificationsPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const { unreadCount, setUnreadCount, setUser } = useAppStore();

  // ── Fetch session + notifications ─────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [sessionRes, notifRes] = await Promise.all([
          fetch('/api/auth/session'),
          fetch('/api/notifications'),
        ]);

        if (!sessionRes.ok || !notifRes.ok) {
          if (!cancelled) router.push('/login');
          return;
        }

        const sessionData: SessionData = await sessionRes.json();
        const notifData: { notifications: Notification[]; unreadCount: number } =
          await notifRes.json();

        if (!sessionData.isLoggedIn) {
          if (!cancelled) router.push('/login');
          return;
        }

        // Gate: Level 2+
        if ((sessionData.userLevel ?? 1) < 2) {
          if (!cancelled) router.push('/dashboard');
          return;
        }

        if (!cancelled) {
          setSession(sessionData);
          setItems(notifData.notifications);
          setUnreadCount(notifData.unreadCount);
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
  }, [router, setUser, setUnreadCount]);

  // ── Mark single as read ───────────────────────────────────────────────────

  const markAsRead = useCallback(async (notificationId: string) => {
    // Optimistic update
    setItems((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: 1 } : n,
      ),
    );
    setUnreadCount(Math.max(0, unreadCount - 1));

    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });
    } catch {
      // Revert on failure: refetch
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setItems(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    }
  }, [unreadCount, setUnreadCount]);

  // ── Mark all as read ──────────────────────────────────────────────────────

  const markAllRead = useCallback(async () => {
    // Optimistic update
    setItems((prev) => prev.map((n) => ({ ...n, read: 1 })));
    setUnreadCount(0);

    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
    } catch {
      // Revert on failure: refetch
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setItems(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    }
  }, [setUnreadCount]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const level = session?.userLevel ?? 2;
  const hasUnread = items.some((n) => n.read === 0);

  // ── Loading skeleton ──────────────────────────────────────────────────────

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <div className="mx-auto max-w-[480px] px-4">
          <div className="safe-top pb-24 pt-6">
            <div className="space-y-3">
              <div className="h-8 w-32 animate-pulse rounded-lg bg-bg-card" />
              <div className="h-20 animate-pulse rounded-2xl bg-bg-card" />
              <div className="h-20 animate-pulse rounded-2xl bg-bg-card" />
              <div className="h-20 animate-pulse rounded-2xl bg-bg-card" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="mx-auto max-w-[480px] px-4">
        <div className="safe-top pb-24 pt-6">
          <div className="flex flex-col gap-3">

            {/* ─── Header ───────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between"
            >
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                Activity
              </h1>
              {hasUnread && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150"
                  style={{
                    color: 'var(--accent-blue)',
                    backgroundColor: 'transparent',
                  }}
                  aria-label="Mark all notifications as read"
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              )}
            </motion.div>

            {/* ─── Info banner ───────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="rounded-xl p-3"
              style={{ backgroundColor: 'var(--bg-card-inner)' }}
            >
              <div className="flex items-start gap-2.5">
                <Info
                  size={14}
                  className="mt-0.5 shrink-0"
                  style={{ color: 'var(--text-dim)' }}
                />
                <p className="text-xs leading-relaxed text-text-dim">
                  Generating notifications requires simulating transactions first. Try the demo in Settings.
                </p>
              </div>
            </motion.div>

            {/* ─── Notification feed ────────────────────────────────── */}
            {items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Card>
                  <div className="flex flex-col items-center py-8 text-center">
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-full"
                      style={{ backgroundColor: 'var(--bg-card-inner)' }}
                    >
                      <Bell
                        size={24}
                        style={{ color: 'var(--text-dim)' }}
                      />
                    </div>
                    <p className="mt-4 text-sm font-medium text-text-secondary">
                      No notifications yet
                    </p>
                    <p className="mt-1 max-w-[240px] text-xs text-text-dim">
                      Your activity will appear here.
                    </p>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <AnimatePresence initial={false}>
                {items.map((notification, index) => {
                  const isUnread = notification.read === 0;
                  const dotColor = getDotColor(notification.type);

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 + index * 0.03 }}
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          if (isUnread) markAsRead(notification.id);
                        }}
                        onKeyDown={(e) => {
                          if ((e.key === 'Enter' || e.key === ' ') && isUnread) {
                            e.preventDefault();
                            markAsRead(notification.id);
                          }
                        }}
                        className="overflow-hidden rounded-2xl border transition-all duration-200"
                        style={{
                          backgroundColor: isUnread
                            ? 'var(--bg-card)'
                            : 'var(--bg-card)',
                          borderColor: isUnread
                            ? 'var(--border-secondary)'
                            : 'var(--border-primary)',
                          borderLeftWidth: isUnread ? 3 : 1,
                          borderLeftColor: isUnread
                            ? dotColor
                            : 'var(--border-primary)',
                          cursor: isUnread ? 'pointer' : 'default',
                          boxShadow: isUnread
                            ? '0 1px 3px var(--shadow)'
                            : 'none',
                        }}
                      >
                        <div className="flex items-start gap-3 p-4">
                          {/* Colored type dot */}
                          <div className="mt-1.5 shrink-0">
                            <div
                              className="h-2.5 w-2.5 rounded-full"
                              style={{
                                backgroundColor: dotColor,
                                boxShadow: isUnread
                                  ? `0 0 6px ${dotColor}`
                                  : 'none',
                              }}
                            />
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <p
                              className={[
                                'text-sm text-text-primary',
                                isUnread ? 'font-semibold' : 'font-normal',
                              ].join(' ')}
                            >
                              {notification.title}
                            </p>
                            <p
                              className="mt-0.5 text-xs leading-relaxed text-text-secondary"
                              style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {notification.body}
                            </p>
                            <p className="mt-1.5 text-[10px] text-text-dim">
                              {getRelativeTime(notification.created_at)}
                            </p>
                          </div>

                          {/* Unread indicator dot */}
                          {isUnread && (
                            <div className="mt-2 shrink-0">
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: 'var(--accent-blue)' }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}

          </div>
        </div>
      </div>

      {/* ─── Bottom Navigation ─────────────────────────────────────── */}
      <BottomNav level={level} unreadCount={unreadCount} currentPath="/notifications" />
    </div>
  );
}
