"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToastStore } from "@/store";
import { getCharityColor } from "@/lib/charityColors";
import { ChevronLeft, ShieldCheck, Target, Info, Coins, Clock, PieChart, ChevronDown } from "lucide-react";

interface HowMoneyHelps { amount: number; description: string }
interface Milestone { year: number; title: string; description: string }
interface FinancialBreakdown { programs: number; admin: number; fundraising: number }

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
  foundingStory: string | null;
  howMoneyHelps: HowMoneyHelps[];
  milestones: Milestone[];
  financialBreakdown: FinancialBreakdown | null;
  fundraisingEfficiency: string | null;
}

export default function CharityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const showToast = useToastStore((s) => s.showToast);
  const [charity, setCharity] = useState<CharityDetail | null>(null);
  const [allocation, setAllocation] = useState(0);
  const [donatedAmount, setDonatedAmount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [storyExpanded, setStoryExpanded] = useState(true);
  const [showDonEnConfiance, setShowDonEnConfiance] = useState(false);

  useEffect(() => {
    fetch(`/api/charities/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setCharity(data.charity);
        setAllocation(data.allocation || 0);
        setDonatedAmount(data.donatedAmount || 0);
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

  const brandColor = getCharityColor(charity.name);

  // Impact calculator
  function getImpactText(): string | null {
    if (!charity || donatedAmount <= 0 || !charity.howMoneyHelps.length) return null;
    const help = charity.howMoneyHelps;
    const units = Math.floor(donatedAmount / help[0].amount);
    if (units > 0) {
      return `Your €${donatedAmount.toFixed(2)} has funded approximately ${units} × ${help[0].description.toLowerCase()}`;
    }
    return null;
  }

  const impactText = getImpactText();

  return (
    <div className="px-5 pt-14 pb-4 max-w-lg mx-auto page-transition" style={{ background: `linear-gradient(180deg, ${brandColor}08 0%, transparent 200px)` }}>
      <button onClick={() => router.back()} className="flex items-center gap-1 p-2 -ml-2 text-text-secondary text-sm mb-4 hover:text-text-primary transition-colors min-h-[44px]">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="text-center mb-6">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-5xl mb-3">
          {charity.icon}
        </motion.div>
        <h1 className="text-2xl font-bold text-text-primary mb-1">{charity.name}</h1>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Badge variant="blue" className="capitalize">{charity.category}</Badge>
          {charity.qualityLabel && (
            <Badge variant="green"><ShieldCheck className="w-3 h-3 mr-1" />{charity.qualityLabel}</Badge>
          )}
        </div>
      </div>

      {/* Don en Confiance explainer */}
      {charity.qualityLabel && (
        <div className="mb-4">
          <button onClick={() => setShowDonEnConfiance(!showDonEnConfiance)} className="flex items-center gap-1.5 text-xs text-text-secondary font-medium hover:text-text-primary transition-colors min-h-[44px] px-1">
            <Info className="w-3.5 h-3.5" /> What is Don en Confiance?
          </button>
          {showDonEnConfiance && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="px-1 pb-2">
              <p className="text-text-secondary text-xs font-medium leading-relaxed">
                Don en Confiance is an independent French oversight body that monitors charities for ethical fundraising, financial transparency, and governance. Only organisations that meet strict standards receive this label.
              </p>
            </motion.div>
          )}
        </div>
      )}

      {/* Impact Calculator (if user has donated) */}
      {impactText && (
        <Card glow="green" delay={0.05} className="mb-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: brandColor + "20" }}>
              <Coins className="w-4 h-4" style={{ color: brandColor }} />
            </div>
            <div>
              <p className="text-text-primary text-xs font-bold mb-1">Your impact so far</p>
              <p className="text-text-secondary text-xs font-medium leading-relaxed">{impactText}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Mission */}
      <Card delay={0.1} className="mb-4">
        <h3 className="text-text-primary font-semibold mb-2">Mission</h3>
        {charity.mission.split("\n\n").map((p, i) => (
          <p key={i} className="text-text-secondary text-sm leading-relaxed font-medium mb-2 last:mb-0">{p}</p>
        ))}
      </Card>

      {/* Founding Story */}
      {charity.foundingStory && (
        <Card delay={0.15} className="mb-4">
          <button onClick={() => setStoryExpanded(!storyExpanded)} className="flex items-center justify-between w-full min-h-[36px]">
            <h3 className="text-text-primary font-semibold">Our story</h3>
            <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform ${storyExpanded ? "rotate-180" : ""}`} />
          </button>
          {storyExpanded && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-text-secondary text-sm leading-relaxed font-medium mt-2">{charity.foundingStory}</p>
            </motion.div>
          )}
        </Card>
      )}

      {/* Impact Bullets */}
      <Card delay={0.2} className="mb-4">
        <h3 className="text-text-primary font-semibold mb-3">Recent impact</h3>
        <div className="space-y-2.5">
          {charity.impact.map((bullet, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: brandColor }} />
              <p className="text-text-secondary text-sm font-medium">{bullet}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* How Your Money Helps */}
      {charity.howMoneyHelps.length > 0 && (
        <Card delay={0.25} className="mb-4">
          <h3 className="text-text-primary font-semibold mb-4">How your money helps</h3>
          <div className="relative">
            <div className="absolute left-4 top-2 bottom-2 w-px bg-navy-600" />
            <div className="space-y-4">
              {charity.howMoneyHelps.map((h, i) => (
                <div key={i} className="flex items-start gap-4 relative">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10" style={{ backgroundColor: brandColor + "20", color: brandColor }}>
                    €{h.amount}
                  </div>
                  <p className="text-text-secondary text-sm font-medium pt-1">{h.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Financial Transparency */}
      {charity.financialBreakdown && (
        <Card delay={0.3} className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="w-4 h-4 text-accent-blue" />
            <h3 className="text-text-primary font-semibold">Where your money goes</h3>
          </div>
          <div className="flex h-4 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-accent-green" style={{ width: `${charity.financialBreakdown.programs}%` }} />
            <div className="h-full bg-accent-blue" style={{ width: `${charity.financialBreakdown.admin}%` }} />
            <div className="h-full bg-accent-orange" style={{ width: `${charity.financialBreakdown.fundraising}%` }} />
          </div>
          <div className="flex justify-between text-xs text-text-secondary font-medium">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-green" /> Programs {charity.financialBreakdown.programs}%</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-blue" /> Admin {charity.financialBreakdown.admin}%</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-orange" /> Fundraising {charity.financialBreakdown.fundraising}%</span>
          </div>
          {charity.fundraisingEfficiency && (
            <p className="text-text-secondary text-xs font-medium mt-2 italic">{charity.fundraisingEfficiency}</p>
          )}
        </Card>
      )}

      {/* Milestones Timeline */}
      {charity.milestones.length > 0 && (
        <Card delay={0.35} className="mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-accent-purple" />
            <h3 className="text-text-primary font-semibold">Key milestones</h3>
          </div>
          <div className="space-y-4 relative">
            <div className="absolute left-[22px] top-2 bottom-2 w-px bg-navy-600" />
            {charity.milestones.map((m, i) => (
              <div key={i} className="flex gap-4 relative">
                <div className="w-11 text-right shrink-0">
                  <span className="text-xs font-bold tabular-nums" style={{ color: brandColor }}>{m.year}</span>
                </div>
                <div className="w-2 h-2 rounded-full shrink-0 mt-1.5 z-10" style={{ backgroundColor: brandColor }} />
                <div>
                  <p className="text-text-primary text-sm font-semibold">{m.title}</p>
                  <p className="text-text-secondary text-xs font-medium">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tax Benefit */}
      <Card delay={0.4} glow={charity.taxRate === 75 ? "green" : "purple"} className="mb-4">
        <h3 className="text-text-primary font-semibold mb-2">Tax benefit</h3>
        <p className="text-text-secondary text-sm font-medium">
          Donations to {charity.name} qualify for a <span className="text-accent-green font-semibold">{charity.taxRate}%</span> tax credit
          {charity.taxRate === 75 ? " under the Loi Coluche (capped at €2,000)" : ""}.
        </p>
      </Card>

      {/* Allocation Slider */}
      <Card delay={0.45} className="mb-4">
        <h3 className="text-text-primary font-semibold mb-3">Your allocation</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary font-medium">Percentage of round ups</span>
            <span className="font-bold text-lg tabular-nums" style={{ color: brandColor }}>{allocation}%</span>
          </div>
          <input
            type="range" min={0} max={100} step={5} value={allocation}
            onChange={(e) => setAllocation(Number(e.target.value))}
            aria-label="Allocation percentage" aria-valuetext={`${allocation}%`}
            className="w-full h-2 bg-navy-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-11 [&::-webkit-slider-thumb]:h-11 [&::-webkit-slider-thumb]:bg-accent-blue [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-navy-700"
          />
          {donatedAmount > 0 && (
            <p className="text-text-secondary text-xs font-medium tabular-nums">Year to date: €{donatedAmount.toFixed(2)} donated</p>
          )}
          <Button fullWidth onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Allocation"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
