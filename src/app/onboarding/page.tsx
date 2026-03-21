"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Check, ChevronRight, ChevronLeft, Building2, Loader2, Shield } from "lucide-react";
import { getJurisdiction } from "@/lib/tax-engine";

const JURISDICTIONS = [
  { code: "FR", name: "France", flag: "🇫🇷", rate: "66% / 75%" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", rate: "25% Gift Aid" },
  { code: "DE", name: "Germany", flag: "🇩🇪", rate: "Up to 45%" },
  { code: "BE", name: "Belgium", flag: "🇧🇪", rate: "45%" },
  { code: "ES", name: "Spain", flag: "🇪🇸", rate: "80% / 40%" },
];

const BRACKET_PREVIEWS: Record<string, { label: string; preview: number }[]> = {
  FR: [
    { label: "Under €30,000", preview: 142 },
    { label: "€30,000 to €60,000", preview: 285 },
    { label: "€60,000 to €100,000", preview: 475 },
    { label: "€100,000+", preview: 720 },
  ],
  GB: [
    { label: "Under £25,000", preview: 125 },
    { label: "£25,000 to £50,270", preview: 125 },
    { label: "£50,271 to £125,140", preview: 300 },
    { label: "£125,141+", preview: 375 },
  ],
  DE: [
    { label: "Under €30,000", preview: 150 },
    { label: "€30,000 to €60,000", preview: 210 },
    { label: "€60,000 to €100,000", preview: 210 },
    { label: "€100,000+", preview: 225 },
  ],
  BE: [
    { label: "Under €30,000", preview: 225 },
    { label: "€30,000 to €60,000", preview: 225 },
    { label: "€60,000 to €100,000", preview: 225 },
    { label: "€100,000+", preview: 225 },
  ],
  ES: [
    { label: "Under €20,000", preview: 260 },
    { label: "€20,000 to €35,000", preview: 260 },
    { label: "€35,000 to €60,000", preview: 260 },
    { label: "€60,000+", preview: 260 },
  ],
};

const BANKS = [
  { name: "BNP Paribas", color: "#00a651" },
  { name: "Société Générale", color: "#e2001a" },
  { name: "Crédit Agricole", color: "#006f4e" },
  { name: "Boursorama", color: "#ff6600" },
  { name: "Revolut", color: "#0075eb" },
  { name: "N26", color: "#36a18b" },
];

interface Charity {
  id: string;
  name: string;
  icon: string;
  category: string;
  taxRate: number;
}

// Reordered steps:
// 0: Welcome
// 1: Jurisdiction + Income (merged)
// 2: Tax Preview
// 3: Charity Picker (before bank for emotional investment)
// 4: Bank Connection
// 5: SEPA Mandate
// 6: Celebration

const TOTAL_STEPS = 7;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [jurisdiction, setJurisdiction] = useState("FR");
  const [incomeBracket, setIncomeBracket] = useState(1);
  const [bankConnecting, setBankConnecting] = useState(false);
  const [bankConnected, setBankConnected] = useState(false);
  const [selectedBank, setSelectedBank] = useState("");
  const [sepaSigned, setSepaSigned] = useState(false);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedCharities, setSelectedCharities] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    fetch("/api/charities")
      .then((r) => r.json())
      .then((data) => setCharities(data.charities || []))
      .catch(() => {});
  }, []);

  // Focus heading after step change for screen readers
  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, [step]);

  const brackets = BRACKET_PREVIEWS[jurisdiction] || BRACKET_PREVIEWS.FR;
  const taxPreview = brackets[incomeBracket]?.preview || 285;
  const jurisdictionConfig = getJurisdiction(jurisdiction);
  const sym = jurisdictionConfig.currencySymbol;

  const canProceed = useCallback(() => {
    switch (step) {
      case 0: return true;
      case 1: return !!jurisdiction;
      case 2: return true;
      case 3: return selectedCharities.length > 0;
      case 4: return bankConnected;
      case 5: return sepaSigned;
      case 6: return true;
      default: return false;
    }
  }, [step, jurisdiction, bankConnected, sepaSigned, selectedCharities]);

  function handleBankConnect(bankName: string) {
    setSelectedBank(bankName);
    setBankConnecting(true);
    setTimeout(() => {
      setBankConnecting(false);
      setBankConnected(true);
    }, 2000);
  }

  function toggleCharity(id: string) {
    setSelectedCharities((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function handleComplete() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jurisdiction, incomeBracket, selectedCharities }),
      });
      if (res.ok) {
        setShowConfetti(true);
        setTimeout(() => router.push("/dashboard"), 2500);
      }
    } catch {
      setSubmitting(false);
    }
  }

  function nextStep() {
    if (step === 5) {
      setDirection(1);
      setStep(6);
      handleComplete();
    } else if (step < 6) {
      setDirection(1);
      setStep(step + 1);
    }
  }

  function prevStep() {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  }

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col">
      {/* Confetti overlay (only on final celebration) */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
          >
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 400),
                  y: -20,
                  rotate: 0,
                  scale: Math.random() * 0.5 + 0.5,
                }}
                animate={{
                  y: (typeof window !== "undefined" ? window.innerHeight : 800) + 20,
                  rotate: Math.random() * 720 - 360,
                }}
                transition={{ duration: Math.random() * 2 + 1.5, ease: "easeIn" }}
                className="absolute w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: ["#5ce0b8", "#4a9eff", "#b48eff", "#ffd93d", "#ff9a76", "#ff6b6b"][i % 6],
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm"
          >
            {/* Step 0: Welcome */}
            {step === 0 && (
              <div className="text-center space-y-6">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 12 }}
                  className="text-6xl mb-4"
                >
                  💚
                </motion.div>
                <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-bold text-text-primary outline-none">RoundUp</h1>
                <p className="text-xl text-text-secondary">Give effortlessly. Save on taxes.</p>
                <p className="text-sm text-text-secondary/70 font-medium">
                  Every purchase you make rounds up to the nearest euro. The difference goes to charities you choose. It all counts towards your tax deductions.
                </p>
              </div>
            )}

            {/* Step 1: Jurisdiction + Income (merged) */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="text-center mb-4">
                  <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-text-primary mb-2 outline-none">About you</h2>
                  <p className="text-text-secondary text-sm font-medium">Where you are based and your income range</p>
                </div>
                <div>
                  <p className="text-text-secondary text-xs font-medium mb-2 uppercase tracking-wider">Country</p>
                  <div className="space-y-2">
                    {JURISDICTIONS.map((j) => (
                      <button
                        key={j.code}
                        onClick={() => setJurisdiction(j.code)}
                        className={`w-full flex items-center gap-4 p-3.5 rounded-2xl border transition-all ${
                          jurisdiction === j.code
                            ? "bg-accent-blue/10 border-accent-blue"
                            : "bg-navy-700 border-[#1f4070] hover:border-navy-500"
                        }`}
                      >
                        <span className="text-xl">{j.flag}</span>
                        <div className="text-left flex-1">
                          <div className="text-text-primary font-medium text-sm">{j.name}</div>
                        </div>
                        {jurisdiction === j.code && (
                          <Check className="w-5 h-5 text-accent-blue" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-text-secondary text-xs font-medium mb-2 uppercase tracking-wider">Annual income</p>
                  <div className="space-y-2">
                    {brackets.map((b, idx) => (
                      <button
                        key={idx}
                        onClick={() => setIncomeBracket(idx)}
                        className={`w-full p-3.5 rounded-2xl border text-left transition-all ${
                          incomeBracket === idx
                            ? "bg-accent-blue/10 border-accent-blue"
                            : "bg-navy-700 border-[#1f4070] hover:border-navy-500"
                        }`}
                      >
                        <div className="text-text-primary font-medium text-sm">{b.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Tax Preview */}
            {step === 2 && (
              <div className="text-center space-y-6">
                <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-text-primary mb-2 outline-none">Your spare change could do this</h2>
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 10, delay: 0.3 }}
                  className="text-center"
                >
                  <p className="text-accent-green text-3xl font-bold mb-1">{Math.round(taxPreview * 1.5 / 0.25)} meals</p>
                  <p className="text-text-secondary text-sm font-medium">funded through your spare change this year</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="bg-navy-700 border border-[#1f4070] rounded-2xl p-4"
                >
                  <p className="text-accent-blue text-2xl font-bold tabular-nums mb-1">{sym}{taxPreview}</p>
                  <p className="text-text-secondary text-sm font-medium">saved on your taxes</p>
                </motion.div>
                <p className="text-text-secondary/60 text-xs font-medium">
                  Estimates based on your income bracket. Actual savings depend on your total giving.
                </p>
              </div>
            )}

            {/* Step 3: Charity Picker (moved before bank) */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="text-center mb-4">
                  <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-text-primary mb-2 outline-none">Choose your charities</h2>
                  <p className="text-text-secondary text-sm font-medium">Select one or more to receive your round ups</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {charities.map((c) => {
                    const selected = selectedCharities.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        onClick={() => toggleCharity(c.id)}
                        className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                          selected
                            ? "bg-accent-green/10 border-accent-green"
                            : "bg-navy-700 border-[#1f4070] hover:border-navy-500"
                        }`}
                      >
                        {selected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 w-5 h-5 bg-accent-green rounded-full flex items-center justify-center"
                          >
                            <Check className="w-3 h-3 text-navy-900" />
                          </motion.div>
                        )}
                        <span className="text-2xl">{c.icon}</span>
                        <span className="text-text-primary text-xs font-medium text-center">{c.name}</span>
                        <span className="text-text-secondary text-xs font-medium">{c.taxRate}% tax credit</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-center text-text-secondary text-xs font-medium">
                  {selectedCharities.length} selected. Donations split equally by default.
                </p>
              </div>
            )}

            {/* Step 4: Bank Connection */}
            {step === 4 && (
              <div className="space-y-5">
                <div className="text-center mb-4">
                  <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-text-primary mb-2 outline-none">Connect your bank</h2>
                  <p className="text-text-secondary text-sm font-medium">Select your bank to track transactions</p>
                </div>
                {bankConnected ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center space-y-4 py-8"
                  >
                    <div className="w-16 h-16 rounded-full bg-accent-green/20 flex items-center justify-center mx-auto">
                      <Check className="w-8 h-8 text-accent-green" />
                    </div>
                    <p className="text-accent-green font-semibold text-lg">Connected!</p>
                    <p className="text-text-secondary text-sm font-medium">{selectedBank}</p>
                  </motion.div>
                ) : bankConnecting ? (
                  <div className="text-center py-12 space-y-4">
                    <Loader2 className="w-10 h-10 text-accent-blue animate-spin mx-auto" />
                    <p className="text-text-secondary font-medium">Connecting to {selectedBank}...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {BANKS.map((b) => (
                      <button
                        key={b.name}
                        onClick={() => handleBankConnect(b.name)}
                        className="flex flex-col items-center gap-3 p-4 bg-navy-700 border border-[#1f4070] rounded-2xl hover:border-navy-500 transition-all"
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: b.color + "20" }}
                        >
                          <Building2 className="w-5 h-5" style={{ color: b.color }} />
                        </div>
                        <span className="text-text-primary text-xs font-medium text-center">{b.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 5: SEPA Mandate */}
            {step === 5 && (
              <div className="space-y-5">
                <div className="text-center mb-4">
                  <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-text-primary mb-2 outline-none">SEPA Direct Debit</h2>
                  <p className="text-text-secondary text-sm font-medium">Authorise automatic donations</p>
                </div>
                <div className="bg-navy-700 border border-[#1f4070] rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary font-medium">Creditor</span>
                    <span className="text-text-primary">RoundUp SAS</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary font-medium">Mandate reference</span>
                    <span className="text-text-primary font-mono text-xs">RNDUP-2026-001</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary font-medium">Frequency</span>
                    <span className="text-text-primary">Weekly</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary font-medium">Bank</span>
                    <span className="text-text-primary">{selectedBank || "Your bank"}</span>
                  </div>
                  <div className="border-t border-[#1f4070] pt-3">
                    <div className="flex items-start gap-2 text-xs text-text-secondary font-medium">
                      <Shield className="w-4 h-4 shrink-0 mt-0.5 text-accent-blue" />
                      <span>A €0.00 verification charge will confirm your account. No money is taken until your first round up week completes.</span>
                    </div>
                  </div>
                </div>
                <Button
                  fullWidth
                  size="lg"
                  onClick={() => setSepaSigned(true)}
                  disabled={sepaSigned}
                  variant={sepaSigned ? "secondary" : "primary"}
                >
                  {sepaSigned ? "✓ Mandate Signed" : "Sign Mandate"}
                </Button>
              </div>
            )}

            {/* Step 6: Celebration */}
            {step === 6 && (
              <div className="text-center space-y-6 py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 8 }}
                  className="text-7xl"
                >
                  🎉
                </motion.div>
                <h2 ref={headingRef} tabIndex={-1} className="text-3xl font-bold text-text-primary outline-none">You&apos;re all set!</h2>
                <p className="text-text-secondary font-medium">
                  Your round ups are now active. Every purchase makes a difference.
                </p>
                <Button
                  fullWidth
                  size="lg"
                  onClick={() => router.push("/dashboard")}
                  disabled={submitting}
                >
                  {submitting ? "Setting up..." : "Let's go"}
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {step < 6 && (
        <div className="px-6 pb-8 space-y-4">
          <div className="flex gap-3">
            {step > 0 && (
              <Button variant="secondary" onClick={prevStep} className="px-4">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}
            <Button fullWidth onClick={nextStep} disabled={!canProceed()}>
              <span className="flex items-center gap-2 justify-center">
                {step === 5 ? "Finish Setup" : "Continue"}
                <ChevronRight className="w-4 h-4" />
              </span>
            </Button>
          </div>

          {/* Step progress */}
          <p className="text-center text-text-secondary text-xs font-medium mb-2">Step {step + 1} of {TOTAL_STEPS}</p>
          <div className="flex justify-center gap-2" role="group" aria-label="Onboarding progress">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                role="img"
                aria-label={`Step ${i + 1} of ${TOTAL_STEPS}`}
                aria-current={i === step ? "step" : undefined}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === step ? "bg-accent-blue w-6" : i < step ? "bg-accent-blue/40" : "bg-navy-600"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CountUp({ target }: { target: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();

    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [target]);

  return (
    <div className="text-6xl font-bold text-accent-green tabular-nums">
      €{value}
    </div>
  );
}
