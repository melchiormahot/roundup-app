'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { X, Download, Share } from 'lucide-react';

// ─── Haptic feedback system ──────────────────────────────────────────

export function useHaptics() {
  return {
    light: () => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
    },
    medium: () => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(25);
    },
    success: () => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([10, 50, 20]);
    },
    error: () => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([50, 30, 50]);
    },
  };
}

// ─── Service Worker Registrar ────────────────────────────────────────

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // Check for updates on page focus
        const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
            registration.update();
          }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Handle waiting worker (update available)
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // New content available; optionally prompt user to reload
              if (confirm('A new version of RoundUp is available. Reload to update?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        });

        return () => {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
      })
      .catch((err) => {
        console.error('SW registration failed:', err);
      });
  }, []);

  return null;
}

// ─── Install Prompt ──────────────────────────────────────────────────

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const VISIT_COUNT_KEY = 'roundup-visit-count';
const INSTALL_DISMISSED_KEY = 'roundup-install-dismissed';

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone === true)
  );
}

export function InstallPrompt() {
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Don't show if already installed as standalone
    if (isStandalone()) return;

    // Don't show if user previously dismissed
    const dismissed = localStorage.getItem(INSTALL_DISMISSED_KEY);
    if (dismissed === 'true') return;

    // Track visit count
    const count = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10) + 1;
    localStorage.setItem(VISIT_COUNT_KEY, String(count));

    // Only show after 3+ visits
    if (count < 3) return;

    if (isIOS()) {
      // iOS doesn't have beforeinstallprompt, show manual instructions
      setShowIOSInstructions(true);
      setShowBanner(true);
      return;
    }

    // Listen for the native install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = useCallback(async () => {
    const prompt = deferredPromptRef.current;
    if (!prompt) return;

    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    deferredPromptRef.current = null;
  }, []);

  const handleDismiss = useCallback(() => {
    setShowBanner(false);
    localStorage.setItem(INSTALL_DISMISSED_KEY, 'true');
  }, []);

  if (!showBanner) return null;

  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-50 flex items-center gap-3 rounded-2xl p-4 shadow-lg backdrop-blur-sm safe-bottom"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-primary)',
        borderWidth: '1px',
      }}
    >
      <div className="flex-1">
        <p
          className="text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Install RoundUp
        </p>
        {showIOSInstructions ? (
          <p
            className="mt-0.5 text-xs"
            style={{ color: 'var(--text-secondary)' }}
          >
            Tap{' '}
            <Share className="inline h-3 w-3" style={{ color: 'var(--accent-blue)' }} />{' '}
            then &quot;Add to Home Screen&quot;
          </p>
        ) : (
          <p
            className="mt-0.5 text-xs"
            style={{ color: 'var(--text-secondary)' }}
          >
            Add to your home screen for the best experience
          </p>
        )}
      </div>

      {!showIOSInstructions && (
        <button
          onClick={handleInstall}
          className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-opacity active:opacity-80"
          style={{
            backgroundColor: 'var(--accent-green)',
            color: 'var(--bg-primary)',
          }}
        >
          <Download className="h-3.5 w-3.5" />
          Install
        </button>
      )}

      <button
        onClick={handleDismiss}
        className="flex h-8 w-8 items-center justify-center rounded-full transition-opacity active:opacity-80"
        style={{ backgroundColor: 'var(--bg-card-inner)' }}
        aria-label="Dismiss install prompt"
      >
        <X className="h-4 w-4" style={{ color: 'var(--text-dim)' }} />
      </button>
    </div>
  );
}
