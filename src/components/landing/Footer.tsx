'use client';

const productLinks = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Tax savings', href: '#tax-savings' },
  { label: 'Charities', href: '#charities' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Dashboard', href: '/dashboard' },
];

const companyLinks = [
  { label: 'About', href: '#' },
  { label: 'Blog', href: '#' },
  { label: 'Careers', href: '#' },
  { label: 'Contact', href: '#' },
];

const legalLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Cookie Policy', href: '#' },
  { label: 'Legal Notice', href: '#' },
];

function SocialIcon({ path, label }: { path: string; label: string }) {
  return (
    <a
      href="#"
      aria-label={label}
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        backgroundColor: 'var(--bg-card-inner)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.2s ease',
        color: 'var(--text-dim)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-card)';
        (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-card-inner)';
        (e.currentTarget as HTMLElement).style.color = 'var(--text-dim)';
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={path} />
      </svg>
    </a>
  );
}

export function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-primary)',
        padding: '64px 24px 32px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Main grid */}
        <div
          className="landing-footer-grid"
          style={{
            display: 'grid',
            gap: '48px',
            marginBottom: '48px',
          }}
        >
          {/* Brand + social */}
          <div>
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
                marginBottom: '16px',
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
            <p
              style={{
                fontSize: '14px',
                lineHeight: 1.6,
                color: 'var(--text-dim)',
                marginBottom: '24px',
                maxWidth: '260px',
              }}
            >
              Turn your spare change into meaningful impact. Give effortlessly, save on taxes.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <SocialIcon
                label="Twitter"
                path="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"
              />
              <SocialIcon
                label="LinkedIn"
                path="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"
              />
              <SocialIcon
                label="Instagram"
                path="M3 7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7zm9 9a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm5-9.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"
              />
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '20px',
              }}
            >
              Product
            </h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {productLinks.map((link) => (
                <li key={link.label} style={{ marginBottom: '12px' }}>
                  <a
                    href={link.href}
                    style={{
                      color: 'var(--text-dim)',
                      textDecoration: 'none',
                      fontSize: '14px',
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.color = 'var(--text-dim)';
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '20px',
              }}
            >
              Company
            </h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {companyLinks.map((link) => (
                <li key={link.label} style={{ marginBottom: '12px' }}>
                  <a
                    href={link.href}
                    style={{
                      color: 'var(--text-dim)',
                      textDecoration: 'none',
                      fontSize: '14px',
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.color = 'var(--text-dim)';
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h4
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '20px',
              }}
            >
              Legal
            </h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {legalLinks.map((link) => (
                <li key={link.label} style={{ marginBottom: '12px' }}>
                  <a
                    href={link.href}
                    style={{
                      color: 'var(--text-dim)',
                      textDecoration: 'none',
                      fontSize: '14px',
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.color = 'var(--text-dim)';
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div
          style={{
            borderTop: '1px solid var(--border-primary)',
            paddingTop: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '12px',
              color: 'var(--text-dim)',
              lineHeight: 1.5,
              maxWidth: '500px',
            }}
          >
            RoundUp is a demonstration application built for educational purposes. No real transactions are processed and no real money is transferred.
          </p>
          <p
            style={{
              fontSize: '12px',
              color: 'var(--text-dim)',
            }}
          >
            \u00A9 {new Date().getFullYear()} RoundUp. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
