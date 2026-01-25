/**
 * Light Spill Component
 * 
 * Renders optical light "spillage" on the hallway floor coming from active studios.
 * Uses CSS clip-paths and gradients to simulate perspective-accurate light rays.
 * 
 * Intensity synchronizes with session activity and recording states.
 */

import { motion } from 'framer-motion';
import type { StudioRoom } from '@/types/scene';

interface LightSpillProps {
  rooms: StudioRoom[];
  doorPositions: Array<{ x: number; y: number }>;
}

export function LightSpill({ rooms, doorPositions }: LightSpillProps) {
  // Only render spills for rooms that are active
  const activeRooms = rooms.map((room, index) => ({
    room,
    pos: doorPositions[index]
  })).filter(item => 
    item.pos && 
    item.room.state !== 'idle' && 
    item.room.state !== 'waiting'
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {activeRooms.map(({ room, pos }, index) => {
        const isRecording = room.state === 'recording';
        const isSide = pos.x < 30 || pos.x > 70;
        
        // Calculate the "spread" based on side vs center
        const spread = isSide ? 15 : 25;
        const length = isSide ? 20 : 35;
        
        return (
          <motion.div
            key={`spill-${room.id}`}
            className="absolute origin-top"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: `${spread}%`,
              height: `${length}%`,
              transform: 'translateX(-50%)',
              background: `linear-gradient(to bottom, 
                hsl(var(--primary) / 0.4) 0%, 
                hsl(var(--primary) / 0.1) 40%, 
                transparent 100%)`,
              // Create the trapezoidal light ray perspective
              clipPath: 'polygon(45% 0%, 55% 0%, 100% 100%, 0% 100%)',
              filter: 'blur(20px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: isRecording ? [0.4, 0.7, 0.4] : 0.4,
              scale: isRecording ? [1, 1.05, 1] : 1
            }}
            transition={{
              duration: isRecording ? 0.5 : 3, // Synchronize with thump
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        );
      })}
    </div>
  );
}
