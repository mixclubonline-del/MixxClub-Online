/**
 * Club Room
 * 
 * Wrapper component for each "room" section in the Club Scene.
 * Provides entrance animations and consistent styling.
 */

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface ClubRoomProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function ClubRoom({ id, children, className = '' }: ClubRoomProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section
      id={id}
      ref={ref}
      className={`min-h-[100svh] w-full relative flex items-center justify-center snap-start snap-always ${className}`}
    >
      <motion.div
        className="w-full h-full"
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </section>
  );
}
