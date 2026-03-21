'use client';

import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-accent-green text-[#121212] font-semibold hover:brightness-110 active:brightness-95',
  secondary:
    'border border-border-primary bg-transparent text-text-primary hover:bg-bg-card-inner active:bg-bg-card',
  danger:
    'bg-accent-red text-[#121212] font-semibold hover:brightness-110 active:brightness-95',
  ghost:
    'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-card-inner active:bg-bg-card',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-[44px] min-w-[44px] px-3 py-2 text-sm rounded-xl',
  md: 'min-h-[44px] min-w-[44px] px-4 py-2.5 text-sm rounded-xl',
  lg: 'min-h-[48px] min-w-[48px] px-6 py-3 text-base rounded-2xl',
};

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center gap-2 transition-all duration-150',
        'select-none',
        variantClasses[variant],
        sizeClasses[size],
        isDisabled && 'pointer-events-none opacity-50',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
