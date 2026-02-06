/**
 * UnlockCelebrationProvider
 * 
 * Wraps app content and checks for new unlocks on mount.
 * Renders celebration modal when a new unlock is detected.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, PartyPopper, Unlock, ArrowRight } from 'lucide-react';
import { useUnlockCelebration, UnlockedMilestone } from '@/hooks/useUnlockCelebration';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import confetti from 'canvas-confetti';

interface UnlockCelebrationProviderProps {
  children: React.ReactNode;
}

function UnlockCelebrationModal({
  milestone,
  onDismiss,
  onNext,
  hasMore,
}: {
  milestone: UnlockedMilestone;
  onDismiss: () => void;
  onNext: () => void;
  hasMore: boolean;
}) {
  // Trigger confetti on mount
  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#8b5cf6', '#ec4899', '#06b6d4'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#8b5cf6', '#ec4899', '#06b6d4'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={onDismiss}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* Modal */}
      <motion.div
        className="relative w-full max-w-md p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-background to-secondary/10 border border-primary/20 shadow-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/50 transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Icon */}
          <motion.div
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500/20 to-primary/20 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Unlock className="w-10 h-10 text-green-500" />
          </motion.div>

          {/* Header */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <PartyPopper className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary uppercase tracking-wide">
              Community Unlock!
            </span>
            <PartyPopper className="w-5 h-5 text-primary scale-x-[-1]" />
          </div>

          {/* Milestone name */}
          <h2 className="text-2xl md:text-3xl font-black mb-3 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            {milestone.name}
          </h2>

          {/* Description */}
          {milestone.description && (
            <p className="text-muted-foreground mb-4">{milestone.description}</p>
          )}

          {/* Reward */}
          {milestone.reward_description && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 mb-6">
              <div className="flex items-center justify-center gap-2 text-green-500 font-medium">
                <Sparkles className="w-4 h-4" />
                <span>{milestone.reward_description}</span>
              </div>
            </div>
          )}

          {/* Type badge */}
          <p className="text-xs text-muted-foreground mb-6">
            Unlocked by the {milestone.unlock_type} community
          </p>

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            {hasMore ? (
              <>
                <Button variant="outline" onClick={onDismiss}>
                  Close
                </Button>
                <Button onClick={onNext}>
                  Next Unlock
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            ) : (
              <Button onClick={onDismiss} className="px-8">
                Awesome!
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function UnlockCelebrationProvider({ children }: UnlockCelebrationProviderProps) {
  const { user } = useAuth();
  const { newUnlock, markAsSeen, dismissAll, totalUnlocked } = useUnlockCelebration();
  const [showCelebration, setShowCelebration] = useState(false);

  // Only show celebration for logged-in users
  useEffect(() => {
    if (user && newUnlock) {
      // Small delay to let the app settle
      const timer = setTimeout(() => {
        setShowCelebration(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, newUnlock]);

  const handleDismiss = () => {
    setShowCelebration(false);
    dismissAll();
  };

  const handleNext = () => {
    markAsSeen();
    // Keep celebration open for next unlock
  };

  // Check if there are more unlocks after current one
  const hasMore = totalUnlocked > 1 && newUnlock !== null;

  return (
    <>
      {children}
      <AnimatePresence>
        {showCelebration && newUnlock && (
          <UnlockCelebrationModal
            milestone={newUnlock}
            onDismiss={handleDismiss}
            onNext={handleNext}
            hasMore={hasMore}
          />
        )}
      </AnimatePresence>
    </>
  );
}
