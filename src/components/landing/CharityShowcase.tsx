'use client';

import { motion } from 'framer-motion';
import { Heart, GraduationCap, TreePine, Droplets, Baby, Globe } from 'lucide-react';

const charities = [
  {
    name: 'M\u00E9decins Sans Fronti\u00E8res',
    mission: 'Emergency medical aid in over 70 countries.',
    stat: '4.8M patients treated in 2024',
    taxBadge: '75%',
    color: '#dc2626',
    icon: Heart,
  },
  {
    name: 'UNICEF France',
    mission: 'Protecting children worldwide through health, education, and protection.',
    stat: '190 countries reached',
    taxBadge: '75%',
    color: '#00aeef',
    icon: Baby,
  },
  {
    name: 'Action contre la Faim',
    mission: 'Fighting hunger through nutrition, food security, and clean water.',
    stat: '28M people supported',
    taxBadge: '75%',
    color: '#e85d00',
    icon: Droplets,
  },
  {
    name: 'Fondation Abbé Pierre',
    mission: 'Providing shelter and fighting poor housing conditions.',
    stat: '950K people housed',
    taxBadge: '75%',
    color: '#f59e0b',
    icon: Globe,
  },
  {
    name: 'WWF France',
    mission: 'Conserving nature and reducing threats to biodiversity.',
    stat: '100+ conservation projects',
    taxBadge: '66%',
    color: '#16a34a',
    icon: TreePine,
  },
  {
    name: 'Secours Populaire',
    mission: 'Combating poverty and exclusion with solidarity programs.',
    stat: '3.5M people helped',
    taxBadge: '75%',
    color: '#7c3aed',
    icon: GraduationCap,
  },
];

export function CharityShowcase() {
  return (
    <section
      id="charities"
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
            color: 'var(--accent-purple)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '12px',
          }}
        >
          Our partners
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
          Trusted charities, real impact
        </h2>
      </motion.div>

      <div
        className="landing-charity-grid"
        style={{
          display: 'grid',
          gap: '16px',
        }}
      >
        {charities.map((charity, i) => (
          <motion.div
            key={charity.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{
              duration: 0.5,
              delay: i * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              borderRadius: '20px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Accent bar */}
            <div
              style={{
                height: '4px',
                backgroundColor: charity.color,
              }}
            />

            <div style={{ padding: '24px' }}>
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      backgroundColor: charity.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0.9,
                    }}
                  >
                    <charity.icon size={20} color="white" />
                  </div>
                  <h3
                    style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {charity.name}
                  </h3>
                </div>

                {/* Tax badge */}
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    backgroundColor: 'rgba(134, 239, 172, 0.1)',
                    color: 'var(--accent-green)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {charity.taxBadge} back
                </span>
              </div>

              <p
                style={{
                  fontSize: '14px',
                  lineHeight: 1.5,
                  color: 'var(--text-secondary)',
                  marginBottom: '16px',
                }}
              >
                {charity.mission}
              </p>

              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg-card-inner)',
                  borderRadius: '10px',
                  fontSize: '13px',
                  color: 'var(--text-dim)',
                  fontWeight: 500,
                }}
              >
                {charity.stat}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
