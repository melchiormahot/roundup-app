"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { useToastStore } from "@/store";
import { useTheme } from "@/components/ThemeProvider";
import {
  Copy, LogOut, RefreshCw, CheckCircle, Building2, FileCheck2,
  ChevronDown, Lock, Play, FastForward, Calendar, Trash2, Loader2,
  Sun, Moon, Monitor,
  AlertTriangle, User, Zap, Crown,
} from "lucide-react";

interface UserData {
  id: string;
  email: string;
  name: string;
  jurisdiction: string;
  incomeBracket: number;
  debitFrequency: string;
  referralCode: string;
  createdAt: string;
}

interface SimState {
  enabled: boolean;
  currentDate: string;
  dayCount: number;
  notificationStyle: string;
}

interface SimResult {
  transactions: number;
  roundupTotal: number;
  allocations: { charity: string; amount: number }[];
  notifications: string[];
  dayCount: number;
}

export default function SettingsPage() {
  const router = useRouter();
  const showToast = useToastStore((s) => s.showToast);
  const [user, setUser] = useState<UserData | null>(null);
  const [simState, setSimState] = useState<SimState | null>(null);
  const [simResult, setSimResult] = useState<SimResult | null>(null);
  const [simLoading, setSimLoading] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [dataExpanded, setDataExpanded] = useState(false);
  const { theme, setTheme } = useTheme();
  const [notifSettings, setNotifSettings] = useState({
    weeklySummary: true,
    monthlyProgress: true,
    crisisAlerts: true,
    charityUpdates: true,
  });

  useEffect(() => {
    fetch("/api/user").then((r) => r.json()).then((d) => setUser(d.user)).catch(console.error);
    fetch("/api/simulation").then((r) => r.json()).then(setSimState).catch(console.error);
  }, []);

  async function simAction(action: string, extra?: Record<string, string>) {
    setSimLoading(action);
    setSimResult(null);
    try {
      const res = await fetch("/api/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Simulation failed", "error");
      } else {
        if (data.result) setSimResult(data.result);
        if (action === "toggle") setSimState((s) => s ? { ...s, enabled: data.enabled } : null);
        if (action === "reset") { setConfirmReset(false); showToast("Data reset", "info"); }
        if (action === "loadProfile") showToast("Profile loaded", "success");
        if (action === "crisis") showToast("Crisis event triggered", "info");
        if (action === "setStyle") setSimState((s) => s ? { ...s, notificationStyle: extra?.notificationStyle || "factual" } : null);
        // Refresh sim state
        const state = await fetch("/api/simulation").then((r) => r.json());
        setSimState(state);
      }
    } catch { showToast("Network error", "error"); }
    setSimLoading(null);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  function copyReferral() {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      showToast("Referral code copied!", "success");
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const joinDate = new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  // Timeline position
  const simDate = simState?.currentDate ? new Date(simState.currentDate) : new Date();
  const yearStart = new Date(simDate.getFullYear(), 0, 1);
  const yearEnd = new Date(simDate.getFullYear(), 11, 31);
  const yearProgress = ((simDate.getTime() - yearStart.getTime()) / (yearEnd.getTime() - yearStart.getTime())) * 100;

  return (
    <div className="px-5 pt-14 pb-4 max-w-lg mx-auto page-transition overscroll-contain">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
      </div>

      {/* Demo Mode Control Panel */}
      <div className="mb-6 p-4 bg-navy-700 border-2 border-accent-yellow/30 rounded-[16px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent-yellow" />
            <h3 className="text-text-primary font-bold">Demo Mode</h3>
          </div>
          <Toggle
            checked={simState?.enabled || false}
            onChange={() => simAction("toggle")}
          />
        </div>

        {simState?.enabled && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary font-medium">Day {simState.dayCount} of simulated usage</span>
              <span className="text-text-secondary font-medium tabular-nums">
                {new Date(simState.currentDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>

            {/* Year Timeline */}
            <div>
              <div className="flex justify-between text-[10px] text-text-secondary font-medium mb-1">
                <span>Jan</span><span>Mar</span><span>Jun</span><span>Sep</span><span>Dec</span>
              </div>
              <div className="h-2 bg-navy-600 rounded-full overflow-hidden relative">
                <div className="h-full bg-accent-yellow/60 rounded-full" style={{ width: `${yearProgress}%` }} />
                <div className="absolute top-0 h-full w-0.5 bg-accent-yellow" style={{ left: `${yearProgress}%` }} />
              </div>
            </div>

            {/* Simulation Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <SimButton icon={<Play className="w-4 h-4" />} label="Simulate Day" color="blue" loading={simLoading === "day"} onClick={() => simAction("day")} />
              <SimButton icon={<Calendar className="w-4 h-4" />} label="Simulate Week" color="green" loading={simLoading === "week"} onClick={() => simAction("week")} />
              <SimButton icon={<FastForward className="w-4 h-4" />} label="Simulate Month" color="purple" loading={simLoading === "month"} onClick={() => simAction("month")} />
              <SimButton icon={<Crown className="w-4 h-4" />} label="Jump to Year End" color="yellow" loading={simLoading === "yearEnd"} onClick={() => simAction("yearEnd")} />
            </div>

            {/* Result Summary */}
            <AnimatePresence>
              {simResult && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-navy-600/20 rounded-xl text-xs text-text-secondary font-medium space-y-1"
                >
                  <p className="text-text-primary font-semibold">Generated {simResult.transactions} transactions, €{simResult.roundupTotal.toFixed(2)} in round ups</p>
                  {simResult.allocations.map((a, i) => (
                    <p key={i}>€{a.amount.toFixed(2)} to {a.charity}</p>
                  ))}
                  {simResult.notifications.length > 0 && (
                    <p className="text-accent-blue">Notifications: {simResult.notifications.join(", ")}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Crisis + Reset */}
            <div className="flex gap-2">
              <button
                onClick={() => simAction("crisis")}
                disabled={simLoading === "crisis"}
                className="flex-1 flex items-center justify-center gap-1.5 p-2.5 bg-accent-red/10 border border-accent-red/30 rounded-xl text-accent-red text-xs font-medium min-h-[44px] hover:bg-accent-red/20 transition-colors"
              >
                {simLoading === "crisis" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                Trigger Crisis
              </button>
              {!confirmReset ? (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 p-2.5 border border-accent-red/30 rounded-xl text-accent-red text-xs font-medium min-h-[44px] hover:bg-accent-red/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Reset Data
                </button>
              ) : (
                <button
                  onClick={() => simAction("reset")}
                  disabled={simLoading === "reset"}
                  className="flex-1 flex items-center justify-center gap-1.5 p-2.5 bg-accent-red border border-accent-red rounded-xl text-navy-900 text-xs font-bold min-h-[44px]"
                >
                  {simLoading === "reset" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm Reset"}
                </button>
              )}
            </div>

            {/* Demo Profiles */}
            <div>
              <p className="text-text-secondary text-xs font-medium mb-2">Demo Profiles</p>
              <div className="space-y-2">
                {[
                  { key: "sophie", name: "Sophie, 24", desc: "Student, 2 charities, 2 months", icon: "👩‍🎓" },
                  { key: "thomas", name: "Thomas, 35", desc: "Engineer, 4 charities, 6 months", icon: "👨‍💻" },
                  { key: "marie", name: "Marie, 52", desc: "Executive, 3 charities, near ceiling", icon: "👩‍💼" },
                ].map((p) => (
                  <button
                    key={p.key}
                    onClick={() => simAction("loadProfile", { profile: p.key })}
                    disabled={simLoading === "loadProfile"}
                    className="w-full flex items-center gap-3 p-3 bg-navy-600/20 rounded-xl hover:bg-navy-600/30 transition-colors min-h-[44px]"
                  >
                    <span className="text-lg">{p.icon}</span>
                    <div className="text-left flex-1">
                      <p className="text-text-primary text-sm font-medium">{p.name}</p>
                      <p className="text-text-secondary text-xs font-medium">{p.desc}</p>
                    </div>
                    {simLoading === "loadProfile" ? <Loader2 className="w-4 h-4 animate-spin text-text-secondary" /> : <User className="w-4 h-4 text-text-secondary" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Style Toggle */}
            <div>
              <p className="text-text-secondary text-xs font-medium mb-2">Notification Style</p>
              <div className="flex gap-2">
                {(["factual", "warm", "motivational"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => simAction("setStyle", { notificationStyle: s })}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium capitalize transition-all min-h-[44px] ${
                      simState.notificationStyle === s
                        ? "bg-accent-blue text-navy-900 font-bold"
                        : "bg-navy-600/20 text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Account */}
      <Card delay={0.1} className="mb-4">
        <h3 className="text-text-primary font-semibold mb-3">Account</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-text-secondary">Name</span><span className="text-text-primary">{user.name}</span></div>
          <div className="flex justify-between"><span className="text-text-secondary">Email</span><span className="text-text-primary">{user.email}</span></div>
          <div className="flex justify-between"><span className="text-text-secondary">Member since</span><span className="text-text-primary">{joinDate}</span></div>
        </div>
      </Card>

      {/* Bank & SEPA */}
      <Card delay={0.2} className="mb-4">
        <h3 className="text-text-primary font-semibold mb-3">Banking</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-navy-600/20 rounded-xl">
            <Building2 className="w-5 h-5 text-accent-blue" />
            <div className="flex-1">
              <p className="text-text-primary text-sm">Bank connection</p>
              <p className="text-text-secondary text-xs font-medium">Simulated · Last synced: just now</p>
            </div>
            <div className="flex items-center gap-1 text-accent-green text-xs font-medium"><CheckCircle className="w-3.5 h-3.5" /> Connected</div>
          </div>
          <p className="text-text-secondary/60 text-xs font-medium px-1">Secured by 256-bit encryption</p>
          <div className="flex items-center gap-3 p-3 bg-navy-600/20 rounded-xl">
            <FileCheck2 className="w-5 h-5 text-accent-blue" />
            <div className="flex-1">
              <p className="text-text-primary text-sm">SEPA mandate</p>
              <p className="text-text-secondary text-xs">RNDUP-2026-001</p>
            </div>
            <div className="flex items-center gap-1 text-accent-green text-xs"><CheckCircle className="w-3.5 h-3.5" /> Active</div>
          </div>
        </div>
      </Card>

      {/* Theme */}
      <Card delay={0.25} className="mb-4">
        <h3 className="text-text-primary font-semibold mb-3">Theme</h3>
        <div className="flex gap-1 bg-navy-600/20 rounded-xl p-1">
          {([["dark", Moon, "Dark"], ["light", Sun, "Light"], ["system", Monitor, "System"]] as const).map(([value, Icon, label]) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all min-h-[44px] ${
                theme === value ? "bg-accent-blue text-navy-900" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
        {theme === "system" && (
          <p className="text-text-secondary text-xs font-medium mt-2">Follows your device settings</p>
        )}
      </Card>

      {/* Notifications */}
      <Card delay={0.3} className="mb-4">
        <h3 className="text-text-primary font-semibold mb-4">Notifications</h3>
        <div className="space-y-4">
          <Toggle label="Weekly summary" checked={notifSettings.weeklySummary} onChange={(v) => setNotifSettings((s) => ({ ...s, weeklySummary: v }))} />
          <Toggle label="Monthly progress" checked={notifSettings.monthlyProgress} onChange={(v) => setNotifSettings((s) => ({ ...s, monthlyProgress: v }))} />
          <Toggle label="Crisis alerts" checked={notifSettings.crisisAlerts} onChange={(v) => setNotifSettings((s) => ({ ...s, crisisAlerts: v }))} />
          <Toggle label="Charity updates" checked={notifSettings.charityUpdates} onChange={(v) => setNotifSettings((s) => ({ ...s, charityUpdates: v }))} />
        </div>
      </Card>

      {/* Referral */}
      <Card delay={0.4} className="mb-4">
        <h3 className="text-text-primary font-semibold mb-2">Referral code</h3>
        <p className="text-text-secondary text-xs mb-3">Share your code and earn bonus round ups</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-navy-600/20 rounded-xl px-4 py-3 text-text-primary font-mono text-sm">{user.referralCode}</div>
          <button onClick={copyReferral} className="p-3 bg-navy-600/20 rounded-xl text-text-secondary hover:text-accent-blue transition-colors"><Copy className="w-5 h-5" /></button>
        </div>
      </Card>

      {/* Data Transparency */}
      <Card delay={0.5} className="mb-4">
        <button onClick={() => setDataExpanded(!dataExpanded)} className="flex items-center justify-between w-full min-h-[44px]">
          <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-accent-blue" /><h3 className="text-text-primary font-semibold">What data we store</h3></div>
          <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform ${dataExpanded ? "rotate-180" : ""}`} />
        </button>
        {dataExpanded && (
          <div className="mt-3 space-y-2 text-xs text-text-secondary font-medium">
            <p>RoundUp stores the minimum data needed to operate:</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>Your email address and name</li>
              <li>Jurisdiction and income bracket (for tax calculations)</li>
              <li>Charity allocation preferences</li>
              <li>Transaction round up amounts (not your purchases)</li>
            </ul>
            <p>We never store your bank credentials, card numbers, or full transaction details. All data is encrypted at rest and in transit.</p>
          </div>
        )}
      </Card>

      {/* Actions */}
      <div className="space-y-3 mb-4">
        <Button fullWidth variant="secondary" onClick={() => {
          fetch("/api/user", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ onboardingCompleted: false }) }).then(() => router.push("/onboarding"));
        }}>
          <span className="flex items-center gap-2 justify-center"><RefreshCw className="w-4 h-4" /> Replay Onboarding</span>
        </Button>
        <Button fullWidth variant="ghost" onClick={handleLogout} className="text-accent-red">
          <span className="flex items-center gap-2 justify-center"><LogOut className="w-4 h-4" /> Log Out</span>
        </Button>
      </div>
    </div>
  );
}

function SimButton({ icon, label, color, loading, onClick }: { icon: React.ReactNode; label: string; color: string; loading: boolean; onClick: () => void }) {
  const colors: Record<string, string> = {
    blue: "bg-accent-blue/10 border-accent-blue/30 text-accent-blue hover:bg-accent-blue/20",
    green: "bg-accent-green/10 border-accent-green/30 text-accent-green hover:bg-accent-green/20",
    purple: "bg-accent-purple/10 border-accent-purple/30 text-accent-purple hover:bg-accent-purple/20",
    yellow: "bg-accent-yellow/10 border-accent-yellow/30 text-accent-yellow hover:bg-accent-yellow/20",
  };
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex items-center justify-center gap-1.5 p-3 border rounded-xl text-xs font-semibold min-h-[44px] transition-colors ${colors[color] || colors.blue}`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {label}
    </button>
  );
}
