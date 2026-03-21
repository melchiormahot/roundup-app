'use client';

import Link from 'next/link';
import { Home, Heart, Receipt, Bell, Settings } from 'lucide-react';
import { type ReactNode } from 'react';

interface NavTab {
  href: string;
  label: string;
  icon: ReactNode;
  minLevel: number;
  /** If true, show unread dot when unreadCount > 0 */
  showBadge?: boolean;
}

const TABS: NavTab[] = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: <Home size={22} />,
    minLevel: 1,
  },
  {
    href: '/charities',
    label: 'Charities',
    icon: <Heart size={22} />,
    minLevel: 1,
  },
  {
    href: '/tax',
    label: 'Tax',
    icon: <Receipt size={22} />,
    minLevel: 2,
  },
  {
    href: '/notifications',
    label: 'Alerts',
    icon: <Bell size={22} />,
    minLevel: 2,
    showBadge: true,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: <Settings size={22} />,
    minLevel: 1,
  },
];

interface BottomNavProps {
  level: number;
  unreadCount: number;
  currentPath: string;
}

export function BottomNav({ level, unreadCount, currentPath }: BottomNavProps) {
  const visibleTabs = TABS.filter((tab) => level >= tab.minLevel);

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border-primary bg-nav-bg backdrop-blur-xl safe-bottom"
    >
      <ul className="mx-auto flex max-w-lg items-center justify-around px-2">
        {visibleTabs.map((tab) => {
          const isActive =
            currentPath === tab.href ||
            (tab.href !== '/dashboard' && currentPath.startsWith(tab.href));

          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={[
                  'relative flex min-h-[48px] min-w-[44px] flex-col items-center justify-center gap-0.5 px-3 py-1.5',
                  'text-xs transition-colors duration-150',
                  isActive
                    ? 'text-accent-green'
                    : 'text-text-dim hover:text-text-secondary',
                ].join(' ')}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="relative">
                  {tab.icon}
                  {tab.showBadge && unreadCount > 0 && (
                    <span
                      className="absolute -right-1.5 -top-1 h-2.5 w-2.5 rounded-full bg-accent-red ring-2 ring-[var(--bg-primary)]"
                      aria-label={`${unreadCount} unread notifications`}
                    />
                  )}
                </span>
                <span className="font-medium leading-tight">{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
