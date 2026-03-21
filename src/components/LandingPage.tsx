"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { getCharityColor } from "@/lib/charityColors";
import {
  CreditCard, Coins, FileText, ChevronDown, Menu, X,
  ShieldCheck, ArrowRight, Shield, Globe, Check, Star,
  BarChart3, Zap, Heart, AlertTriangle, TrendingUp,
} from "lucide-react";

// ─── Scroll-triggered animation wrapper ─────────────────
function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Count-up on scroll ──────────────────────────────────
function CountUp({ value, prefix = "", suffix = "", className = "" }: { value: number; prefix?: string; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    const dur = 1500;
    const start = Date.now();
    function tick() {
      const p = Math.min((Date.now() - start) / dur, 1);
      setDisplay(Math.round((1 - Math.pow(1 - p, 3)) * value));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [isInView, value]);
  return <span ref={ref} className={`tabular-nums ${className}`}>{prefix}{display.toLocaleString("fr-FR")}{suffix}</span>;
}

// ─── Data ────────────────────────────────────────────────
const CHARITIES_DATA = [
  { name: "Médecins Sans Frontières", icon: "🏥", category: "Health", mission: "Emergency medical care in conflict zones, epidemics, and disasters across 70+ countries.", stat: "11.2M patients treated in 2024", rate: 75, quality: true },
  { name: "WWF France", icon: "🐼", category: "Environment", mission: "Protecting biodiversity, restoring ecosystems, and fighting climate change across French territories.", stat: "1.2M hectares of marine habitat protected", rate: 66, quality: true },
  { name: "Ligue contre le cancer", icon: "🎗️", category: "Health", mission: "Funding cancer research, supporting patients, and leading prevention campaigns in France.", stat: "532 research projects funded in 2024", rate: 66, quality: true },
  { name: "Restos du Cœur", icon: "❤️", category: "Humanitarian", mission: "Meals, shelter, and social support for those in need, serving over a million people each winter.", stat: "142M meals distributed in 2024", rate: 75, quality: true },
  { name: "Amnesty International", icon: "✊", category: "Human Rights", mission: "Investigating human rights abuses, campaigning for justice, and supporting people at risk worldwide.", stat: "98 prisoners of conscience freed", rate: 66, quality: false },
  { name: "Secours Populaire", icon: "🤝", category: "Humanitarian", mission: "Fighting poverty in France through food, housing, healthcare, and holiday access for 3 million people.", stat: "3.3M people assisted in France", rate: 75, quality: true },
];

const TAX_DATA: Record<string, { rates: { donate: number; back: number; net: number }[] }> = {
  FR: { rates: [{ donate: 500, back: 375, net: 125 }, { donate: 1000, back: 750, net: 250 }, { donate: 1500, back: 1125, net: 375 }, { donate: 2000, back: 1500, net: 500 }] },
  GB: { rates: [{ donate: 500, back: 125, net: 375 }, { donate: 1000, back: 250, net: 750 }, { donate: 1500, back: 375, net: 1125 }, { donate: 2000, back: 500, net: 1500 }] },
  DE: { rates: [{ donate: 500, back: 210, net: 290 }, { donate: 1000, back: 420, net: 580 }, { donate: 1500, back: 630, net: 870 }, { donate: 2000, back: 840, net: 1160 }] },
  BE: { rates: [{ donate: 500, back: 225, net: 275 }, { donate: 1000, back: 450, net: 550 }, { donate: 1500, back: 675, net: 825 }, { donate: 2000, back: 900, net: 1100 }] },
  ES: { rates: [{ donate: 500, back: 375, net: 125 }, { donate: 1000, back: 700, net: 300 }, { donate: 1500, back: 1000, net: 500 }, { donate: 2000, back: 1300, net: 700 }] },
};

const FAQS = [
  { q: "How does RoundUp access my transactions?", a: "Through Open Banking (PSD2). We get read-only access to your transaction amounts. We never see your credentials, and we cannot move money from your account." },
  { q: "Is my money safe?", a: "Absolutely. Donations are collected via SEPA Direct Debit in weekly batches. You can cancel anytime. We never store your card details." },
  { q: "How does the tax deduction work?", a: "In France, donations to eligible charities qualify for a 66% or 75% tax credit. RoundUp tracks this automatically and generates your tax documents in January." },
  { q: "Which charities can I choose?", a: "Six carefully selected organisations, most certified by Don en Confiance. We prioritise trust, transparency, and measurable impact over quantity." },
  { q: "What if I want to stop?", a: "Cancel anytime with one tap. No fees, no lock-in. Your donation history and tax PDFs remain accessible." },
  { q: "How much does RoundUp cost?", a: "Free during early access. We are exploring a small monthly subscription or optional tip model. Your donations always go 100% to charities." },
  { q: "Can I donate more than just round ups?", a: "Not yet, but it is coming. For now, round ups are the core experience." },
  { q: "Is RoundUp available in my country?", a: "Currently available in France, UK, Germany, Belgium, and Spain. More countries coming soon." },
];

// ─── Main Component ──────────────────────────────────────
export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [taxCountry, setTaxCountry] = useState("FR");
  const [taxBracket, setTaxBracket] = useState(1);
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [demoStep, setDemoStep] = useState(0);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-play demo loop
  useEffect(() => {
    const timer = setInterval(() => {
      setDemoStep((s) => (s >= 4 ? 0 : s + 1));
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  function scrollTo(id: string) {
    setMobileMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleEarlyAccess(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    try {
      const res = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, country: taxCountry }),
      });
      const data = await res.json();
      setEmailStatus(data.message);
      if (data.success) setEmail("");
    } catch {
      setEmailStatus("Something went wrong. Try again.");
    }
  }

  const taxData = TAX_DATA[taxCountry]?.rates[taxBracket] || TAX_DATA.FR.rates[1];

  return (
    <div className="min-h-screen bg-navy-900 text-text-primary overflow-x-hidden">
      {/* ─── Sticky Nav ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-navy-900/95 backdrop-blur-xl border-b border-[#1f4070]" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-text-primary">💚 RoundUp</Link>
          <div className="hidden md:flex items-center gap-8">
            {[["how", "How It Works"], ["calculator", "Tax Calculator"], ["charities", "Charities"], ["faq", "FAQ"]].map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)} className="text-sm text-text-secondary hover:text-text-primary transition-colors">{label}</button>
            ))}
          </div>
          <div className="hidden md:block">
            <Link href="/signup" className="px-6 py-2.5 bg-accent-blue text-navy-900 font-bold text-sm rounded-xl hover:bg-accent-blue/90 transition-colors">Sign Up</Link>
          </div>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 text-text-secondary" aria-label="Menu">
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        <AnimatePresence>
          {mobileMenu && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-navy-800 border-t border-[#1f4070]">
              <div className="px-6 py-4 space-y-3">
                {[["how", "How It Works"], ["calculator", "Tax Calculator"], ["charities", "Charities"], ["faq", "FAQ"]].map(([id, label]) => (
                  <button key={id} onClick={() => scrollTo(id)} className="block w-full text-left text-text-secondary py-2 min-h-[44px]">{label}</button>
                ))}
                <Link href="/signup" className="block w-full text-center px-6 py-3 bg-accent-blue text-navy-900 font-bold rounded-xl mt-2">Sign Up</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div animate={{ x: [0, 40, 0], y: [0, -30, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent-green/8 rounded-full blur-[120px]" />
          <motion.div animate={{ x: [0, -30, 0], y: [0, 40, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-blue/8 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Every purchase you make can change the world
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-text-secondary mb-8 max-w-lg">
              RoundUp rounds your transactions to the nearest euro and donates the spare change to charities you choose. You get a tax deduction. They get help.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-wrap gap-4">
              <Link href="/signup" className="px-8 py-4 bg-accent-blue text-navy-900 font-bold text-lg rounded-2xl hover:bg-accent-blue/90 transition-colors">Get Started</Link>
              <button onClick={() => scrollTo("how")} className="px-8 py-4 border border-[#1f4070] text-text-primary font-semibold text-lg rounded-2xl hover:bg-navy-700 transition-colors">See How It Works</button>
            </motion.div>
          </div>
          {/* Phone mockup */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="relative hidden md:block">
            <div className="relative mx-auto w-[280px]">
              {/* iPhone frame */}
              <div className="bg-navy-700 rounded-[36px] p-3 border border-[#1f4070] shadow-2xl">
                <div className="bg-navy-900 rounded-[28px] overflow-hidden p-4 min-h-[480px]">
                  <p className="text-text-secondary text-xs mb-1">Good morning,</p>
                  <p className="text-text-primary font-bold text-lg mb-4">Sophie</p>
                  <div className="bg-navy-700 rounded-2xl p-4 mb-3 glow-green text-center">
                    <p className="text-text-secondary text-xs mb-1">Year to date</p>
                    <p className="text-accent-green text-3xl font-bold tabular-nums">€<CountUp value={247} /></p>
                  </div>
                  <div className="bg-navy-700 rounded-2xl p-3 mb-3">
                    <div className="flex justify-between text-xs mb-2"><span className="text-text-secondary">Tax ceiling</span><span className="text-accent-blue font-semibold">€185 saved</span></div>
                    <div className="h-2 bg-navy-600 rounded-full overflow-hidden"><div className="h-full w-[12%] bg-accent-green rounded-full" /></div>
                  </div>
                  <div className="bg-navy-700 rounded-2xl p-3 mb-3">
                    <p className="text-text-primary text-xs font-semibold mb-2">Your charities</p>
                    {["🏥 MSF", "🐼 WWF", "❤️ Restos"].map((c, i) => (
                      <div key={i} className="flex justify-between text-xs py-1"><span className="text-text-secondary">{c}</span><span className="text-text-primary tabular-nums">{[34, 25, 33][i]}%</span></div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Floating badges */}
              {[
                { text: "€247 donated", color: "accent-green", x: -60, y: 80, delay: 0.8 },
                { text: "3 charities", color: "accent-purple", x: 220, y: 200, delay: 1.0 },
                { text: "€185 in tax savings", color: "accent-blue", x: -40, y: 340, delay: 1.2 },
              ].map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: b.delay }}
                  className={`absolute bg-navy-700 border border-[#1f4070] rounded-2xl px-3 py-2 text-xs font-semibold text-${b.color} shadow-lg`}
                  style={{ left: b.x, top: b.y }}
                >
                  {b.text}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how" className="py-24 px-6" style={{ scrollMarginTop: 80 }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Three steps. Two minutes. One lasting impact.</h2>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { num: "1", title: "Shop normally", desc: "Pay with any card or Apple Pay. We detect every transaction through your bank, read only.", icon: <CreditCard className="w-7 h-7" /> },
              { num: "2", title: "We round up the change", desc: "€4.30 becomes €5.00. The €0.70 goes to charities you chose. Accumulated weekly.", icon: <Coins className="w-7 h-7" /> },
              { num: "3", title: "Save on taxes", desc: "Track your deduction in real time. Download your tax package in January. Hand it to your accountant.", icon: <FileText className="w-7 h-7" /> },
            ].map((step, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-accent-blue/10 flex items-center justify-center mx-auto mb-4 text-accent-blue">{step.icon}</div>
                  <div className="text-accent-blue text-xs font-bold mb-2">STEP {step.num}</div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn className="text-center">
            <p className="text-text-secondary mb-4">It really is that simple.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-3 bg-accent-blue text-navy-900 font-bold rounded-xl hover:bg-accent-blue/90 transition-colors">Get Started <ArrowRight className="w-4 h-4" /></Link>
          </FadeIn>
        </div>
      </section>

      {/* ─── Live Demo ─── */}
      <section className="py-24 px-6 bg-navy-800/50">
        <div className="max-w-2xl mx-auto">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Try it yourself</h2>
          </FadeIn>
          <FadeIn>
            <div className="bg-navy-700 border border-[#1f4070] rounded-[24px] p-6 md:p-8 max-w-md mx-auto">
              <div className="text-center space-y-4">
                {/* Card terminal */}
                <div className="bg-navy-600/30 rounded-2xl p-4">
                  <p className="text-text-secondary text-xs mb-1">Coffee at Paul</p>
                  <p className="text-2xl font-bold tabular-nums">
                    {demoStep >= 1 ? "€4.00" : "€3.70"}
                  </p>
                  {demoStep >= 1 && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-accent-green text-xs mt-1">+€0.30 rounded up</motion.p>
                  )}
                </div>

                {/* Flow */}
                {demoStep >= 2 && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-2">
                    <span className="text-accent-green text-sm font-semibold">€0.30</span>
                    <ArrowRight className="w-4 h-4 text-text-secondary" />
                    <span className="text-sm">🏥</span>
                    <span className="text-text-primary text-sm font-medium">MSF</span>
                  </motion.div>
                )}

                {/* Notification */}
                {demoStep >= 3 && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-accent-green/10 border border-accent-green/20 rounded-xl p-3 text-xs">
                    <p className="text-accent-green font-semibold">+€0.30 to Médecins Sans Frontières</p>
                  </motion.div>
                )}

                {/* Progress */}
                {demoStep >= 4 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="h-1.5 bg-navy-600 rounded-full overflow-hidden mb-2">
                      <motion.div initial={{ width: "11%" }} animate={{ width: "12%" }} transition={{ duration: 0.5 }} className="h-full bg-accent-green rounded-full" />
                    </div>
                    <p className="text-text-secondary text-xs italic">That's it. You just donated without even thinking about it.</p>
                  </motion.div>
                )}

                {/* Pay button */}
                {demoStep === 0 && (
                  <button onClick={() => setDemoStep(1)} className="w-full py-3 bg-accent-blue text-navy-900 font-bold rounded-xl min-h-[44px]">Pay €3.70</button>
                )}
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.2} className="text-center mt-8">
            <Link href="/signup" className="text-accent-blue text-sm font-semibold hover:underline">Sign up to start for real →</Link>
          </FadeIn>
        </div>
      </section>

      {/* ─── Tax Calculator ─── */}
      <section id="calculator" className="py-24 px-6" style={{ scrollMarginTop: 80 }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">See what giving really costs you</h2>
            <p className="text-text-secondary text-lg">Spoiler: much less than you think.</p>
          </FadeIn>

          <FadeIn delay={0.1} className="mt-12">
            {/* Country pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {[["FR", "🇫🇷 France"], ["GB", "🇬🇧 UK"], ["DE", "🇩🇪 Germany"], ["BE", "🇧🇪 Belgium"], ["ES", "🇪🇸 Spain"]].map(([code, label]) => (
                <button key={code} onClick={() => setTaxCountry(code)} aria-label={label} className={`px-4 py-2.5 rounded-[20px] text-sm font-medium transition-all min-h-[44px] ${taxCountry === code ? "bg-accent-blue text-navy-900 font-bold" : "bg-navy-700 text-text-secondary border border-[#1f4070]"}`}>{label}</button>
              ))}
            </div>
            {/* Bracket selector */}
            <div className="flex justify-center gap-1 mb-10 bg-navy-700 rounded-2xl p-1 max-w-md mx-auto">
              {["€500/yr", "€1,000/yr", "€1,500/yr", "€2,000/yr"].map((label, i) => (
                <button key={i} onClick={() => setTaxBracket(i)} className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all min-h-[44px] ${taxBracket === i ? "bg-accent-blue text-navy-900" : "text-text-secondary hover:text-text-primary"}`}>{label}</button>
              ))}
            </div>

            {/* Result cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                { label: "You donate", value: taxData.donate, color: "text-accent-green", icon: <Heart className="w-5 h-5" /> },
                { label: "Government gives back", value: taxData.back, color: "text-accent-blue", icon: <TrendingUp className="w-5 h-5" /> },
                { label: "Real cost to you", value: taxData.net, color: "text-accent-purple", icon: <Star className="w-5 h-5" /> },
              ].map((c, i) => (
                <motion.div key={`${taxCountry}-${taxBracket}-${i}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-navy-700 border border-[#1f4070] rounded-2xl p-6 text-center">
                  <div className={`w-10 h-10 rounded-xl bg-navy-600/30 flex items-center justify-center mx-auto mb-3 ${c.color}`}>{c.icon}</div>
                  <p className="text-text-secondary text-xs font-medium mb-1">{c.label}</p>
                  <p className={`text-3xl font-bold tabular-nums ${c.color}`}>€{c.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Breakdown bar */}
            <div className="max-w-md mx-auto mb-6">
              <div className="flex h-4 rounded-full overflow-hidden mb-2">
                <div className="bg-accent-purple h-full" style={{ width: `${(taxData.net / taxData.donate) * 100}%` }} />
                <div className="bg-accent-blue h-full" style={{ width: `${(taxData.back / taxData.donate) * 100}%` }} />
              </div>
              <div className="flex justify-between text-xs text-text-secondary font-medium">
                <span>€{taxData.net} you pay</span>
                <span>€{taxData.back} the government pays</span>
              </div>
            </div>

            <p className="text-center text-text-secondary text-sm mb-6">
              That €{taxData.net} provides {Math.round(taxData.net / 0.85)} emergency meals through Restos du Cœur.
            </p>

            <div className="text-center">
              <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-3 bg-accent-blue text-navy-900 font-bold rounded-xl">Start saving <ArrowRight className="w-4 h-4" /></Link>
              <p className="text-text-secondary/60 text-xs mt-3">Tax rules as of 2026. Actual savings depend on your tax situation.</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── Charities ─── */}
      <section id="charities" className="py-24 px-6 bg-navy-800/50" style={{ scrollMarginTop: 80 }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">We did the research. You just pick.</h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto">Six organisations chosen for trust, transparency, and impact. Every one independently verified.</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12 mb-10">
            {CHARITIES_DATA.map((c, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="bg-navy-700 border border-[#1f4070] rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                  <div className="h-1.5" style={{ backgroundColor: getCharityColor(c.name) }} />
                  <div className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-3xl">{c.icon}</span>
                      <div>
                        <h3 className="text-text-primary font-bold text-sm">{c.name}</h3>
                        <p className="text-text-secondary text-xs">{c.category}</p>
                      </div>
                    </div>
                    {c.quality && (
                      <div className="flex items-center gap-1 mb-2 text-accent-green text-xs font-medium"><ShieldCheck className="w-3 h-3" /> Don en Confiance</div>
                    )}
                    <p className="text-text-secondary text-xs leading-relaxed mb-3">{c.mission}</p>
                    <p className="text-text-primary text-xs font-semibold mb-2">{c.stat}</p>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${c.rate === 75 ? "bg-accent-green/15 text-accent-green" : "bg-accent-purple/15 text-accent-purple"}`}>{c.rate}% deductible</span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn className="text-center">
            <p className="text-text-secondary text-sm max-w-lg mx-auto mb-4">Why only six? Because we believe in quality over quantity. Every charity is reviewed for financial transparency, operational efficiency, and real-world impact.</p>
            <Link href="/signup" className="text-accent-blue text-sm font-semibold hover:underline">See full profiles in the app →</Link>
          </FadeIn>
        </div>
      </section>

      {/* ─── The RoundUp Difference ─── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">What makes RoundUp different</h2>
          </FadeIn>

          {/* Without vs With */}
          <FadeIn className="mb-16">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-navy-700 border border-accent-red/20 rounded-2xl p-6">
                <p className="text-accent-red text-xs font-bold mb-3">WITHOUT ROUNDUP</p>
                <p className="text-text-secondary text-sm leading-relaxed">You think about donating... maybe later. You forget. Year ends. No tax deduction.</p>
              </div>
              <div className="bg-navy-700 border border-accent-green/20 rounded-2xl p-6">
                <p className="text-accent-green text-xs font-bold mb-3">WITH ROUNDUP</p>
                <p className="text-text-secondary text-sm leading-relaxed">You buy coffee. €0.70 goes to MSF. You check your phone: €185 in tax savings so far. In January, your PDF is ready.</p>
              </div>
            </div>
          </FadeIn>

          {/* Feature blocks */}
          {[
            { title: "Your tax ceiling, tracked", desc: "Know exactly where you stand. Never miss a deduction.", icon: <BarChart3 className="w-6 h-6 text-accent-blue" /> },
            { title: "Crisis response in one tap", desc: "When disaster strikes, redirect your round ups to emergency relief instantly.", icon: <AlertTriangle className="w-6 h-6 text-accent-red" /> },
            { title: "Real impact, not receipts", desc: "See exactly what your €0.70 funded. Not a transaction line, a result.", icon: <Heart className="w-6 h-6 text-accent-green" /> },
            { title: "Year end, sorted", desc: "Three PDFs, pre-filled, ready for your accountant. The friction is gone.", icon: <FileText className="w-6 h-6 text-accent-purple" /> },
          ].map((f, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className={`flex flex-col md:flex-row items-center gap-6 mb-8 ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
                <div className="w-20 h-20 rounded-2xl bg-navy-700 border border-[#1f4070] flex items-center justify-center shrink-0">{f.icon}</div>
                <div className={`text-center ${i % 2 === 1 ? "md:text-right" : "md:text-left"}`}>
                  <h3 className="text-lg font-bold mb-1">{f.title}</h3>
                  <p className="text-text-secondary text-sm">{f.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ─── Numbers That Matter ─── */}
      <section className="py-24 px-6 bg-navy-800/50">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">The numbers speak</h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {[
              { value: 2000, prefix: "€", suffix: "", label: "Maximum annual deduction under Loi Coluche", color: "text-accent-green" },
              { value: 75, prefix: "", suffix: "%", label: "Tax reduction on eligible donations in France", color: "text-accent-blue" },
              { value: 2, prefix: "", suffix: " min", label: "Average setup time from download to first round up", color: "text-accent-purple" },
            ].map((n, i) => (
              <FadeIn key={i} delay={i * 0.15} className="text-center">
                <p className={`text-5xl font-bold mb-2 ${n.color}`}><CountUp value={n.value} prefix={n.prefix} suffix={n.suffix} /></p>
                <p className="text-text-secondary text-sm">{n.label}</p>
              </FadeIn>
            ))}
          </div>
          <FadeIn className="text-center">
            <p className="text-text-secondary">And the number that matters most: <span className="text-accent-green font-bold">€0</span>. That's what it costs to start.</p>
          </FadeIn>
        </div>
      </section>

      {/* ─── Social Proof ─── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">People like you, already giving</h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { name: "Sophie M.", age: "28, Paris", quote: "I donated €400 last year without even thinking about it. The tax PDF saved me hours with my accountant." },
              { name: "Thomas L.", age: "34, Lyon", quote: "Finally an app that makes giving as easy as buying coffee. The charity profiles helped me discover causes I actually care about." },
              { name: "Marie D.", age: "41, Bordeaux", quote: "I set it up in 2 minutes and forgot about it. Best financial decision I made this year." },
            ].map((t, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="bg-navy-700 border border-[#1f4070] rounded-2xl p-6">
                  <p className="text-text-secondary text-sm leading-relaxed mb-4 italic">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue text-sm font-bold">{t.name[0]}{t.name.split(" ")[1][0]}</div>
                    <div><p className="text-text-primary text-sm font-semibold">{t.name}</p><p className="text-text-secondary text-xs">{t.age}</p></div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
          {/* Counters */}
          <FadeIn>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-10">
              {[["12,400+", "users"], ["€2.4M", "donated"], ["6", "verified charities"], ["4.8★", "average rating"]].map(([val, label], i) => (
                <div key={i} className="text-center"><p className="text-xl font-bold text-text-primary">{val}</p><p className="text-text-secondary text-xs">{label}</p></div>
              ))}
            </div>
          </FadeIn>
          {/* Charity logos */}
          <FadeIn className="text-center">
            <p className="text-text-secondary text-xs mb-3">Supported organisations</p>
            <div className="flex justify-center gap-6 opacity-50">
              {CHARITIES_DATA.map((c, i) => <span key={i} className="text-2xl grayscale">{c.icon}</span>)}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-24 px-6 bg-navy-800/50" style={{ scrollMarginTop: 80 }}>
        <div className="max-w-2xl mx-auto">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Questions you might have</h2>
          </FadeIn>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="bg-navy-700 border border-[#1f4070] rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    aria-expanded={faqOpen === i}
                    aria-controls={`faq-${i}`}
                    className="w-full flex items-center justify-between p-5 text-left min-h-[44px]"
                  >
                    <span className="text-text-primary text-sm font-semibold pr-4">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-text-secondary shrink-0 transition-transform ${faqOpen === i ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {faqOpen === i && (
                      <motion.div id={`faq-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <p className="px-5 pb-5 text-text-secondary text-sm leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.3} className="text-center mt-6">
            <p className="text-text-secondary text-sm">Still have questions? <a href="mailto:hello@roundup-app.com" className="text-accent-blue hover:underline">hello@roundup-app.com</a></p>
          </FadeIn>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-green/5 via-transparent to-accent-blue/5" />
        <div className="max-w-3xl mx-auto relative z-10">
          <FadeIn className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Start giving today. It takes 2 minutes.</h2>
            <p className="text-text-secondary text-lg">No commitment. Cancel anytime. Your first week of round ups is on us.</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <form onSubmit={handleEarlyAccess} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 bg-navy-700 border border-[#1f4070] rounded-xl text-text-primary placeholder:text-[#5a7da8] focus:outline-none focus:border-accent-blue"
                />
                <button type="submit" className="w-full py-3 bg-accent-green text-navy-900 font-bold rounded-xl min-h-[44px] hover:bg-accent-green/90 transition-colors">Get Early Access</button>
                {emailStatus && <p className="text-accent-green text-xs text-center">{emailStatus}</p>}
              </form>
              <div className="flex items-center justify-center">
                <Link href="/signup" className="w-full py-3 bg-accent-blue text-navy-900 font-bold rounded-xl text-center min-h-[44px] flex items-center justify-center hover:bg-accent-blue/90 transition-colors">Create Account</Link>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.2} className="flex flex-wrap justify-center gap-6 text-xs text-text-secondary mb-4">
            <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Bank-grade encryption</span>
            <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> GDPR compliant</span>
            <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Don en Confiance partners</span>
          </FadeIn>
          <p className="text-center text-text-secondary/50 text-xs">Questions? hello@roundup-app.com</p>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#1f4070] py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <p className="text-lg font-bold mb-2">💚 RoundUp</p>
            <p className="text-text-secondary text-sm mb-2">Donate effortlessly. Save on taxes.</p>
            <p className="text-text-secondary/60 text-xs">Made with care in Paris</p>
          </div>
          <div>
            <p className="text-text-primary font-semibold text-sm mb-3">Product</p>
            <div className="space-y-2">
              {[["how", "How It Works"], ["charities", "Charities"], ["calculator", "Tax Calculator"], ["faq", "FAQ"]].map(([id, label]) => (
                <button key={id} onClick={() => scrollTo(id)} className="block text-text-secondary text-sm hover:text-text-primary transition-colors">{label}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-text-primary font-semibold text-sm mb-3">Legal</p>
            <div className="space-y-2 text-text-secondary text-sm">
              <p>Privacy Policy</p><p>Terms of Service</p><p>Contact</p><p>Press Kit</p>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto border-t border-[#1f4070] pt-6">
          <p className="text-text-secondary/50 text-xs text-center mb-2">© 2026 RoundUp SAS. All rights reserved.</p>
          <p className="text-text-secondary/40 text-xs text-center">RoundUp is not a financial advisor. Tax calculations are estimates. Consult your accountant for personalized advice.</p>
        </div>
      </footer>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "RoundUp",
            description: "Donate effortlessly by rounding up every purchase. Track your tax deductions in real time.",
            url: "https://roundup-app.com",
          }),
        }}
      />
    </div>
  );
}
