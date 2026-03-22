'use client';

import { motion } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

export function Comparison() {
  return (
    <section
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
        style={{ textAlign: 'center', marginBottom: '64px' }}
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
          The difference is in the cents
        </h2>
      </motion.div>

      <div
        className="landing-comparison-grid"
        style={{
          display: 'grid',
          gap: '20px',
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        {/* Without RoundUp */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          style={{
            padding: '36px 32px',
            borderRadius: '24px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Muted overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.15)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-card-inner)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={20} color="var(--text-dim)" />
              </div>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--text-dim)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Without RoundUp
              </span>
            </div>

            <p
              style={{
                fontSize: 'clamp(18px, 2.5vw, 22px)',
                lineHeight: 1.5,
                color: 'var(--text-dim)',
                fontWeight: 500,
              }}
            >
              You spend{' '}
              <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
                \u20AC4.30
              </span>{' '}
              on coffee. The 70 cents disappear into thin air.
            </p>

            <div
              style={{
                marginTop: '24px',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-card-inner)',
                fontSize: '13px',
                color: 'var(--text-dim)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              \u20AC0.70 \u2192 gone
            </div>
          </div>
        </motion.div>

        {/* With RoundUp */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            padding: '36px 32px',
            borderRadius: '24px',
            border: '1px solid rgba(134, 239, 172, 0.2)',
            background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(134, 239, 172, 0.04) 100%)',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: 'rgba(134, 239, 172, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={20} color="var(--accent-green)" />
            </div>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--accent-green)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              With RoundUp
            </span>
          </div>

          <p
            style={{
              fontSize: 'clamp(18px, 2.5vw, 22px)',
              lineHeight: 1.5,
              color: 'var(--text-primary)',
              fontWeight: 500,
            }}
          >
            You spend{' '}
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              \u20AC4.30
            </span>{' '}
            on coffee. The 70 cents fund a meal for someone in need.
          </p>

          <div
            style={{
              marginTop: '24px',
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(134, 239, 172, 0.08)',
              border: '1px solid rgba(134, 239, 172, 0.12)',
              fontSize: '13px',
              color: 'var(--accent-green)',
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            \u20AC0.70 \u2192 1 meal provided
          </div>
        </motion.div>
      </div>
    </section>
  );
}
