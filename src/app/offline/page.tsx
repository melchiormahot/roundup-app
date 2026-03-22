'use client';

import { WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
        style={{ backgroundColor: 'var(--bg-card)' }}
      >
        <WifiOff
          className="h-10 w-10"
          style={{ color: 'var(--text-dim)' }}
        />
      </div>

      <h1
        className="mb-3 text-2xl font-bold"
        style={{ color: 'var(--text-primary)' }}
      >
        You&apos;re offline
      </h1>

      <p
        className="mb-8 max-w-sm text-base leading-relaxed"
        style={{ color: 'var(--text-secondary)' }}
      >
        Don&apos;t worry, your round-ups are safe. Connect to the internet to
        see the latest.
      </p>

      <button
        onClick={() => window.location.reload()}
        className="rounded-xl px-8 py-3 text-sm font-semibold transition-opacity active:opacity-80"
        style={{
          backgroundColor: 'var(--accent-green)',
          color: 'var(--bg-primary)',
        }}
      >
        Retry
      </button>
    </div>
  );
}
