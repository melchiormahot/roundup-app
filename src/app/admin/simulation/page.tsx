"use client";

import { useEffect, useState } from "react";
import { KpiBar, KpiCard } from "@/components/admin/KpiBar";

export default function AdminSimulationPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch("/api/admin?section=simulation").then((r) => r.json()).then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="skeleton h-64 w-full" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Simulation Stats</h1>

      <KpiBar>
        <KpiCard label="Users with Sim" value={(data.usersWithSim as number)?.toString() || "0"} />
        <KpiCard label="Avg Sim Days" value={(data.avgSimDays as number)?.toString() || "0"} />
        <KpiCard label="Total Sim States" value={(data.totalSimStates as number)?.toString() || "0"} />
      </KpiBar>

      <div className="bg-navy-700 border border-[#1f4070] rounded-xl p-5">
        <h3 className="text-text-primary font-semibold mb-3">About Simulation</h3>
        <p className="text-text-secondary text-sm font-medium leading-relaxed">
          This page tracks how demo and simulation features are used. It helps understand which simulation buttons are most popular, how deep users go into demo mode, and which demo profiles are loaded most frequently.
        </p>
      </div>
    </div>
  );
}
