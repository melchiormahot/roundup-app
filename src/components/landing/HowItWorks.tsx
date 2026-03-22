'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, Coins, Receipt } from 'lucide-react';

const steps = [
  {
    icon: ShoppingBag,
    title: 'Shop as usual',
    description: 'Pay with your card. We round up to the nearest euro.',
    color: 'var(--accent-green)',
    step: '01',
  },
  {
    icon: Coins,
    title: 'Round\u2011ups add up',
    description: 'Your spare change flows to charities you choose.',
    color: 'var(--accent-blue)',
    step: '02',
  },
  {
    icon: Receipt,
    title: 'Save on taxes',
    description: 'Track your tax deductions automatically.',
    color: 'var(--accent-purple)',
    step: '03',
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      style={{
        padding: '120px 24px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: '72px' }}
      >
        <p
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--accent-green)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '12px',
          }}
        >
          How it works
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
          Three steps to meaningful giving
        </h2>
      </motion.div>

      <div
        style={{
          display: 'grid',
          gap: '24px',
        }}
        className="landing-steps-grid"
      >
        {steps.map((step, i) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{
              duration: 0.6,
              delay: i * 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              padding: '40px 32px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              borderRadius: '24px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Step number watermark */}
            <span
              style={{
                position: 'absolute',
                top: '16px',
                right: '24px',
                fontSize: '72px',
                fontWeight: 900,
                color: 'var(--border-primary)',
                lineHeight: 1,
                letterSpacing: '-0.04em',
                opacity: 0.5,
              }}
            >
              {step.step}
            </span>

            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: step.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
              }}
            >
              <step.icon size={28} color="#121212" strokeWidth={2.2} />
            </div>

            <h3
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '12px',
                letterSpacing: '-0.01em',
              }}
            >
              {step.title}
            </h3>
            <p
              style={{
                fontSize: '15px',
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
                maxWidth: '280px',
              }}
            >
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
