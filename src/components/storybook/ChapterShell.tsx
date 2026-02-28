/**
 * Chapter Shell
 * 
 * Horizontal chapter container. Each child is a full-viewport chapter.
 * Uses GPU-accelerated translateX for sliding transitions.
 * Lazy-mounts only active ±1 neighbor chapters.
 */

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useChapterStore } from '@/stores/chapterStore';
import { useChapterNavigation } from '@/hooks/useChapterNavigation';
import { ChapterNav } from './ChapterNav';
import { ChapterProgress } from './ChapterProgress';
import { useSearchParams } from 'react-router-dom';
import { useSceneFlowStore } from '@/stores/sceneFlowStore';
import { ArrowLeft } from 'lucide-react';

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

  // Ref to break circular dep with SceneFlow's URL sync
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  // Store → URL sync (only fires when `active` changes)
  useEffect(() => {
    const sp = searchParamsRef.current;
    if (sp.get('chapter') === String(active)) return;
    const next = new URLSearchParams(sp);
    next.set('chapter', String(active));
    setSearchParams(next, { replace: true });
  }, [active, setSearchParams]);

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

  const parallaxFactor = 0.35;

  return (
    <div className="relative w-full h-[100svh] overflow-hidden bg-background">
      {/* Parallax background layer — moves slower for depth */}
      <motion.div
        className="absolute inset-0 w-full h-full pointer-events-none will-change-transform"
        animate={{ x: `${-active * 100 * parallaxFactor}vw` }}
        transition={{ duration: durationS * 1.2, ease: [0.4, 0, 0.2, 1] }}
        aria-hidden
      >
        <div
          className="h-full"
          style={{ width: `${slots.length * 100}vw`, display: 'flex' }}
        >
          {slots.map((slot, i) => (
            <div
              key={`bg-${slot.id}`}
              className="w-screen h-full flex-shrink-0 relative overflow-hidden"
            >
              {/* Radial glow that shifts hue per chapter */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background: `radial-gradient(ellipse 80% 60% at 50% 40%, hsl(${220 + i * 30} 60% 30% / 0.5), transparent)`,
                }}
              />
              {/* Subtle grid texture */}
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
                  backgroundSize: '60px 60px',
                }}
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Progress bar */}
      <ChapterProgress />

      {/* Horizontal strip */}
      <motion.div
        className="relative flex h-full will-change-transform"
        animate={{ x: `${-active * 100}vw` }}
        transition={{
          duration: durationS,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        {slots.map((slot, i) => {
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

      {/* Back to Demo floating button */}
      <BackToDemoButton />

      {/* ARIA live region */}
      <div className="sr-only" role="status" aria-live="polite">
        {`Chapter ${active + 1} of ${slots.length}`}
      </div>
    </div>
  );
}

/** Floating pill button to return to the Demo scene */
function BackToDemoButton() {
  const go = useSceneFlowStore((s) => s.go);

  return (
    <button
      onClick={() => go('DEMO')}
      className="fixed top-5 left-5 z-50 flex items-center gap-2 px-4 py-2 rounded-full
        bg-background/60 backdrop-blur-md border border-white/10
        text-sm font-medium text-foreground/80
        hover:bg-background/80 hover:border-white/20 hover:text-foreground
        transition-all duration-200 hover:-translate-x-0.5
        shadow-lg shadow-black/10"
      aria-label="Back to Demo"
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="hidden sm:inline">Back to Demo</span>
    </button>
  );
}
