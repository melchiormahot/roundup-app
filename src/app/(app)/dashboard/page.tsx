"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { ChevronDown, ChevronUp, AlertTriangle, Share2 } from "lucide-react";

interface DashboardData {
  userName: string;
  ytdTotal: number;
  taxSaving: number;
  enhancedCeiling: number;
  enhancedTotal: number;
  weekRoundupCount: number;
  weekTotal: number;
  nextDebitDate: string;
  weekTransactions: {
    id: string;
    merchant: string;
    purchase: number;
    roundup: number;
    time: string;
  }[];
  charityAllocations: {
    charityName: string;
    charityIcon: string;
    charityId: string;
    allocationPct: number;
    amountDonated: number;
    taxRate: number;
  }[];
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [txExpanded, setTxExpanded] = useState(false);
  const [crisisBanner, setCrisisBanner] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 pt-14 pb-4 max-w-lg mx-auto page-transition">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <p className="text-text-secondary text-sm">{getGreeting()},</p>
        <h1 className="text-2xl font-bold text-text-primary">{data.userName}</h1>
      </motion.div>

      {/* YTD Total */}
      <Card glow="green" delay={0.1} className="mb-4 text-center">
        <p className="text-text-secondary text-sm mb-1">Year to date donations</p>
        <AnimatedNumber
          value={data.ytdTotal}
          prefix="€"
          className="text-4xl font-bold text-accent-green"
        />
      </Card>

      {/* Tax Ceiling Progress */}
      <Card delay={0.2} className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-text-secondary text-sm">Loi Coluche (75% rate)</span>
          <Badge variant="blue">€{data.taxSaving.toFixed(0)} saved</Badge>
        </div>
        <ProgressBar
          value={data.enhancedTotal}
          max={data.enhancedCeiling}
          color="green"
          glow
          label="Tax ceiling progress"
        />
        <p className="text-text-secondary text-xs mt-2">
          €{Math.max(0, data.enhancedCeiling - data.enhancedTotal).toFixed(0)} remaining before ceiling
        </p>
      </Card>

      {/* Crisis Banner */}
      {crisisBanner && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4"
        >
          <Card className="bg-accent-red/10 border-accent-red/30" delay={0.25}>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-accent-red shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-text-primary text-sm font-semibold mb-1">Emergency: Earthquake Relief</p>
                <p className="text-text-secondary text-xs mb-2">
                  MSF and Secours Populaire are mobilising. Redirect your round ups?
                </p>
                <div className="flex gap-2">
                  <button className="text-xs text-accent-red font-medium hover:underline">
                    Redirect now
                  </button>
                  <button
                    className="text-xs text-text-secondary hover:underline"
                    onClick={() => setCrisisBanner(false)}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* This Week */}
      <Card delay={0.3} className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-text-primary font-semibold">This week</h3>
          <Badge variant="green">{data.weekRoundupCount} round ups</Badge>
        </div>
        <div className="flex justify-between mb-3">
          <div>
            <p className="text-text-secondary text-xs">Total</p>
            <p className="text-text-primary font-semibold">€{data.weekTotal.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-text-secondary text-xs">Next debit</p>
            <p className="text-text-primary font-semibold">{formatDate(data.nextDebitDate)}</p>
          </div>
        </div>
        <button
          onClick={() => setTxExpanded(!txExpanded)}
          className="flex items-center gap-1 text-accent-blue text-xs font-medium"
        >
          {txExpanded ? "Hide" : "Show"} transactions
          {txExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        {txExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3 space-y-2"
          >
            {data.weekTransactions.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center py-1.5 border-t border-navy-600/50">
                <div>
                  <p className="text-text-primary text-sm">{tx.merchant}</p>
                  <p className="text-text-secondary text-xs">
                    €{tx.purchase.toFixed(2)} purchase
                  </p>
                </div>
                <span className="text-accent-green text-sm font-medium">+€{tx.roundup.toFixed(2)}</span>
              </div>
            ))}
          </motion.div>
        )}
      </Card>

      {/* Charity Allocation */}
      <Card delay={0.4} className="mb-4">
        <h3 className="text-text-primary font-semibold mb-3">Your charities</h3>
        <div className="space-y-3">
          {data.charityAllocations.map((a) => (
            <div key={a.charityId} className="flex items-center gap-3">
              <span className="text-xl">{a.charityIcon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-text-primary text-sm truncate">{a.charityName}</p>
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <span>{a.allocationPct}%</span>
                  <span>·</span>
                  <span>€{a.amountDonated.toFixed(2)}</span>
                </div>
              </div>
              <Badge variant={a.taxRate === 75 ? "green" : "purple"} className="text-[10px]">
                {a.taxRate}%
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Monthly Milestone */}
      <Card delay={0.5} className="mb-4 text-center">
        <p className="text-text-secondary text-xs mb-1">March milestone</p>
        <p className="text-text-primary font-semibold mb-2">
          €{data.ytdTotal.toFixed(0)} donated this year
        </p>
        <button className="inline-flex items-center gap-1.5 text-accent-blue text-xs font-medium">
          <Share2 className="w-3.5 h-3.5" />
          Share your impact
        </button>
      </Card>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}
