'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Heart, RotateCcw, ArrowRight } from 'lucide-react';

type DemoState = 'idle' | 'paying' | 'roundup' | 'donated' | 'impact';

export function LiveDemo() {
  const [state, setState] = useState<DemoState>('idle');

  const handlePay = useCallback(() => {
    setState('paying');
    setTimeout(() => setState('roundup'), 800);
    setTimeout(() => setState('donated'), 2000);
    setTimeout(() => setState('impact'), 3000);
  }, []);

  const handleReset = useCallback(() => {
    setState('idle');
  }, []);

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
        <p
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--accent-blue)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '12px',
          }}
        >
          Interactive demo
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
          Try it yourself
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
        style={{
          maxWidth: '480px',
          margin: '0 auto',
        }}
      >
        {/* Receipt card */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            borderRadius: '24px',
            padding: '32px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '32px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                backgroundColor: 'var(--bg-card-inner)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Coffee size={24} color="var(--accent-yellow)" />
            </div>
            <div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                Starbucks
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: 'var(--text-dim)',
                }}
              >
                Today at 9:32 AM
              </div>
            </div>
          </div>

          {/* Amount line */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 0',
              borderTop: '1px solid var(--border-primary)',
              borderBottom: '1px solid var(--border-primary)',
            }}
          >
            <span
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
              }}
            >
              Flat White
            </span>
            <span
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              \u20AC4.30
            </span>
          </div>

          {/* Round-up reveal */}
          <AnimatePresence>
            {(state === 'roundup' || state === 'donated' || state === 'impact') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ overflow: 'hidden' }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 0',
                    borderBottom: '1px solid var(--border-primary)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--accent-green)',
                    }}
                  >
                    Round up
                  </span>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
                    style={{
                      fontSize: '24px',
                      fontWeight: 700,
                      color: 'var(--accent-green)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    \u20AC0.70
                  </motion.span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Donation flow */}
          <AnimatePresence>
            {(state === 'donated' || state === 'impact') && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{
                  marginTop: '24px',
                  padding: '20px',
                  backgroundColor: 'var(--bg-card-inner)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Heart size={22} color="white" fill="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginBottom: '2px',
                    }}
                  >
                    M\u00E9decins Sans Fronti\u00E8res
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-dim)',
                    }}
                  >
                    \u20AC0.70 donated
                  </div>
                </div>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.4 }}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-green)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8L6.5 11.5L13 5" stroke="#121212" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Impact */}
          <AnimatePresence>
            {state === 'impact' && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{
                  marginTop: '16px',
                  padding: '16px 20px',
                  background: 'linear-gradient(135deg, rgba(134, 239, 172, 0.1) 0%, rgba(96, 165, 250, 0.08) 100%)',
                  borderRadius: '12px',
                  border: '1px solid rgba(134, 239, 172, 0.15)',
                  textAlign: 'center',
                }}
              >
                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--accent-green)',
                    fontWeight: 500,
                  }}
                >
                  That is one dose of malaria treatment
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action buttons */}
          <div style={{ marginTop: '32px' }}>
            {state === 'idle' && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handlePay}
                style={{
                  width: '100%',
                  height: '52px',
                  backgroundColor: 'var(--accent-green)',
                  color: '#121212',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'filter 0.15s ease, transform 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.filter = 'brightness(1)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                Pay \u20AC4.30
                <ArrowRight size={18} />
              </motion.button>
            )}

            {state === 'paying' && (
              <div
                style={{
                  width: '100%',
                  height: '52px',
                  backgroundColor: 'var(--bg-card-inner)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid var(--border-secondary)',
                    borderTopColor: 'var(--accent-green)',
                    borderRadius: '50%',
                  }}
                />
                Processing payment...
              </div>
            )}

            {state === 'impact' && (
              <button
                onClick={handleReset}
                style={{
                  width: '100%',
                  height: '48px',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '14px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'border-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--text-dim)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-primary)';
                }}
              >
                <RotateCcw size={16} />
                Try again
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
