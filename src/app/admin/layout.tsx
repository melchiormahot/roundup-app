'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Workflow,
  Heart,
  Building2,
  Receipt,
  Bell,
  Rocket,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Onboarding', href: '/admin/onboarding', icon: Workflow },
  { label: 'Donations', href: '/admin/donations', icon: Heart },
  { label: 'Charities', href: '/admin/charities', icon: Building2 },
  { label: 'Tax', href: '/admin/tax-analytics', icon: Receipt },
  { label: 'Notifications', href: '/admin/notification-analytics', icon: Bell },
  { label: 'Early Access', href: '/admin/early-access', icon: Rocket },
  { label: 'Progression', href: '/admin/progression', icon: TrendingUp },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => {
        if (data.isAdmin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      })
      .catch(() => setIsAdmin(false));
  }, []);

  if (isAdmin === null) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <div
          className="animate-pulse text-lg"
          style={{ color: 'var(--text-secondary)' }}
        >
          Loading...
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen gap-4"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <h1
          className="text-6xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          404
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          This page could not be found.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-4 px-4 py-2 rounded-lg text-sm font-medium"
          style={{
            backgroundColor: 'var(--accent-green)',
            color: 'var(--bg-primary)',
          }}
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  }

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-60 shrink-0 border-r min-h-screen sticky top-0"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <div
          className="flex items-center gap-2 px-5 py-4 border-b"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <ShieldCheck
            size={20}
            style={{ color: 'var(--accent-purple)' }}
          />
          <span
            className="font-semibold text-sm"
            style={{ color: 'var(--text-primary)' }}
          >
            Admin
          </span>
          <span
            className="ml-auto px-2 py-0.5 rounded text-[10px] font-bold uppercase"
            style={{
              backgroundColor: 'var(--accent-purple)',
              color: 'var(--bg-primary)',
            }}
          >
            Admin
          </span>
        </div>

        <nav className="flex-1 py-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className="w-full flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: active
                    ? 'var(--bg-card)'
                    : 'transparent',
                  color: active
                    ? 'var(--accent-green)'
                    : 'var(--text-secondary)',
                  borderRight: active
                    ? '3px solid var(--accent-green)'
                    : '3px solid transparent',
                }}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile top tabs */}
      <div
        className="md:hidden sticky top-0 z-50 border-b overflow-x-auto"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <div className="flex items-center gap-1 px-3 py-2 min-w-max">
          <ShieldCheck
            size={16}
            style={{ color: 'var(--accent-purple)' }}
            className="mr-1 shrink-0"
          />
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
                style={{
                  backgroundColor: active
                    ? 'var(--accent-green)'
                    : 'transparent',
                  color: active
                    ? 'var(--bg-primary)'
                    : 'var(--text-secondary)',
                }}
              >
                <Icon size={14} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
