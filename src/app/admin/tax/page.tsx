"use client";

import { useEffect, useState } from "react";
import { KpiBar, KpiCard } from "@/components/admin/KpiBar";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminTaxPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch("/api/admin?section=tax").then((r) => r.json()).then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="skeleton h-64 w-full" />;

  const byJurisdiction = data.byJurisdiction as Record<string, { donated: number; saved: number; users: number }>;
  const chartData = Object.entries(byJurisdiction || {}).map(([code, v]) => ({ country: code, donated: v.donated, saved: v.saved, users: v.users }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Tax Analytics</h1>

      <KpiBar>
        <KpiCard label="Total Tax Saved" value={`€${(data.totalSaved as number)?.toFixed(0) || 0}`} />
        <KpiCard label="Avg Per User" value={`€${(data.avgSaved as number)?.toFixed(0) || 0}`} />
        <KpiCard label="Total Users" value={(data.totalUsers as number)?.toString() || "0"} />
      </KpiBar>

      <div className="bg-navy-700 border border-[#33302b] rounded-xl p-5 mb-4">
        <h3 className="text-text-primary font-semibold mb-4">Donations & Savings by Country</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <XAxis dataKey="country" tick={{ fill: "#a8a29e", fontSize: 10 }} />
            <YAxis tick={{ fill: "#a8a29e", fontSize: 10 }} tickFormatter={(v) => `€${v}`} />
            <Tooltip contentStyle={{ background: "#231f1c", border: "1px solid #33302b", borderRadius: 8, color: "#e7e5e4", fontSize: 12 }} formatter={(v) => `€${Number(v).toFixed(2)}`} />
            <Bar dataKey="donated" fill="#86efac" name="Donated" radius={[4, 4, 0, 0]} />
            <Bar dataKey="saved" fill="#60a5fa" name="Tax Saved" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-navy-700 border border-[#33302b] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-[#33302b]">
            <th className="text-left px-4 py-3 text-text-secondary text-xs font-medium">Country</th>
            <th className="text-right px-4 py-3 text-text-secondary text-xs font-medium">Users</th>
            <th className="text-right px-4 py-3 text-text-secondary text-xs font-medium">Donated</th>
            <th className="text-right px-4 py-3 text-text-secondary text-xs font-medium">Tax Saved</th>
          </tr></thead>
          <tbody>
            {chartData.map((r) => (
              <tr key={r.country} className="border-b border-[#33302b]/50">
                <td className="px-4 py-3 text-text-primary font-medium">{r.country}</td>
                <td className="px-4 py-3 text-right tabular-nums">{r.users}</td>
                <td className="px-4 py-3 text-right tabular-nums text-accent-green">€{r.donated.toFixed(2)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-accent-blue">€{r.saved.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
