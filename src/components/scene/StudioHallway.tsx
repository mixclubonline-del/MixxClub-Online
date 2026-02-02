/**
 * Studio Hallway Component
 * 
 * An immersive, WORDLESS visualization of MixClub's active sessions.
 * Uses AI-generated hallway imagery with visual hotspots for active rooms.
 * 
 * The entire hallway is clickable - no literal "Enter" buttons.
 * Atmospheric life layers make the space feel alive even when empty.
 * 
 * Depth-Aware Revelation:
 * - Posted Up: See glowing doors (ambient awareness)
 * - In the Room: See avatars behind doors (who's creating)
 * - On the Mic: Can enter sessions (full interaction)
 * - On Stage: Featured glow (you ARE the energy)
 */

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudios, useFeaturedSession, useSceneSystemInit } from '@/hooks/useSceneSystem';
import { useFlowNavigation } from '@/core/fabric/useFlow';
import { useDepthLayer } from '@/hooks/useDepthLayer';
import { useAuth } from '@/hooks/useAuth';
import { DepthAwareHotspot } from './DepthAwareHotspot';
import { HallwayAmbience } from './HallwayAmbience';
import { ActivityPulse } from './ActivityPulse';
import { DoorFlicker } from './DoorFlicker';
import type { StudioRoom } from '@/types/scene';

// Static imports for hallway backgrounds
import hallwayBase from '@/assets/studio-hallway-base.jpg';
import hallwayActive from '@/assets/studio-hallway-active.jpg';

// Door positions mapped to the hallway image perspective
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

interface StudioHallwayProps {
  fullscreen?: boolean;
  onEnter?: () => void;
}

export function StudioHallway({ fullscreen = false, onEnter }: StudioHallwayProps) {
  const { navigateTo } = useFlowNavigation();
  const { user } = useAuth();
  const { isConnected } = useSceneSystemInit();
  const { studios, activeCount } = useStudios();
  const { featuredSession } = useFeaturedSession();
  const { currentLayer, isOnStage } = useDepthLayer();
  const [imageError, setImageError] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  const hasActiveSessions = activeCount > 0;
  
  // Ambient intensity based on activity
  const ambientIntensity = useMemo(() => {
    if (hasActiveSessions) return Math.min(0.5 + (activeCount * 0.1), 1);
    return 0.3; // Low but present - always some life
  }, [hasActiveSessions, activeCount]);
  
  // Check if current user has a featured session (On Stage gets the glow)
  const userFeaturedRoomId = useMemo(() => {
    if (!user || !isOnStage) return null;
    const userRoom = studios.find(
      s => s.hostId === user.id && s.state !== 'idle' && s.state !== 'waiting'
    );
    return userRoom?.id || null;
  }, [user, isOnStage, studios]);
  
  const handleRoomClick = (room: StudioRoom) => {
    // Only On the Mic and On Stage can enter sessions
    if (currentLayer === 'posted-up' || currentLayer === 'in-the-room') {
      return;
    }
    
    if (room.visibility === 'public' && room.sessionId) {
      navigateTo(`/session/${room.sessionId}`);
    }
  };
  
  // Handle click anywhere in the hallway (fullscreen mode)
  const handleHallwayClick = useCallback(() => {
    if (fullscreen && onEnter) {
      onEnter();
    }
  }, [fullscreen, onEnter]);
  
  // Map studios to door positions
  const studioPositions = studios.slice(0, DOOR_POSITIONS.length).map((studio, index) => ({
    room: studio,
    position: DOOR_POSITIONS[index]
  }));
  
  return (
    <section 
      className={`relative w-full overflow-hidden ${
        fullscreen ? 'h-screen cursor-pointer' : 'h-[70vh] min-h-[500px] max-h-[800px]'
      }`}
      onClick={handleHallwayClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Background image - crossfade between base and active, with fallback */}
      <div className="absolute inset-0">
        {imageError ? (
          <div className="absolute inset-0 bg-gradient-to-br from-muted via-background to-muted">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.1),transparent_60%)]" />
          </div>
        ) : (
          <>
            {/* Base (dark/empty) layer */}
            <motion.img
              src={hallwayBase}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 1 }}
              animate={{ opacity: hasActiveSessions ? 0 : 1 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              onError={() => setImageError(true)}
            />
            
            {/* Active (lit) layer */}
            <motion.img
              src={hallwayActive}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: hasActiveSessions ? 1 : 0 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              onError={() => setImageError(true)}
            />
          </>
        )}
        
        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background" />
      </div>
      
      {/* Ambient life layers - always active */}
      <HallwayAmbience intensity={ambientIntensity} />
      
      {/* Door flicker effect - simulated activity for cold start */}
      {!hasActiveSessions && (
        <DoorFlicker doorPositions={DOOR_POSITIONS} enabled={true} />
      )}
      
      {/* Perspective shift on hover - subtle "pull" effect */}
      {fullscreen && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            scale: isHovering ? 1.02 : 1,
            y: isHovering ? -8 : 0
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      )}
      
      {/* Connection indicator - minimal, top-right */}
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
      
      {/* Studio hotspots - depth-aware rendering */}
      <div className="absolute inset-0">
        <AnimatePresence mode="sync">
          {studioPositions.map(({ room, position }) => (
            <DepthAwareHotspot
              key={room.id}
              room={room}
              position={position}
              depthLayer={currentLayer}
              isUserFeatured={room.id === userFeaturedRoomId}
              onClick={() => handleRoomClick(room)}
            />
          ))}
        </AnimatePresence>
      </div>
      
      {/* Featured session highlight - extra glow for On Stage users */}
      {featuredSession && isOnStage && (
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
                className="absolute w-40 h-40 rounded-full bg-primary/25 blur-3xl"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            );
          })}
        </motion.div>
      )}
      
      {/* Activity Pulse - ALWAYS visible, wordless */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <ActivityPulse sessionCount={activeCount} />
      </motion.div>
      
      {/* Subtle scroll/click hint - fullscreen only, appears after delay */}
      {fullscreen && onEnter && (
        <motion.div
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovering ? 0.8 : 0.4 }}
          transition={{ delay: 3, duration: 0.5 }}
        >
          <motion.div
            className="flex flex-col items-center gap-2"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Downward chevrons - universal "proceed" symbol */}
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              className="text-foreground/40"
            >
              <path 
                d="M6 9L12 15L18 9" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              className="text-foreground/20 -mt-4"
            >
              <path 
                d="M6 9L12 15L18 9" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
