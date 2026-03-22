'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, ChevronDown, ChevronUp, TrendingUp, Globe, Info } from 'lucide-react';
import { Card, Badge, AnimatedNumber, BottomNav, Button } from '@/components/ui';
import { useAppStore } from '@/store';

// ─── Types ──────────────────────────────────────────────────────────────────

interface TaxData {
  jurisdiction: string;
  jurisdictionName: string;
  incomeBracket: number;
  totalDonated: number;
  standardDonations: number;
  enhancedDonations: number;
  taxSaving: number;
  ceiling: number | null;
  ceilingUsed: number;
  ceilingRemaining: number | null;
  ceilingPct: number;
  projection: { totalDonations: number; taxSaving: number; monthsRemaining: number };
  breakdown: { rate: number; label: string; amount: number; deduction: number }[];
  currencySymbol: string;
}

interface SessionData {
  isLoggedIn: boolean;
  userId?: string;
  name?: string;
  userLevel?: number;
  jurisdiction?: string;
  incomeBracket?: number;
}

// ─── Jurisdiction config ────────────────────────────────────────────────────

const JURISDICTIONS = [
  { code: 'FR', label: 'France', flag: 'FR' },
  { code: 'UK', label: 'UK', flag: 'GB' },
  { code: 'DE', label: 'Germany', flag: 'DE' },
  { code: 'BE', label: 'Belgium', flag: 'BE' },
  { code: 'ES', label: 'Spain', flag: 'ES' },
];

const BRACKETS: Record<string, { label: string; brackets: string[] }> = {
  FR: { label: 'Income bracket', brackets: ['< \u20ac25k', '\u20ac25k\u201350k', '\u20ac50k\u2013100k', '> \u20ac100k'] },
  UK: { label: 'Tax band', brackets: ['Basic rate', 'Higher rate', 'Additional rate', 'Additional rate'] },
  DE: { label: 'Einkommensstufe', brackets: ['< \u20ac25k', '\u20ac25k\u201350k', '\u20ac50k\u2013100k', '> \u20ac100k'] },
  BE: { label: 'Inkomensniveau', brackets: ['< \u20ac25k', '\u20ac25k\u201350k', '\u20ac50k\u2013100k', '> \u20ac100k'] },
  ES: { label: 'Tramo de renta', brackets: ['< \u20ac25k', '\u20ac25k\u201350k', '\u20ac50k\u2013100k', '> \u20ac100k'] },
};

const DOC_NAMES: Record<string, { summary: string; calculation: string; receipt: string }> = {
  FR: { summary: 'R\u00e9capitulatif annuel', calculation: 'Calcul fiscal (Cerfa)', receipt: 'Re\u00e7u par organisme' },
  UK: { summary: 'Annual Summary', calculation: 'Gift Aid Calculation', receipt: 'Gift Aid Declaration' },
  DE: { summary: 'Jahres\u00fcbersicht', calculation: 'Sonderausgaben Berechnung', receipt: 'Zuwendungsbest\u00e4tigung' },
  BE: { summary: 'R\u00e9capitulatif annuel', calculation: 'Calcul de la r\u00e9duction', receipt: 'Attestation fiscale' },
  ES: { summary: 'Resumen anual', calculation: 'C\u00e1lculo de deducci\u00f3n', receipt: 'Certificado de donaciones' },
};

const DOC_DESCRIPTIONS: Record<string, { summary: string; calculation: string; receipt: string }> = {
  FR: {
    summary: 'Toutes vos donations par mois et par organisme',
    calculation: 'D\u00e9tail du calcul de votre r\u00e9duction d\u2019imp\u00f4t',
    receipt: 'Re\u00e7us fiscaux pour chaque organisme',
  },
  UK: {
    summary: 'All your donations by month and charity',
    calculation: 'Detailed Gift Aid tax relief breakdown',
    receipt: 'Individual Gift Aid declarations per charity',
  },
  DE: {
    summary: 'Alle Spenden nach Monat und Organisation',
    calculation: 'Detaillierte Sonderausgaben Berechnung',
    receipt: 'Zuwendungsbest\u00e4tigungen pro Organisation',
  },
  BE: {
    summary: 'Tous vos dons par mois et par organisme',
    calculation: 'D\u00e9tail du calcul de votre r\u00e9duction',
    receipt: 'Attestations fiscales par organisme',
  },
  ES: {
    summary: 'Todas sus donaciones por mes y organizaci\u00f3n',
    calculation: 'Detalle del c\u00e1lculo de la deducci\u00f3n',
    receipt: 'Certificados de donaci\u00f3n por entidad',
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtCurrency(amount: number, symbol: string): string {
  const formatted = amount.toFixed(2);
  return symbol === '\u00a3' ? `${symbol}${formatted}` : `\u20ac${formatted}`;
}

function fmtCurrencyShort(amount: number, symbol: string): string {
  if (amount >= 1000) {
    return symbol === '\u00a3' ? `${symbol}${(amount / 1000).toFixed(1)}k` : `${(amount / 1000).toFixed(1)}k\u20ac`;
  }
  const formatted = amount.toFixed(0);
  return symbol === '\u00a3' ? `${symbol}${formatted}` : `\u20ac${formatted}`;
}

// ─── Circular Progress Component ────────────────────────────────────────────

function CircularProgress({
  percent,
  used,
  total,
  noCap,
  currencySymbol,
}: {
  percent: number;
  used: number;
  total: number | null;
  noCap: boolean;
  currencySymbol: string;
}) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(percent, 100) / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 148, height: 148 }}>
        <svg
          width="148"
          height="148"
          viewBox="0 0 148 148"
          className="-rotate-90"
        >
          {/* Track */}
          <circle
            cx="74"
            cy="74"
            r={radius}
            fill="none"
            stroke="var(--progress-track)"
            strokeWidth="10"
          />
          {/* Progress */}
          {!noCap && (
            <circle
              cx="74"
              cy="74"
              r={radius}
              fill="none"
              stroke="var(--accent-blue)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
              style={{
                filter: 'drop-shadow(0 0 6px var(--accent-blue))',
              }}
            />
          )}
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {noCap ? (
            <>
              <span className="text-sm font-bold" style={{ color: 'var(--accent-blue)' }}>
                No ceiling
              </span>
              <span className="mt-0.5 text-[10px] text-text-dim">
                Unlimited relief
              </span>
            </>
          ) : (
            <>
              <span
                className="text-lg font-bold tabular-nums"
                style={{ color: 'var(--accent-blue)' }}
              >
                {percent}%
              </span>
              <span className="mt-0.5 text-center text-[10px] leading-tight text-text-dim">
                {fmtCurrencyShort(used, currencySymbol)} of {fmtCurrencyShort(total ?? 0, currencySymbol)}
                <br />ceiling used
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Breakdown Card ─────────────────────────────────────────────────────────

function BreakdownCard({
  label,
  amount,
  deduction,
  rate,
  maxDeduction,
  currencySymbol,
}: {
  label: string;
  amount: number;
  deduction: number;
  rate: number;
  maxDeduction: number;
  currencySymbol: string;
}) {
  const progress = maxDeduction > 0 ? Math.min(100, (deduction / maxDeduction) * 100) : 0;

  return (
    <Card>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary">{label}</span>
        <Badge variant="blue">{rate}%</Badge>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <div>
          <p className="text-xs text-text-dim">Qualifying amount</p>
          <p className="text-sm font-semibold text-text-primary">
            {fmtCurrency(amount, currencySymbol)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-text-dim">Deduction</p>
          <p className="text-sm font-bold" style={{ color: 'var(--accent-blue)' }}>
            {fmtCurrency(deduction, currencySymbol)}
          </p>
        </div>
      </div>
      <div className="mt-3">
        <div
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label} deduction progress`}
          className="h-2 w-full overflow-hidden rounded-full"
          style={{ backgroundColor: 'var(--progress-track)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progress}%`,
              backgroundColor: 'var(--accent-blue)',
              boxShadow: '0 0 8px var(--accent-blue)',
            }}
          />
        </div>
      </div>
    </Card>
  );
}

// ─── PDF Document Card ──────────────────────────────────────────────────────

function PdfCard({
  title,
  description,
  type,
  downloading,
  onDownload,
}: {
  title: string;
  description: string;
  type: string;
  downloading: string | null;
  onDownload: (type: string) => void;
}) {
  const isDownloading = downloading === type;

  return (
    <Card>
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: 'var(--accent-blue)', opacity: 0.15 }}
        >
          <FileText size={18} style={{ color: 'var(--accent-blue)' }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text-primary">{title}</p>
          <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
        </div>
        <button
          onClick={() => onDownload(type)}
          disabled={isDownloading}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl transition-all duration-150"
          style={{
            backgroundColor: isDownloading ? 'var(--bg-card-inner)' : 'var(--accent-blue)',
            color: isDownloading ? 'var(--text-dim)' : '#ffffff',
            opacity: isDownloading ? 0.6 : 1,
          }}
          aria-label={`Download ${title}`}
        >
          {isDownloading ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <Download size={18} />
          )}
        </button>
      </div>
    </Card>
  );
}

// ─── Tax Dashboard Page ─────────────────────────────────────────────────────

export default function TaxDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [data, setData] = useState<TaxData | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileExpanded, setProfileExpanded] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Editable profile state
  const [editJurisdiction, setEditJurisdiction] = useState('FR');
  const [editBracket, setEditBracket] = useState(0);

  const { unreadCount, setUser } = useAppStore();

  // ── Fetch data ──────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [sessionRes, taxRes] = await Promise.all([
          fetch('/api/auth/session'),
          fetch('/api/tax'),
        ]);

        if (!sessionRes.ok || !taxRes.ok) {
          if (!cancelled) router.push('/login');
          return;
        }

        const sessionData: SessionData = await sessionRes.json();
        const taxData: TaxData = await taxRes.json();

        if (!sessionData.isLoggedIn) {
          if (!cancelled) router.push('/login');
          return;
        }

        // Gate: Level 2+
        if ((sessionData.userLevel ?? 1) < 2) {
          if (!cancelled) router.push('/dashboard');
          return;
        }

        if (!cancelled) {
          setSession(sessionData);
          setData(taxData);
          setEditJurisdiction(taxData.jurisdiction);
          setEditBracket(taxData.incomeBracket);
          setUser({
            id: sessionData.userId!,
            name: sessionData.name!,
            level: sessionData.userLevel ?? 1,
            jurisdiction: sessionData.jurisdiction ?? 'FR',
            incomeBracket: sessionData.incomeBracket ?? 0,
          });
          setLoading(false);
        }
      } catch {
        if (!cancelled) router.push('/login');
      }
    }

    load();
    return () => { cancelled = true; };
  }, [router, setUser]);

  // ── Auto-expand profile editor when bracket is 0 ───────────────────────

  useEffect(() => {
    if (data && data.incomeBracket === 0 && !profileExpanded) {
      // Show the prompt, but don't auto-expand
    }
  }, [data, profileExpanded]);

  // ── Save profile ──────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/tax', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incomeBracket: editBracket,
          jurisdiction: editJurisdiction,
        }),
      });

      if (res.ok) {
        // Refetch tax data
        const taxRes = await fetch('/api/tax');
        if (taxRes.ok) {
          const taxData: TaxData = await taxRes.json();
          setData(taxData);
          setEditJurisdiction(taxData.jurisdiction);
          setEditBracket(taxData.incomeBracket);
        }
      }
    } catch {
      // Silently fail
    } finally {
      setSaving(false);
    }
  }, [editBracket, editJurisdiction]);

  // ── Download PDF ──────────────────────────────────────────────────────

  const handleDownload = useCallback(async (type: string) => {
    setDownloading(type);
    try {
      const res = await fetch(`/api/tax/pdf?type=${type}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `roundup-${type}-${new Date().getFullYear()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch {
      // Silently fail
    } finally {
      setDownloading(null);
    }
  }, []);

  // ── Derived ──────────────────────────────────────────────────────────

  const level = session?.userLevel ?? 2;
  const noCap = data?.ceiling === null;
  const brackets = BRACKETS[editJurisdiction] ?? BRACKETS.FR;
  const docNames = DOC_NAMES[data?.jurisdiction ?? 'FR'] ?? DOC_NAMES.FR;
  const docDescs = DOC_DESCRIPTIONS[data?.jurisdiction ?? 'FR'] ?? DOC_DESCRIPTIONS.FR;
  const showFirstVisitPrompt = data?.incomeBracket === 0 && !profileExpanded;

  // ── Loading skeleton ─────────────────────────────────────────────────

  if (loading || !session || !data) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <div className="mx-auto max-w-[480px] px-4 pt-safe-top">
          <div className="safe-top pb-24 pt-6">
            <div className="space-y-3">
              <div className="h-8 w-40 animate-pulse rounded-lg bg-bg-card" />
              <div className="h-14 animate-pulse rounded-2xl bg-bg-card" />
              <div className="h-48 animate-pulse rounded-2xl bg-bg-card" />
              <div className="h-28 animate-pulse rounded-2xl bg-bg-card" />
              <div className="h-28 animate-pulse rounded-2xl bg-bg-card" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const cSymbol = data.currencySymbol;
  const maxDeduction = data.breakdown.length > 0
    ? Math.max(...data.breakdown.map((b) => b.deduction))
    : 1;

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="mx-auto max-w-[480px] px-4">
        <div className="safe-top pb-24 pt-6">
          <div className="flex flex-col gap-3">

            {/* ─── Page title + jurisdiction badge ─────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between"
            >
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                Tax Savings
              </h1>
              <Badge variant="blue">
                <Globe size={12} className="mr-1" />
                {data.jurisdictionName}
              </Badge>
            </motion.div>

            {/* ─── Estimated tax saving ─────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              <Card className="relative overflow-hidden">
                <p className="text-xs font-medium uppercase tracking-wider text-text-dim">
                  Estimated tax saving
                </p>
                <div className="mt-2">
                  <AnimatedNumber
                    value={data.taxSaving}
                    prefix={cSymbol}
                    decimals={2}
                    duration={1000}
                    className="text-4xl font-bold tracking-tight text-accent-blue"
                  />
                </div>
                <p className="mt-1 text-sm text-text-secondary">
                  On {fmtCurrency(data.totalDonated, cSymbol)} contributed this year
                </p>
                {/* Blue decorative glow */}
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-3xl"
                  style={{ backgroundColor: 'var(--accent-blue)' }}
                />
              </Card>
            </motion.div>

            {/* ─── First visit prompt ──────────────────────────────── */}
            {showFirstVisitPrompt && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Card
                  onClick={() => setProfileExpanded(true)}
                  className="border-accent-blue/20"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: 'var(--accent-blue)', opacity: 0.15 }}
                    >
                      <Info size={18} style={{ color: 'var(--accent-blue)' }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        Set your income bracket
                      </p>
                      <p className="mt-0.5 text-xs text-text-secondary">
                        We can show you more accurate tax savings when we know your approximate income range. Tap to set it up.
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ─── Circular progress indicator ─────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card>
                <p className="mb-4 text-xs font-medium uppercase tracking-wider text-text-dim">
                  Tax ceiling usage
                </p>
                <CircularProgress
                  percent={data.ceilingPct}
                  used={data.ceilingUsed}
                  total={data.ceiling}
                  noCap={noCap}
                  currencySymbol={cSymbol}
                />
                {!noCap && data.ceilingRemaining !== null && data.ceilingRemaining > 0 && (
                  <div
                    className="mt-4 rounded-xl p-3 text-center"
                    style={{ backgroundColor: 'var(--bg-card-inner)' }}
                  >
                    <p className="text-xs text-text-secondary">
                      Room to give{' '}
                      <span className="font-semibold" style={{ color: 'var(--accent-blue)' }}>
                        {fmtCurrency(data.ceilingRemaining, cSymbol)}
                      </span>
                      {' '}more this year
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* ─── Breakdown cards by rate ──────────────────────────── */}
            {data.breakdown.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="flex flex-col gap-2"
              >
                <p className="text-xs font-medium uppercase tracking-wider text-text-dim">
                  Deduction breakdown
                </p>
                {data.breakdown.map((b) => (
                  <BreakdownCard
                    key={`${b.rate}-${b.label}`}
                    label={b.label}
                    amount={b.amount}
                    deduction={b.deduction}
                    rate={b.rate}
                    maxDeduction={maxDeduction}
                    currencySymbol={cSymbol}
                  />
                ))}
              </motion.div>
            )}

            {/* ─── Year-end projection ──────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card className="relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} style={{ color: 'var(--accent-blue)' }} />
                  <p className="text-xs font-medium uppercase tracking-wider text-text-dim">
                    By December
                  </p>
                </div>
                <div className="mt-3 flex items-baseline gap-6">
                  <div>
                    <p className="text-xs text-text-dim">Projected contributions</p>
                    <p className="text-lg font-bold text-text-primary">
                      {fmtCurrency(data.projection.totalDonations, cSymbol)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-dim">Projected saving</p>
                    <p className="text-lg font-bold" style={{ color: 'var(--accent-blue)' }}>
                      {fmtCurrency(data.projection.taxSaving, cSymbol)}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-text-dim">
                  Based on your current pace ({data.projection.monthsRemaining} months remaining)
                </p>
                {!noCap && data.ceilingRemaining !== null && data.ceilingRemaining > 0 && (
                  <div
                    className="mt-3 rounded-lg p-2.5"
                    style={{ backgroundColor: 'var(--bg-card-inner)' }}
                  >
                    <p className="text-xs text-text-secondary">
                      You still have room to give more before reaching your tax ceiling.
                    </p>
                  </div>
                )}
                {/* Decorative */}
                <div
                  className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 rounded-full opacity-10 blur-2xl"
                  style={{ backgroundColor: 'var(--accent-blue)' }}
                />
              </Card>
            </motion.div>

            {/* ─── Tax documents ────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="flex flex-col gap-2"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-text-dim">
                Your tax documents
              </p>
              <PdfCard
                title={docNames.summary}
                description={docDescs.summary}
                type="summary"
                downloading={downloading}
                onDownload={handleDownload}
              />
              <PdfCard
                title={docNames.calculation}
                description={docDescs.calculation}
                type="calculation"
                downloading={downloading}
                onDownload={handleDownload}
              />
              <PdfCard
                title={docNames.receipt}
                description={docDescs.receipt}
                type="receipt"
                downloading={downloading}
                onDownload={handleDownload}
              />
            </motion.div>

            {/* ─── Tax profile editor ──────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card>
                <button
                  onClick={() => setProfileExpanded((p) => !p)}
                  className="flex w-full items-center justify-between text-left"
                  style={{ minHeight: 44 }}
                >
                  <p className="text-xs font-medium uppercase tracking-wider text-text-dim">
                    Your tax profile
                  </p>
                  {profileExpanded ? (
                    <ChevronUp size={16} className="text-text-dim" />
                  ) : (
                    <ChevronDown size={16} className="text-text-dim" />
                  )}
                </button>

                <AnimatePresence>
                  {profileExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 flex flex-col gap-4">

                        {/* Jurisdiction pills */}
                        <div>
                          <p className="mb-2 text-xs font-medium text-text-secondary">
                            Jurisdiction
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {JURISDICTIONS.map((j) => (
                              <button
                                key={j.code}
                                onClick={() => setEditJurisdiction(j.code)}
                                className="rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150"
                                style={{
                                  minHeight: 44,
                                  minWidth: 44,
                                  backgroundColor: editJurisdiction === j.code
                                    ? 'var(--accent-blue)'
                                    : 'var(--bg-card-inner)',
                                  color: editJurisdiction === j.code
                                    ? '#ffffff'
                                    : 'var(--text-secondary)',
                                }}
                              >
                                {j.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Income bracket segmented control */}
                        <div>
                          <p className="mb-2 text-xs font-medium text-text-secondary">
                            {brackets.label}
                          </p>
                          <div
                            className="flex overflow-hidden rounded-xl border border-border-primary"
                            style={{ backgroundColor: 'var(--bg-card-inner)' }}
                          >
                            {brackets.brackets.map((label, i) => (
                              <button
                                key={i}
                                onClick={() => setEditBracket(i)}
                                className="flex-1 px-1 py-2.5 text-center text-[11px] font-medium transition-all duration-150"
                                style={{
                                  minHeight: 44,
                                  backgroundColor: editBracket === i
                                    ? 'var(--accent-blue)'
                                    : 'transparent',
                                  color: editBracket === i
                                    ? '#ffffff'
                                    : 'var(--text-secondary)',
                                }}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Update button */}
                        <Button
                          onClick={handleSave}
                          loading={saving}
                          variant="primary"
                          size="md"
                          className="w-full"
                          style={{
                            backgroundColor: 'var(--accent-blue)',
                            color: '#ffffff',
                          }}
                        >
                          Update tax profile
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>

          </div>
        </div>
      </div>

      {/* ─── Bottom Navigation ─────────────────────────────────────── */}
      <BottomNav level={level} unreadCount={unreadCount} currentPath="/tax" />
    </div>
  );
}
