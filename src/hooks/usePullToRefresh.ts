import { useState, useRef, useCallback } from 'react';
import { useHaptics } from '@/hooks/useHaptics';

const THRESHOLD = 80;   // px needed to trigger refresh
const MAX_PULL = 120;    // visual cap
const RESISTANCE = 0.45; // dampen pull distance

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>;
}

export function usePullToRefresh({ onRefresh }: PullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);
  const haptics = useHaptics();

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    // Only start pull if scrolled to top
    const scrollEl = e.currentTarget;
    if (scrollEl.scrollTop > 0 || isRefreshing) return;
    startY.current = e.touches[0].clientY;
    pulling.current = true;
  }, [isRefreshing]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling.current || isRefreshing) return;
    const dy = (e.touches[0].clientY - startY.current) * RESISTANCE;
    if (dy < 0) {
      setPullDistance(0);
      return;
    }
    const clamped = Math.min(dy, MAX_PULL);
    setPullDistance(clamped);

    // Haptic at threshold crossing
    if (clamped >= THRESHOLD && pullDistance < THRESHOLD) {
      haptics.light();
    }
  }, [isRefreshing, pullDistance, haptics]);

  const onTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;

    if (pullDistance >= THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      haptics.success();
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, isRefreshing, onRefresh, haptics]);

  const isReady = pullDistance >= THRESHOLD;

  return {
    pullDistance,
    isRefreshing,
    isReady,
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
  };
}
