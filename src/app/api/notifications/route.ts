import { NextResponse } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { getSession } from "@/lib/session";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifs = db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, session.userId))
    .orderBy(desc(notifications.createdAt))
    .all();

  const unreadCount = notifs.filter((n) => !n.read).length;

  return NextResponse.json({ notifications: notifs, unreadCount });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();

  db.update(notifications)
    .set({ read: true })
    .where(eq(notifications.id, id))
    .run();

  return NextResponse.json({ success: true });
}
