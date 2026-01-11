/**
 * Studio Hotspot Component
 * 
 * A visual indicator representing a studio "door" in the hallway.
 * Glows when active, pulses when recording. No text labels.
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import type { StudioRoom } from '@/types/scene';

interface StudioHotspotProps {
  room: StudioRoom;
  position: { x: number; y: number };
  onClick: () => void;
}

export function StudioHotspot({ room, position, onClick }: StudioHotspotProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const isActive = room.state !== 'idle' && room.state !== 'waiting';
  const isRecording = room.state === 'recording';
  
  return (
    <motion.div
      className="absolute cursor-pointer group"
      style={{ 
        left: `${position.x}%`, 
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Outer glow ring for active sessions */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/30"
          style={{ 
            width: '80px', 
            height: '80px',
            left: '-20px',
            top: '-20px'
          }}
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.5, 0.2, 0.5]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}
      
      {/* Main hotspot circle */}
      <motion.div
        className={`
          relative w-10 h-10 rounded-full border-2 backdrop-blur-sm
          transition-colors duration-300
          ${isActive 
            ? 'bg-primary/40 border-primary shadow-lg shadow-primary/50' 
            : 'bg-muted/20 border-muted-foreground/30 hover:border-muted-foreground/60'
          }
        `}
        animate={isRecording ? {
          boxShadow: [
            '0 0 20px 5px hsl(var(--destructive) / 0.5)',
            '0 0 30px 10px hsl(var(--destructive) / 0.3)',
            '0 0 20px 5px hsl(var(--destructive) / 0.5)'
          ]
        } : {}}
        transition={isRecording ? { duration: 1.5, repeat: Infinity } : {}}
      >
        {/* Recording indicator - red dot */}
        {isRecording && (
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-destructive"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
        
        {/* Active session inner glow */}
        {isActive && !isRecording && (
          <div className="absolute inset-2 rounded-full bg-primary/60" />
        )}
      </motion.div>
      
      {/* Hover tooltip - minimal, appears on hover only */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute left-1/2 -translate-x-1/2 -bottom-12 z-20 pointer-events-none"
        >
          <div className="bg-background/95 backdrop-blur-md border border-border/50 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
            <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
              {room.title}
            </p>
            {isActive && (
              <p className="text-xs text-primary flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {room.participantCount} in session
              </p>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
