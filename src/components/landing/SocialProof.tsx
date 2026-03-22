'use client';

import { motion } from 'framer-motion';
import { Star, Users, HandHeart, Building2 } from 'lucide-react';

const testimonials = [
  {
    name: 'Sophie M.',
    location: 'Paris',
    text: 'I barely notice the round ups, but the impact report at the end of each month always surprises me. It is the easiest way to give back.',
    rating: 5,
  },
  {
    name: 'Thomas D.',
    location: 'Lyon',
    text: 'The tax deduction alone pays for itself. I donated \u20AC180 last year and got \u20AC135 back on my taxes. It is basically free giving.',
    rating: 5,
  },
  {
    name: 'Marie L.',
    location: 'Bordeaux',
    text: 'I love seeing exactly where my money goes. The impact tracking shows every meal, every kit, every treatment my spare change funded.',
    rating: 5,
  },
];

const counters = [
  { icon: Users, value: '12,400+', label: 'users' },
  { icon: HandHeart, value: '\u20AC850,000+', label: 'donated' },
  { icon: Building2, value: '45', label: 'charities' },
];

const charityNames = [
  'MSF', 'UNICEF', 'WWF', 'ACF', 'Croix-Rouge', 'Secours Populaire',
  'Fondation Abb\u00E9 Pierre', 'SOS Villages',
];

export function SocialProof() {
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
            color: 'var(--accent-green)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '12px',
          }}
        >
          Loved by givers
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
          What our users say
        </h2>
      </motion.div>

      {/* Testimonials */}
      <div
        className="landing-testimonials-grid"
        style={{
          display: 'grid',
          gap: '16px',
          marginBottom: '64px',
        }}
      >
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{
              duration: 0.5,
              delay: i * 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              padding: '28px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Stars */}
            <div
              style={{
                display: 'flex',
                gap: '2px',
                marginBottom: '16px',
              }}
            >
              {Array.from({ length: t.rating }).map((_, si) => (
                <Star
                  key={si}
                  size={16}
                  fill="var(--accent-yellow)"
                  color="var(--accent-yellow)"
                />
              ))}
            </div>

            <p
              style={{
                fontSize: '15px',
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
                flex: 1,
                marginBottom: '20px',
              }}
            >
              &ldquo;{t.text}&rdquo;
            </p>

            <div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                {t.name}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: 'var(--text-dim)',
                }}
              >
                {t.location}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Counter row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
        className="landing-counters-grid"
        style={{
          display: 'grid',
          gap: '16px',
          marginBottom: '48px',
        }}
      >
        {counters.map((c) => (
          <div
            key={c.label}
            style={{
              textAlign: 'center',
              padding: '24px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              borderRadius: '16px',
            }}
          >
            <c.icon
              size={24}
              color="var(--accent-green)"
              style={{ margin: '0 auto 12px' }}
            />
            <div
              style={{
                fontSize: '24px',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {c.value}
            </div>
            <div
              style={{
                fontSize: '13px',
                color: 'var(--text-dim)',
                marginTop: '4px',
              }}
            >
              {c.label}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Charity logo row */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {charityNames.map((name) => (
          <div
            key={name}
            style={{
              padding: '8px 16px',
              borderRadius: '100px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-dim)',
            }}
          >
            {name}
          </div>
        ))}
      </motion.div>
    </section>
  );
}
