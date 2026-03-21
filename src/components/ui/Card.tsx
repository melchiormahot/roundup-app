'use client';

import { type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  const isClickable = !!onClick;

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(e as unknown as MouseEvent<HTMLDivElement>);
    }
  }

  return (
    <div
      className={[
        'rounded-2xl border border-border-primary bg-bg-card p-4',
        'shadow-[0_1px_3px_var(--shadow)]',
        isClickable &&
          'cursor-pointer transition-all duration-200 hover:border-border-secondary hover:shadow-[0_4px_12px_var(--shadow)] active:scale-[0.98]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...(isClickable
        ? {
            role: 'button',
            tabIndex: 0,
            onClick,
            onKeyDown: handleKeyDown,
          }
        : {})}
    >
      {children}
    </div>
  );
}
