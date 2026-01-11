/**
 * Studio Hallway Component
 * 
 * An immersive, wordless visualization of MixClub's active sessions.
 * Uses AI-generated hallway imagery with visual hotspots for active rooms.
 * No text labels - atmosphere is the message.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStudios, useFeaturedSession, useSceneSystemInit } from '@/hooks/useSceneSystem';
import { StudioHotspot } from './StudioHotspot';
import type { StudioRoom } from '@/types/scene';

// Static imports for hallway backgrounds
import hallwayBase from '@/assets/studio-hallway-base.jpg';
import hallwayActive from '@/assets/studio-hallway-active.jpg';

// Door positions mapped to the hallway image perspective
// These correspond to where doors appear in the generated images
const DOOR_POSITIONS = [
  { x: 12, y: 45 },  // Left side, front
  { x: 15, y: 55 },  // Left side, second
  { x: 18, y: 65 },  // Left side, back
  { x: 88, y: 45 },  // Right side, front
  { x: 85, y: 55 },  // Right side, second
  { x: 82, y: 65 },  // Right side, back
  { x: 50, y: 75 },  // Center back
  { x: 25, y: 75 },  // Left back corner
  { x: 75, y: 75 },  // Right back corner
];

export function StudioHallway() {
  const navigate = useNavigate();
  const { isConnected } = useSceneSystemInit();
  const { studios, activeCount } = useStudios();
  const { featuredSession } = useFeaturedSession();
  
  const hasActiveSessions = activeCount > 0;
  
  const handleRoomClick = (room: StudioRoom) => {
    if (room.visibility === 'public' && room.sessionId) {
      navigate(`/session/${room.sessionId}`);
    }
  };
  
  // Map studios to door positions
  const studioPositions = studios.slice(0, DOOR_POSITIONS.length).map((studio, index) => ({
    room: studio,
    position: DOOR_POSITIONS[index]
  }));
  
  return (
    <section className="relative w-full h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden">
      {/* Background image - crossfade between base and active */}
      <div className="absolute inset-0">
        {/* Base (dark/empty) layer */}
        <motion.img
          src={hallwayBase}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 1 }}
          animate={{ opacity: hasActiveSessions ? 0 : 1 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />
        
        {/* Active (lit) layer */}
        <motion.img
          src={hallwayActive}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: hasActiveSessions ? 1 : 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />
        
        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background" />
      </div>
      
      {/* Ambient breathing animation for empty state */}
      {!hasActiveSessions && (
        <motion.div
          className="absolute inset-0 bg-primary/5"
          animate={{ opacity: [0, 0.1, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      
      {/* Connection indicator - subtle, positioned top-right */}
      <motion.div
        className="absolute top-4 right-4 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-muted'}`}
          animate={isConnected ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
      
      {/* Studio hotspots - visual door indicators */}
      <div className="absolute inset-0">
        <AnimatePresence mode="sync">
          {studioPositions.map(({ room, position }) => (
            <StudioHotspot
              key={room.id}
              room={room}
              position={position}
              onClick={() => handleRoomClick(room)}
            />
          ))}
        </AnimatePresence>
      </div>
      
      {/* Featured session highlight - larger glow for the featured room */}
      {featuredSession && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {studioPositions.map(({ room, position }) => {
            if (room.id !== featuredSession.room.id) return null;
            return (
              <motion.div
                key={`featured-${room.id}`}
                className="absolute w-32 h-32 rounded-full bg-primary/20 blur-2xl"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            );
          })}
        </motion.div>
      )}
      
      {/* Active session count indicator - subtle, bottom */}
      {hasActiveSessions && (
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-md border border-primary/30">
            <motion.div
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-sm font-medium text-primary">
              {activeCount}
            </span>
          </div>
        </motion.div>
      )}
    </section>
  );
}
