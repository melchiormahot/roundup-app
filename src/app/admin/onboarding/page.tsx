"use client";

import { useEffect, useState } from "react";
import { KpiBar, KpiCard } from "@/components/admin/KpiBar";

interface FunnelStep { step: string; count: number; dropOff: number }

export default function AdminOnboardingPage() {
  const [data, setData] = useState<{ funnel: FunnelStep[]; totalUsers: number } | null>(null);

  useEffect(() => {
    fetch("/api/admin?section=onboarding").then((r) => r.json()).then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="skeleton h-64 w-full" />;

  const maxCount = Math.max(...data.funnel.map((f) => f.count), 1);
  const biggestDrop = data.funnel.reduce((prev, curr) => (Number(curr.dropOff) > Number(prev.dropOff) ? curr : prev), data.funnel[0]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Onboarding Funnel</h1>

      <KpiBar>
        <KpiCard label="Total Signups" value={data.totalUsers.toString()} />
        <KpiCard label="Completed" value={data.funnel[data.funnel.length - 1]?.count.toString() || "0"} />
        <KpiCard label="Completion Rate" value={`${data.totalUsers > 0 ? ((data.funnel[data.funnel.length - 1]?.count || 0) / data.totalUsers * 100).toFixed(0) : 0}%`} />
        <KpiCard label="Biggest Drop Off" value={biggestDrop?.step || "N/A"} delta={`${biggestDrop?.dropOff || 0}%`} deltaUp={false} />
      </KpiBar>

      <div className="bg-navy-700 border border-[#1f4070] rounded-xl p-5">
        <h3 className="text-text-primary font-semibold mb-6">Conversion Funnel</h3>
        <div className="space-y-3">
          {data.funnel.map((step, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-24 text-right text-xs text-text-secondary font-medium shrink-0">{step.step}</div>
              <div className="flex-1">
                <div className="h-6 bg-navy-600 rounded-lg overflow-hidden relative">
                  <div
                    className={`h-full rounded-lg ${Number(step.dropOff) > 20 ? "bg-accent-red/60" : "bg-accent-blue/60"}`}
                    style={{ width: `${(step.count / maxCount) * 100}%` }}
                  />
                  <span className="absolute inset-0 flex items-center px-2 text-xs font-semibold text-text-primary tabular-nums">{step.count}</span>
                </div>
              </div>
              <div className="w-16 text-right">
                {i > 0 && Number(step.dropOff) > 0 && (
                  <span className={`text-xs font-medium ${Number(step.dropOff) > 20 ? "text-accent-red" : "text-text-secondary"}`}>-{step.dropOff}%</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
