/**
 * useMobileSwipeNav — Horizontal swipe to switch between mobile tabs.
 * 
 * Detects left/right swipes on touch devices and navigates to the
 * adjacent tab in the provided order. Includes velocity detection
 * and minimum distance threshold to avoid false positives from scrolling.
 */

import { useRef, useCallback, TouchEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';

interface SwipeNavOptions {
  /** Ordered tab paths (left-to-right). Center/action tabs are skipped. */
  tabPaths: string[];
  /** Minimum horizontal distance in px to trigger (default 60) */
  threshold?: number;
  /** Maximum vertical distance to still count as horizontal (default 80) */
  maxVertical?: number;
}

export function useMobileSwipeNav({
  tabPaths,
  threshold = 60,
  maxVertical = 80,
}: SwipeNavOptions) {
  const navigate = useNavigate();
  const location = useLocation();
  const { triggerHaptic } = useMobileOptimization({ enableHaptics: true });

  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);

  const onTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  }, []);

  const onTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStart.current) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    const elapsed = Date.now() - touchStart.current.time;
    touchStart.current = null;

    // Must be a horizontal-dominant gesture
    if (Math.abs(dy) > maxVertical) return;
    if (Math.abs(dx) < threshold) return;
    // Must complete within 500ms to feel intentional
    if (elapsed > 500) return;

    // Find current tab index (match by path prefix, stripping query params)
    const currentBase = location.pathname;
    const currentIndex = tabPaths.findIndex(
      (p) => currentBase === p.split('?')[0] || currentBase.startsWith(p.split('?')[0] + '/')
    );

    if (currentIndex === -1) return;

    const direction = dx < 0 ? 1 : -1; // swipe left = next, swipe right = prev
    const nextIndex = currentIndex + direction;

    if (nextIndex < 0 || nextIndex >= tabPaths.length) return;

    triggerHaptic('light');
    navigate(tabPaths[nextIndex]);
  }, [location.pathname, tabPaths, threshold, maxVertical, navigate, triggerHaptic]);

  return { onTouchStart, onTouchEnd };
}
