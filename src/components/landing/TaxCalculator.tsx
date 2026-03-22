'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator } from 'lucide-react';

const countries = [
  { code: 'FR', flag: '\uD83C\uDDEB\uD83C\uDDF7', name: 'France' },
  { code: 'UK', flag: '\uD83C\uDDEC\uD83C\uDDE7', name: 'UK' },
  { code: 'DE', flag: '\uD83C\uDDE9\uD83C\uDDEA', name: 'Germany' },
  { code: 'BE', flag: '\uD83C\uDDE7\uD83C\uDDEA', name: 'Belgium' },
  { code: 'ES', flag: '\uD83C\uDDEA\uD83C\uDDF8', name: 'Spain' },
];

const brackets = [
  { label: '<\u20AC25k', value: 0 },
  { label: '\u20AC25k\u201350k', value: 1 },
  { label: '\u20AC50k\u2013100k', value: 2 },
  { label: '>\u20AC100k', value: 3 },
];

const donationOptions = [5, 10, 15, 20, 30];

// Client-side tax calculation (mirrors server lib/tax.ts logic)
function clientCalculateDeduction(
  amount: number,
  jurisdiction: string,
  incomeBracket: number,
): number {
  switch (jurisdiction) {
    case 'FR': {
      // Loi Coluche: 75% up to 2000 for enhanced charities
      const enhancedPortion = Math.min(amount, 2000);
      return enhancedPortion * 0.75;
    }
    case 'UK': {
      const basicReclaim = amount * 0.25;
      if (incomeBracket >= 3) return basicReclaim + amount * 0.25;
      if (incomeBracket >= 2) return basicReclaim + amount * 0.20;
      return basicReclaim;
    }
    case 'DE': {
      const rates: Record<number, number> = { 0: 14, 1: 30, 2: 42, 3: 45 };
      const rate = rates[incomeBracket] ?? 14;
      return amount * (rate / 100);
    }
    case 'ES': {
      const firstTier = Math.min(amount, 250);
      const secondTier = Math.max(0, amount - 250);
      return firstTier * 0.80 + secondTier * 0.35;
    }
    case 'BE': {
      return amount * 0.30;
    }
    default:
      return 0;
  }
}

export function TaxCalculator() {
  const [country, setCountry] = useState('FR');
  const [bracket, setBracket] = useState(1);
  const [monthly, setMonthly] = useState(15);

  const results = useMemo(() => {
    const annual = monthly * 12;
    const deduction = clientCalculateDeduction(annual, country, bracket);
    const realCost = Math.max(0, annual - deduction);
    const meals = Math.floor(annual / 3);
    const kits = Math.floor(annual / 15);
    return {
      annual: Math.round(annual),
      deduction: Math.round(deduction),
      realCost: Math.round(realCost),
      meals,
      kits,
    };
  }, [country, bracket, monthly]);

  return (
    <section
      id="tax-savings"
      style={{
        padding: '120px 24px',
        background: 'linear-gradient(180deg, transparent 0%, var(--bg-secondary) 15%, var(--bg-secondary) 85%, transparent 100%)',
      }}
    >
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '56px' }}
        >
          <p
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--accent-yellow)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '12px',
            }}
          >
            Tax calculator
          </p>
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              lineHeight: 1.1,
            }}
          >
            See your tax savings
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            borderRadius: '24px',
            padding: '32px',
          }}
        >
          {/* Country selector */}
          <div style={{ marginBottom: '28px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Country
            </label>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              {countries.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCountry(c.code)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    borderRadius: '100px',
                    border: country === c.code
                      ? '2px solid var(--accent-green)'
                      : '1px solid var(--border-primary)',
                    backgroundColor: country === c.code
                      ? 'rgba(134, 239, 172, 0.08)'
                      : 'var(--bg-card-inner)',
                    color: country === c.code
                      ? 'var(--accent-green)'
                      : 'var(--text-secondary)',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{c.flag}</span>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Income bracket */}
          <div style={{ marginBottom: '28px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Income bracket
            </label>
            <div
              style={{
                display: 'flex',
                backgroundColor: 'var(--bg-card-inner)',
                borderRadius: '12px',
                padding: '4px',
                gap: '2px',
              }}
            >
              {brackets.map((b) => (
                <button
                  key={b.value}
                  onClick={() => setBracket(b.value)}
                  style={{
                    flex: 1,
                    padding: '10px 8px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: bracket === b.value
                      ? 'var(--bg-card)'
                      : 'transparent',
                    color: bracket === b.value
                      ? 'var(--text-primary)'
                      : 'var(--text-dim)',
                    fontSize: '13px',
                    fontWeight: bracket === b.value ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: bracket === b.value
                      ? '0 1px 3px var(--shadow)'
                      : 'none',
                  }}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Monthly donation */}
          <div style={{ marginBottom: '36px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Monthly round-ups
            </label>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              {donationOptions.map((d) => (
                <button
                  key={d}
                  onClick={() => setMonthly(d)}
                  style={{
                    padding: '10px 20px',
                    minHeight: 44,
                    borderRadius: '12px',
                    border: monthly === d
                      ? '2px solid var(--accent-green)'
                      : '1px solid var(--border-primary)',
                    backgroundColor: monthly === d
                      ? 'rgba(134, 239, 172, 0.08)'
                      : 'var(--bg-card-inner)',
                    color: monthly === d
                      ? 'var(--accent-green)'
                      : 'var(--text-secondary)',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  \u20AC{d}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              height: '1px',
              backgroundColor: 'var(--border-primary)',
              marginBottom: '32px',
            }}
          />

          {/* Results */}
          <div
            style={{
              display: 'grid',
              gap: '12px',
            }}
            className="landing-tax-results"
          >
            <div
              style={{
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: 'rgba(134, 239, 172, 0.06)',
                border: '1px solid rgba(134, 239, 172, 0.12)',
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  color: 'var(--text-dim)',
                  marginBottom: '4px',
                  fontWeight: 500,
                }}
              >
                You contribute
              </div>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  color: 'var(--accent-green)',
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.02em',
                }}
              >
                \u20AC{results.annual}
                <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-dim)' }}>
                  /year
                </span>
              </div>
            </div>

            <div
              style={{
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: 'rgba(96, 165, 250, 0.06)',
                border: '1px solid rgba(96, 165, 250, 0.12)',
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  color: 'var(--text-dim)',
                  marginBottom: '4px',
                  fontWeight: 500,
                }}
              >
                You get back
              </div>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  color: 'var(--accent-blue)',
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.02em',
                }}
              >
                \u20AC{results.deduction}
              </div>
            </div>

            <div
              style={{
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: 'rgba(251, 191, 36, 0.06)',
                border: '1px solid rgba(251, 191, 36, 0.12)',
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  color: 'var(--text-dim)',
                  marginBottom: '4px',
                  fontWeight: 500,
                }}
              >
                Real cost
              </div>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  color: 'var(--accent-yellow)',
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.02em',
                }}
              >
                \u20AC{results.realCost}
              </div>
            </div>
          </div>

          {/* Impact context */}
          <div
            style={{
              marginTop: '20px',
              padding: '16px 20px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-card-inner)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <Calculator size={18} color="var(--text-dim)" />
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              That is{' '}
              <span style={{ fontWeight: 600, color: 'var(--accent-green)' }}>
                {results.meals} meals
              </span>{' '}
              or{' '}
              <span style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>
                {results.kits} school supply kits
              </span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
