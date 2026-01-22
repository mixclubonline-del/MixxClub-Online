/**
 * Studio Hallway Component
 * 
 * An immersive, wordless visualization of MixClub's active sessions.
 * Uses AI-generated hallway imagery with visual hotspots for active rooms.
 * 
 * Depth-Aware Revelation:
 * - Posted Up: See glowing doors (ambient awareness)
 * - In the Room: See avatars behind doors (who's creating)
 * - On the Mic: Can enter sessions (full interaction)
 * - On Stage: Featured glow (you ARE the energy)
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStudios, useFeaturedSession, useSceneSystemInit } from '@/hooks/useSceneSystem';
import { useDepthLayer } from '@/hooks/useDepthLayer';
import { useAuth } from '@/hooks/useAuth';
import { DepthAwareHotspot } from './DepthAwareHotspot';
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected } = useSceneSystemInit();
  const { studios, activeCount } = useStudios();
  const { featuredSession } = useFeaturedSession();
  const { currentLayer, isOnStage } = useDepthLayer();
  const [imageError, setImageError] = useState(false);
  
  const hasActiveSessions = activeCount > 0;
  
  // Check if current user has a featured session (On Stage gets the glow)
  const userFeaturedRoomId = useMemo(() => {
    if (!user || !isOnStage) return null;
    // Find if user hosts any active session
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
      navigate(`/session/${room.sessionId}`);
    }
  };
  
  // Map studios to door positions
  const studioPositions = studios.slice(0, DOOR_POSITIONS.length).map((studio, index) => ({
    room: studio,
    position: DOOR_POSITIONS[index]
  }));
  
  return (
    <section className={`relative w-full overflow-hidden ${
      fullscreen ? 'h-screen' : 'h-[70vh] min-h-[500px] max-h-[800px]'
    }`}>
      {/* Background image - crossfade between base and active, with fallback */}
      <div className="absolute inset-0">
        {imageError ? (
          /* Gradient fallback if images fail to load */
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
      
      {/* Ambient breathing animation for empty state */}
      {!hasActiveSessions && (
        <motion.div
          className="absolute inset-0 bg-primary/5"
          animate={{ opacity: [0, 0.1, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      
      {/* Depth layer indicator - shows current access level */}
      <motion.div
        className="absolute top-4 left-4 z-20"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/60 backdrop-blur-md border border-border/30">
          <div className={`w-2 h-2 rounded-full ${
            currentLayer === 'on-stage' ? 'bg-primary' :
            currentLayer === 'on-the-mic' ? 'bg-primary/80' :
            currentLayer === 'in-the-room' ? 'bg-primary/60' :
            'bg-muted-foreground/40'
          }`} />
          <span className="text-xs font-medium text-muted-foreground capitalize">
            {currentLayer.replace('-', ' ')}
          </span>
        </div>
      </motion.div>
      
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
      
      {/* Active session count indicator - visible to all but styled by depth */}
      {hasActiveSessions && (
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className={`
            flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border
            ${currentLayer === 'posted-up' 
              ? 'bg-background/60 border-border/30' 
              : 'bg-background/80 border-primary/30'
            }
          `}>
            <motion.div
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className={`text-sm font-medium ${
              currentLayer === 'posted-up' ? 'text-muted-foreground' : 'text-primary'
            }`}>
              {activeCount} {activeCount === 1 ? 'session' : 'sessions'} active
            </span>
          </div>
        </motion.div>
      )}
      
      {/* Entry CTA - fullscreen mode only */}
      {fullscreen && onEnter && (
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <motion.button
            onClick={onEnter}
            className="group flex flex-col items-center gap-3 px-8 py-4 rounded-2xl bg-background/60 backdrop-blur-md border border-primary/30 hover:border-primary/60 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-4 h-4 border-2 border-primary rounded-full" />
            </motion.div>
            <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">
              Enter the Club
            </span>
          </motion.button>
        </motion.div>
      )}

      {/* Posted Up prompt - gentle nudge to sign in (non-fullscreen) */}
      {!fullscreen && currentLayer === 'posted-up' && (
        <motion.div
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <p className="text-xs text-muted-foreground/60 text-center">
            Sign in to see who's creating
          </p>
        </motion.div>
      )}
    </section>
  );
}
