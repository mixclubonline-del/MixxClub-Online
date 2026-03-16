import { useState, useEffect, useRef } from 'react';

interface UseCountUpOptions {
  end: number;
  duration?: number;
  start?: number;
  enabled?: boolean;
  suffix?: string;
  prefix?: string;
}

/**
 * Animated count-up hook. Triggers when `enabled` becomes true.
 * Uses easeOutExpo for a satisfying deceleration curve.
 */
export function useCountUp({
  end,
  duration = 1800,
  start = 0,
  enabled = true,
  suffix = '',
  prefix = '',
}: UseCountUpOptions) {
  const [value, setValue] = useState(start);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      setValue(start);
      return;
    }

    const startTime = performance.now();
    const diff = end - start;

    const easeOutExpo = (t: number) =>
      t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      const current = start + diff * eased;

      setValue(Number.isInteger(end) ? Math.round(current) : parseFloat(current.toFixed(1)));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [end, start, duration, enabled]);

  const display = `${prefix}${value}${suffix}`;

  return { value, display };
}
