'use client';

import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Tax savings', href: '#tax-savings' },
  { label: 'Charities', href: '#charities' },
  { label: 'FAQ', href: '#faq' },
];

export function StickyNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.3s ease, backdrop-filter 0.3s ease, border-color 0.3s ease',
        backgroundColor: scrolled ? 'var(--nav-bg)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-primary)' : '1px solid transparent',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <a
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            textDecoration: 'none',
            color: 'var(--text-primary)',
            fontSize: '20px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          Round
          <span style={{ color: 'var(--accent-green)' }}>Up</span>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-green)',
              marginLeft: '2px',
              marginBottom: '8px',
            }}
          />
        </a>

        {/* Desktop links */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
          }}
          className="landing-nav-desktop"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = 'var(--text-secondary)';
              }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="/signup"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '44px',
              padding: '0 24px',
              backgroundColor: 'var(--accent-green)',
              color: '#121212',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'transform 0.15s ease, filter 0.15s ease',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.filter = 'brightness(1.1)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.filter = 'brightness(1)';
            }}
          >
            Sign Up
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="landing-nav-mobile-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          style={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
          }}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            top: '64px',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'var(--bg-primary)',
            zIndex: 99,
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            gap: '8px',
            animation: 'fadeSlideDown 0.2s ease',
          }}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                color: 'var(--text-primary)',
                textDecoration: 'none',
                fontSize: '18px',
                fontWeight: 500,
                padding: '16px 0',
                borderBottom: '1px solid var(--border-primary)',
              }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="/signup"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '52px',
              marginTop: '16px',
              backgroundColor: 'var(--accent-green)',
              color: '#121212',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Sign Up
          </a>
        </div>
      )}
    </nav>
  );
}
