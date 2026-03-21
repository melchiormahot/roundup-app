"use client";

import { useEffect, useState } from "react";
import { KpiBar, KpiCard } from "@/components/admin/KpiBar";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminNotificationsPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch("/api/admin?section=notifications").then((r) => r.json()).then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="skeleton h-64 w-full" />;

  const byType = (data.byType as { type: string; sent: number; read: number; readRate: number }[]) || [];
  const bestType = byType.reduce((prev, curr) => (curr.readRate > (prev?.readRate || 0) ? curr : prev), byType[0]);
  const worstType = byType.reduce((prev, curr) => (curr.readRate < (prev?.readRate || 100) ? curr : prev), byType[0]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Notifications</h1>

      <KpiBar>
        <KpiCard label="Total Sent" value={(data.totalSent as number)?.toString() || "0"} />
        <KpiCard label="Read Rate" value={`${data.readRate}%`} />
        <KpiCard label="Most Engaged" value={bestType?.type || "N/A"} delta={`${bestType?.readRate}% read`} deltaUp />
        <KpiCard label="Least Engaged" value={worstType?.type || "N/A"} delta={`${worstType?.readRate}% read`} deltaUp={false} />
      </KpiBar>

      <div className="bg-navy-700 border border-[#1f4070] rounded-xl p-5 mb-4">
        <h3 className="text-text-primary font-semibold mb-4">Notifications by Type</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={byType}>
            <XAxis dataKey="type" tick={{ fill: "#7a9cc6", fontSize: 10 }} />
            <YAxis tick={{ fill: "#7a9cc6", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#0f1f38", border: "1px solid #1f4070", borderRadius: 8, color: "#d0dff0", fontSize: 12 }} />
            <Bar dataKey="sent" fill="#4a9eff" name="Sent" radius={[4, 4, 0, 0]} />
            <Bar dataKey="read" fill="#5ce0b8" name="Read" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-navy-700 border border-[#1f4070] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-[#1f4070]">
            <th className="text-left px-4 py-3 text-text-secondary text-xs font-medium">Type</th>
            <th className="text-right px-4 py-3 text-text-secondary text-xs font-medium">Sent</th>
            <th className="text-right px-4 py-3 text-text-secondary text-xs font-medium">Read</th>
            <th className="text-right px-4 py-3 text-text-secondary text-xs font-medium">Read Rate</th>
          </tr></thead>
          <tbody>
            {byType.map((t) => (
              <tr key={t.type} className="border-b border-[#1f4070]/50">
                <td className="px-4 py-3 text-text-primary capitalize font-medium">{t.type.replace("_", " ")}</td>
                <td className="px-4 py-3 text-right tabular-nums">{t.sent}</td>
                <td className="px-4 py-3 text-right tabular-nums">{t.read}</td>
                <td className="px-4 py-3 text-right tabular-nums text-accent-blue">{t.readRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
