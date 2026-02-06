/**
 * Club Progress
 * 
 * Vertical progress indicator showing which room user is viewing.
 * Styled as minimalist dots with subtle room labels.
 */

import { motion } from 'framer-motion';

const ROOMS = [
  { id: 'listening', label: 'Listen' },
  { id: 'green', label: 'Meet' },
  { id: 'control', label: 'How' },
  { id: 'vip', label: 'Join' },
  { id: 'stage', label: 'Enter' },
];

interface ClubProgressProps {
  currentRoom: number;
  onRoomClick: (index: number) => void;
}

export function ClubProgress({ currentRoom, onRoomClick }: ClubProgressProps) {
  return (
    <motion.nav
      className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-center gap-3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1 }}
    >
      {ROOMS.map((room, index) => (
        <button
          key={room.id}
          onClick={() => onRoomClick(index)}
          className="group flex items-center gap-2"
          aria-label={`Go to ${room.label}`}
        >
          {/* Label - appears on hover */}
          <span className="text-xs text-muted-foreground/0 group-hover:text-muted-foreground/70 transition-colors">
            {room.label}
          </span>
          
          {/* Dot */}
          <motion.div
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentRoom 
                ? 'bg-primary' 
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
            animate={index === currentRoom ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </button>
      ))}
    </motion.nav>
  );
}
