/**
 * Hallway Video Background Component
 * 
 * Renders AI-generated video or image backgrounds for the Studio Hallway.
 * Supports both video and image assets with smooth transitions.
 */

import { motion, AnimatePresence } from 'framer-motion';

interface HallwayVideoBackgroundProps {
  url: string | null;
  isVideo: boolean;
  className?: string;
}

export function HallwayVideoBackground({ url, isVideo, className = '' }: HallwayVideoBackgroundProps) {
  if (!url) {
    // Default gradient background when no asset
    return (
      <div 
        className={`absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background ${className}`}
      />
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={url}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className={`absolute inset-0 overflow-hidden ${className}`}
      >
        {isVideo ? (
          <video
            src={url}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={url}
            alt="Studio Hallway"
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background/90" />
      </motion.div>
    </AnimatePresence>
  );
}
