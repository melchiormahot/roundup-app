'use client';

import { useEffect, useState } from 'react';
import { getFeatureAccess, FeatureAccess } from './levels';

const DEFAULT_ACCESS = getFeatureAccess(1);

export function useFeatureAccess(): FeatureAccess & {
  level: number;
  loading: boolean;
} {
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchLevel() {
      try {
        const res = await fetch('/api/auth/session');
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (!cancelled && data?.user?.level) {
          setLevel(data.user.level);
        }
      } catch {
        // Session fetch failed; default to level 1
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchLevel();
    return () => {
      cancelled = true;
    };
  }, []);

  const access = loading ? DEFAULT_ACCESS : getFeatureAccess(level);

  return {
    ...access,
    level,
    loading,
  };
}
