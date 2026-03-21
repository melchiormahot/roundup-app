"use client";

import { useEffect, useState } from "react";
import { KpiBar, KpiCard } from "@/components/admin/KpiBar";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#5ce0b8", "#4a9eff", "#b48eff", "#ffd93d", "#ff6b6b", "#ff9a76"];

export default function AdminDonationsPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch("/api/admin?section=donations").then((r) => r.json()).then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="skeleton h-64 w-full" />;

  const daily = (data.daily as { date: string; amount: number }[]) || [];
  const distribution = data.distribution as Record<string, number>;
  const topDonors = (data.topDonors as { rank: number; userId: string; total: number }[]) || [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Donations</h1>

      <KpiBar>
        <KpiCard label="Total Donated" value={`€${(data.totalDonated as number)?.toFixed(0) || 0}`} />
        <KpiCard label="This Month" value={`€${(data.monthTotal as number)?.toFixed(0) || 0}`} />
        <KpiCard label="Avg Round Up" value={`€${(data.avgRoundup as number)?.toFixed(2) || 0}`} />
        <KpiCard label="Total Round Ups" value={(data.totalRoundups as number)?.toLocaleString() || "0"} />
        <KpiCard label="SEPA Debits" value={(data.totalDebits as number)?.toString() || "0"} />
      </KpiBar>

      {/* Daily Line Chart */}
      <div className="bg-navy-700 border border-[#1f4070] rounded-xl p-5 mb-4">
        <h3 className="text-text-primary font-semibold mb-4">Daily Donations (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={daily}>
            <XAxis dataKey="date" tick={{ fill: "#7a9cc6", fontSize: 10 }} tickFormatter={(v) => new Date(v).getDate().toString()} />
            <YAxis tick={{ fill: "#7a9cc6", fontSize: 10 }} tickFormatter={(v) => `€${v}`} />
            <Tooltip contentStyle={{ background: "#0f1f38", border: "1px solid #1f4070", borderRadius: 8, color: "#d0dff0", fontSize: 12 }} formatter={(v) => [`€${Number(v).toFixed(2)}`, "Donated"]} />
            <Line type="monotone" dataKey="amount" stroke="#5ce0b8" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Distribution */}
        <div className="bg-navy-700 border border-[#1f4070] rounded-xl p-5">
          <h3 className="text-text-primary font-semibold mb-4">Donation Distribution</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={Object.entries(distribution || {}).map(([k, v]) => ({ bucket: k, count: v }))}>
              <XAxis dataKey="bucket" tick={{ fill: "#7a9cc6", fontSize: 10 }} />
              <YAxis tick={{ fill: "#7a9cc6", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#0f1f38", border: "1px solid #1f4070", borderRadius: 8, color: "#d0dff0", fontSize: 12 }} />
              <Bar dataKey="count" fill="#4a9eff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Donors */}
        <div className="bg-navy-700 border border-[#1f4070] rounded-xl p-5">
          <h3 className="text-text-primary font-semibold mb-4">Top Donors</h3>
          <div className="space-y-2">
            {topDonors.map((d) => (
              <div key={d.rank} className="flex justify-between text-sm">
                <span className="text-text-secondary">#{d.rank} User {d.userId}...</span>
                <span className="text-accent-green font-semibold tabular-nums">€{d.total.toFixed(2)}</span>
              </div>
            ))}
            {topDonors.length === 0 && <p className="text-text-secondary text-sm">No donation data yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
