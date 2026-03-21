"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { getCharityColor } from "@/lib/charityColors";
import { ChevronDown, ChevronUp, AlertTriangle, Share2, Flame, TrendingUp, TrendingDown, Users } from "lucide-react";

interface DashboardData {
  userName: string;
  ytdTotal: number;
  taxSaving: number;
  enhancedCeiling: number;
  enhancedTotal: number;
  weekRoundupCount: number;
  weekTotal: number;
  weekDelta: number;
  dailyTotals: number[];
  givingStreak: number;
  impactStatement: string | null;
  donatesToRestos: boolean;
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

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

function MiniBarChart({ values }: { values: number[] }) {
  const max = Math.max(...values, 0.1);
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div className="flex items-end gap-1.5 h-12 mt-2">
      {values.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${Math.max((v / max) * 100, 4)}%` }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="w-full bg-accent-green/60 rounded-t-sm min-h-[2px]"
          />
          <span className="text-[10px] text-text-secondary font-medium">{days[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [txExpanded, setTxExpanded] = useState(false);
  const [crisisBanner, setCrisisBanner] = useState(true);
  const [colucheCard, setColucheCard] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="px-5 pt-14 pb-4 max-w-lg mx-auto">
        <Skeleton className="h-6 w-40 mb-2" />
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-24 w-full mb-4" />
        <Skeleton className="h-28 w-full mb-4" />
        <Skeleton className="h-36 w-full mb-4" />
      </div>
    );
  }

  return (
    <div className="px-5 pt-14 pb-4 max-w-lg mx-auto page-transition overscroll-contain">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <p className="text-text-secondary text-sm">{getGreeting()},</p>
        <h1 className="text-2xl font-bold text-text-primary">{data.userName}</h1>
      </motion.div>

      {/* Impact Statement (emotional first) */}
      {data.impactStatement && (
        <Card glow="green" delay={0.05} className="mb-4">
          <p className="text-xs text-text-secondary font-medium mb-1">Your impact this month</p>
          <p className="text-text-primary text-sm font-semibold">{data.impactStatement}</p>
        </Card>
      )}

      {/* Coluche Story Card (appears when user donates to Restos du Coeur) */}
      {data.donatesToRestos && colucheCard && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4">
            <Card className="border-accent-yellow/20 bg-accent-yellow/5" delay={0.08}>
              <div className="flex items-start justify-between mb-2">
                <p className="text-accent-yellow text-xs font-bold">DID YOU KNOW?</p>
                <button onClick={() => setColucheCard(false)} className="text-text-secondary text-xs hover:text-text-primary min-h-[24px] px-1">Dismiss</button>
              </div>
              <p className="text-text-secondary text-sm font-medium leading-relaxed mb-2">
                The 75% tax deduction you receive? It exists because of Coluche, the comedian who founded Restos du Cœur in 1985. He fought for a law that would make giving to people in need as rewarding as possible. Every time you donate to Restos through RoundUp, you are part of his legacy.
              </p>
              <p className="text-text-secondary/60 text-xs italic font-medium">
                "Je fais appel à la bonté. La loi Coluche, c'est la reconnaissance que la générosité mérite d'être encouragée."
              </p>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Social Proof */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 mb-4 px-1"
      >
        <Users className="w-3.5 h-3.5 text-accent-blue" />
        <span className="text-xs text-text-secondary">Join 1,200+ people rounding up this week</span>
      </motion.div>

      {/* YTD Total + Delta */}
      <Card glow="green" delay={0.15} className="mb-4 text-center">
        <p className="text-text-secondary text-sm mb-1">Year to date donations</p>
        <AnimatedNumber
          value={data.ytdTotal}
          prefix="€"
          className="text-4xl font-bold text-accent-green"
        />
        {data.weekDelta !== 0 && (
          <div className="flex items-center justify-center gap-1 mt-1">
            {data.weekDelta > 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-accent-green" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-accent-red" />
            )}
            <span className={`text-xs font-medium tabular-nums ${data.weekDelta > 0 ? "text-accent-green" : "text-accent-red"}`}>
              {data.weekDelta > 0 ? "+" : ""}€{data.weekDelta.toFixed(2)} vs. last week
            </span>
          </div>
        )}
      </Card>

      {/* Giving Streak */}
      {data.givingStreak > 1 && (
        <Card delay={0.2} className="mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-orange/15 flex items-center justify-center">
              <Flame className="w-5 h-5 text-accent-orange" />
            </div>
            <div>
              <p className="text-text-primary font-semibold tabular-nums">{data.givingStreak} week streak</p>
              <p className="text-text-secondary text-xs">Consecutive weeks of active round ups</p>
            </div>
          </div>
        </Card>
      )}

      {/* Tax Ceiling Progress */}
      <Card delay={0.25} className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-text-secondary text-sm font-medium">Loi Coluche (75% rate)</span>
          <Badge variant="blue">€{data.taxSaving.toFixed(0)} saved</Badge>
        </div>
        <ProgressBar
          value={data.enhancedTotal}
          max={data.enhancedCeiling}
          color="green"
          glow
          label="Tax ceiling progress"
        />
        <p className="text-text-secondary text-xs mt-2 font-medium">
          €{Math.max(0, data.enhancedCeiling - data.enhancedTotal).toFixed(0)} remaining before ceiling
        </p>
      </Card>

      {/* Crisis Banner */}
      <AnimatePresence>
        {crisisBanner && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <Card className="bg-accent-red/10 border-accent-red/30" delay={0.3}>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-accent-red shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-text-primary text-sm font-semibold mb-1">Emergency: Earthquake Relief</p>
                  <p className="text-text-secondary text-xs mb-2 font-medium">
                    MSF and Secours Populaire are mobilising. Redirect your round ups?
                  </p>
                  <div className="flex gap-2">
                    <button className="text-xs text-accent-red font-medium hover:underline min-h-[44px] px-2 -ml-2 flex items-center">
                      Redirect now
                    </button>
                    <button
                      className="text-xs text-text-secondary hover:underline min-h-[44px] px-2 flex items-center"
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
      </AnimatePresence>

      {/* This Week */}
      <Card delay={0.35} className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-text-primary font-semibold">This week</h3>
          <Badge variant="green">{data.weekRoundupCount} round ups</Badge>
        </div>
        <div className="flex justify-between mb-2">
          <div>
            <p className="text-text-secondary text-xs font-medium">Total</p>
            <p className="text-text-primary font-semibold tabular-nums">€{data.weekTotal.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-text-secondary text-xs font-medium">Next debit</p>
            <p className="text-text-primary font-semibold">{formatDate(data.nextDebitDate)}</p>
          </div>
        </div>
        <MiniBarChart values={data.dailyTotals} />
        <button
          onClick={() => setTxExpanded(!txExpanded)}
          className="flex items-center gap-1 text-accent-blue text-xs font-medium min-h-[44px] mt-1"
        >
          {txExpanded ? "Hide" : "Show"} transactions
          {txExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        <AnimatePresence>
          {txExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              {data.weekTransactions.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex justify-between items-center py-1.5 border-t border-[#1f4070]/50"
                >
                  <div>
                    <p className="text-text-primary text-sm">{tx.merchant}</p>
                    <p className="text-text-secondary text-xs font-medium tabular-nums">
                      €{tx.purchase.toFixed(2)} purchase
                    </p>
                  </div>
                  <span className="text-accent-green text-sm font-medium tabular-nums">+€{tx.roundup.toFixed(2)}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Charity Allocation with stacked bar */}
      <Card delay={0.4} className="mb-4">
        <h3 className="text-text-primary font-semibold mb-3">Your charities</h3>
        {/* Stacked colour bar */}
        <div className="flex h-3 rounded-full overflow-hidden mb-4">
          {data.charityAllocations.map((a) => (
            <motion.div
              key={a.charityId}
              initial={{ width: 0 }}
              animate={{ width: `${a.allocationPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ backgroundColor: getCharityColor(a.charityName) }}
              className="h-full first:rounded-l-full last:rounded-r-full"
            />
          ))}
        </div>
        <div className="space-y-3">
          {data.charityAllocations.map((a) => (
            <div key={a.charityId} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: getCharityColor(a.charityName) }}
              />
              <span className="text-xl">{a.charityIcon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-text-primary text-sm truncate">{a.charityName}</p>
                <div className="flex items-center gap-2 text-xs text-text-secondary font-medium tabular-nums">
                  <span>{a.allocationPct}%</span>
                  <span>·</span>
                  <span>€{a.amountDonated.toFixed(2)}</span>
                </div>
              </div>
              <Badge variant={a.taxRate === 75 ? "green" : "purple"} className="text-xs">
                {a.taxRate}%
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Monthly Milestone */}
      <Card delay={0.45} className="mb-4 text-center">
        <p className="text-text-secondary text-xs font-medium mb-1">March milestone</p>
        <p className="text-text-primary font-semibold mb-2 tabular-nums">
          €{data.ytdTotal.toFixed(0)} donated this year
        </p>
        <button className="inline-flex items-center gap-1.5 text-accent-blue text-xs font-medium min-h-[44px] px-3">
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
