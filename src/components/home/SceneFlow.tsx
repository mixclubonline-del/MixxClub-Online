/**
 * Scene Flow Controller
 * 
 * Manages the immersive scene-based homepage experience.
 * For now, just the Hallway scene - clicking navigates to How It Works.
 */

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useFlowNavigation } from '@/core/fabric/useFlow';
import { StudioHallway } from '@/components/scene/StudioHallway';

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
  const { browseSection } = useFlowNavigation();

  const handleEnterHallway = useCallback(() => {
    // Navigate to How It Works journey
    browseSection('how-it-works');
  }, [browseSection]);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <motion.div
        key="hallway"
        variants={dissolveVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={dissolveTransition}
        className="min-h-screen"
      >
        <StudioHallway fullscreen onEnter={handleEnterHallway} />
      </motion.div>
    </div>
  );
}
