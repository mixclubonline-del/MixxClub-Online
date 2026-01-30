import { motion, AnimatePresence } from 'framer-motion';
import { CharacterAvatar } from '@/components/characters/CharacterAvatar';
import { cn } from '@/lib/utils';

interface DreamChamberGuideProps {
  state: 'idle' | 'generating' | 'success' | 'error';
  className?: string;
  compact?: boolean;
}

const DREAM_QUOTES = {
  idle: [
    "See it before you build it.",
    "The city's look is in your hands.",
    "Dream it. Save it. Ship it.",
    "Every district started as a vision.",
  ],
  generating: [
    "Dreaming...",
    "Building the vision...",
    "Bringing it to life...",
    "Creating something new...",
  ],
  success: [
    "That's the one.",
    "Vision locked.",
    "Now make it live.",
    "The city just got brighter.",
  ],
  error: [
    "Let's try that again.",
    "Every legend had rough takes.",
    "Adjust and retry.",
    "The vision is still there.",
  ],
};

function getRandomQuote(state: DreamChamberGuideProps['state']): string {
  const quotes = DREAM_QUOTES[state];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

export function DreamChamberGuide({ state, className, compact = false }: DreamChamberGuideProps) {
  const quote = getRandomQuote(state);

  return (
    <motion.div
      className={cn(
        "flex items-center gap-4",
        compact ? "flex-row" : "flex-col md:flex-row",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Prime Avatar with state-aware glow */}
      <motion.div
        className="relative"
        animate={state === 'generating' ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 1.5, repeat: state === 'generating' ? Infinity : 0 }}
      >
        <CharacterAvatar
          characterId="prime"
          size={compact ? "sm" : "lg"}
          className={cn(
            "border-2 transition-all duration-500",
            state === 'generating' && "border-primary animate-pulse",
            state === 'success' && "border-green-500",
            state === 'error' && "border-red-500",
            state === 'idle' && "border-primary/50"
          )}
        />
        
        {/* Ambient glow */}
        <div
          className={cn(
            "absolute inset-0 -z-10 rounded-full blur-xl transition-all duration-500",
            state === 'generating' && "bg-primary/40 animate-pulse",
            state === 'success' && "bg-green-500/30",
            state === 'error' && "bg-red-500/20",
            state === 'idle' && "bg-primary/20"
          )}
        />
      </motion.div>

      {/* Speech bubble with quote */}
      <AnimatePresence mode="wait">
        <motion.div
          key={quote}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className={cn(
            "relative px-4 py-2 rounded-2xl bg-card/80 backdrop-blur border border-border/50",
            compact ? "text-sm" : "text-base"
          )}
          style={{
            boxShadow: state === 'generating' 
              ? '0 0 20px hsl(270 75% 55% / 0.3)' 
              : state === 'success'
              ? '0 0 20px hsl(142 76% 36% / 0.3)'
              : undefined
          }}
        >
          {/* Arrow pointer */}
          <div className="absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-card/80" />
          
          <p className={cn(
            "font-medium",
            state === 'generating' && "text-primary",
            state === 'success' && "text-green-400",
            state === 'error' && "text-red-400"
          )}>
            "{quote}"
          </p>
          <p className="text-xs text-muted-foreground mt-1">— Prime</p>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
