'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

/* ─── Types ──────────────────────────────────────────────────────────────────── */

interface Charity {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  countryCode: string;
  brandColor: string;
}

interface SessionData {
  isLoggedIn: boolean;
  jurisdiction?: string;
  onboardingCompleted?: boolean;
  onboardingStepReached?: number;
}

/* ─── Country config ─────────────────────────────────────────────────────────── */

const COUNTRIES = [
  { code: 'FR', name: 'France', flag: '\u{1F1EB}\u{1F1F7}' },
  { code: 'GB', name: 'United Kingdom', flag: '\u{1F1EC}\u{1F1E7}' },
  { code: 'DE', name: 'Germany', flag: '\u{1F1E9}\u{1F1EA}' },
  { code: 'BE', name: 'Belgium', flag: '\u{1F1E7}\u{1F1EA}' },
  { code: 'ES', name: 'Spain', flag: '\u{1F1EA}\u{1F1F8}' },
];

const COUNTRY_NAMES: Record<string, string> = {
  FR: 'France',
  GB: 'United Kingdom',
  DE: 'Germany',
  BE: 'Belgium',
  ES: 'Spain',
};

/* ─── Timezone to country mapping ────────────────────────────────────────────── */

function detectCountry(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.startsWith('Europe/Paris') || tz.startsWith('Europe/Lyon')) return 'FR';
    if (tz.startsWith('Europe/London')) return 'GB';
    if (tz.startsWith('Europe/Berlin') || tz.startsWith('Europe/Munich')) return 'DE';
    if (tz.startsWith('Europe/Brussels')) return 'BE';
    if (tz.startsWith('Europe/Madrid') || tz.startsWith('Europe/Barcelona')) return 'ES';

    // Fallback: check navigator.language
    const lang = navigator.language?.toLowerCase() || '';
    if (lang.startsWith('fr')) return 'FR';
    if (lang.startsWith('en-gb')) return 'GB';
    if (lang.startsWith('de')) return 'DE';
    if (lang.startsWith('nl-be') || lang.startsWith('fr-be')) return 'BE';
    if (lang.startsWith('es')) return 'ES';
  } catch {
    // ignore
  }
  return 'FR';
}

/* ─── Slide animation variants ───────────────────────────────────────────────── */

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

/* ═══════════════════════════════════════════════════════════════════════════════
   Main Onboarding Component
   ═══════════════════════════════════════════════════════════════════════════════ */

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCharities, setSelectedCharities] = useState<string[]>([]);
  const [localCharities, setLocalCharities] = useState<Charity[]>([]);
  const [intlCharities, setIntlCharities] = useState<Charity[]>([]);
  const [loadingCharities, setLoadingCharities] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  /* ─── Load session and resume from saved step ──────────────────────────────── */

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch('/api/auth/session');
        const data: SessionData = await res.json();

        if (!data.isLoggedIn) {
          window.location.href = '/login';
          return;
        }

        if (data.onboardingCompleted) {
          window.location.href = '/dashboard';
          return;
        }

        // Resume from saved step
        const savedStep = data.onboardingStepReached ?? 0;
        if (savedStep >= 1 && savedStep < 4) {
          setStep(savedStep + 1);
        }

        // Pre-select jurisdiction if known
        if (data.jurisdiction) {
          setSelectedCountry(data.jurisdiction);
        }
      } catch {
        // If session fails, stay on step 1
      } finally {
        setSessionLoaded(true);
      }
    }

    loadSession();
  }, []);

  /* ─── Auto-detect country on step 2 ───────────────────────────────────────── */

  useEffect(() => {
    if (step === 2 && !selectedCountry) {
      setSelectedCountry(detectCountry());
    }
  }, [step, selectedCountry]);

  /* ─── Fetch charities when entering step 3 ─────────────────────────────────── */

  useEffect(() => {
    if (step === 3 && selectedCountry) {
      setLoadingCharities(true);
      fetch(`/api/charities?country=${selectedCountry}`)
        .then((res) => res.json())
        .then((data) => {
          setLocalCharities(data.local || []);
          setIntlCharities(data.international || []);
        })
        .catch(() => {
          // Charities will show empty
        })
        .finally(() => setLoadingCharities(false));
    }
  }, [step, selectedCountry]);

  /* ─── Step navigation ──────────────────────────────────────────────────────── */

  const goForward = useCallback(
    async (nextStep: number) => {
      setDirection(1);
      setStep(nextStep);
    },
    []
  );

  /* ─── API helpers ──────────────────────────────────────────────────────────── */

  async function saveCountry() {
    setSaving(true);
    try {
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'country', country: selectedCountry }),
      });
      goForward(3);
    } catch {
      // Allow progression even if save fails
      goForward(3);
    } finally {
      setSaving(false);
    }
  }

  async function saveCharities() {
    setSaving(true);
    try {
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'charities', charityIds: selectedCharities }),
      });
      goForward(4);
    } catch {
      goForward(4);
    } finally {
      setSaving(false);
    }
  }

  async function completeOnboarding() {
    setSaving(true);
    try {
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'complete' }),
      });
      window.location.href = '/dashboard';
    } catch {
      window.location.href = '/dashboard';
    }
  }

  /* ─── Charity toggle ───────────────────────────────────────────────────────── */

  function toggleCharity(id: string) {
    setSelectedCharities((prev) => {
      if (prev.includes(id)) return prev.filter((c) => c !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  /* ─── Don't render until session is loaded ─────────────────────────────────── */

  if (!sessionLoaded) {
    return (
      <div
        className="flex min-h-dvh items-center justify-center"
        style={{ background: 'var(--bg-primary)' }}
      >
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'var(--accent-green)', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  /* ─── Render ───────────────────────────────────────────────────────────────── */

  return (
    <div
      className="relative flex min-h-dvh flex-col"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Progress dots */}
      <ProgressDots current={step} total={4} />

      {/* Step content */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex flex-1 flex-col"
          >
            {step === 1 && <StepWelcome onContinue={() => goForward(2)} />}
            {step === 2 && (
              <StepCountry
                selected={selectedCountry}
                onSelect={setSelectedCountry}
                onContinue={saveCountry}
                saving={saving}
              />
            )}
            {step === 3 && (
              <StepCharities
                country={selectedCountry}
                localCharities={localCharities}
                intlCharities={intlCharities}
                loading={loadingCharities}
                selected={selectedCharities}
                onToggle={toggleCharity}
                onContinue={saveCharities}
                saving={saving}
              />
            )}
            {step === 4 && (
              <StepDone onContinue={completeOnboarding} saving={saving} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Progress Dots
   ═══════════════════════════════════════════════════════════════════════════════ */

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="safe-top flex items-center justify-center gap-2 pt-6 pb-2">
      {Array.from({ length: total }, (_, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === current;
        const isCompleted = stepNum < current;

        return (
          <motion.div
            key={i}
            className="rounded-full"
            animate={{
              width: isActive ? 24 : 8,
              height: 8,
              backgroundColor: isActive || isCompleted
                ? 'var(--accent-green)'
                : 'var(--border-primary)',
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          />
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Step 1: Welcome
   ═══════════════════════════════════════════════════════════════════════════════ */

function StepWelcome({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 pb-12">
      {/* Animated logo */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="mb-10"
      >
        <motion.div
          animate={{
            scale: [1, 1.06, 1],
            boxShadow: [
              '0 0 0 0 rgba(134, 239, 172, 0)',
              '0 0 40px 8px rgba(134, 239, 172, 0.25)',
              '0 0 0 0 rgba(134, 239, 172, 0)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="flex h-28 w-28 items-center justify-center rounded-[2rem]"
          style={{ background: 'var(--accent-green)' }}
        >
          <svg
            width="56"
            height="56"
            viewBox="0 0 56 56"
            fill="none"
            className="drop-shadow-sm"
          >
            <path
              d="M28 8C17 8 8 17 8 28s9 20 20 20 20-9 20-20S39 8 28 8z"
              fill="#121212"
              fillOpacity="0.15"
            />
            <path
              d="M20 28l6 6 10-12"
              stroke="#121212"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M28 12v4M28 40v4M12 28h4M40 28h4"
              stroke="#121212"
              strokeWidth="2"
              strokeLinecap="round"
              strokeOpacity="0.3"
            />
          </svg>
        </motion.div>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="mb-4 text-center text-[28px] font-bold leading-tight tracking-tight"
        style={{ color: 'var(--text-primary)' }}
      >
        Give effortlessly.
        <br />
        Save on taxes.
      </motion.h1>

      {/* Subtext */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-12 max-w-[280px] text-center text-base leading-relaxed"
        style={{ color: 'var(--text-secondary)' }}
      >
        Round up your purchases. Watch the good add up.
      </motion.p>

      {/* CTA */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="w-full max-w-[340px] px-2"
      >
        <button
          onClick={onContinue}
          className="w-full rounded-2xl text-base font-semibold transition-all duration-150 active:scale-[0.98]"
          style={{
            height: 48,
            background: 'var(--accent-green)',
            color: '#121212',
          }}
        >
          Get started
        </button>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Step 2: Country Selection
   ═══════════════════════════════════════════════════════════════════════════════ */

function StepCountry({
  selected,
  onSelect,
  onContinue,
  saving,
}: {
  selected: string;
  onSelect: (code: string) => void;
  onContinue: () => void;
  saving: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col px-6 pt-8 pb-12">
      <motion.h2
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-2 text-center text-2xl font-bold"
        style={{ color: 'var(--text-primary)' }}
      >
        Where are you based?
      </motion.h2>

      <motion.p
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8 text-center text-sm"
        style={{ color: 'var(--text-secondary)' }}
      >
        This determines your tax benefits and charity recommendations
      </motion.p>

      {/* Country pills */}
      <div className="mx-auto flex w-full max-w-[340px] flex-col gap-3">
        {COUNTRIES.map((country, i) => {
          const isSelected = selected === country.code;

          return (
            <motion.button
              key={country.code}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              onClick={() => onSelect(country.code)}
              className="flex items-center gap-3 rounded-full px-5 transition-all duration-150 active:scale-[0.98]"
              style={{
                height: 48,
                minHeight: 44,
                background: isSelected
                  ? 'rgba(134, 239, 172, 0.12)'
                  : 'var(--bg-card)',
                border: isSelected
                  ? '2px solid var(--accent-green)'
                  : '1px solid var(--border-primary)',
              }}
            >
              <span className="text-xl leading-none">{country.flag}</span>
              <span
                className="text-[15px] font-medium"
                style={{
                  color: isSelected
                    ? 'var(--accent-green)'
                    : 'var(--text-primary)',
                }}
              >
                {country.name}
              </span>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <circle
                      cx="10"
                      cy="10"
                      r="10"
                      fill="var(--accent-green)"
                    />
                    <path
                      d="M6 10l3 3 5-6"
                      stroke="#121212"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Continue */}
      <div className="mt-auto w-full max-w-[340px] self-center px-2 pt-8">
        <button
          onClick={onContinue}
          disabled={!selected || saving}
          className="w-full rounded-2xl text-base font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          style={{
            height: 48,
            background: 'var(--accent-green)',
            color: '#121212',
          }}
        >
          {saving ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Step 3: Pick Charities
   ═══════════════════════════════════════════════════════════════════════════════ */

function StepCharities({
  country,
  localCharities,
  intlCharities,
  loading,
  selected,
  onToggle,
  onContinue,
  saving,
}: {
  country: string;
  localCharities: Charity[];
  intlCharities: Charity[];
  loading: boolean;
  selected: string[];
  onToggle: (id: string) => void;
  onContinue: () => void;
  saving: boolean;
}) {
  const countryName = COUNTRY_NAMES[country] || country;

  return (
    <div className="flex flex-1 flex-col px-6 pt-8 pb-12">
      <motion.h2
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-1 text-center text-2xl font-bold"
        style={{ color: 'var(--text-primary)' }}
      >
        Choose your charities
      </motion.h2>

      <motion.p
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6 text-center text-sm"
        style={{ color: 'var(--text-secondary)' }}
      >
        Select 1 to 3. Your spare change will be split equally.
      </motion.p>

      {/* Counter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-5 flex items-center justify-center gap-2"
      >
        <div
          className="flex h-7 items-center rounded-full px-3 text-xs font-semibold"
          style={{
            background:
              selected.length > 0
                ? 'rgba(134, 239, 172, 0.15)'
                : 'var(--bg-card)',
            color:
              selected.length > 0
                ? 'var(--accent-green)'
                : 'var(--text-dim)',
            border: '1px solid',
            borderColor:
              selected.length > 0
                ? 'rgba(134, 239, 172, 0.3)'
                : 'var(--border-primary)',
          }}
        >
          {selected.length} of 3 selected
        </div>
      </motion.div>

      {/* Scrollable charity list */}
      <div className="flex-1 overflow-y-auto -mx-6 px-6 pb-4" style={{ maxHeight: 'calc(100dvh - 320px)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div
              className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: 'var(--accent-green)', borderTopColor: 'transparent' }}
            />
          </div>
        ) : (
          <>
            {/* Local charities */}
            {localCharities.length > 0 && (
              <>
                <p
                  className="mb-3 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-dim)' }}
                >
                  Popular in {countryName}
                </p>
                <div className="mb-6 flex flex-col gap-2.5">
                  {localCharities.slice(0, 7).map((charity, i) => (
                    <CharityCard
                      key={charity.id}
                      charity={charity}
                      isSelected={selected.includes(charity.id)}
                      disabled={!selected.includes(charity.id) && selected.length >= 3}
                      onToggle={() => onToggle(charity.id)}
                      delay={0.05 * i}
                    />
                  ))}
                </div>
              </>
            )}

            {/* International charities */}
            {intlCharities.length > 0 && (
              <>
                <p
                  className="mb-3 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-dim)' }}
                >
                  International
                </p>
                <div className="flex flex-col gap-2.5">
                  {intlCharities.slice(0, 5).map((charity, i) => (
                    <CharityCard
                      key={charity.id}
                      charity={charity}
                      isSelected={selected.includes(charity.id)}
                      disabled={!selected.includes(charity.id) && selected.length >= 3}
                      onToggle={() => onToggle(charity.id)}
                      delay={0.05 * i}
                    />
                  ))}
                </div>
              </>
            )}

            {localCharities.length === 0 && intlCharities.length === 0 && (
              <p
                className="py-12 text-center text-sm"
                style={{ color: 'var(--text-dim)' }}
              >
                No charities available for this region yet.
              </p>
            )}
          </>
        )}
      </div>

      {/* Continue */}
      <div className="mt-4 w-full max-w-[340px] self-center px-2 pt-2">
        <button
          onClick={onContinue}
          disabled={selected.length === 0 || saving}
          className="w-full rounded-2xl text-base font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          style={{
            height: 48,
            background: 'var(--accent-green)',
            color: '#121212',
          }}
        >
          {saving ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}

/* ─── Charity Card ───────────────────────────────────────────────────────────── */

function CharityCard({
  charity,
  isSelected,
  disabled,
  onToggle,
  delay,
}: {
  charity: Charity;
  isSelected: boolean;
  disabled: boolean;
  onToggle: () => void;
  delay: number;
}) {
  return (
    <motion.button
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay }}
      onClick={onToggle}
      disabled={disabled}
      className="relative flex w-full items-start gap-3 rounded-2xl p-3.5 text-left transition-all duration-150 active:scale-[0.98] disabled:opacity-40"
      style={{
        background: isSelected ? 'rgba(134, 239, 172, 0.08)' : 'var(--bg-card)',
        border: isSelected
          ? '2px solid var(--accent-green)'
          : '1px solid var(--border-primary)',
      }}
    >
      {/* Icon */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
        style={{ background: 'var(--bg-card-inner)' }}
      >
        {charity.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="text-[14px] font-semibold leading-tight truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {charity.name}
          </span>
          {charity.category && (
            <span
              className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium"
              style={{
                background: 'var(--bg-card-inner)',
                color: 'var(--text-dim)',
              }}
            >
              {charity.category}
            </span>
          )}
        </div>
        {charity.description && (
          <p
            className="mt-0.5 text-[12px] leading-snug line-clamp-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            {charity.description}
          </p>
        )}
      </div>

      {/* Checkmark */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="11" fill="var(--accent-green)" />
            <path
              d="M6.5 11l3 3 6-7"
              stroke="#121212"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Step 4: Done
   ═══════════════════════════════════════════════════════════════════════════════ */

function StepDone({
  onContinue,
  saving,
}: {
  onContinue: () => void;
  saving: boolean;
}) {
  /* Fire confetti on mount */
  useEffect(() => {
    const duration = 2500;
    const end = Date.now() + duration;

    function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#86efac', '#60a5fa', '#c084fc', '#fbbf24'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#86efac', '#60a5fa', '#c084fc', '#fbbf24'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }

    // Initial burst
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#86efac', '#60a5fa', '#c084fc', '#fbbf24', '#fb923c'],
    });

    requestAnimationFrame(frame);
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 pb-12">
      {/* Celebration icon */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        className="mb-8 flex h-24 w-24 items-center justify-center rounded-[1.75rem]"
        style={{ background: 'rgba(134, 239, 172, 0.15)' }}
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-5xl"
        >
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="var(--accent-green)"
              fillOpacity="0.2"
            />
            <path
              d="M16 24l6 6 10-12"
              stroke="var(--accent-green)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </motion.div>

      {/* Headline */}
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-4 text-center text-[28px] font-bold leading-tight tracking-tight"
        style={{ color: 'var(--text-primary)' }}
      >
        Your round-ups
        <br />
        start now.
      </motion.h2>

      {/* Impact statement */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mb-12 max-w-[280px] text-center text-base leading-relaxed"
        style={{ color: 'var(--text-secondary)' }}
      >
        Every purchase rounds up. Every cent makes a difference.
      </motion.p>

      {/* CTA */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-[340px] px-2"
      >
        <button
          onClick={onContinue}
          disabled={saving}
          className="w-full rounded-2xl text-base font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
          style={{
            height: 48,
            background: 'var(--accent-green)',
            color: '#121212',
          }}
        >
          {saving ? 'Finishing up...' : 'Go to dashboard'}
        </button>
      </motion.div>
    </div>
  );
}
