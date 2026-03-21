'use client';

import { useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  visible: boolean;
  onDismiss: () => void;
  /** Auto-dismiss duration in ms. Default 3000. Set 0 to disable. */
  duration?: number;
}

const typeStyles: Record<ToastType, string> = {
  success: 'border-accent-green/30 bg-accent-green/10 text-accent-green',
  error: 'border-accent-red/30 bg-accent-red/10 text-accent-red',
  info: 'border-accent-blue/30 bg-accent-blue/10 text-accent-blue',
};

export function Toast({
  message,
  type = 'info',
  visible,
  onDismiss,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    if (!visible || duration === 0) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [visible, duration, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={[
        'fixed bottom-6 left-1/2 z-50 -translate-x-1/2',
        'max-w-[calc(100vw-2rem)] rounded-2xl border px-5 py-3',
        'text-sm font-medium shadow-[0_8px_24px_var(--shadow)]',
        'backdrop-blur-lg transition-all duration-300',
        'safe-bottom',
        typeStyles[type],
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-4 opacity-0',
      ].join(' ')}
    >
      {message}
    </div>
  );
}
