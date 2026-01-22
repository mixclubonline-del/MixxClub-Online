/**
 * Scene Flow Controller
 * 
 * Manages the immersive scene-based homepage experience.
 * Dissolves between: Hallway (Intrigue) → Demo (Energy) → Information (Clarity)
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StudioHallway } from '@/components/scene/StudioHallway';
import { InsiderDemoExperience } from '@/components/demo/InsiderDemoExperience';
import { InformationScene } from '@/components/home/InformationScene';

export type HomeScene = 'hallway' | 'demo' | 'information';

const dissolveVariants = {
  initial: { opacity: 0, scale: 1.02 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 }
};

const dissolveTransition = {
  duration: 0.8,
  ease: 'easeInOut' as const
};

export function SceneFlow() {
  const [currentScene, setCurrentScene] = useState<HomeScene>('hallway');

  const handleEnterDemo = useCallback(() => {
    setCurrentScene('demo');
  }, []);

  const handleLearnMore = useCallback(() => {
    setCurrentScene('information');
  }, []);

  const handleBackToHallway = useCallback(() => {
    setCurrentScene('hallway');
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <AnimatePresence mode="wait">
        {currentScene === 'hallway' && (
          <motion.div
            key="hallway"
            variants={dissolveVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={dissolveTransition}
            className="min-h-screen"
          >
            <StudioHallway fullscreen onEnter={handleEnterDemo} />
          </motion.div>
        )}

        {currentScene === 'demo' && (
          <motion.div
            key="demo"
            variants={dissolveVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={dissolveTransition}
            className="min-h-screen"
          >
            <InsiderDemoExperience 
              embedded 
              onLearnMore={handleLearnMore}
              onBack={handleBackToHallway}
            />
          </motion.div>
        )}

        {currentScene === 'information' && (
          <motion.div
            key="information"
            variants={dissolveVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={dissolveTransition}
            className="min-h-screen"
          >
            <InformationScene onBack={handleBackToHallway} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
