"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck, Search, SlidersHorizontal } from "lucide-react";

interface Charity {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  qualityLabel: string | null;
  taxRate: number;
  countryOfOrigin: string | null;
  jurisdictionsEligible: string | null;
  loiColucheEligible: boolean;
  currency: string;
  certifications: string | null;
}

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "humanitarian", label: "Humanitarian" },
  { value: "health", label: "Health" },
  { value: "environment", label: "Environment" },
  { value: "children", label: "Children" },
  { value: "human_rights", label: "Human Rights" },
  { value: "hunger", label: "Hunger" },
  { value: "disability", label: "Disability" },
];

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "name", label: "Alphabetical" },
  { value: "taxRate", label: "Tax benefit" },
  { value: "category", label: "Category" },
];

const FLAGS: Record<string, string> = { FR: "🇫🇷", GB: "🇬🇧", DE: "🇩🇪", BE: "🇧🇪", ES: "🇪🇸", CH: "🇨🇭", AT: "🇦🇹", NL: "🇳🇱", US: "🇺🇸" };

export default function CharitiesPage() {
  const router = useRouter();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recommended");
  const [showDeductibleOnly, setShowDeductibleOnly] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [userJurisdiction, setUserJurisdiction] = useState("FR");

  useEffect(() => {
    fetch("/api/charities").then((r) => r.json()).then((data) => setCharities(data.charities || [])).catch(console.error);
    fetch("/api/user").then((r) => r.json()).then((data) => { if (data.user) setUserJurisdiction(data.user.jurisdiction); }).catch(() => {});
  }, []);

  function isEligible(c: Charity): boolean {
    if (!c.jurisdictionsEligible) return false;
    try {
      const eligible = JSON.parse(c.jurisdictionsEligible);
      return eligible.includes(userJurisdiction);
    } catch { return false; }
  }

  function getCerts(c: Charity): { name: string }[] {
    if (!c.certifications) return [];
    try { return JSON.parse(c.certifications); } catch { return []; }
  }

  let filtered = charities;

  // Category filter
  if (filter !== "all") filtered = filtered.filter((c) => c.category === filter);

  // Search
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((c) => c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || (c.countryOfOrigin || "").toLowerCase().includes(q));
  }

  // Jurisdiction filter
  if (showDeductibleOnly) {
    const eligible = filtered.filter((c) => isEligible(c));
    const nonEligible = filtered.filter((c) => !isEligible(c));
    filtered = [...eligible, ...nonEligible]; // eligible first, non-eligible greyed
  }

  // Sort
  if (sort === "name") filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === "taxRate") filtered = [...filtered].sort((a, b) => b.taxRate - a.taxRate);
  else if (sort === "category") filtered = [...filtered].sort((a, b) => a.category.localeCompare(b.category));
  else {
    // Recommended: eligible first, then by tax rate
    filtered = [...filtered].sort((a, b) => {
      const aEl = isEligible(a) ? 1 : 0;
      const bEl = isEligible(b) ? 1 : 0;
      if (aEl !== bEl) return bEl - aEl;
      return b.taxRate - a.taxRate;
    });
  }

  const eligibleCount = charities.filter(isEligible).length;

  return (
    <div className="px-5 pt-14 pb-4 max-w-lg mx-auto page-transition overscroll-contain">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-text-primary">Charities</h1>
        <p className="text-text-secondary text-sm mt-1 font-medium">{charities.length} organisations · {eligibleCount} deductible in your country</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search charities..."
          className="w-full pl-9 pr-10 py-3 bg-navy-700 border border-[#1f4070] rounded-xl text-sm text-text-primary placeholder:text-[#5a7da8] focus:outline-none focus:border-accent-blue"
        />
        <button onClick={() => setShowFilters(!showFilters)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-text-primary">
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-4 p-3 bg-navy-700 border border-[#1f4070] rounded-xl space-y-3">
          <div>
            <p className="text-text-secondary text-xs font-medium mb-2">Sort by</p>
            <div className="flex flex-wrap gap-1.5">
              {SORT_OPTIONS.map((s) => (
                <button key={s.value} onClick={() => setSort(s.value)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sort === s.value ? "bg-accent-blue text-navy-900" : "bg-navy-600/30 text-text-secondary"}`}>{s.label}</button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showDeductibleOnly} onChange={(e) => setShowDeductibleOnly(e.target.checked)} className="rounded" />
            <span className="text-text-secondary text-xs font-medium">Show deductible in my country first</span>
          </label>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilter(cat.value)}
            className={`px-4 py-2.5 min-h-[44px] rounded-[20px] text-sm font-medium whitespace-nowrap transition-all ${
              filter === cat.value ? "bg-accent-blue text-navy-900 font-bold" : "bg-navy-700 text-text-secondary border border-[#1f4070]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Charity Cards */}
      <div className="space-y-3">
        {filtered.map((charity, i) => {
          const eligible = isEligible(charity);
          const certs = getCerts(charity);
          return (
            <Card
              key={charity.id}
              delay={Math.min(i * 0.04, 0.3)}
              onClick={() => router.push(`/charities/${charity.id}`)}
              className={!eligible && showDeductibleOnly ? "opacity-50" : ""}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{charity.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <h3 className="text-text-primary font-semibold text-sm truncate">{charity.name}</h3>
                    {charity.countryOfOrigin && <span className="text-xs shrink-0">{FLAGS[charity.countryOfOrigin] || ""}</span>}
                  </div>
                  <p className="text-text-secondary text-xs mb-2 line-clamp-2 font-medium">{charity.description}</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {charity.loiColucheEligible && userJurisdiction === "FR" && (
                      <Badge variant="yellow" className="text-xs">75% Loi Coluche</Badge>
                    )}
                    {charity.qualityLabel && (
                      <Badge variant="green" className="text-xs"><ShieldCheck className="w-3 h-3 mr-0.5" />{charity.qualityLabel}</Badge>
                    )}
                    {certs.some((c) => c.name.includes("Nobel")) && (
                      <Badge variant="yellow" className="text-xs">Nobel Prize</Badge>
                    )}
                    <Badge variant={charity.taxRate >= 75 ? "orange" : "purple"} className="text-xs">{charity.taxRate}%</Badge>
                    {!eligible && <Badge variant="red" className="text-xs">Not deductible</Badge>}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12"><p className="text-text-secondary">No charities match your search</p></div>
      )}
    </div>
  );
}
