"use client";

import { useEffect, useState } from "react";
import { KpiBar, KpiCard } from "@/components/admin/KpiBar";
import { Download } from "lucide-react";

interface EaEmail { id: string; email: string; country: string | null; createdAt: string; converted: boolean }

export default function AdminEarlyAccessPage() {
  const [data, setData] = useState<{ totalSignups: number; emails: EaEmail[]; byCountry: Record<string, number>; conversionRate: number } | null>(null);

  useEffect(() => {
    fetch("/api/admin?section=early-access").then((r) => r.json()).then(setData).catch(console.error);
  }, []);

  function exportCsv() {
    if (!data) return;
    const csv = "Email,Country,Signup Date,Converted\n" + data.emails.map((e) => `${e.email},${e.country || ""},${e.createdAt},${e.converted}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "roundup_early_access.csv";
    a.click();
  }

  if (!data) return <div className="skeleton h-64 w-full" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Early Access</h1>
        <button onClick={exportCsv} className="flex items-center gap-1.5 px-3 py-2 bg-navy-700 border border-[#1f4070] rounded-xl text-xs text-text-secondary font-medium hover:text-text-primary"><Download className="w-3.5 h-3.5" /> Export CSV</button>
      </div>

      <KpiBar>
        <KpiCard label="Total Signups" value={data.totalSignups.toString()} />
        <KpiCard label="Conversion Rate" value={`${data.conversionRate}%`} deltaUp={data.conversionRate > 10} delta={data.conversionRate > 10 ? "Good" : "Needs work"} />
        {Object.entries(data.byCountry).slice(0, 3).map(([k, v]) => (
          <KpiCard key={k} label={k} value={v.toString()} />
        ))}
      </KpiBar>

      <div className="bg-navy-700 border border-[#1f4070] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-[#1f4070]">
            <th className="text-left px-4 py-3 text-text-secondary text-xs font-medium">Email</th>
            <th className="text-left px-4 py-3 text-text-secondary text-xs font-medium">Country</th>
            <th className="text-left px-4 py-3 text-text-secondary text-xs font-medium">Date</th>
            <th className="text-right px-4 py-3 text-text-secondary text-xs font-medium">Converted</th>
          </tr></thead>
          <tbody>
            {data.emails.map((e) => (
              <tr key={e.id} className="border-b border-[#1f4070]/50">
                <td className="px-4 py-3 text-text-primary">{e.email}</td>
                <td className="px-4 py-3 text-text-secondary">{e.country || "N/A"}</td>
                <td className="px-4 py-3 text-text-secondary">{new Date(e.createdAt).toLocaleDateString("en-GB")}</td>
                <td className="px-4 py-3 text-right">{e.converted ? <span className="text-accent-green">Yes</span> : <span className="text-text-secondary">No</span>}</td>
              </tr>
            ))}
          </tbody>
          {data.emails.length === 0 && <tbody><tr><td colSpan={4} className="px-4 py-8 text-center text-text-secondary">No early access signups yet</td></tr></tbody>}
        </table>
      </div>
    </div>
  );
}
