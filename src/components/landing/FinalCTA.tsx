'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Clock, Lock } from 'lucide-react';

const trustBadges = [
  { icon: Shield, label: 'Bank level security' },
  { icon: Clock, label: 'Cancel anytime' },
  { icon: Lock, label: 'GDPR compliant' },
];

export function FinalCTA() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/early-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'You are on the list!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  return (
    <section
      style={{
        padding: '120px 24px',
        background: 'linear-gradient(180deg, transparent 0%, var(--bg-secondary) 20%, var(--bg-secondary) 80%, transparent 100%)',
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, var(--accent-green), rgba(134, 239, 172, 0.6))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 32px',
            }}
          >
            <ArrowRight size={28} color="#121212" strokeWidth={2.5} />
          </div>

          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              lineHeight: 1.1,
              marginBottom: '16px',
            }}
          >
            Start making a difference today
          </h2>
          <p
            style={{
              fontSize: '16px',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              marginBottom: '40px',
              maxWidth: '440px',
              margin: '0 auto 40px',
            }}
          >
            Join thousands of people turning their everyday purchases into meaningful impact.
          </p>

          {/* Email form */}
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              gap: '12px',
              maxWidth: '480px',
              margin: '0 auto 16px',
            }}
            className="landing-cta-form"
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status !== 'idle') setStatus('idle');
              }}
              required
              style={{
                flex: 1,
                height: '52px',
                padding: '0 20px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-primary)',
                borderRadius: '14px',
                color: 'var(--text-primary)',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-green)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-primary)';
              }}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                height: '52px',
                padding: '0 28px',
                backgroundColor: 'var(--accent-green)',
                color: '#121212',
                border: 'none',
                borderRadius: '14px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: status === 'loading' ? 'wait' : 'pointer',
                whiteSpace: 'nowrap',
                transition: 'filter 0.15s ease, transform 0.15s ease',
                opacity: status === 'loading' ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (status !== 'loading') {
                  (e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.filter = 'brightness(1)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              {status === 'loading' ? 'Sending...' : 'Create Account'}
            </button>
          </form>

          {/* Status messages */}
          {status === 'success' && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                fontSize: '14px',
                color: 'var(--accent-green)',
                fontWeight: 500,
                marginBottom: '8px',
              }}
            >
              {message}
            </motion.p>
          )}
          {status === 'error' && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                fontSize: '14px',
                color: 'var(--accent-red)',
                fontWeight: 500,
                marginBottom: '8px',
              }}
            >
              {message}
            </motion.p>
          )}

          {/* Link to signup */}
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-dim)',
              marginBottom: '48px',
            }}
          >
            Or{' '}
            <a
              href="/signup"
              style={{
                color: 'var(--accent-green)',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              }}
            >
              sign up with email and password
            </a>
          </p>

          {/* Trust badges */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              flexWrap: 'wrap',
            }}
          >
            {trustBadges.map((badge) => (
              <div
                key={badge.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: 'var(--text-dim)',
                  fontWeight: 500,
                }}
              >
                <badge.icon size={16} color="var(--text-dim)" />
                {badge.label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
