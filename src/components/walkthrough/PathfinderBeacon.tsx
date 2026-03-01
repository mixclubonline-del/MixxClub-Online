import { motion, AnimatePresence } from 'framer-motion';
import { Compass, X } from 'lucide-react';
import { usePathfinder } from '@/hooks/usePathfinder';
import { PathfinderStepCard } from './PathfinderStep';

export const PathfinderBeacon = () => {
  const {
    isActive,
    isReady,
    currentStep,
    stepIndex,
    totalSteps,
    isOnImmersiveRoute,
    isAtCurrentStep,
    next,
    skip,
    dismiss,
    goToStep,
  } = usePathfinder();

  if (!isReady || !isActive || !currentStep) return null;

  // On immersive routes show beacon only when user is NOT at the step's target;
  // when they arrive at the step's target, show the full card even on immersive routes.
  const showBeaconOnly = isOnImmersiveRoute && !isAtCurrentStep;

  if (showBeaconOnly) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-6 right-6 z-[55]"
        >
          <button
            onClick={goToStep}
            className="group relative w-12 h-12 rounded-full bg-black/60 backdrop-blur-xl border border-white/10
              hover:border-primary/40 hover:bg-black/70 transition-all"
            aria-label="Pathfinder walkthrough"
          >
            <Compass className="w-5 h-5 text-primary mx-auto" />
            <span className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
          </button>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Full card mode — shown on non-immersive routes OR when at the step's target
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-6 right-6 z-[55] w-[300px]"
      >
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-primary" />
              <span className="text-[11px] font-medium text-white/50 uppercase tracking-wider">Pathfinder</span>
            </div>
            <button
              onClick={dismiss}
              className="w-6 h-6 rounded-full flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
              aria-label="Dismiss walkthrough"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <PathfinderStepCard
            step={currentStep}
            stepIndex={stepIndex}
            totalSteps={totalSteps}
            onGo={isAtCurrentStep ? next : goToStep}
            onSkip={skip}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
