'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Moon,
  Sun,
  Monitor,
  Copy,
  ChevronDown,
  ChevronUp,
  Landmark,
  CreditCard,
  Play,
  RotateCcw,
  FastForward,
  User,
  Zap,
  AlertTriangle,
  Pause,
  Minus,
  X,
} from 'lucide-react';
import { Card, Badge, Button, Toggle, Toast, BottomNav } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { useAppStore } from '@/store';

// ─── Types ──────────────────────────────────────────────────────────────────

interface UserSettings {
  email: string;
  name: string;
  jurisdiction: string;
  createdAt: string;
  themePreference: string;
  hapticEnabled: boolean;
  referralCode: string | null;
  userLevel: number;
  debitFrequency: string;
  onboardingCompleted: boolean;
}

interface NotificationPrefs {
  weeklySummary: boolean;
  monthlyProgress: boolean;
  milestoneCelebrations: boolean;
  charityUpdates: boolean;
  crisisAlerts: boolean;
}

type ToastState = {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
};

type CancellationView = 'hidden' | 'options' | 'confirm';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatJoinDate(dateStr: string | null): string {
  if (!dateStr) return 'Member since 2024';
  const d = new Date(dateStr);
  return `Member since ${d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
}

function jurisdictionLabel(code: string): string {
  const map: Record<string, string> = {
    FR: 'France',
    DE: 'Germany',
    BE: 'Belgium',
    LU: 'Luxembourg',
    NL: 'Netherlands',
    ES: 'Spain',
    IT: 'Italy',
    PT: 'Portugal',
    AT: 'Austria',
    IE: 'Ireland',
    CH: 'Switzerland',
    GB: 'United Kingdom',
  };
  return map[code] ?? code;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { userLevel, unreadCount } = useAppStore();

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>({
    weeklySummary: true,
    monthlyProgress: true,
    milestoneCelebrations: true,
    charityUpdates: true,
    crisisAlerts: true,
  });

  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [dataExpanded, setDataExpanded] = useState(false);
  const [cancellationView, setCancellationView] = useState<CancellationView>('hidden');
  const [resetConfirm, setResetConfirm] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [notifStyle, setNotifStyle] = useState('warm');
  const [simulateLoading, setSimulateLoading] = useState<string | null>(null);

  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'info',
    visible: false,
  });

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      setToast({ message, type, visible: true });
    },
    [],
  );

  const dismissToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  // ─── Fetch settings ─────────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/settings');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data: UserSettings = await res.json();
        setSettings(data);
        setHapticEnabled(data.hapticEnabled);

        // Load notification prefs from localStorage
        try {
          const stored = localStorage.getItem('roundup-notif-prefs');
          if (stored) {
            setNotifPrefs(JSON.parse(stored));
          }
        } catch {
          // ignore
        }
      } catch {
        showToast('Failed to load settings', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router, showToast]);

  // ─── Save helpers ───────────────────────────────────────────────────────

  async function updateSetting(body: Record<string, unknown>) {
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch {
      showToast('Failed to save setting', 'error');
    }
  }

  function saveNotifPrefs(prefs: NotificationPrefs) {
    setNotifPrefs(prefs);
    try {
      localStorage.setItem('roundup-notif-prefs', JSON.stringify(prefs));
    } catch {
      // ignore
    }
  }

  function handleThemeChange(newTheme: 'dark' | 'light' | 'system') {
    setTheme(newTheme);
    updateSetting({ themePreference: newTheme });
  }

  function handleHapticToggle(checked: boolean) {
    setHapticEnabled(checked);
    updateSetting({ hapticEnabled: checked });
    if (checked && navigator.vibrate) {
      navigator.vibrate(20);
    }
  }

  async function handleCopyReferral() {
    if (!settings?.referralCode) return;
    try {
      await navigator.clipboard.writeText(settings.referralCode);
      showToast('Referral code copied', 'success');
    } catch {
      showToast('Could not copy to clipboard', 'error');
    }
  }

  async function handleSimulate(action: string, extra?: Record<string, unknown>) {
    setSimulateLoading(action);
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Simulation failed', 'error');
        return;
      }
      if (action === 'reset') {
        showToast('All data has been reset', 'info');
        setResetConfirm(false);
      } else if (action === 'crisis') {
        showToast('Crisis event triggered', 'info');
      } else if (action === 'profile') {
        showToast(`Loaded ${extra?.profile} profile`, 'success');
        setSelectedProfile(extra?.profile as string);
      } else if (action === 'notification-style') {
        showToast(`Notification style set to ${extra?.notificationStyle}`, 'success');
        setNotifStyle(extra?.notificationStyle as string);
      } else {
        const txLabel = data.transactions === 1 ? 'transaction' : 'transactions';
        showToast(
          `Simulated ${data.transactions} ${txLabel}`,
          'success',
        );
      }
    } catch {
      showToast('Simulation failed', 'error');
    } finally {
      setSimulateLoading(null);
    }
  }

  async function handleReplayOnboarding() {
    await updateSetting({ onboardingCompleted: false });
    router.push('/onboarding');
  }

  async function handlePause() {
    showToast('Account paused for one month', 'info');
    setCancellationView('hidden');
  }

  async function handleReduce() {
    showToast('Round up frequency reduced', 'info');
    setCancellationView('hidden');
  }

  async function handleCancel() {
    showToast('Account cancelled. We hope to see you again.', 'info');
    setCancellationView('hidden');
  }

  const level = settings?.userLevel ?? userLevel;

  // ─── Loading ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg-primary">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-transparent"
          style={{
            borderTopColor: 'var(--accent-green)',
            borderRightColor: 'var(--accent-green)',
          }}
        />
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-dvh bg-bg-primary pb-28">
      <div className="mx-auto max-w-lg px-4 pt-6">
        {/* Page title */}
        <h1 className="mb-6 text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Settings
        </h1>

        <div className="flex flex-col gap-3">
          {/* ───────────────────────────────────────── Account ─── */}
          <SectionHeader>Account</SectionHeader>
          <Card>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: 'var(--bg-card-inner)' }}
                  >
                    <User size={18} style={{ color: 'var(--text-secondary)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {settings?.name ?? 'User'}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {settings?.email}
                    </p>
                  </div>
                </div>
                <Badge variant="blue">
                  {jurisdictionLabel(settings?.jurisdiction ?? 'FR')}
                </Badge>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
                {formatJoinDate(settings?.createdAt ?? null)}
              </p>
            </div>
          </Card>

          {/* ───────────────────────────────────────── Appearance ─── */}
          <SectionHeader>Appearance</SectionHeader>
          <Card>
            <div
              className="flex overflow-hidden rounded-xl border"
              style={{ borderColor: 'var(--border-primary)' }}
            >
              <ThemeOption
                icon={<Moon size={16} />}
                label="Dark"
                active={theme === 'dark'}
                onClick={() => handleThemeChange('dark')}
              />
              <ThemeOption
                icon={<Sun size={16} />}
                label="Light"
                active={theme === 'light'}
                onClick={() => handleThemeChange('light')}
              />
              <ThemeOption
                icon={<Monitor size={16} />}
                label="System"
                active={theme === 'system'}
                onClick={() => handleThemeChange('system')}
              />
            </div>
          </Card>

          {/* ───────────────────────────────────── Bank Account ─── */}
          <SectionHeader>Bank account</SectionHeader>
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Landmark size={18} style={{ color: 'var(--text-secondary)' }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Not connected
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
                    Link a bank account to start rounding up
                  </p>
                </div>
              </div>
              <Badge variant="yellow">Pending</Badge>
            </div>
            <div className="mt-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => showToast('Coming soon', 'info')}
              >
                Connect bank
              </Button>
            </div>
          </Card>

          {/* ──────────────────────────────────── SEPA Mandate ─── */}
          <SectionHeader>SEPA Direct Debit</SectionHeader>
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard size={18} style={{ color: 'var(--text-secondary)' }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Not active
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
                    Authorize automatic collection of round ups
                  </p>
                </div>
              </div>
              <Badge variant="blue">Info</Badge>
            </div>
            <div className="mt-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => showToast('Coming soon', 'info')}
              >
                Set up SEPA
              </Button>
            </div>
          </Card>

          {/* ──────────────────────────────────── Notifications ─── */}
          <SectionHeader>Notifications</SectionHeader>
          <Card>
            <div className="flex flex-col gap-4">
              <NotificationToggle
                label="Weekly summary"
                description="Recap of your round ups each week"
                checked={notifPrefs.weeklySummary}
                onChange={(c) =>
                  saveNotifPrefs({ ...notifPrefs, weeklySummary: c })
                }
              />
              <NotificationToggle
                label="Monthly progress"
                description="Monthly impact report and trends"
                checked={notifPrefs.monthlyProgress}
                onChange={(c) =>
                  saveNotifPrefs({ ...notifPrefs, monthlyProgress: c })
                }
              />
              <NotificationToggle
                label="Milestone celebrations"
                description="Get notified when you hit giving milestones"
                checked={notifPrefs.milestoneCelebrations}
                onChange={(c) =>
                  saveNotifPrefs({ ...notifPrefs, milestoneCelebrations: c })
                }
              />
              <NotificationToggle
                label="Charity updates"
                description="News from your selected charities"
                checked={notifPrefs.charityUpdates}
                onChange={(c) =>
                  saveNotifPrefs({ ...notifPrefs, charityUpdates: c })
                }
              />
              <NotificationToggle
                label="Crisis alerts"
                description="Urgent humanitarian response notifications"
                checked={notifPrefs.crisisAlerts}
                onChange={(c) =>
                  saveNotifPrefs({ ...notifPrefs, crisisAlerts: c })
                }
              />
            </div>
          </Card>

          {/* ─────────────────────────────────────────── Haptics ─── */}
          <SectionHeader>Haptics</SectionHeader>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Vibration feedback
                </p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Subtle haptic feedback on interactions
                </p>
              </div>
              <Toggle
                checked={hapticEnabled}
                onChange={handleHapticToggle}
              />
            </div>
          </Card>

          {/* ────────────────────────────────── Referral (L4+) ─── */}
          {level >= 4 && settings?.referralCode && (
            <>
              <SectionHeader>Invite friends</SectionHeader>
              <Card>
                <p className="mb-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Share your referral code with friends
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 rounded-xl px-3 py-2.5 font-mono text-sm"
                    style={{
                      backgroundColor: 'var(--bg-card-inner)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-primary)',
                    }}
                  >
                    {settings.referralCode}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopyReferral}
                  >
                    <Copy size={16} />
                    Copy
                  </Button>
                </div>
              </Card>
            </>
          )}

          {/* ─────────────────────────────────────── Demo Mode ─── */}
          <div
            className="mt-2 border-t pt-2"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <SectionHeader>Demo Mode</SectionHeader>
          </div>

          <Card>
            <p
              className="mb-3 text-xs font-medium uppercase tracking-wider"
              style={{ color: 'var(--text-dim)' }}
            >
              Simulation Controls
            </p>

            {/* Simulate buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="bg-accent-blue text-[#121212] font-semibold hover:brightness-110"
                loading={simulateLoading === 'day'}
                onClick={() => handleSimulate('day')}
              >
                <Play size={14} />
                Simulate a Day
              </Button>
              <Button
                size="sm"
                className="bg-accent-green text-[#121212] font-semibold hover:brightness-110"
                loading={simulateLoading === 'week'}
                onClick={() => handleSimulate('week')}
              >
                <Play size={14} />
                Simulate a Week
              </Button>
              <Button
                size="sm"
                className="bg-accent-purple text-[#121212] font-semibold hover:brightness-110"
                loading={simulateLoading === 'month'}
                onClick={() => handleSimulate('month')}
              >
                <Play size={14} />
                Simulate a Month
              </Button>
            </div>

            {/* Reset & Year End */}
            <div className="mt-3 flex flex-wrap gap-2">
              {!resetConfirm ? (
                <Button
                  variant="secondary"
                  size="sm"
                  className="border-accent-red/40 text-accent-red hover:bg-accent-red/10"
                  onClick={() => setResetConfirm(true)}
                >
                  <RotateCcw size={14} />
                  Reset Data
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    loading={simulateLoading === 'reset'}
                    onClick={() => handleSimulate('reset')}
                  >
                    Confirm Reset
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setResetConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
              <Button
                variant="secondary"
                size="sm"
                className="border-accent-yellow/40 text-accent-yellow hover:bg-accent-yellow/10"
                loading={simulateLoading === 'year-end'}
                onClick={() => handleSimulate('year-end')}
              >
                <FastForward size={14} />
                Jump to Year End
              </Button>
            </div>
          </Card>

          {/* Demo Profiles */}
          <Card>
            <p
              className="mb-3 text-xs font-medium uppercase tracking-wider"
              style={{ color: 'var(--text-dim)' }}
            >
              Demo Profiles
            </p>
            <div className="grid grid-cols-3 gap-2">
              <ProfileCard
                name="Sophie"
                description="Casual giver, 120 days"
                selected={selectedProfile === 'sophie'}
                loading={simulateLoading === 'profile-sophie'}
                onClick={() =>
                  handleSimulate('profile', { profile: 'sophie' })
                }
              />
              <ProfileCard
                name="Thomas"
                description="Active donor, 45 days"
                selected={selectedProfile === 'thomas'}
                loading={simulateLoading === 'profile-thomas'}
                onClick={() =>
                  handleSimulate('profile', { profile: 'thomas' })
                }
              />
              <ProfileCard
                name="Marie"
                description="Power user, 300 days"
                selected={selectedProfile === 'marie'}
                loading={simulateLoading === 'profile-marie'}
                onClick={() =>
                  handleSimulate('profile', { profile: 'marie' })
                }
              />
            </div>
          </Card>

          {/* Notification Style */}
          <Card>
            <p
              className="mb-3 text-xs font-medium uppercase tracking-wider"
              style={{ color: 'var(--text-dim)' }}
            >
              Notification Style
            </p>
            <div className="flex gap-2">
              {(['factual', 'warm', 'motivational'] as const).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() =>
                    handleSimulate('notification-style', {
                      notificationStyle: style,
                    })
                  }
                  className="min-h-[44px] min-w-[44px] flex-1 rounded-xl px-3 py-2 text-xs font-medium capitalize transition-all duration-200"
                  style={{
                    backgroundColor:
                      notifStyle === style
                        ? 'var(--accent-blue)'
                        : 'var(--bg-card-inner)',
                    color:
                      notifStyle === style
                        ? '#121212'
                        : 'var(--text-secondary)',
                    border: `1px solid ${
                      notifStyle === style
                        ? 'var(--accent-blue)'
                        : 'var(--border-primary)'
                    }`,
                  }}
                >
                  {style}
                </button>
              ))}
            </div>
          </Card>

          {/* Crisis trigger */}
          <Card>
            <Button
              variant="secondary"
              size="sm"
              className="w-full border-accent-red/40 text-accent-red hover:bg-accent-red/10"
              loading={simulateLoading === 'crisis'}
              onClick={() => handleSimulate('crisis')}
            >
              <AlertTriangle size={14} />
              Trigger Crisis Event
            </Button>
          </Card>

          {/* ──────────────────────────── Replay Onboarding ─── */}
          <SectionHeader>Onboarding</SectionHeader>
          <Card>
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={handleReplayOnboarding}
            >
              <RotateCcw size={14} />
              Replay onboarding
            </Button>
          </Card>

          {/* ─────────────────────────── Data Transparency ─── */}
          <SectionHeader>Your data</SectionHeader>
          <Card>
            <button
              type="button"
              className="flex min-h-[44px] w-full items-center justify-between"
              onClick={() => setDataExpanded(!dataExpanded)}
            >
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                What data we store
              </span>
              {dataExpanded ? (
                <ChevronUp size={18} style={{ color: 'var(--text-dim)' }} />
              ) : (
                <ChevronDown size={18} style={{ color: 'var(--text-dim)' }} />
              )}
            </button>
            {dataExpanded && (
              <div
                className="mt-3 rounded-xl p-3 text-xs leading-relaxed"
                style={{
                  backgroundColor: 'var(--bg-card-inner)',
                  color: 'var(--text-secondary)',
                }}
              >
                <p className="mb-2">
                  We believe in complete transparency. Here is exactly what we store:
                </p>
                <ul className="flex flex-col gap-1.5 pl-4" style={{ listStyleType: 'disc' }}>
                  <li>
                    <strong style={{ color: 'var(--text-primary)' }}>Email address</strong>{' '}
                    for account login and communication
                  </li>
                  <li>
                    <strong style={{ color: 'var(--text-primary)' }}>Full name</strong>{' '}
                    for tax receipts and personalization
                  </li>
                  <li>
                    <strong style={{ color: 'var(--text-primary)' }}>Jurisdiction</strong>{' '}
                    to calculate your tax deductions correctly
                  </li>
                  <li>
                    <strong style={{ color: 'var(--text-primary)' }}>Transaction data</strong>{' '}
                    (anonymized) to compute round ups only
                  </li>
                  <li>
                    <strong style={{ color: 'var(--text-primary)' }}>Charity preferences</strong>{' '}
                    so we know where to direct your donations
                  </li>
                </ul>
                <p className="mt-3" style={{ color: 'var(--text-dim)' }}>
                  We never sell your data. We never share it with third parties for marketing.
                  Your financial data is encrypted at rest and in transit.
                </p>
              </div>
            )}
          </Card>

          {/* ──────────────────────────── Cancellation Flow ─── */}
          <SectionHeader>Account</SectionHeader>
          <Card>
            {cancellationView === 'hidden' && (
              <button
                type="button"
                className="min-h-[44px] text-sm"
                style={{ color: 'var(--text-dim)' }}
                onClick={() => setCancellationView('options')}
              >
                Pause or cancel
              </button>
            )}

            {cancellationView === 'options' && (
              <div className="flex flex-col gap-3">
                {/* Impact summary */}
                <div
                  className="rounded-xl p-3 text-xs leading-relaxed"
                  style={{
                    backgroundColor: 'var(--bg-card-inner)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <p>
                    Since you joined, your spare change has helped fund meals, school
                    supplies, and emergency aid through your chosen charities. Every
                    cent has made a difference.
                  </p>
                </div>

                {/* 3 option cards */}
                <button
                  type="button"
                  className="flex min-h-[44px] items-center gap-3 rounded-xl p-3 text-left transition-all duration-150 hover:brightness-110"
                  style={{
                    backgroundColor: 'var(--bg-card-inner)',
                    border: '1px solid var(--border-primary)',
                  }}
                  onClick={handlePause}
                >
                  <Pause size={18} style={{ color: 'var(--accent-yellow)' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Pause for 1 month
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
                      Take a break. Your charities and preferences are saved.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  className="flex min-h-[44px] items-center gap-3 rounded-xl p-3 text-left transition-all duration-150 hover:brightness-110"
                  style={{
                    backgroundColor: 'var(--bg-card-inner)',
                    border: '1px solid var(--border-primary)',
                  }}
                  onClick={handleReduce}
                >
                  <Minus size={18} style={{ color: 'var(--accent-blue)' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Reduce round ups
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
                      Switch to bi weekly or monthly collections instead.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  className="flex min-h-[44px] items-center gap-3 rounded-xl p-3 text-left transition-all duration-150 hover:brightness-110"
                  style={{
                    backgroundColor: 'var(--bg-card-inner)',
                    border: '1px solid var(--border-primary)',
                  }}
                  onClick={() => setCancellationView('confirm')}
                >
                  <X size={18} style={{ color: 'var(--accent-red)' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Cancel account
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
                      Delete your account and all data permanently.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  className="mt-1 min-h-[44px] text-xs"
                  style={{ color: 'var(--text-dim)' }}
                  onClick={() => setCancellationView('hidden')}
                >
                  Never mind, go back
                </button>
              </div>
            )}

            {cancellationView === 'confirm' && (
              <div className="flex flex-col gap-3">
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  Are you sure you want to cancel your account?
                </p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  This will permanently delete all your data, charity preferences,
                  and donation history. This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleCancel}
                  >
                    Yes, cancel my account
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCancellationView('options')}
                  >
                    Go back
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onDismiss={dismissToast}
      />

      {/* Bottom Nav */}
      <BottomNav level={level} unreadCount={unreadCount} currentPath="/settings" />
    </div>
  );
}

// ─── Subcomponents ──────────────────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="px-1 text-xs font-medium uppercase tracking-wider"
      style={{ color: 'var(--text-dim)' }}
    >
      {children}
    </h2>
  );
}

function ThemeOption({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[44px] flex-1 items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium transition-all duration-200"
      style={{
        backgroundColor: active ? 'var(--accent-blue)' : 'transparent',
        color: active ? '#121212' : 'var(--text-secondary)',
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function NotificationToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex-1">
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {label}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function ProfileCard({
  name,
  description,
  selected,
  loading,
  onClick,
}: {
  name: string;
  description: string;
  selected: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex min-h-[44px] flex-col items-center justify-center rounded-xl p-3 text-center transition-all duration-200"
      style={{
        backgroundColor: selected ? 'var(--accent-blue)' : 'var(--bg-card-inner)',
        color: selected ? '#121212' : 'var(--text-primary)',
        border: `1px solid ${selected ? 'var(--accent-blue)' : 'var(--border-primary)'}`,
        opacity: loading ? 0.6 : 1,
      }}
    >
      <span className="text-sm font-medium">{name}</span>
      <span
        className="mt-0.5 text-[10px] leading-tight"
        style={{
          color: selected ? 'rgba(18,18,18,0.7)' : 'var(--text-dim)',
        }}
      >
        {description}
      </span>
    </button>
  );
}
