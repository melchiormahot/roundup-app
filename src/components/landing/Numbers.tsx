'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface CounterProps {
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  decimals?: number;
}

function AnimatedCounter({ target, prefix = '', suffix = '', duration = 1200, decimals = 0 }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    let start: number | null = null;
    const from = 0;

    function animate(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(from + (target - from) * eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [isInView, target, duration]);

  return (
    <span ref={ref} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {prefix}
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
}

const numbers = [
  {
    target: 2000,
    prefix: '\u20AC',
    suffix: '',
    label: 'Maximum annual tax return in France',
    color: 'var(--accent-green)',
  },
  {
    target: 75,
    prefix: '',
    suffix: '%',
    label: 'Returned on qualifying contributions',
    color: 'var(--accent-blue)',
  },
  {
    target: 2,
    prefix: '',
    suffix: ' min',
    label: 'To set up and start giving',
    color: 'var(--accent-purple)',
  },
];

export function Numbers() {
  return (
    <section
      style={{
        padding: '120px 24px',
        background: 'linear-gradient(180deg, transparent 0%, var(--bg-secondary) 15%, var(--bg-secondary) 85%, transparent 100%)',
      }}
    >
      <div
        style={{
          maxWidth: '1000px',
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
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              lineHeight: 1.1,
            }}
          >
            Numbers that matter
          </h2>
        </motion.div>

        <div
          className="landing-numbers-grid"
          style={{
            display: 'grid',
            gap: '24px',
          }}
        >
          {numbers.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                duration: 0.6,
                delay: i * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                textAlign: 'center',
                padding: '48px 24px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-primary)',
                borderRadius: '24px',
              }}
            >
              <div
                style={{
                  fontSize: 'clamp(40px, 6vw, 64px)',
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  color: item.color,
                  lineHeight: 1,
                  marginBottom: '16px',
                }}
              >
                <AnimatedCounter
                  target={item.target}
                  prefix={item.prefix}
                  suffix={item.suffix}
                />
              </div>
              <p
                style={{
                  fontSize: '15px',
                  color: 'var(--text-secondary)',
                  maxWidth: '220px',
                  margin: '0 auto',
                  lineHeight: 1.5,
                }}
              >
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
