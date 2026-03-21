import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, userCharities, roundups, notifications } from "@/db/schema";
import { getSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { jurisdiction, incomeBracket, selectedCharities } = await request.json();

    // Update user with onboarding data
    db.update(users)
      .set({
        jurisdiction: jurisdiction || "FR",
        incomeBracket: incomeBracket ?? 0,
        onboardingCompleted: true,
      })
      .where(eq(users.id, session.userId))
      .run();

    // Create charity allocations (equal split)
    const charityIds: string[] = selectedCharities || [];
    if (charityIds.length > 0) {
      const pct = Math.floor(100 / charityIds.length);
      const remainder = 100 - pct * charityIds.length;

      charityIds.forEach((charityId: string, i: number) => {
        db.insert(userCharities)
          .values({
            id: nanoid(),
            userId: session.userId!,
            charityId,
            allocationPct: pct + (i === 0 ? remainder : 0),
          })
          .run();
      });
    }

    // Seed sample round-up transactions for this user
    seedSampleTransactions(session.userId);
    seedSampleNotifications(session.userId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Onboarding error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function seedSampleTransactions(userId: string) {
  const merchants = [
    { name: "Café de Flore", min: 3.2, max: 6.8 },
    { name: "Monoprix", min: 8.5, max: 45.3 },
    { name: "RATP Metro", min: 1.9, max: 2.15 },
    { name: "Le Bouillon Chartier", min: 12.5, max: 28.0 },
    { name: "Boulangerie Paul", min: 2.3, max: 8.5 },
    { name: "Fnac", min: 15.0, max: 89.0 },
    { name: "Carrefour City", min: 5.2, max: 32.0 },
    { name: "Uber", min: 8.0, max: 24.0 },
    { name: "Picard", min: 6.0, max: 22.0 },
    { name: "Pharmacie", min: 4.5, max: 18.0 },
  ];

  const now = new Date();
  for (let d = 0; d < 30; d++) {
    const txCount = Math.floor(Math.random() * 4) + 1;
    for (let t = 0; t < txCount; t++) {
      const merchant = merchants[Math.floor(Math.random() * merchants.length)];
      const purchaseAmount = +(merchant.min + Math.random() * (merchant.max - merchant.min)).toFixed(2);
      const roundupAmount = +(Math.ceil(purchaseAmount) - purchaseAmount).toFixed(2) || 1.0;
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      date.setHours(Math.floor(Math.random() * 14) + 8, Math.floor(Math.random() * 60));

      db.insert(roundups)
        .values({
          id: nanoid(),
          userId,
          merchantName: merchant.name,
          purchaseAmount,
          roundupAmount,
          timestamp: date.toISOString(),
          status: d < 7 ? "pending" : "included",
        })
        .run();
    }
  }
}

function seedSampleNotifications(userId: string) {
  const now = new Date();
  const notifs = [
    {
      type: "weekly",
      title: "Weekly Summary",
      body: "You rounded up 23 transactions this week, donating a total of €12.47. Your generosity is making a difference!",
      daysAgo: 1,
    },
    {
      type: "monthly",
      title: "March Progress",
      body: "You have donated €48.32 this month across 4 charities. You are on track to save €362 in taxes this year.",
      daysAgo: 3,
    },
    {
      type: "crisis",
      title: "Emergency: Earthquake Relief",
      body: "A 7.2 magnitude earthquake has struck Turkey. MSF and Secours Populaire are mobilising. Redirect your round ups to help?",
      daysAgo: 5,
    },
    {
      type: "charity_update",
      title: "MSF: Field Update",
      body: "Thanks to donors like you, MSF has delivered 50,000 vaccine doses in South Sudan this month.",
      daysAgo: 7,
    },
    {
      type: "milestone",
      title: "100 Round Ups!",
      body: "Congratulations! You have completed 100 round ups since joining RoundUp. That is 100 small acts of generosity.",
      daysAgo: 10,
    },
    {
      type: "weekly",
      title: "Weekly Summary",
      body: "18 round ups this week totalling €9.83. Your total year to date: €156.20.",
      daysAgo: 8,
    },
  ];

  notifs.forEach((n) => {
    const date = new Date(now);
    date.setDate(date.getDate() - n.daysAgo);
    db.insert(notifications)
      .values({
        id: nanoid(),
        userId,
        type: n.type,
        title: n.title,
        body: n.body,
        read: n.daysAgo > 5,
        createdAt: date.toISOString(),
      })
      .run();
  });
}
