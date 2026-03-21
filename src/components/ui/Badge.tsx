'use client';

import { type ReactNode } from 'react';

type BadgeVariant = 'green' | 'blue' | 'purple' | 'red' | 'yellow' | 'orange';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  green: 'bg-accent-green/15 text-accent-green',
  blue: 'bg-accent-blue/15 text-accent-blue',
  purple: 'bg-accent-purple/15 text-accent-purple',
  red: 'bg-accent-red/15 text-accent-red',
  yellow: 'bg-accent-yellow/15 text-accent-yellow',
  orange: 'bg-accent-orange/15 text-accent-orange',
};

export function Badge({
  children,
  variant = 'green',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}
