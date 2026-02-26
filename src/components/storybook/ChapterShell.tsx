/**
 * Chapter Shell
 * 
 * Horizontal chapter container. Each child is a full-viewport chapter.
 * Uses GPU-accelerated translateX for sliding transitions.
 * Lazy-mounts only active ±1 neighbor chapters.
 */

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useChapterStore } from '@/stores/chapterStore';
import { useChapterNavigation } from '@/hooks/useChapterNavigation';
import { ChapterNav } from './ChapterNav';
import { ChapterProgress } from './ChapterProgress';
import { useSearchParams } from 'react-router-dom';

interface ChapterSlot {
  id: string;
  element: React.ReactNode;
}

interface ChapterShellProps {
  slots: ChapterSlot[];
}

export function ChapterShell({ slots }: ChapterShellProps) {
  const active = useChapterStore((s) => s.active);
  const durationMs = useChapterStore((s) => s.durationMs);
  const goTo = useChapterStore((s) => s.goTo);
  const [searchParams, setSearchParams] = useSearchParams();

  // Enable keyboard + swipe + wheel navigation
  useChapterNavigation({ enabled: true });

  // Deep-link: URL → store sync on mount
  useEffect(() => {
    const chapterParam = searchParams.get('chapter');
    if (chapterParam !== null) {
      const idx = parseInt(chapterParam, 10);
      if (!isNaN(idx) && idx >= 0 && idx < slots.length) {
        goTo(idx);
      }
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Store → URL sync
  useEffect(() => {
    const current = searchParams.get('chapter');
    if (current === String(active)) return;
    const next = new URLSearchParams(searchParams);
    next.set('chapter', String(active));
    setSearchParams(next, { replace: true });
  }, [active, searchParams, setSearchParams]);

  // Focus management: move focus to new chapter
  useEffect(() => {
    const el = document.getElementById(`chapter-${active}`);
    if (el) {
      const focusable = el.querySelector<HTMLElement>(
        'button, [href], input, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus({ preventScroll: true });
    }
  }, [active]);

  const durationS = durationMs / 1000;

  return (
    <div className="relative w-full h-[100svh] overflow-hidden bg-background">
      {/* Progress bar */}
      <ChapterProgress />

      {/* Horizontal strip */}
      <motion.div
        className="flex h-full will-change-transform"
        animate={{ x: `${-active * 100}vw` }}
        transition={{
          duration: durationS,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        {slots.map((slot, i) => {
          // Lazy mount: only render active ±1
          const shouldMount = Math.abs(i - active) <= 1;

          return (
            <div
              key={slot.id}
              id={`chapter-${i}`}
              className="w-screen h-[100svh] flex-shrink-0 overflow-y-auto overflow-x-hidden"
              role="tabpanel"
              aria-label={`Chapter ${i + 1}`}
              aria-hidden={i !== active}
            >
              <motion.div
                className="w-full h-full"
                animate={{
                  opacity: i === active ? 1 : 0.6,
                  scale: i === active ? 1 : 0.97,
                }}
                transition={{ duration: durationS * 0.6 }}
              >
                {shouldMount ? slot.element : null}
              </motion.div>
            </div>
          );
        })}
      </motion.div>

      {/* Bottom navigation */}
      <ChapterNav />

      {/* ARIA live region */}
      <div className="sr-only" role="status" aria-live="polite">
        {`Chapter ${active + 1} of ${slots.length}`}
      </div>
    </div>
  );
}
