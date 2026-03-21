"use client";

import { useEffect, useState } from "react";
import { KpiBar, KpiCard } from "@/components/admin/KpiBar";
import { Copy, Check } from "lucide-react";

interface Overview {
  totalUsers: number;
  todaySignups: number;
  totalDonated: number;
  weekDonated: number;
  avgDonationPerUser: number;
  onboardingRate: number;
  activeUsers: number;
  activeRate: number;
  totalRoundups: number;
  totalDebits: number;
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/admin?section=overview").then((r) => r.json()).then(setData).catch(console.error);
  }, []);

  function copySnapshot() {
    if (!data) return;
    const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const text = `RoundUp Snapshot (${today}): ${data.totalUsers} users, €${data.totalDonated.toFixed(0)} donated, ${data.onboardingRate}% onboarding completion, ${data.activeRate}% weekly active, €${data.avgDonationPerUser.toFixed(0)} avg per user, ${data.totalRoundups} total round ups.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!data) return <div className="skeleton h-32 w-full" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Overview</h1>
        <button
          onClick={copySnapshot}
          className="flex items-center gap-1.5 px-3 py-2 bg-navy-700 border border-[#1f4070] rounded-xl text-xs text-text-secondary font-medium hover:text-text-primary transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-accent-green" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy Snapshot"}
        </button>
      </div>

      <KpiBar>
        <KpiCard label="Total Users" value={data.totalUsers.toLocaleString()} delta={`+${data.todaySignups} today`} deltaUp={data.todaySignups > 0} />
        <KpiCard label="Total Donated" value={`€${data.totalDonated.toFixed(0)}`} delta={`+€${data.weekDonated.toFixed(0)} this week`} deltaUp={data.weekDonated > 0} />
        <KpiCard label="Avg Per User/Month" value={`€${data.avgDonationPerUser.toFixed(0)}`} />
        <KpiCard label="Onboarding Rate" value={`${data.onboardingRate}%`} deltaUp={data.onboardingRate > 50} delta={`${data.onboardingRate > 50 ? "Healthy" : "Needs work"}`} />
        <KpiCard label="Active Users" value={`${data.activeUsers}`} delta={`${data.activeRate}% of total`} />
      </KpiBar>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-navy-700 border border-[#1f4070] rounded-xl p-5">
          <h3 className="text-text-primary font-semibold mb-3">Quick Stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-text-secondary">Total Round Ups</span><span className="text-text-primary tabular-nums">{data.totalRoundups.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">SEPA Debits Processed</span><span className="text-text-primary tabular-nums">{data.totalDebits}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">Weekly Active Users</span><span className="text-text-primary tabular-nums">{data.activeUsers}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">Avg Donation Per User</span><span className="text-text-primary tabular-nums">€{data.avgDonationPerUser.toFixed(2)}</span></div>
          </div>
        </div>
        <div className="bg-navy-700 border border-[#1f4070] rounded-xl p-5">
          <h3 className="text-text-primary font-semibold mb-3">Platform Health</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1"><span className="text-text-secondary">Onboarding Completion</span><span className="text-text-primary">{data.onboardingRate}%</span></div>
              <div className="h-2 bg-navy-600 rounded-full overflow-hidden"><div className="h-full bg-accent-green rounded-full" style={{ width: `${data.onboardingRate}%` }} /></div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1"><span className="text-text-secondary">Weekly Active Rate</span><span className="text-text-primary">{data.activeRate}%</span></div>
              <div className="h-2 bg-navy-600 rounded-full overflow-hidden"><div className="h-full bg-accent-blue rounded-full" style={{ width: `${data.activeRate}%` }} /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
