"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck } from "lucide-react";

interface Charity {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  qualityLabel: string | null;
  taxRate: number;
}

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "health", label: "Health" },
  { value: "environment", label: "Environment" },
  { value: "humanitarian", label: "Humanitarian" },
  { value: "rights", label: "Human Rights" },
];

export default function CharitiesPage() {
  const router = useRouter();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/charities")
      .then((r) => r.json())
      .then((data) => setCharities(data.charities || []))
      .catch(console.error);
  }, []);

  const filtered = filter === "all" ? charities : charities.filter((c) => c.category === filter);

  return (
    <div className="px-5 pt-14 pb-4 max-w-lg mx-auto page-transition">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Charities</h1>
        <p className="text-text-secondary text-sm mt-1">Choose where your round ups go</p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilter(cat.value)}
            className={`px-4 py-2 rounded-[20px] text-sm font-medium whitespace-nowrap transition-all ${
              filter === cat.value
                ? "bg-accent-blue text-white"
                : "bg-navy-700 text-text-secondary hover:text-text-primary border border-navy-600"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Charity Cards */}
      <div className="space-y-3">
        {filtered.map((charity, i) => (
          <Card
            key={charity.id}
            delay={i * 0.08}
            onClick={() => router.push(`/charities/${charity.id}`)}
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl">{charity.icon}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-text-primary font-semibold mb-1">{charity.name}</h3>
                <p className="text-text-secondary text-xs mb-2 line-clamp-2">{charity.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {charity.qualityLabel && (
                    <Badge variant="green" className="text-[10px]">
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      {charity.qualityLabel}
                    </Badge>
                  )}
                  <Badge variant={charity.taxRate === 75 ? "orange" : "purple"} className="text-[10px]">
                    {charity.taxRate}% tax credit
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
