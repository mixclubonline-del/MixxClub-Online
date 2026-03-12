import { motion, AnimatePresence } from 'framer-motion';
import { StickyNote, ChevronDown } from 'lucide-react';
import { PRESENTER_NOTES } from './presenterNotes';

interface Props {
  slideIndex: number;
  isOpen: boolean;
  onToggle: () => void;
}

export function PresenterNotesPanel({ slideIndex, isOpen, onToggle }: Props) {
  const notes = PRESENTER_NOTES[slideIndex] || '';

  return (
    <div className="relative">
      {/* Toggle button integrated into the bar */}
      <button
        onClick={onToggle}
        className="absolute -top-8 right-4 flex items-center gap-1.5 px-3 py-1 rounded-t-lg bg-[hsl(262,30%,8%)] border border-b-0 border-border/20 text-xs text-muted-foreground hover:text-foreground transition-colors z-10"
      >
        <StickyNote className="w-3.5 h-3.5" />
        Notes
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden bg-[hsl(262,30%,6%)] border-t border-border/20"
          >
            <div className="px-6 py-4 max-h-[180px] overflow-y-auto">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {notes}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
