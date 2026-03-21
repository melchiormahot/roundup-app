"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ChevronLeft, ShieldCheck } from "lucide-react";

const CATEGORY_META: Record<string, { name: string; description: string; why: string }> = {
  humanitarian: {
    name: "Humanitarian",
    description: "Organisations providing essential aid to people in crisis",
    why: "When people have nothing, a meal, a blanket, or a doctor can be the difference between despair and hope.",
  },
  health: {
    name: "Health",
    description: "Charities advancing medical research and patient support",
    why: "Medical research moves slowly, costs dearly, and saves millions. Your spare change accelerates the cure.",
  },
  environment: {
    name: "Environment",
    description: "Organisations protecting nature and fighting climate change",
    why: "The planet doesn't send invoices, but the costs are real. Conservation protects what we can't replace.",
  },
  rights: {
    name: "Human Rights",
    description: "Defenders of fundamental freedoms and justice worldwide",
    why: "When someone is silenced, imprisoned, or persecuted, a voice on their side changes everything.",
  },
};

interface Charity {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  qualityLabel: string | null;
  taxRate: number;
  mission: string;
}

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [charities, setCharities] = useState<Charity[]>([]);
  const meta = CATEGORY_META[slug];

  useEffect(() => {
    fetch("/api/charities")
      .then((r) => r.json())
      .then((data) => setCharities((data.charities || []).filter((c: Charity) => c.category === slug)))
      .catch(console.error);
  }, [slug]);

  if (!meta) {
    return <div className="px-5 pt-14 max-w-lg mx-auto"><p className="text-text-secondary">Category not found</p></div>;
  }

  return (
    <div className="px-5 pt-14 pb-4 max-w-lg mx-auto page-transition">
      <button onClick={() => router.back()} className="flex items-center gap-1 p-2 -ml-2 text-text-secondary text-sm mb-4 hover:text-text-primary transition-colors min-h-[44px]">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary mb-2">{meta.name}</h1>
        <p className="text-text-secondary text-sm font-medium mb-4">{meta.description}</p>
        <p className="text-text-secondary text-sm italic leading-relaxed">"{meta.why}"</p>
        <p className="text-text-secondary text-xs mt-2 font-medium">{charities.length} {charities.length === 1 ? "charity" : "charities"} in this category</p>
      </div>

      <div className="space-y-4">
        {charities.map((c, i) => (
          <Card key={c.id} delay={i * 0.1} onClick={() => router.push(`/charities/${c.id}`)}>
            <div className="flex items-start gap-4 mb-3">
              <span className="text-3xl">{c.icon}</span>
              <div className="flex-1">
                <h3 className="text-text-primary font-bold mb-1">{c.name}</h3>
                <div className="flex gap-2 flex-wrap mb-2">
                  {c.qualityLabel && (
                    <Badge variant="green" className="text-xs"><ShieldCheck className="w-3 h-3 mr-1" />{c.qualityLabel}</Badge>
                  )}
                  <Badge variant={c.taxRate === 75 ? "orange" : "purple"} className="text-xs">{c.taxRate}% deductible</Badge>
                </div>
              </div>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">{c.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
