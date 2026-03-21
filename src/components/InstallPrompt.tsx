"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Share } from "lucide-react";

export function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);
    if (standalone) return;

    // Check iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    // Check if dismissed recently
    const dismissed = localStorage.getItem("roundup_install_dismissed");
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < 30 * 24 * 60 * 60 * 1000) return; // 30 days
    }

    // Track visits
    const visits = parseInt(localStorage.getItem("roundup_visits") || "0", 10) + 1;
    localStorage.setItem("roundup_visits", visits.toString());

    // Show after 3+ visits
    if (visits >= 3) {
      // Android: listen for beforeinstallprompt
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setShow(true);
      };
      window.addEventListener("beforeinstallprompt", handler);

      // iOS: show manual instructions after delay
      if (ios) {
        setTimeout(() => setShow(true), 3000);
      }

      return () => window.removeEventListener("beforeinstallprompt", handler);
    }
  }, []);

  function dismiss() {
    setShow(false);
    localStorage.setItem("roundup_install_dismissed", Date.now().toString());
  }

  async function install() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === "accepted") {
        setShow(false);
      }
    }
  }

  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 z-50 bg-navy-700 border border-[#1f4070] rounded-2xl p-4 shadow-2xl"
          style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <button onClick={dismiss} className="absolute top-3 right-3 p-1 text-text-secondary"><X className="w-4 h-4" /></button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent-green/15 flex items-center justify-center shrink-0">
              <Download className="w-6 h-6 text-accent-green" />
            </div>
            <div className="flex-1">
              <p className="text-text-primary font-semibold text-sm">Install RoundUp</p>
              <p className="text-text-secondary text-xs font-medium">
                {isIOS
                  ? "Tap the share button, then 'Add to Home Screen'"
                  : "Add to your home screen for the best experience"
                }
              </p>
            </div>
          </div>
          {isIOS ? (
            <div className="mt-3 flex items-center gap-2 bg-navy-600/20 rounded-xl p-3">
              <Share className="w-4 h-4 text-accent-blue shrink-0" />
              <p className="text-text-secondary text-xs font-medium">Tap <span className="text-text-primary">Share</span> → <span className="text-text-primary">Add to Home Screen</span></p>
            </div>
          ) : (
            <div className="mt-3 flex gap-2">
              <button onClick={install} className="flex-1 py-2.5 bg-accent-blue text-navy-900 font-bold text-sm rounded-xl min-h-[44px]">Install</button>
              <button onClick={dismiss} className="px-4 py-2.5 text-text-secondary text-sm font-medium min-h-[44px]">Not now</button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// TypeScript interface for beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
