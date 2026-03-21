"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { ChevronLeft, ShieldCheck, Target, Info } from "lucide-react";
import { useToastStore } from "@/store";

interface CharityDetail {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  qualityLabel: string | null;
  taxRate: number;
  mission: string;
  impact: string[];
  crisisEligible: boolean;
}

export default function CharityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const showToast = useToastStore((s) => s.showToast);
  const [charity, setCharity] = useState<CharityDetail | null>(null);
  const [allocation, setAllocation] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showDonEnConfiance, setShowDonEnConfiance] = useState(false);

  useEffect(() => {
    fetch(`/api/charities/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setCharity(data.charity);
        setAllocation(data.allocation || 0);
      })
      .catch(console.error);
  }, [id]);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/charities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allocationPct: allocation }),
      });
      showToast("Allocation updated", "success");
    } catch {
      showToast("Failed to save", "error");
    }
    setSaving(false);
  }

  if (!charity) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 pt-14 pb-4 max-w-lg mx-auto page-transition">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 p-2 -ml-2 text-text-secondary text-sm mb-4 hover:text-text-primary transition-colors min-h-[44px]"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>

      {/* Header */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-5xl mb-3"
        >
          {charity.icon}
        </motion.div>
        <h1 className="text-2xl font-bold text-text-primary mb-1">{charity.name}</h1>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Badge variant="blue" className="capitalize">{charity.category}</Badge>
          {charity.qualityLabel && (
            <Badge variant="green">
              <ShieldCheck className="w-3 h-3 mr-1" />
              {charity.qualityLabel}
            </Badge>
          )}
        </div>
      </div>

      {/* Don en Confiance explainer */}
      {charity.qualityLabel && (
        <div className="mb-4">
          <button
            onClick={() => setShowDonEnConfiance(!showDonEnConfiance)}
            className="flex items-center gap-1.5 text-xs text-text-secondary font-medium hover:text-text-primary transition-colors min-h-[44px] px-1"
          >
            <Info className="w-3.5 h-3.5" />
            What is Don en Confiance?
          </button>
          {showDonEnConfiance && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="px-1 pb-2"
            >
              <p className="text-text-secondary text-xs font-medium leading-relaxed">
                Don en Confiance is an independent French oversight body that monitors charities for ethical fundraising, financial transparency, and governance. Only organisations that meet strict standards receive this label.
              </p>
            </motion.div>
          )}
        </div>
      )}

      {/* Mission */}
      <Card delay={0.1} className="mb-4">
        <h3 className="text-text-primary font-semibold mb-2">Mission</h3>
        <p className="text-text-secondary text-sm leading-relaxed font-medium">{charity.mission}</p>
      </Card>

      {/* Impact */}
      <Card delay={0.2} className="mb-4">
        <h3 className="text-text-primary font-semibold mb-3">Recent impact</h3>
        <div className="space-y-2">
          {charity.impact.map((bullet, i) => (
            <div key={i} className="flex items-start gap-2">
              <Target className="w-4 h-4 text-accent-green shrink-0 mt-0.5" />
              <p className="text-text-secondary text-sm">{bullet}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Tax Benefit */}
      <Card delay={0.3} className="mb-4" glow={charity.taxRate === 75 ? "green" : "purple"}>
        <h3 className="text-text-primary font-semibold mb-2">Tax benefit</h3>
        <p className="text-text-secondary text-sm">
          Donations to {charity.name} qualify for a <span className="text-accent-green font-semibold">{charity.taxRate}%</span> tax credit
          {charity.taxRate === 75 ? " under the Loi Coluche (capped at €2,000)" : ""}.
        </p>
      </Card>

      {/* Allocation Slider */}
      <Card delay={0.4} className="mb-4">
        <h3 className="text-text-primary font-semibold mb-3">Your allocation</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Percentage of round ups</span>
            <span className="text-accent-blue font-bold text-lg">{allocation}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={allocation}
            onChange={(e) => setAllocation(Number(e.target.value))}
            aria-label="Allocation percentage"
            aria-valuetext={`${allocation}%`}
            className="w-full h-2 bg-navy-600 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-11
              [&::-webkit-slider-thumb]:h-11
              [&::-webkit-slider-thumb]:bg-accent-blue
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:border-4
              [&::-webkit-slider-thumb]:border-navy-700"
          />
          <Button fullWidth onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Allocation"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
