/**
 * Chapter Nav
 * 
 * Floating bottom pill with dot indicators, arrow buttons,
 * and current chapter title.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useChapterStore } from '@/stores/chapterStore';

export function ChapterNav() {
  const active = useChapterStore((s) => s.active);
  const chapters = useChapterStore((s) => s.chapters);
  const next = useChapterStore((s) => s.next);
  const prev = useChapterStore((s) => s.prev);
  const goTo = useChapterStore((s) => s.goTo);
  const transitioning = useChapterStore((s) => s.transitioning);

  const current = chapters[active];
  const isFirst = active === 0;
  const isLast = active === chapters.length - 1;

  return (
    <motion.div
      className="mg-panel fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-4 py-2.5 rounded-full backdrop-blur-xl border border-border/30 bg-card/60"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
    >
      {/* Left arrow */}
      <button
        type="button"
        onClick={prev}
        disabled={isFirst || transitioning}
        className="p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Previous chapter"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Dots */}
      <div className="flex items-center gap-2" role="tablist" aria-label="Chapter navigation">
        {chapters.map((ch, i) => (
          <button
            key={ch.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`Go to ${ch.title}`}
            onClick={() => goTo(i)}
            disabled={transitioning}
            className="relative p-0.5"
          >
            <span
              className={`block rounded-full transition-all duration-300 ${
                i === active
                  ? 'w-6 h-2 bg-primary'
                  : 'w-2 h-2 bg-muted-foreground/40 hover:bg-muted-foreground/70'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Right arrow */}
      <button
        type="button"
        onClick={next}
        disabled={isLast || transitioning}
        className="p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Next chapter"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Chapter title */}
      <AnimatePresence mode="wait">
        <motion.span
          key={current?.id}
          className="text-xs font-medium text-muted-foreground min-w-[80px] text-center hidden sm:inline-block"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {current?.subtitle || current?.title}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );
}
