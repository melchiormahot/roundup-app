import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { db } from '@/db';
import { notifications } from '@/db/schema';
import { eq, and, desc, count } from 'drizzle-orm';

// ─── GET: Fetch notifications for current user ──────────────────────────────

export async function GET() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  if (!session.isLoggedIn || !session.userId) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const userId = session.userId;

  // Fetch all notifications, newest first
  const rows = db
    .select()
    .from(notifications)
    .where(eq(notifications.user_id, userId))
    .orderBy(desc(notifications.created_at))
    .limit(50)
    .all();

  // Count unread
  const unreadResult = db
    .select({ count: count() })
    .from(notifications)
    .where(
      and(
        eq(notifications.user_id, userId),
        eq(notifications.read, 0),
      ),
    )
    .get();

  const unreadCount = unreadResult?.count ?? 0;

  return Response.json({
    notifications: rows,
    unreadCount,
  });
}

// ─── POST: Mark notification(s) as read ─────────────────────────────────────

export async function POST(request: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  if (!session.isLoggedIn || !session.userId) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const userId = session.userId;

  let body: { notificationId?: string; markAllRead?: boolean };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (body.markAllRead) {
    // Mark all as read for this user
    db.update(notifications)
      .set({ read: 1 })
      .where(
        and(
          eq(notifications.user_id, userId),
          eq(notifications.read, 0),
        ),
      )
      .run();

    return Response.json({ success: true, markedAll: true });
  }

  if (body.notificationId) {
    // Mark a single notification as read (only if it belongs to this user)
    db.update(notifications)
      .set({ read: 1 })
      .where(
        and(
          eq(notifications.id, body.notificationId),
          eq(notifications.user_id, userId),
        ),
      )
      .run();

    return Response.json({ success: true, notificationId: body.notificationId });
  }

  return Response.json({ error: 'Provide notificationId or markAllRead' }, { status: 400 });
}
