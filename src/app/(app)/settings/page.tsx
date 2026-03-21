"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { useToastStore } from "@/store";
import { Copy, LogOut, RefreshCw, CheckCircle, Building2, FileCheck2 } from "lucide-react";

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

export default function SettingsPage() {
  const router = useRouter();
  const showToast = useToastStore((s) => s.showToast);
  const [user, setUser] = useState<UserData | null>(null);
  const [notifSettings, setNotifSettings] = useState({
    weeklySummary: true,
    monthlyProgress: true,
    crisisAlerts: true,
    charityUpdates: true,
  });

  useEffect(() => {
    fetch("/api/user")
      .then((r) => r.json())
      .then((data) => setUser(data.user))
      .catch(console.error);
  }, []);

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

  const joinDate = new Date(user.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="px-5 pt-14 pb-4 max-w-lg mx-auto page-transition">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
      </div>

      {/* Account */}
      <Card delay={0.1} className="mb-4">
        <h3 className="text-text-primary font-semibold mb-3">Account</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Name</span>
            <span className="text-text-primary">{user.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Email</span>
            <span className="text-text-primary">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Member since</span>
            <span className="text-text-primary">{joinDate}</span>
          </div>
        </div>
      </Card>

      {/* Bank & SEPA */}
      <Card delay={0.2} className="mb-4">
        <h3 className="text-text-primary font-semibold mb-3">Banking</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-navy-800 rounded-xl">
            <Building2 className="w-5 h-5 text-accent-blue" />
            <div className="flex-1">
              <p className="text-text-primary text-sm">Bank connection</p>
              <p className="text-text-secondary text-xs">Simulated</p>
            </div>
            <div className="flex items-center gap-1 text-accent-green text-xs">
              <CheckCircle className="w-3.5 h-3.5" />
              Connected
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-navy-800 rounded-xl">
            <FileCheck2 className="w-5 h-5 text-accent-blue" />
            <div className="flex-1">
              <p className="text-text-primary text-sm">SEPA mandate</p>
              <p className="text-text-secondary text-xs">RNDUP-2026-001</p>
            </div>
            <div className="flex items-center gap-1 text-accent-green text-xs">
              <CheckCircle className="w-3.5 h-3.5" />
              Active
            </div>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card delay={0.3} className="mb-4">
        <h3 className="text-text-primary font-semibold mb-4">Notifications</h3>
        <div className="space-y-4">
          <Toggle
            label="Weekly summary"
            checked={notifSettings.weeklySummary}
            onChange={(v) => setNotifSettings((s) => ({ ...s, weeklySummary: v }))}
          />
          <Toggle
            label="Monthly progress"
            checked={notifSettings.monthlyProgress}
            onChange={(v) => setNotifSettings((s) => ({ ...s, monthlyProgress: v }))}
          />
          <Toggle
            label="Crisis alerts"
            checked={notifSettings.crisisAlerts}
            onChange={(v) => setNotifSettings((s) => ({ ...s, crisisAlerts: v }))}
          />
          <Toggle
            label="Charity updates"
            checked={notifSettings.charityUpdates}
            onChange={(v) => setNotifSettings((s) => ({ ...s, charityUpdates: v }))}
          />
        </div>
      </Card>

      {/* Referral */}
      <Card delay={0.4} className="mb-4">
        <h3 className="text-text-primary font-semibold mb-2">Referral code</h3>
        <p className="text-text-secondary text-xs mb-3">Share your code and earn bonus round ups</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-navy-800 rounded-xl px-4 py-3 text-text-primary font-mono text-sm">
            {user.referralCode}
          </div>
          <button
            onClick={copyReferral}
            className="p-3 bg-navy-800 rounded-xl text-text-secondary hover:text-accent-blue transition-colors"
          >
            <Copy className="w-5 h-5" />
          </button>
        </div>
      </Card>

      {/* Actions */}
      <div className="space-y-3 mb-4">
        <Button
          fullWidth
          variant="secondary"
          onClick={() => {
            fetch("/api/user", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ onboardingCompleted: false }),
            }).then(() => router.push("/onboarding"));
          }}
        >
          <span className="flex items-center gap-2 justify-center">
            <RefreshCw className="w-4 h-4" />
            Replay Onboarding
          </span>
        </Button>

        <Button fullWidth variant="ghost" onClick={handleLogout} className="text-accent-red">
          <span className="flex items-center gap-2 justify-center">
            <LogOut className="w-4 h-4" />
            Log Out
          </span>
        </Button>
      </div>
    </div>
  );
}
