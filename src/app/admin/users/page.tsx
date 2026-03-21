"use client";

import { useEffect, useState } from "react";
import { KpiBar, KpiCard } from "@/components/admin/KpiBar";
import { Download, Search, ChevronDown } from "lucide-react";

interface UserRow {
  id: string; email: string; name: string; jurisdiction: string;
  incomeBracket: number; createdAt: string; onboardingCompleted: boolean;
  totalDonated: number; charityCount: number; lastActive: string | null;
}

export default function AdminUsersPage() {
  const [data, setData] = useState<{ users: UserRow[]; byJurisdiction: Record<string, number>; byBracket: Record<number, number> } | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin?section=users").then((r) => r.json()).then(setData).catch(console.error);
  }, []);

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  function exportCsv() {
    if (!data) return;
    const headers = "Email,Name,Jurisdiction,Bracket,Signup,Onboarded,Donated,Charities\n";
    const rows = data.users.map((u) => `${u.email},${u.name},${u.jurisdiction},${u.incomeBracket},${u.createdAt},${u.onboardingCompleted},${u.totalDonated},${u.charityCount}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "roundup_users.csv";
    a.click();
  }

  if (!data) return <div className="skeleton h-64 w-full" />;

  const filtered = data.users.filter((u) => u.email.toLowerCase().includes(search.toLowerCase()) || u.name.toLowerCase().includes(search.toLowerCase()));
  const sorted = [...filtered].sort((a, b) => {
    const av = (a as unknown as Record<string, unknown>)[sortKey];
    const bv = (b as unknown as Record<string, unknown>)[sortKey];
    if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
    return sortDir === "asc" ? String(av || "").localeCompare(String(bv || "")) : String(bv || "").localeCompare(String(av || ""));
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Users</h1>
        <button onClick={exportCsv} className="flex items-center gap-1.5 px-3 py-2 bg-navy-700 border border-[#1f4070] rounded-xl text-xs text-text-secondary font-medium hover:text-text-primary"><Download className="w-3.5 h-3.5" /> Export CSV</button>
      </div>

      <KpiBar>
        <KpiCard label="Total Users" value={data.users.length.toString()} />
        {Object.entries(data.byJurisdiction).slice(0, 3).map(([k, v]) => (
          <KpiCard key={k} label={k} value={v.toString()} />
        ))}
        <KpiCard label="Onboarded" value={data.users.filter((u) => u.onboardingCompleted).length.toString()} />
      </KpiBar>

      <div className="bg-navy-700 border border-[#1f4070] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#1f4070]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="w-full pl-9 pr-4 py-2 bg-navy-600/20 border border-[#1f4070] rounded-lg text-sm text-text-primary placeholder:text-[#5a7da8] focus:outline-none focus:border-accent-blue" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1f4070]">
                {[["name", "Name"], ["email", "Email"], ["jurisdiction", "Country"], ["totalDonated", "Donated"], ["createdAt", "Signed Up"]].map(([key, label]) => (
                  <th key={key} onClick={() => toggleSort(key)} className="text-left px-4 py-3 text-text-secondary text-xs font-medium cursor-pointer hover:text-text-primary whitespace-nowrap">
                    {label} {sortKey === key && (sortDir === "asc" ? "↑" : "↓")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.slice(0, 50).map((u) => (
                <tr key={u.id} onClick={() => setExpanded(expanded === u.id ? null : u.id)} className="border-b border-[#1f4070]/50 cursor-pointer hover:bg-navy-600/10">
                  <td className="px-4 py-3 text-text-primary font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{u.email}</td>
                  <td className="px-4 py-3 text-text-secondary">{u.jurisdiction}</td>
                  <td className="px-4 py-3 text-accent-green tabular-nums">€{u.totalDonated.toFixed(2)}</td>
                  <td className="px-4 py-3 text-text-secondary">{new Date(u.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 text-text-secondary text-xs border-t border-[#1f4070]">
          Showing {Math.min(sorted.length, 50)} of {sorted.length} users
        </div>
      </div>
    </div>
  );
}
