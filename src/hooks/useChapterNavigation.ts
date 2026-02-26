/**
 * Chapter Navigation Hook
 * 
 * Handles keyboard (arrows), horizontal scroll-wheel,
 * and touch swipe inputs for chapter navigation.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useChapterStore } from '@/stores/chapterStore';

interface ChapterNavOptions {
  enabled?: boolean;
  swipeThreshold?: number;
  swipeAngleLimit?: number; // degrees from horizontal
}

export function useChapterNavigation(opts: ChapterNavOptions = {}) {
  const {
    enabled = true,
    swipeThreshold = 60,
    swipeAngleLimit = 30,
  } = opts;

  const next = useChapterStore((s) => s.next);
  const prev = useChapterStore((s) => s.prev);
  const transitioning = useChapterStore((s) => s.transitioning);

  const touchRef = useRef<{ x: number; y: number } | null>(null);
  const wheelLock = useRef(false);

  // Keyboard
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (transitioning) return;

      if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, next, prev, transitioning]);

  // Horizontal scroll wheel
  useEffect(() => {
    if (!enabled) return;
    const onWheel = (e: WheelEvent) => {
      if (transitioning || wheelLock.current) return;
      // Only trigger on predominantly horizontal scroll or shift+scroll
      const dx = Math.abs(e.deltaX);
      const dy = Math.abs(e.deltaY);
      if (dx < 30 && dy < 30) return;
      if (dx < dy && !e.shiftKey) return; // vertical scroll — let it pass

      e.preventDefault();
      wheelLock.current = true;
      if (e.deltaX > 0 || (e.shiftKey && e.deltaY > 0)) next();
      else prev();

      setTimeout(() => { wheelLock.current = false; }, 700);
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [enabled, next, prev, transitioning]);

  // Touch swipe
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
  }, [enabled]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!enabled || !touchRef.current || transitioning) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchRef.current.x;
    const dy = t.clientY - touchRef.current.y;
    touchRef.current = null;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    if (absDx < swipeThreshold) return;

    // Check angle — only accept near-horizontal swipes
    const angle = Math.atan2(absDy, absDx) * (180 / Math.PI);
    if (angle > swipeAngleLimit) return;

    if (dx < 0) next(); else prev();
  }, [enabled, next, prev, transitioning, swipeThreshold, swipeAngleLimit]);

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchEnd]);
}
