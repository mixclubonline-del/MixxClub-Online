/**
 * Chapter Progress
 * 
 * Ultra-thin Stories-style segmented progress bar at the top of the viewport.
 */

import { motion } from 'framer-motion';
import { useChapterStore } from '@/stores/chapterStore';

export function ChapterProgress() {
  const active = useChapterStore((s) => s.active);
  const chapters = useChapterStore((s) => s.chapters);
  const durationMs = useChapterStore((s) => s.durationMs);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[70] flex gap-1 px-3 py-1.5"
      role="progressbar"
      aria-valuenow={active + 1}
      aria-valuemin={1}
      aria-valuemax={chapters.length}
      aria-label="Story progress"
    >
      {chapters.map((ch, i) => (
        <div
          key={ch.id}
          className="flex-1 h-[3px] rounded-full bg-muted-foreground/20 overflow-hidden"
        >
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={false}
            animate={{
              scaleX: i < active ? 1 : i === active ? 1 : 0,
            }}
            style={{ originX: 0 }}
            transition={{
              duration: i === active ? durationMs / 1000 : 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
          />
        </div>
      ))}
    </div>
  );
}
