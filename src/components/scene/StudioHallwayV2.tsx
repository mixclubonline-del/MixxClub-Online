/**
 * Studio Hallway V2 — Double-Door Entrance
 * 
 * Two doors split "MIXX | CLUB" — left door (Artists, warm orange),
 * right door (Engineers, cool cyan). Branding is baked into the
 * background image; overlays handle interactivity only.
 * 
 * Supports dynamic background assets via useDynamicHallwayAssets
 * (video or image) with static fallback.
 */

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mic, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStudios, useFeaturedSession, useSceneSystemInit, useCommunityPulse } from '@/hooks/useSceneSystem';
import { useDepthLayer } from '@/hooks/useDepthLayer';
import { useAuth } from '@/hooks/useAuth';
import { DepthAwareHotspot } from './DepthAwareHotspot';
import { useHallwayAmbience } from '@/hooks/useHallwayAmbience';
import { useDynamicHallwayAssets } from '@/hooks/useDynamicHallwayAssets';
import type { StudioRoom } from '@/types/scene';

import hallwayDoubleDoorFallback from '@/assets/hallway-double-door-base.jpg';

// Side-wall hotspot positions (doors along the side walls, not center)
const SIDE_DOOR_POSITIONS = [
  { x: 8, y: 50 },
  { x: 10, y: 62 },
  { x: 92, y: 50 },
  { x: 90, y: 62 },
  { x: 50, y: 80 },
  { x: 20, y: 78 },
  { x: 80, y: 78 },
];

interface StudioHallwayV2Props {
  fullscreen?: boolean;
  onEnter?: () => void;
  trackConversion?: (event: string, data?: Record<string, unknown>) => void;
}

export function StudioHallwayV2({ fullscreen = false, onEnter, trackConversion }: StudioHallwayV2Props) {
  const navigate = useNavigate();
  const [showSkipHint, setShowSkipHint] = useState(false);
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);
  const [hoveredDoor, setHoveredDoor] = useState<'left' | 'right' | null>(null);
  const [openingDoor, setOpeningDoor] = useState<'left' | 'right' | null>(null);
  const { user } = useAuth();
  const { isConnected } = useSceneSystemInit();
  const { studios, activeCount } = useStudios();
  const communityPulse = useCommunityPulse();
  const { featuredSession } = useFeaturedSession();
  const { currentLayer, isOnStage } = useDepthLayer();
  const [imageError, setImageError] = useState(false);
  const ambienceStartedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Dynamic asset system — pulls from brand_assets DB, falls back to static import
  const { getBackgroundUrl, isVideo: checkIsVideo, isLoading: assetsLoading } = useDynamicHallwayAssets();

  const { startAmbience } = useHallwayAmbience(studios, hoveredRoomId);

  const hasActiveSessions = activeCount > 0;

  // Resolve background: DB asset → static fallback
  const dynamicUrl = getBackgroundUrl(hasActiveSessions);
  const backgroundUrl = dynamicUrl || hallwayDoubleDoorFallback;
  const backgroundIsVideo = dynamicUrl ? checkIsVideo(hasActiveSessions) : false;

  const ensureAmbience = useCallback(() => {
    if (!ambienceStartedRef.current) {
      ambienceStartedRef.current = true;
      startAmbience();
    }
  }, [startAmbience]);

  const handleHoverChange = useCallback((roomId: string, hovered: boolean) => {
    ensureAmbience();
    setHoveredRoomId(hovered ? roomId : null);
  }, [ensureAmbience]);

  useEffect(() => {
    if (!fullscreen) return;
    const timer = setTimeout(() => setShowSkipHint(true), 3000);
    return () => clearTimeout(timer);
  }, [fullscreen]);

  // Auto-play video backgrounds
  useEffect(() => {
    if (backgroundIsVideo && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [backgroundIsVideo, backgroundUrl]);

  const userFeaturedRoomId = useMemo(() => {
    if (!user || !isOnStage) return null;
    const userRoom = studios.find(
      s => s.hostId === user.id && s.state !== 'idle' && s.state !== 'waiting'
    );
    return userRoom?.id || null;
  }, [user, isOnStage, studios]);

  const handleRoomClick = (room: StudioRoom) => {
    if (currentLayer === 'posted-up' || currentLayer === 'in-the-room') return;
    if (room.visibility === 'public' && room.sessionId) {
      navigate(`/session/${room.sessionId}`);
    }
  };

  const handleDoorClick = (door: 'left' | 'right') => {
    ensureAmbience();
    const role = door === 'left' ? 'artist' : 'engineer';
    trackConversion?.(`door_click_${role}`, { door });

    // Start door-opening animation
    setOpeningDoor(door);

    // Navigate after animation completes
    setTimeout(() => {
      if (user) {
        // Authenticated → go straight to the experience
        navigate(`/home?path=${role}`);
      } else {
        // Unauthenticated → auth wizard with role pre-selected
        navigate(`/auth?mode=signup&role=${role}`);
      }
    }, 500);
  };

  const studioPositions = studios.slice(0, SIDE_DOOR_POSITIONS.length).map((studio, index) => ({
    room: studio,
    position: SIDE_DOOR_POSITIONS[index]
  }));

  return (
    <section
      className={`relative w-full overflow-hidden ${fullscreen ? 'h-screen' : 'h-[70vh] min-h-[500px] max-h-[800px]'}`}
      aria-label="Studio hallway entrance"
    >
      {/* Background — dynamic video/image with static fallback */}
      <div className="absolute inset-0">
        {imageError && !backgroundIsVideo ? (
          <div className="absolute inset-0 bg-gradient-to-br from-muted via-background to-muted">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.1),transparent_60%)]" />
          </div>
        ) : backgroundIsVideo ? (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          >
            <video
              ref={videoRef}
              src={backgroundUrl}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          </motion.div>
        ) : (
          <motion.img
            key={backgroundUrl}
            src={backgroundUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            onError={() => setImageError(true)}
          />
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background" />
      </div>

      {/* Ambient breathing for empty state */}
      {!hasActiveSessions && (
        <motion.div
          className="absolute inset-0 bg-primary/5"
          animate={{ opacity: [0, 0.1, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* ═══ INTERACTIVE DOOR ZONES ═══ */}
      {/* Absolute-positioned to align with background image doors */}
      {fullscreen && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* Door-opening flash overlay */}
          <AnimatePresence>
            {openingDoor && (
              <motion.div
                className="absolute inset-0 z-50 bg-white pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeIn' }}
              />
            )}
          </AnimatePresence>

          {/* LEFT DOOR — Artists */}
          <motion.button
            className="pointer-events-auto absolute rounded-2xl border border-transparent cursor-pointer overflow-hidden group"
            style={{
              left: '22%',
              top: '20%',
              width: '22%',
              height: '55%',
              background: hoveredDoor === 'left'
                ? 'radial-gradient(ellipse at center, hsl(25 95% 55% / 0.15), transparent 70%)'
                : 'transparent',
            }}
            onMouseEnter={() => { setHoveredDoor('left'); ensureAmbience(); }}
            onMouseLeave={() => setHoveredDoor(null)}
            onClick={() => handleDoorClick('left')}
            animate={openingDoor === 'left' ? { scale: 1.08, opacity: 0.6 } : {}}
            whileHover={!openingDoor ? { scale: 1.02 } : {}}
            whileTap={!openingDoor ? { scale: 0.98 } : {}}
            aria-label="Enter as an Artist"
          >
            {/* Edge glow */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                boxShadow: '0 0 40px 8px hsl(25 95% 55% / 0.2), inset 0 0 30px hsl(25 95% 55% / 0.1)',
              }}
              animate={{ opacity: hoveredDoor === 'left' ? 1 : 0.2 }}
              transition={{ duration: 0.4 }}
            />

            {/* Door-crack light effect on hover */}
            <motion.div
              className="absolute top-0 bottom-0 w-[3px]"
              style={{
                right: 0,
                background: 'linear-gradient(to bottom, transparent, hsl(25 95% 70% / 0.9), hsl(25 95% 55% / 0.6), transparent)',
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{
                scaleX: hoveredDoor === 'left' ? 1 : 0,
                opacity: hoveredDoor === 'left' ? 1 : 0,
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
            {/* Spill light from crack */}
            <motion.div
              className="absolute top-[10%] bottom-[10%] w-[30px]"
              style={{
                right: 0,
                background: 'linear-gradient(to left, hsl(25 95% 60% / 0.3), transparent)',
                filter: 'blur(8px)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: hoveredDoor === 'left' ? 1 : 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            />

            {/* Label — reveals on hover */}
            <AnimatePresence>
              {hoveredDoor === 'left' && (
                <motion.div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="w-14 h-14 rounded-full bg-[hsl(25_95%_55%/0.2)] flex items-center justify-center backdrop-blur-sm border border-[hsl(25_95%_55%/0.3)]"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Mic className="w-6 h-6 text-[hsl(25,95%,65%)]" />
                  </motion.div>
                  <span className="text-lg font-semibold tracking-wide text-[hsl(25,95%,75%)]">
                    Artists
                  </span>
                  <span className="text-xs text-muted-foreground/70">
                    Record · Collaborate · Release
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* RIGHT DOOR — Engineers */}
          <motion.button
            className="pointer-events-auto absolute rounded-2xl border border-transparent cursor-pointer overflow-hidden group"
            style={{
              right: '22%',
              top: '20%',
              width: '22%',
              height: '55%',
              background: hoveredDoor === 'right'
                ? 'radial-gradient(ellipse at center, hsl(190 100% 55% / 0.15), transparent 70%)'
                : 'transparent',
            }}
            onMouseEnter={() => { setHoveredDoor('right'); ensureAmbience(); }}
            onMouseLeave={() => setHoveredDoor(null)}
            onClick={() => handleDoorClick('right')}
            animate={openingDoor === 'right' ? { scale: 1.08, opacity: 0.6 } : {}}
            whileHover={!openingDoor ? { scale: 1.02 } : {}}
            whileTap={!openingDoor ? { scale: 0.98 } : {}}
            aria-label="Enter as an Engineer"
          >
            {/* Edge glow */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                boxShadow: '0 0 40px 8px hsl(190 100% 55% / 0.2), inset 0 0 30px hsl(190 100% 55% / 0.1)',
              }}
              animate={{ opacity: hoveredDoor === 'right' ? 1 : 0.2 }}
              transition={{ duration: 0.4 }}
            />

            {/* Door-crack light effect on hover */}
            <motion.div
              className="absolute top-0 bottom-0 w-[3px]"
              style={{
                left: 0,
                background: 'linear-gradient(to bottom, transparent, hsl(190 100% 70% / 0.9), hsl(190 100% 55% / 0.6), transparent)',
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{
                scaleX: hoveredDoor === 'right' ? 1 : 0,
                opacity: hoveredDoor === 'right' ? 1 : 0,
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
            {/* Spill light from crack */}
            <motion.div
              className="absolute top-[10%] bottom-[10%] w-[30px]"
              style={{
                left: 0,
                background: 'linear-gradient(to right, hsl(190 100% 60% / 0.3), transparent)',
                filter: 'blur(8px)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: hoveredDoor === 'right' ? 1 : 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            />

            {/* Label — reveals on hover */}
            <AnimatePresence>
              {hoveredDoor === 'right' && (
                <motion.div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="w-14 h-14 rounded-full bg-[hsl(190_100%_55%/0.2)] flex items-center justify-center backdrop-blur-sm border border-[hsl(190_100%_55%/0.3)]"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Headphones className="w-6 h-6 text-[hsl(190,100%,65%)]" />
                  </motion.div>
                  <span className="text-lg font-semibold tracking-wide text-[hsl(190,100%,75%)]">
                    Engineers
                  </span>
                  <span className="text-xs text-muted-foreground/70">
                    Mix · Master · Build Your Roster
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      )}

      {/* "Choose your door" hint — first-time visitors */}
      {fullscreen && !hoveredDoor && (
        <motion.p
          className="absolute top-[58%] left-1/2 -translate-x-1/2 z-10 text-sm text-muted-foreground/40 tracking-widest uppercase pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          Choose your door
        </motion.p>
      )}

      {/* Depth layer indicator */}
      <motion.div
        className="absolute bottom-28 left-4 z-20"
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

      {/* Connection indicator */}
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

      {/* Studio side-wall hotspots */}
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
              onHoverChange={handleHoverChange}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Featured session glow */}
      {featuredSession && isOnStage && (
        <motion.div className="absolute inset-0 pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {studioPositions.map(({ room, position }) => {
            if (room.id !== featuredSession.room.id) return null;
            return (
              <motion.div
                key={`featured-${room.id}`}
                className="absolute w-40 h-40 rounded-full bg-primary/25 blur-3xl"
                style={{ left: `${position.x}%`, top: `${position.y}%`, transform: 'translate(-50%, -50%)' }}
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            );
          })}
        </motion.div>
      )}

      {/* Entry CTA area — centered under "Choose your door" */}
      {fullscreen && onEnter && (
        <motion.div
          className="absolute bottom-12 left-[calc(50%-35px)] -translate-x-1/2 z-20 flex flex-col items-center justify-center gap-4 w-full max-w-md px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          {/* Main CTA */}
          <motion.button
            onClick={() => {
              ensureAmbience();
              trackConversion?.('enter_club_click');
              onEnter();
            }}
            aria-label="Enter the club"
            className="mg-panel group flex flex-col items-center gap-3 px-8 py-4 rounded-2xl hover:border-primary/60 transition-all"
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

          {/* Sign In */}
          {!user && (
            <motion.button
              onClick={() => navigate('/auth?mode=login')}
              aria-label="Sign in to your account"
              className="mg-panel group flex items-center gap-2 px-6 py-3 rounded-xl hover:border-primary/60 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <Lock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                Sign In
              </span>
            </motion.button>
          )}

          {/* Social proof */}
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-emerald-500"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs text-muted-foreground/60">
              {communityPulse.totalUsers > 0
                ? `${communityPulse.totalUsers.toLocaleString()} creators have walked this hallway`
                : 'Artists, engineers, producers, and fans are collaborating across the community'}
            </span>
          </motion.div>

          {/* Keyboard hint */}
          <motion.span
            className="hidden md:block text-[10px] font-mono text-muted-foreground/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
          >
            press ENTER to step inside
          </motion.span>
        </motion.div>
      )}

      {/* Posted Up prompt */}
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

      {/* "Been here before?" sign-in shortcut */}
      {fullscreen && showSkipHint && (
        <motion.button
          onClick={() => navigate('/auth?mode=login')}
          aria-label="Sign in to your account"
          className="mg-pill absolute bottom-6 left-1/2 -translate-x-1/2 z-20 text-muted-foreground/70 hover:text-foreground hover:bg-primary/10 transition-all text-xs flex items-center gap-1.5 px-4 py-2"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Lock className="w-3 h-3" />
          <span>Sign In</span>
        </motion.button>
      )}
    </section>
  );
}
