"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

interface KpiProps {
  label: string;
  value: string;
  delta?: string;
  deltaUp?: boolean;
  onClick?: () => void;
}

export function KpiCard({ label, value, delta, deltaUp, onClick }: KpiProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-navy-700 border border-[#1f4070] rounded-xl p-4 ${onClick ? "cursor-pointer hover:bg-navy-600/30 transition-colors" : ""}`}
    >
      <p className="text-text-secondary text-xs font-medium mb-1">{label}</p>
      <p className="text-text-primary text-xl font-bold tabular-nums">{value}</p>
      {delta && (
        <div className="flex items-center gap-1 mt-1">
          {deltaUp !== undefined && (
            deltaUp ? <TrendingUp className="w-3 h-3 text-accent-green" /> : <TrendingDown className="w-3 h-3 text-accent-red" />
          )}
          <span className={`text-xs font-medium ${deltaUp ? "text-accent-green" : deltaUp === false ? "text-accent-red" : "text-text-secondary"}`}>{delta}</span>
        </div>
      )}
    </div>
  );
}

export function KpiBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
      {children}
    </div>
  );
}
