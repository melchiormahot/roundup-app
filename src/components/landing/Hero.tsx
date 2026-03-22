'use client';

import { motion } from 'framer-motion';

const microStats = [
  { value: '\u20AC2,000+', label: 'donated' },
  { value: '75%', label: 'tax return' },
  { value: '2 min', label: 'setup' },
];

export function Hero() {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: '100px 24px 80px',
      }}
    >
      {/* Background gradient orbs */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '20%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(42, 37, 34, 0.8) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            right: '10%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(134, 239, 172, 0.06) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: '30%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(51, 48, 43, 0.6) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1200px',
          width: '100%',
          display: 'grid',
          gap: '64px',
          alignItems: 'center',
        }}
        className="landing-hero-grid"
      >
        {/* Left: copy */}
        <div style={{ maxWidth: '600px' }}>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontSize: 'clamp(36px, 5.5vw, 64px)',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              marginBottom: '24px',
            }}
          >
            Every purchase you make can change the world.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontSize: 'clamp(16px, 2vw, 20px)',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              marginBottom: '40px',
              maxWidth: '480px',
            }}
          >
            Round up your spare change. Fund the causes you love. Save on your taxes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <a
              href="/signup"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '52px',
                padding: '0 32px',
                backgroundColor: 'var(--accent-green)',
                color: '#121212',
                borderRadius: '14px',
                fontSize: '16px',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'transform 0.15s ease, filter 0.15s ease',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.transform = 'translateY(-1px)';
                (e.target as HTMLElement).style.filter = 'brightness(1.1)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.transform = 'translateY(0)';
                (e.target as HTMLElement).style.filter = 'brightness(1)';
              }}
            >
              Get Started
            </a>
            <a
              href="#how-it-works"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '52px',
                padding: '0 32px',
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-secondary)',
                borderRadius: '14px',
                fontSize: '16px',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'border-color 0.2s ease, background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.borderColor = 'var(--text-dim)';
                (e.target as HTMLElement).style.backgroundColor = 'var(--bg-card)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.borderColor = 'var(--border-secondary)';
                (e.target as HTMLElement).style.backgroundColor = 'transparent';
              }}
            >
              See how it works
            </a>
          </motion.div>

          {/* Micro stat badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '48px',
              flexWrap: 'wrap',
            }}
          >
            {microStats.map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '100px',
                  fontSize: '13px',
                }}
              >
                <span style={{ fontWeight: 700, color: 'var(--accent-green)' }}>
                  {stat.value}
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: phone mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="landing-hero-phone"
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '280px',
              height: '560px',
              borderRadius: '36px',
              border: '3px solid var(--border-secondary)',
              backgroundColor: 'var(--bg-secondary)',
              padding: '16px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 0 0 1px var(--border-primary)',
            }}
          >
            {/* Notch */}
            <div
              style={{
                width: '120px',
                height: '28px',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '0 0 20px 20px',
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            />

            {/* Screen content */}
            <div style={{ marginTop: '36px' }}>
              <div
                style={{
                  fontSize: '13px',
                  color: 'var(--text-dim)',
                  marginBottom: '4px',
                }}
              >
                Total donated
              </div>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  color: 'var(--accent-green)',
                  letterSpacing: '-0.02em',
                  marginBottom: '24px',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                \u20AC127.40
              </div>

              {/* Mini chart bars */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '6px',
                  height: '80px',
                  marginBottom: '24px',
                }}
              >
                {[35, 52, 45, 68, 42, 78, 55, 90, 60, 72, 85, 95].map(
                  (h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 0.6, delay: 0.8 + i * 0.05 }}
                      style={{
                        flex: 1,
                        backgroundColor:
                          i === 11
                            ? 'var(--accent-green)'
                            : 'var(--bg-card-inner)',
                        borderRadius: '4px',
                      }}
                    />
                  )
                )}
              </div>

              {/* Recent transactions */}
              {[
                { name: 'Starbucks', amount: '\u20AC0.70', icon: '\u2615' },
                { name: 'Uber', amount: '\u20AC0.45', icon: '\uD83D\uDE97' },
                { name: 'Monoprix', amount: '\u20AC0.82', icon: '\uD83D\uDED2' },
              ].map((tx, i) => (
                <motion.div
                  key={tx.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 + i * 0.15 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: '12px',
                    marginBottom: '8px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{tx.icon}</span>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                      }}
                    >
                      {tx.name}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--accent-green)',
                    }}
                  >
                    +{tx.amount}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
