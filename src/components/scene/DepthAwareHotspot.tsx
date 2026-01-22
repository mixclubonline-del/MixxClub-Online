/**
 * Depth-Aware Studio Hotspot
 * 
 * Progressive revelation based on user depth:
 * - Posted Up (Layer 0): Glowing door indicator only
 * - In the Room (Layer 1): See avatars behind doors
 * - On the Mic (Layer 2): Can click to enter sessions
 * - On Stage (Layer 3): Featured with enhanced glow
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import type { StudioRoom } from '@/types/scene';
import type { DepthLayer } from '@/types/depth';

interface DepthAwareHotspotProps {
  room: StudioRoom;
  position: { x: number; y: number };
  depthLayer: DepthLayer;
  isUserFeatured?: boolean;
  onClick: () => void;
}

// Avatar placeholder - shows participant presence
function ParticipantAvatars({ count, isVisible }: { count: number; isVisible: boolean }) {
  if (!isVisible || count === 0) return null;
  
  const displayCount = Math.min(count, 3);
  const overflow = count - displayCount;
  
  return (
    <motion.div
      className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex -space-x-2"
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {Array.from({ length: displayCount }).map((_, i) => (
        <div
          key={i}
          className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/60 to-primary/30 border border-primary/40 backdrop-blur-sm"
          style={{ zIndex: displayCount - i }}
        />
      ))}
      {overflow > 0 && (
        <div className="w-5 h-5 rounded-full bg-muted/80 border border-border text-[10px] flex items-center justify-center text-muted-foreground font-medium">
          +{overflow}
        </div>
      )}
    </motion.div>
  );
}

// Posted Up view - ambient glow only, no interaction
function PostedUpView({ room, position }: { room: StudioRoom; position: { x: number; y: number } }) {
  const isActive = room.state !== 'idle' && room.state !== 'waiting';
  
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ 
        left: `${position.x}%`, 
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Ambient glow - visible but not interactive */}
      <motion.div
        className={`w-8 h-8 rounded-full ${isActive ? 'bg-primary/40' : 'bg-muted/20'}`}
        animate={isActive ? {
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.7, 0.4]
        } : {
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Subtle outer ring for active sessions */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full border border-primary/20"
          style={{ width: '48px', height: '48px', left: '-8px', top: '-8px' }}
          animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

// In the Room view - can see who's inside
function InTheRoomView({ room, position }: { room: StudioRoom; position: { x: number; y: number } }) {
  const [isHovered, setIsHovered] = useState(false);
  const isActive = room.state !== 'idle' && room.state !== 'waiting';
  
  return (
    <motion.div
      className="absolute"
      style={{ 
        left: `${position.x}%`, 
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      {/* Door indicator with presence awareness */}
      <motion.div
        className={`
          w-10 h-10 rounded-full border-2 backdrop-blur-sm
          transition-colors duration-300
          ${isActive 
            ? 'bg-primary/30 border-primary/60' 
            : 'bg-muted/20 border-muted-foreground/20'
          }
        `}
        animate={isActive ? {
          boxShadow: ['0 0 15px 3px hsl(var(--primary) / 0.3)', '0 0 25px 5px hsl(var(--primary) / 0.2)', '0 0 15px 3px hsl(var(--primary) / 0.3)']
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {isActive && (
          <div className="absolute inset-2 rounded-full bg-primary/40" />
        )}
      </motion.div>
      
      {/* Participant avatars - visible at this depth */}
      <ParticipantAvatars count={room.participantCount} isVisible={isActive} />
      
      {/* Hover info */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-1/2 -translate-x-1/2 -top-14 z-20 pointer-events-none"
        >
          <div className="bg-background/95 backdrop-blur-md border border-border/50 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
            <p className="text-sm font-medium text-foreground truncate max-w-[180px]">
              {room.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {isActive ? `${room.participantCount} creating` : 'Waiting for session'}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// On the Mic view - full interaction enabled
function OnTheMicView({ 
  room, 
  position, 
  onClick 
}: { 
  room: StudioRoom; 
  position: { x: number; y: number };
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isActive = room.state !== 'idle' && room.state !== 'waiting';
  const isRecording = room.state === 'recording';
  const canEnter = room.visibility === 'public' && room.sessionId;
  
  return (
    <motion.div
      className={`absolute group ${canEnter ? 'cursor-pointer' : 'cursor-default'}`}
      style={{ 
        left: `${position.x}%`, 
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={canEnter ? onClick : undefined}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      whileHover={canEnter ? { scale: 1.15 } : {}}
      whileTap={canEnter ? { scale: 0.95 } : {}}
    >
      {/* Outer interactive ring */}
      {isActive && (
        <motion.div
          className="absolute rounded-full bg-primary/20"
          style={{ 
            width: '72px', 
            height: '72px',
            left: '-16px',
            top: '-16px'
          }}
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.4, 0.15, 0.4]
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      
      {/* Main hotspot - fully interactive */}
      <motion.div
        className={`
          relative w-10 h-10 rounded-full border-2 backdrop-blur-sm
          transition-all duration-300
          ${isActive 
            ? 'bg-primary/40 border-primary shadow-lg shadow-primary/40' 
            : 'bg-muted/20 border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/10'
          }
        `}
        animate={isRecording ? {
          boxShadow: [
            '0 0 20px 5px hsl(var(--destructive) / 0.5)',
            '0 0 35px 10px hsl(var(--destructive) / 0.3)',
            '0 0 20px 5px hsl(var(--destructive) / 0.5)'
          ]
        } : {}}
        transition={isRecording ? { duration: 1.2, repeat: Infinity } : {}}
      >
        {/* Recording indicator */}
        {isRecording && (
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-destructive"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
        )}
        
        {/* Active glow */}
        {isActive && !isRecording && (
          <div className="absolute inset-2 rounded-full bg-primary/60" />
        )}
        
        {/* Enter indicator for clickable sessions */}
        {canEnter && isHovered && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary"
            initial={{ scale: 1, opacity: 0 }}
            animate={{ scale: 1.3, opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.div>
      
      {/* Participant avatars */}
      <ParticipantAvatars count={room.participantCount} isVisible={isActive} />
      
      {/* Interactive tooltip */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="absolute left-1/2 -translate-x-1/2 -top-16 z-20 pointer-events-none"
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
            {canEnter && (
              <p className="text-xs text-accent-foreground mt-1">Click to enter</p>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// On Stage view - featured with maximum presence
function OnStageView({ 
  room, 
  position, 
  isUserFeatured,
  onClick 
}: { 
  room: StudioRoom; 
  position: { x: number; y: number };
  isUserFeatured?: boolean;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isActive = room.state !== 'idle' && room.state !== 'waiting';
  const isRecording = room.state === 'recording';
  const canEnter = room.visibility === 'public' && room.sessionId;
  
  return (
    <motion.div
      className={`absolute group ${canEnter ? 'cursor-pointer' : 'cursor-default'}`}
      style={{ 
        left: `${position.x}%`, 
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={canEnter ? onClick : undefined}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      whileHover={canEnter ? { scale: 1.2 } : {}}
      whileTap={canEnter ? { scale: 0.95 } : {}}
    >
      {/* Featured glow aura - extra prominent for On Stage users */}
      {(isActive || isUserFeatured) && (
        <>
          <motion.div
            className="absolute rounded-full bg-primary/25"
            style={{ 
              width: '100px', 
              height: '100px',
              left: '-30px',
              top: '-30px'
            }}
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.1, 0.3]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute rounded-full bg-primary/15"
            style={{ 
              width: '140px', 
              height: '140px',
              left: '-50px',
              top: '-50px'
            }}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.05, 0.2]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />
        </>
      )}
      
      {/* User's featured indicator */}
      {isUserFeatured && (
        <motion.div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-primary/90 text-primary-foreground text-[10px] font-semibold"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          YOU
        </motion.div>
      )}
      
      {/* Main hotspot - premium styling */}
      <motion.div
        className={`
          relative w-12 h-12 rounded-full border-2 backdrop-blur-sm
          transition-all duration-300
          ${isActive || isUserFeatured
            ? 'bg-primary/50 border-primary shadow-xl shadow-primary/50' 
            : 'bg-muted/30 border-muted-foreground/40 hover:border-primary/60 hover:bg-primary/20'
          }
        `}
        animate={isRecording ? {
          boxShadow: [
            '0 0 25px 8px hsl(var(--destructive) / 0.5)',
            '0 0 45px 15px hsl(var(--destructive) / 0.3)',
            '0 0 25px 8px hsl(var(--destructive) / 0.5)'
          ]
        } : {}}
        transition={isRecording ? { duration: 1, repeat: Infinity } : {}}
      >
        {/* Recording indicator */}
        {isRecording && (
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-destructive"
            animate={{ opacity: [1, 0.3, 1], scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
        
        {/* Active premium glow */}
        {(isActive || isUserFeatured) && !isRecording && (
          <motion.div 
            className="absolute inset-2 rounded-full bg-primary/70"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.div>
      
      {/* Participant avatars - larger at this depth */}
      <ParticipantAvatars count={room.participantCount} isVisible={isActive} />
      
      {/* Premium tooltip */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="absolute left-1/2 -translate-x-1/2 -top-20 z-20 pointer-events-none"
        >
          <div className="bg-background/95 backdrop-blur-md border border-primary/30 rounded-lg px-4 py-2 shadow-2xl whitespace-nowrap">
            <p className="text-sm font-semibold text-foreground truncate max-w-[220px]">
              {room.title}
            </p>
            {isActive && (
              <p className="text-xs text-primary flex items-center gap-1.5">
                <motion.span 
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                {room.participantCount} creating now
              </p>
            )}
            {canEnter && (
              <p className="text-xs text-accent-foreground mt-1 font-medium">Click to join</p>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// Main export - routes to correct view based on depth
export function DepthAwareHotspot({ 
  room, 
  position, 
  depthLayer,
  isUserFeatured,
  onClick 
}: DepthAwareHotspotProps) {
  switch (depthLayer) {
    case 'posted-up':
      return <PostedUpView room={room} position={position} />;
    case 'in-the-room':
      return <InTheRoomView room={room} position={position} />;
    case 'on-the-mic':
      return <OnTheMicView room={room} position={position} onClick={onClick} />;
    case 'on-stage':
      return <OnStageView room={room} position={position} isUserFeatured={isUserFeatured} onClick={onClick} />;
    default:
      return <PostedUpView room={room} position={position} />;
  }
}
