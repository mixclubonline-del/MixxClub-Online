/**
 * Door Flicker Component
 * 
 * Creates random, subtle door "flickers" that suggest activity
 * even when there are no real sessions. Makes the hallway feel
 * like something is always about to happen.
 * 
 * Used for cold-start scenarios where we want the space to feel alive.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DoorFlickerProps {
  doorPositions: Array<{ x: number; y: number }>;
  enabled?: boolean;
}

export function DoorFlicker({ doorPositions, enabled = true }: DoorFlickerProps) {
  const [activeDoor, setActiveDoor] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled || doorPositions.length === 0) return;

    // Random flicker interval between 4-8 seconds
    const scheduleFlicker = () => {
      const delay = 4000 + Math.random() * 4000;
      return setTimeout(() => {
        // Pick a random door
        const doorIndex = Math.floor(Math.random() * doorPositions.length);
        setActiveDoor(doorIndex);
        
        // Clear after brief flicker
        setTimeout(() => setActiveDoor(null), 800 + Math.random() * 400);
        
        // Schedule next flicker
        scheduleFlicker();
      }, delay);
    };

    const timeoutId = scheduleFlicker();
    return () => clearTimeout(timeoutId);
  }, [enabled, doorPositions.length]);

  if (!enabled) return null;

  return (
    <AnimatePresence>
      {activeDoor !== null && doorPositions[activeDoor] && (
        <motion.div
          key={activeDoor}
          className="absolute pointer-events-none"
          style={{
            left: `${doorPositions[activeDoor].x}%`,
            top: `${doorPositions[activeDoor].y}%`,
            transform: 'translate(-50%, -50%)'
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Soft glow suggesting activity */}
          <div 
            className="w-16 h-16 rounded-full blur-xl"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)'
            }}
          />
          
          {/* Core flash */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.4, repeat: 2 }}
          >
            <div 
              className="w-4 h-4 rounded-full bg-primary/40 blur-sm"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
