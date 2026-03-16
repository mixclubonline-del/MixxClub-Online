/**
 * Club Progress
 * 
 * Vertical progress indicator with connecting line and active room label.
 * Shows all 6 rooms with scroll progress visualization.
 */

import { motion } from 'framer-motion';

const ROOMS = [
  { id: 'listening', label: 'Listen' },
  { id: 'vault', label: 'Vault' },
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
  const progressPercent = ROOMS.length > 1 ? (currentRoom / (ROOMS.length - 1)) * 100 : 0;

  return (
    <motion.nav
      className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-center gap-0"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1 }}
    >
      {ROOMS.map((room, index) => (
        <div key={room.id} className="flex flex-col items-center">
          <button
            onClick={() => onRoomClick(index)}
            className="group flex items-center gap-2 py-1.5"
            aria-label={`Go to ${room.label}`}
          >
            {/* Label — visible when active or on hover */}
            <motion.span
              className="text-xs font-medium transition-all whitespace-nowrap"
              animate={{
                opacity: index === currentRoom ? 0.8 : 0,
                x: index === currentRoom ? 0 : 4,
              }}
              style={{ color: 'hsl(var(--primary))' }}
            >
              <span className="group-hover:opacity-70 opacity-0 transition-opacity" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {room.label}
              </span>
              {index === currentRoom && (
                <span>{room.label}</span>
              )}
            </motion.span>

            {/* Dot */}
            <motion.div
              className="relative w-2.5 h-2.5 rounded-full transition-colors"
              style={{
                background: index === currentRoom
                  ? 'hsl(var(--primary))'
                  : index < currentRoom
                    ? 'hsl(var(--primary) / 0.4)'
                    : 'hsl(var(--muted-foreground) / 0.25)',
                boxShadow: index === currentRoom ? '0 0 8px hsl(var(--primary) / 0.5)' : 'none',
              }}
              animate={index === currentRoom ? { scale: [1, 1.3, 1] } : { scale: 1 }}
              transition={{ duration: 1.5, repeat: index === currentRoom ? Infinity : 0 }}
            />
          </button>

          {/* Connecting line between dots */}
          {index < ROOMS.length - 1 && (
            <div className="relative w-0.5 h-3">
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: 'hsl(var(--muted-foreground) / 0.12)' }}
              />
              {/* Fill based on progress */}
              <motion.div
                className="absolute inset-x-0 top-0 rounded-full"
                style={{ background: 'hsl(var(--primary) / 0.5)' }}
                animate={{
                  height: index < currentRoom ? '100%' : '0%',
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}
        </div>
      ))}
    </motion.nav>
  );
}
