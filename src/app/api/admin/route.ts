import { NextResponse } from "next/server";
import { db } from "@/db";
import { getSession } from "@/lib/session";
import { eq, desc, sql } from "drizzle-orm";
import { users, roundups, charities, userCharities, notifications, debits, earlyAccess, simulationState } from "@/db/schema";

async function checkAdmin() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) return null;
  const user = db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, session.userId!) }).sync();
  if (!user?.isAdmin) return null;
  return user;
}

export async function GET(request: Request) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const url = new URL(request.url);
  const section = url.searchParams.get("section") || "overview";

  const allUsers = db.select().from(users).all();
  const allRoundups = db.select().from(roundups).all();
  const allCharities = db.select().from(charities).all();
  const allNotifs = db.select().from(notifications).all();
  const allDebits = db.select().from(debits).all();
  const allUserCharities = db.select().from(userCharities).all();

  // Common metrics
  const totalUsers = allUsers.length;
  const totalDonated = allRoundups.reduce((s, r) => s + r.roundupAmount, 0);
  const avgDonationPerUser = totalUsers > 0 ? totalDonated / totalUsers : 0;
  const onboardingCompleted = allUsers.filter((u) => u.onboardingCompleted).length;
  const onboardingRate = totalUsers > 0 ? +((onboardingCompleted / totalUsers) * 100).toFixed(1) : 0;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const activeUsers = new Set(allRoundups.filter((r) => r.timestamp >= sevenDaysAgo.toISOString()).map((r) => r.userId)).size;
  const activeRate = totalUsers > 0 ? +((activeUsers / totalUsers) * 100).toFixed(1) : 0;

  // Today's signups
  const today = new Date().toISOString().split("T")[0];
  const todaySignups = allUsers.filter((u) => u.createdAt.startsWith(today)).length;
  const weekDonated = allRoundups.filter((r) => r.timestamp >= sevenDaysAgo.toISOString()).reduce((s, r) => s + r.roundupAmount, 0);

  const overview = {
    totalUsers, todaySignups, totalDonated: +totalDonated.toFixed(2), weekDonated: +weekDonated.toFixed(2),
    avgDonationPerUser: +avgDonationPerUser.toFixed(2), onboardingRate, activeUsers, activeRate,
    totalRoundups: allRoundups.length, totalDebits: allDebits.length,
  };

  if (section === "overview") return NextResponse.json(overview);

  if (section === "users") {
    const userList = allUsers.map((u) => {
      const userRoundups = allRoundups.filter((r) => r.userId === u.id);
      const total = userRoundups.reduce((s, r) => s + r.roundupAmount, 0);
      const charityCount = allUserCharities.filter((uc) => uc.userId === u.id).length;
      const lastActive = userRoundups.length > 0 ? userRoundups.sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0].timestamp : null;
      return {
        id: u.id, email: u.email, name: u.name, jurisdiction: u.jurisdiction,
        incomeBracket: u.incomeBracket, createdAt: u.createdAt,
        onboardingCompleted: u.onboardingCompleted, totalDonated: +total.toFixed(2),
        charityCount, lastActive,
      };
    });

    // By jurisdiction
    const byJurisdiction: Record<string, number> = {};
    allUsers.forEach((u) => { byJurisdiction[u.jurisdiction] = (byJurisdiction[u.jurisdiction] || 0) + 1; });

    // By bracket
    const byBracket: Record<number, number> = {};
    allUsers.forEach((u) => { byBracket[u.incomeBracket] = (byBracket[u.incomeBracket] || 0) + 1; });

    return NextResponse.json({ ...overview, users: userList, byJurisdiction, byBracket });
  }

  if (section === "onboarding") {
    const steps = ["Signup", "Welcome", "About You", "Tax Preview", "Charities", "Bank", "SEPA", "Complete"];
    const stepCounts = steps.map((_, i) => allUsers.filter((u) => u.onboardingStepReached >= i || (i === 7 && u.onboardingCompleted)).length);
    const funnel = steps.map((name, i) => ({
      step: name, count: i === 0 ? totalUsers : stepCounts[i],
      dropOff: i === 0 ? 0 : totalUsers > 0 ? +(((stepCounts[i - 1] - stepCounts[i]) / Math.max(stepCounts[i - 1], 1)) * 100).toFixed(1) : 0,
    }));
    return NextResponse.json({ ...overview, funnel });
  }

  if (section === "donations") {
    const avgRoundup = allRoundups.length > 0 ? +(totalDonated / allRoundups.length).toFixed(2) : 0;

    // By charity
    const charityTotals: Record<string, { name: string; icon: string; total: number; users: number }> = {};
    allCharities.forEach((c) => { charityTotals[c.id] = { name: c.name, icon: c.icon, total: 0, users: 0 }; });
    allUserCharities.forEach((uc) => {
      if (charityTotals[uc.charityId]) charityTotals[uc.charityId].users++;
    });

    // Daily donations (last 30 days)
    const daily: { date: string; amount: number }[] = [];
    for (let d = 29; d >= 0; d--) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      const dateStr = date.toISOString().split("T")[0];
      const dayTotal = allRoundups.filter((r) => r.timestamp.startsWith(dateStr)).reduce((s, r) => s + r.roundupAmount, 0);
      daily.push({ date: dateStr, amount: +dayTotal.toFixed(2) });
    }

    // Top donors
    const donorTotals: Record<string, number> = {};
    allRoundups.forEach((r) => { donorTotals[r.userId] = (donorTotals[r.userId] || 0) + r.roundupAmount; });
    const topDonors = Object.entries(donorTotals).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([id, total], i) => ({ rank: i + 1, userId: id.slice(0, 8), total: +total.toFixed(2) }));

    // Distribution buckets
    const buckets = { "€0-5": 0, "€5-10": 0, "€10-20": 0, "€20-50": 0, "€50+": 0 };
    Object.values(donorTotals).forEach((t) => {
      if (t < 5) buckets["€0-5"]++;
      else if (t < 10) buckets["€5-10"]++;
      else if (t < 20) buckets["€10-20"]++;
      else if (t < 50) buckets["€20-50"]++;
      else buckets["€50+"]++;
    });

    const monthTotal = allRoundups.filter((r) => {
      const d = new Date(r.timestamp);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((s, r) => s + r.roundupAmount, 0);

    return NextResponse.json({
      ...overview, avgRoundup, monthTotal: +monthTotal.toFixed(2),
      byCharity: Object.values(charityTotals), daily, topDonors, distribution: buckets,
    });
  }

  if (section === "charities") {
    const charityStats = allCharities.map((c) => {
      const ucList = allUserCharities.filter((uc) => uc.charityId === c.id);
      const avgAlloc = ucList.length > 0 ? +(ucList.reduce((s, uc) => s + uc.allocationPct, 0) / ucList.length).toFixed(1) : 0;
      return { id: c.id, name: c.name, icon: c.icon, category: c.category, taxRate: c.taxRate, usersSelected: ucList.length, avgAllocation: avgAlloc };
    });
    const mostLoved = charityStats.sort((a, b) => b.avgAllocation - a.avgAllocation)[0];
    return NextResponse.json({ ...overview, charities: charityStats, mostLoved });
  }

  if (section === "tax") {
    const byJurisdiction: Record<string, { donated: number; saved: number; users: number }> = {};
    allUsers.forEach((u) => {
      const userTotal = allRoundups.filter((r) => r.userId === u.id).reduce((s, r) => s + r.roundupAmount, 0);
      if (!byJurisdiction[u.jurisdiction]) byJurisdiction[u.jurisdiction] = { donated: 0, saved: 0, users: 0 };
      byJurisdiction[u.jurisdiction].donated += userTotal;
      byJurisdiction[u.jurisdiction].saved += userTotal * 0.66; // simplified
      byJurisdiction[u.jurisdiction].users++;
    });
    Object.keys(byJurisdiction).forEach((k) => {
      byJurisdiction[k].donated = +byJurisdiction[k].donated.toFixed(2);
      byJurisdiction[k].saved = +byJurisdiction[k].saved.toFixed(2);
    });

    const totalSaved = Object.values(byJurisdiction).reduce((s, j) => s + j.saved, 0);
    const avgSaved = totalUsers > 0 ? +(totalSaved / totalUsers).toFixed(2) : 0;

    return NextResponse.json({ ...overview, totalSaved: +totalSaved.toFixed(2), avgSaved, byJurisdiction });
  }

  if (section === "notifications") {
    const totalSent = allNotifs.length;
    const totalRead = allNotifs.filter((n) => n.read).length;
    const readRate = totalSent > 0 ? +((totalRead / totalSent) * 100).toFixed(1) : 0;

    const byType: Record<string, { sent: number; read: number }> = {};
    allNotifs.forEach((n) => {
      if (!byType[n.type]) byType[n.type] = { sent: 0, read: 0 };
      byType[n.type].sent++;
      if (n.read) byType[n.type].read++;
    });

    const typeStats = Object.entries(byType).map(([type, stats]) => ({
      type, sent: stats.sent, read: stats.read,
      readRate: stats.sent > 0 ? +((stats.read / stats.sent) * 100).toFixed(1) : 0,
    }));

    return NextResponse.json({ ...overview, totalSent, readRate, byType: typeStats });
  }

  if (section === "early-access") {
    const emails = db.select().from(earlyAccess).orderBy(desc(earlyAccess.createdAt)).all();
    const byCountry: Record<string, number> = {};
    emails.forEach((e) => { if (e.country) byCountry[e.country] = (byCountry[e.country] || 0) + 1; });

    // Check conversions
    const convertedEmails = new Set(allUsers.map((u) => u.email));
    const emailList = emails.map((e) => ({ ...e, converted: convertedEmails.has(e.email) }));
    const conversionRate = emails.length > 0 ? +((emailList.filter((e) => e.converted).length / emails.length) * 100).toFixed(1) : 0;

    return NextResponse.json({ ...overview, totalSignups: emails.length, emails: emailList, byCountry, conversionRate });
  }

  if (section === "simulation") {
    const simStates = db.select().from(simulationState).all();
    const usersWithSim = simStates.filter((s) => s.dayCount > 0).length;
    const avgDays = simStates.length > 0 ? +(simStates.reduce((s, st) => s + st.dayCount, 0) / Math.max(simStates.length, 1)).toFixed(1) : 0;
    return NextResponse.json({ ...overview, usersWithSim, avgSimDays: avgDays, totalSimStates: simStates.length });
  }

  return NextResponse.json(overview);
}
