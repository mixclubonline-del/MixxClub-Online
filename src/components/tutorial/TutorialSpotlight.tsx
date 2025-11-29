import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SpotlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TutorialSpotlightProps {
  targetElement: string | null;
}

export const TutorialSpotlight = ({ targetElement }: TutorialSpotlightProps) => {
  const [position, setPosition] = useState<SpotlightPosition | null>(null);

  useEffect(() => {
    if (!targetElement) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      const element = document.querySelector(targetElement);
      if (!element) {
        setPosition(null);
        return;
      }

      const rect = element.getBoundingClientRect();
      setPosition({
        top: rect.top - 8,
        left: rect.left - 8,
        width: rect.width + 16,
        height: rect.height + 16,
      });
    };

    // Initial position
    updatePosition();

    // Update on scroll and resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    // Observe DOM changes
    const observer = new MutationObserver(updatePosition);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      observer.disconnect();
    };
  }, [targetElement]);

  if (!position) {
    // Full screen overlay when no target
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
      />
    );
  }

  return (
    <>
      {/* Overlay with cutout */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 49 }}
      >
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            <motion.rect
              initial={{ opacity: 0 }}
              animate={{
                x: position.left,
                y: position.top,
                width: position.width,
                height: position.height,
                opacity: 1,
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              rx="8"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="hsl(var(--background))"
          fillOpacity="0.8"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Highlight border */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          top: position.top,
          left: position.left,
          width: position.width,
          height: position.height,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed pointer-events-none rounded-lg border-2 border-primary shadow-lg shadow-primary/20"
        style={{ zIndex: 50 }}
      />
    </>
  );
};
