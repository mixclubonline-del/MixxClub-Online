/**
 * RoomDivider — Subtle gradient line/fog between club rooms.
 */

import { motion } from 'framer-motion';

export function RoomDivider() {
  return (
    <div className="relative w-full h-px overflow-visible pointer-events-none">
      {/* Gradient line */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-1/2 max-w-md h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.25) 50%, transparent 100%)',
        }}
      />
      {/* Fog glow */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-16 rounded-full"
        style={{
          background: 'radial-gradient(ellipse, hsl(var(--primary) / 0.06) 0%, transparent 70%)',
        }}
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </div>
  );
}
