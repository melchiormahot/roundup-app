import { NextResponse } from "next/server";
import { db } from "@/db";
import { simulationState } from "@/db/schema";
import { getSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import {
  getSimState,
  simulateDay,
  simulateWeek,
  simulateMonth,
  jumpToYearEnd,
  triggerCrisis,
  resetSimulation,
  loadDemoProfile,
} from "@/lib/simulation";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = getSimState(session.userId);
  return NextResponse.json({
    enabled: state.enabled,
    currentDate: state.currentDate,
    dayCount: state.dayCount,
    notificationStyle: state.notificationStyle,
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action, profile, notificationStyle } = await request.json();

  // Check charities exist before simulating
  if (["day", "week", "month", "yearEnd"].includes(action)) {
    const { userCharities } = await import("@/db/schema");
    const allocs = db.select().from(userCharities).where(eq(userCharities.userId, session.userId)).all();
    if (allocs.length === 0) {
      return NextResponse.json({ error: "Select at least one charity before simulating" }, { status: 400 });
    }
  }

  let result;

  switch (action) {
    case "toggle": {
      const state = getSimState(session.userId);
      db.update(simulationState)
        .set({ enabled: !state.enabled })
        .where(eq(simulationState.userId, session.userId))
        .run();
      return NextResponse.json({ enabled: !state.enabled });
    }

    case "setStyle": {
      db.update(simulationState)
        .set({ notificationStyle: notificationStyle || "factual" })
        .where(eq(simulationState.userId, session.userId))
        .run();
      return NextResponse.json({ success: true });
    }

    case "day":
      result = simulateDay(session.userId);
      return NextResponse.json({ success: true, result });

    case "week":
      result = simulateWeek(session.userId);
      return NextResponse.json({ success: true, result });

    case "month":
      result = simulateMonth(session.userId);
      return NextResponse.json({ success: true, result });

    case "yearEnd":
      result = jumpToYearEnd(session.userId);
      return NextResponse.json({ success: true, result });

    case "crisis":
      const event = triggerCrisis(session.userId);
      return NextResponse.json({ success: true, event });

    case "reset":
      resetSimulation(session.userId);
      return NextResponse.json({ success: true });

    case "loadProfile":
      if (!profile || !["sophie", "thomas", "marie"].includes(profile)) {
        return NextResponse.json({ error: "Invalid profile" }, { status: 400 });
      }
      loadDemoProfile(session.userId, profile);
      return NextResponse.json({ success: true });

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
