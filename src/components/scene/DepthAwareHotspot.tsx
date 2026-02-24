/**
 * Depth-Aware Studio Hotspot — "Light Under the Door"
 * 
 * Environmental presence signals that feel part of the hallway scene:
 * - DoorLightSpill: Horizontal gradient at door base (replaces glowing circle)
 * - BassRipple: Concentric floor ripples (replaces avatar dots)
 * - RecordingBeacon: Wall-mounted red light (replaces floating red dot)
 * - FrostedGlassReveal: Peering through door glass on hover (replaces tooltip)
 * - SpotlightBloom: Additive light bloom for On Stage users
 * 
 * Progressive revelation via depth layers — same logic, environmental visuals.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import type { StudioRoom } from '@/types/scene';
import type { DepthLayer } from '@/types/depth';

interface DepthAwareHotspotProps {
  room: StudioRoom;
  position: { x: number; y: number };
  depthLayer: DepthLayer;
  isUserFeatured?: boolean;
  onClick: () => void;
  onHoverChange?: (roomId: string, hovered: boolean) => void;
}

// ─── Presence Signal: Door Light Spill ────────────────────────────────
// Horizontal gradient at the door's floor line simulating light leaking out.
function DoorLightSpill({
  room,
  intensity
}: {
  room: StudioRoom;
  intensity: 'faint' | 'medium' | 'full';
}) {
  const isActive = room.state !== 'idle' && room.state !== 'waiting';
  const isRecording = room.state === 'recording';

  if (!isActive && intensity === 'faint') {
    // Idle rooms get a visible cool glow — enough to notice something's there
    return (
      <motion.div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ bottom: '-4px', width: '100px', height: '10px' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(220 15% 60% / 0.5), transparent 70%)',
          }}
        />
      </motion.div>
    );
  }

  if (!isActive) return null;

  const opacityScale = intensity === 'full' ? 1 : intensity === 'medium' ? 0.85 : 0.55;
  const width = intensity === 'full' ? '160px' : intensity === 'medium' ? '140px' : '110px';
  const height = intensity === 'full' ? '14px' : intensity === 'medium' ? '12px' : '10px';

  // Color: amber for active, red pulse for recording — boosted alpha
  const lightColor = isRecording
    ? 'hsl(0 80% 55% / 0.8)'
    : 'hsl(35 90% 55% / 0.7)';
  const lightColorDim = isRecording
    ? 'hsl(0 80% 55% / 0.35)'
    : 'hsl(35 90% 55% / 0.25)';
  const bloomColor = isRecording
    ? 'hsl(0 80% 50% / 0.2)'
    : 'hsl(35 90% 55% / 0.15)';

  return (
    <motion.div
      className="absolute left-1/2 -translate-x-1/2"
      style={{ bottom: '-4px', width, height }}
      initial={{ opacity: 0, scaleX: 0.5 }}
      animate={{
        opacity: opacityScale,
        scaleX: 1,
      }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      {/* Bloom glow — soft wide halo behind the spill */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          bottom: '-8px',
          width: `calc(${width} + 80px)`,
          height: '30px',
          background: `radial-gradient(ellipse at center, ${bloomColor}, transparent 70%)`,
          mixBlendMode: 'screen',
        }}
        animate={{ opacity: [0.5, 0.8, 0.5], scaleX: [0.95, 1.08, 0.95] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Primary light spill */}
      <motion.div
        className="w-full h-full rounded-full"
        style={{
          background: `radial-gradient(ellipse at center, ${lightColor}, ${lightColorDim} 60%, transparent 90%)`,
        }}
        animate={isRecording ? {
          opacity: [1, 0.6, 1],
        } : {
          opacity: [0.85, 1, 0.85],
        }}
        transition={{
          duration: isRecording ? 1.5 : 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      {/* Secondary scatter — wider, brighter */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 -bottom-2"
        style={{
          width: `calc(${width} + 50px)`,
          height: '16px',
          background: `radial-gradient(ellipse at center, ${lightColorDim}, transparent 80%)`,
        }}
        animate={{ opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}

// ─── Presence Signal: Bass Ripple ─────────────────────────────────────
// Concentric rings from door base — more participants = more energy.
function BassRipple({ participantCount }: { participantCount: number }) {
  if (participantCount === 0) return null;

  const rippleCount = Math.min(participantCount, 3);
  // More participants = faster ripples
  const baseDuration = Math.max(2, 4 - participantCount * 0.4);

  return (
    <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: '-8px' }}>
      {Array.from({ length: rippleCount }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 -translate-x-1/2 rounded-full border"
          style={{
            width: '24px',
            height: '12px',
            borderColor: 'hsl(35 90% 55% / 0.4)',
            borderWidth: '1.5px',
            bottom: '0px',
          }}
          initial={{ scaleX: 1, scaleY: 1, opacity: 0.6 }}
          animate={{
            scaleX: [1, 3.5 + i * 0.8],
            scaleY: [1, 2.5 + i * 0.5],
            opacity: [0.55, 0],
          }}
          transition={{
            duration: baseDuration + i * 0.5,
            repeat: Infinity,
            delay: i * (baseDuration / rippleCount),
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

// ─── Presence Signal: Recording Beacon ────────────────────────────────
// Wall-mounted red indicator light above the door.
function RecordingBeacon() {
  return (
    <motion.div
      className="absolute left-1/2 -translate-x-1/2"
      style={{ top: '-20px' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Beacon glow halo */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(0 80% 50% / 0.4), transparent 70%)',
          top: '50%',
        }}
        animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.3, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Beacon dot */}
      <motion.div
        className="relative w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: 'hsl(0 80% 55%)' }}
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}

// ─── Hover Reveal: Frosted Glass ──────────────────────────────────────
// Simulates peering through studio door window.
function FrostedGlassReveal({
  room,
  isVisible,
  canEnter
}: {
  room: StudioRoom;
  isVisible: boolean;
  canEnter: boolean;
}) {
  const isActive = room.state !== 'idle' && room.state !== 'waiting';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 z-20 pointer-events-none"
          style={{ top: '-60px' }}
          initial={{ opacity: 0, filter: 'blur(8px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, filter: 'blur(8px)' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div
            className="px-4 py-3 rounded-lg whitespace-nowrap"
            style={{
              background: 'hsl(var(--background) / 0.15)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid hsl(0 0% 100% / 0.08)',
              boxShadow: '0 8px 32px hsl(0 0% 0% / 0.3)',
            }}
          >
            <p className="text-sm font-medium text-foreground/90 truncate max-w-[200px]">
              {room.title}
            </p>
            {isActive && (
              <p className="text-xs text-foreground/50 mt-0.5">
                {room.participantCount} creating
              </p>
            )}
            {canEnter && (
              <p className="text-[10px] text-primary/70 mt-1 font-medium tracking-wide uppercase">
                Enter session
              </p>
            )}
          </div>
        </motion.div>
      )
      }
    </AnimatePresence >
  );
}

// ─── On Stage: Spotlight Bloom ────────────────────────────────────────
// Large additive-blend light that bleeds into the hallway floor.
function SpotlightBloom({ isUserFeatured }: { isUserFeatured: boolean }) {
  return (
    <motion.div
      className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
      style={{
        bottom: '-30px',
        width: '200px',
        height: '120px',
        mixBlendMode: 'screen',
      }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: 'easeOut' }}
    >
      <motion.div
        className="w-full h-full"
        style={{
          background: isUserFeatured
            ? 'radial-gradient(ellipse at center top, hsl(35 100% 60% / 0.35), hsl(35 90% 50% / 0.1) 50%, transparent 80%)'
            : 'radial-gradient(ellipse at center top, hsl(var(--primary) / 0.3), hsl(var(--primary) / 0.08) 50%, transparent 80%)',
        }}
        animate={{
          opacity: [0.6, 1, 0.6],
          scaleX: [0.95, 1.05, 0.95],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────
export function DepthAwareHotspot({
  room,
  position,
  depthLayer,
  isUserFeatured = false,
  onClick,
  onHoverChange,
}: DepthAwareHotspotProps) {
  const [isHovered, setIsHovered] = useState(false);

  const isActive = room.state !== 'idle' && room.state !== 'waiting';
  const isRecording = room.state === 'recording';
  const canEnter = (depthLayer === 'on-the-mic' || depthLayer === 'on-stage')
    && room.visibility === 'public'
    && !!room.sessionId;
  const isOnStage = depthLayer === 'on-stage';

  // Determine light intensity by depth
  const lightIntensity = useMemo((): 'faint' | 'medium' | 'full' => {
    switch (depthLayer) {
      case 'posted-up': return 'faint';
      case 'in-the-room': return 'medium';
      default: return 'full';
    }
  }, [depthLayer]);

  // Show bass ripples from "in-the-room" and above
  const showRipples = depthLayer !== 'posted-up' && isActive;
  // Show frosted glass on hover from "in-the-room" and above
  const showHoverInfo = depthLayer !== 'posted-up' && isHovered;

  return (
    <motion.div
      className={`absolute ${canEnter ? 'cursor-pointer' : 'cursor-default'}`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        onHoverChange?.(room.id, true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        onHoverChange?.(room.id, false);
      }}
      onClick={canEnter ? onClick : undefined}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Invisible hover target area */}
      <div className="relative" style={{ width: '60px', height: '40px' }}>

        {/* On Stage: Spotlight bloom behind everything */}
        {isOnStage && (isActive || isUserFeatured) && (
          <SpotlightBloom isUserFeatured={isUserFeatured} />
        )}

        {/* Recording Beacon — wall-mounted red light */}
        {isRecording && <RecordingBeacon />}

        {/* Door Light Spill — the core environmental signal */}
        <DoorLightSpill room={room} intensity={lightIntensity} />

        {/* Bass Ripple — energy level indicator */}
        {showRipples && <BassRipple participantCount={room.participantCount} />}

        {/* Interactive hover brightening for clickable doors */}
        {canEnter && isHovered && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2"
            style={{ bottom: '-4px', width: '160px', height: '14px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="w-full h-full rounded-full"
              style={{
                background: 'radial-gradient(ellipse at center, hsl(35 90% 60% / 0.3), transparent 70%)',
              }}
            />
          </motion.div>
        )}

        {/* Posted Up hover: subtle ambient glow response + teaser */}
        {depthLayer === 'posted-up' && isHovered && (
          <>
            <motion.div
              className="absolute left-1/2 -translate-x-1/2"
              style={{ bottom: '-4px', width: '120px', height: '12px' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: 'radial-gradient(ellipse at center, hsl(220 15% 70% / 0.4), transparent 70%)',
                }}
              />
            </motion.div>
            {isActive && (
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 z-20 pointer-events-none"
                style={{ top: '-40px' }}
                initial={{ opacity: 0, filter: 'blur(4px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(4px)' }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="px-3 py-1.5 rounded-lg whitespace-nowrap text-[10px] text-muted-foreground/60 italic"
                  style={{
                    background: 'hsl(var(--background) / 0.1)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid hsl(0 0% 100% / 0.05)',
                  }}
                >
                  Something's happening...
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Frosted Glass Reveal — hover info (In the Room+) */}
        <FrostedGlassReveal
          room={room}
          isVisible={showHoverInfo}
          canEnter={canEnter}
        />
      </div>
    </motion.div>
  );
}
