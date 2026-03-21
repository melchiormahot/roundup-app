"use client";

import { useEffect, useState } from "react";
import { KpiBar, KpiCard } from "@/components/admin/KpiBar";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface CharityStat { id: string; name: string; icon: string; category: string; taxRate: number; usersSelected: number; avgAllocation: number }

export default function AdminCharitiesPage() {
  const [data, setData] = useState<{ charities: CharityStat[]; mostLoved: CharityStat } | null>(null);

  useEffect(() => {
    fetch("/api/admin?section=charities").then((r) => r.json()).then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="skeleton h-64 w-full" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Charities</h1>

      <KpiBar>
        <KpiCard label="Total Charities" value={data.charities.length.toString()} />
        <KpiCard label="Most Popular" value={data.charities.sort((a, b) => b.usersSelected - a.usersSelected)[0]?.name || "N/A"} />
        <KpiCard label="Most Loved" value={data.mostLoved?.name || "N/A"} delta={`${data.mostLoved?.avgAllocation}% avg allocation`} />
      </KpiBar>

      <div className="bg-navy-700 border border-[#1f4070] rounded-xl p-5 mb-4">
        <h3 className="text-text-primary font-semibold mb-4">Users Per Charity</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.charities} layout="vertical">
            <XAxis type="number" tick={{ fill: "#7a9cc6", fontSize: 10 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: "#7a9cc6", fontSize: 10 }} width={120} />
            <Tooltip contentStyle={{ background: "#0f1f38", border: "1px solid #1f4070", borderRadius: 8, color: "#d0dff0", fontSize: 12 }} />
            <Bar dataKey="usersSelected" fill="#5ce0b8" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-navy-700 border border-[#1f4070] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1f4070]">
              <th className="text-left px-4 py-3 text-text-secondary text-xs font-medium">Charity</th>
              <th className="text-left px-4 py-3 text-text-secondary text-xs font-medium">Category</th>
              <th className="text-right px-4 py-3 text-text-secondary text-xs font-medium">Users</th>
              <th className="text-right px-4 py-3 text-text-secondary text-xs font-medium">Avg Alloc</th>
              <th className="text-right px-4 py-3 text-text-secondary text-xs font-medium">Tax Rate</th>
            </tr>
          </thead>
          <tbody>
            {data.charities.map((c) => (
              <tr key={c.id} className="border-b border-[#1f4070]/50">
                <td className="px-4 py-3"><span className="mr-2">{c.icon}</span>{c.name}</td>
                <td className="px-4 py-3 text-text-secondary capitalize">{c.category}</td>
                <td className="px-4 py-3 text-right tabular-nums">{c.usersSelected}</td>
                <td className="px-4 py-3 text-right tabular-nums text-accent-blue">{c.avgAllocation}%</td>
                <td className="px-4 py-3 text-right tabular-nums">{c.taxRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
