'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}

interface PageTransitionProps {
  children: React.ReactNode;
  direction?: 'left' | 'right';
  transitionKey?: string;
}

const SLIDE_OFFSET = 60;
const DURATION = 0.25;

export function PageTransition({
  children,
  direction = 'right',
  transitionKey,
}: PageTransitionProps) {
  const prefersReduced = usePrefersReducedMotion();

  const xOffset = direction === 'right' ? SLIDE_OFFSET : -SLIDE_OFFSET;

  const variants = prefersReduced
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { x: xOffset, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: -xOffset, opacity: 0 },
      };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={transitionKey}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={{
          duration: DURATION,
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
