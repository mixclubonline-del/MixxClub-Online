import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useGlobalPlayer } from '@/contexts/GlobalPlayerContext';
import { isFullImmersiveRoute } from '@/config/immersiveRoutes';
import { useLiveActivity } from '@/hooks/useLiveActivity';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Z_INDEX } from '@/lib/z-index';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Shuffle, Repeat, Repeat1, ListMusic, ChevronUp, ChevronDown,
  Music2, Heart, Radio, Video, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const UniversalMediaPlayer: React.FC = () => {
  const location = useLocation();
  const { isPhone } = useBreakpoint();
  const { activities } = useLiveActivity();
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffled,
    repeatMode,
    queue,
    toggle,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    setRepeatMode,
    toggleQueue,
    isQueueOpen,
  } = useGlobalPlayer();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showVolume, setShowVolume] = useState(false);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const mediaType = currentTrack?.mediaType || 'audio';

  const handleRepeatClick = () => {
    const modes: ('none' | 'one' | 'all')[] = ['none', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    setRepeatMode(modes[(currentIndex + 1) % modes.length]);
  };

  if (!currentTrack || isFullImmersiveRoute(location.pathname)) return null;

  const mediaIcon = mediaType === 'video' ? Video : mediaType === 'live' ? Radio : Music2;
  const MediaIcon = mediaIcon;

  return (
    <>
      {/* Queue panel */}
      <AnimatePresence>
        {isQueueOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 -translate-x-1/2 bottom-44 w-80 max-h-72 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden"
            style={{ zIndex: Z_INDEX.musicPlayer + 1 }}
          >
            <div className="p-3 border-b border-border/50 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-foreground">Queue</h3>
                <p className="text-xs text-muted-foreground">{queue.length} tracks</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleQueue}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="overflow-y-auto max-h-48 hide-scrollbar">
              {queue.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <ListMusic className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Queue is empty</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {queue.map((track, index) => (
                    <div
                      key={`${track.id}-${index}`}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-accent/10 transition-colors"
                    >
                      {track.artworkUrl ? (
                        <img src={track.artworkUrl} alt={track.title} className="w-9 h-9 rounded object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded bg-primary/20 flex items-center justify-center">
                          <Music2 className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-foreground">{track.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main player — centered floating panel */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cn(
          "fixed left-1/2 -translate-x-1/2",
          "bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl",
          "transition-all duration-300",
          isExpanded ? "w-[420px] max-w-[95vw]" : "w-auto max-w-[95vw]",
          isPhone ? "bottom-24" : "bottom-6"
        )}
        style={{ zIndex: Z_INDEX.musicPlayer }}
      >
        {/* Compact pill */}
        <div className="flex items-center gap-3 p-2.5">
          {/* Artwork / media badge */}
          <div className="relative shrink-0">
            {currentTrack.artworkUrl ? (
              <img
                src={currentTrack.artworkUrl}
                alt={currentTrack.title}
                className={cn(
                  "rounded-xl object-cover shadow-lg",
                  isExpanded ? "w-14 h-14" : "w-11 h-11"
                )}
              />
            ) : (
              <div className={cn(
                "rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shadow-lg",
                isExpanded ? "w-14 h-14" : "w-11 h-11"
              )}>
                <MediaIcon className={cn("text-primary-foreground", isExpanded ? "w-7 h-7" : "w-5 h-5")} />
              </div>
            )}
            {mediaType === 'live' && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse border-2 border-card" />
            )}
          </div>

          {/* Track info */}
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-sm truncate text-foreground">{currentTrack.title}</h4>
            <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
          </div>

          {/* Core controls */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex" onClick={previous}>
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              onClick={toggle}
              className="w-9 h-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex" onClick={next}>
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Expand toggle */}
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>
        </div>

        {/* Expanded area */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-3 space-y-3">
                {/* Progress bar */}
                <div className="space-y-1">
                  <div
                    className="relative h-1.5 bg-muted rounded-full cursor-pointer group"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const percent = (e.clientX - rect.left) / rect.width;
                      seek(percent * duration);
                    }}
                  >
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
                      style={{ left: `calc(${progress}% - 7px)` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Extended controls row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7"
                      onClick={toggleShuffle}
                    >
                      <Shuffle className={cn("w-3.5 h-3.5", isShuffled && "text-primary")} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={previous}>
                      <SkipBack className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon" onClick={toggle}
                      className="w-9 h-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={next}>
                      <SkipForward className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7"
                      onClick={handleRepeatClick}
                    >
                      {repeatMode === 'one' ? (
                        <Repeat1 className={cn("w-3.5 h-3.5", "text-primary")} />
                      ) : (
                        <Repeat className={cn("w-3.5 h-3.5", repeatMode === 'all' && "text-primary")} />
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Heart className="w-3.5 h-3.5" />
                    </Button>

                    {/* Volume */}
                    <div
                      className="flex items-center gap-1"
                      onMouseEnter={() => setShowVolume(true)}
                      onMouseLeave={() => setShowVolume(false)}
                    >
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleMute}>
                        {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </Button>
                      <AnimatePresence>
                        {showVolume && (
                          <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 64, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                          >
                            <Slider
                              value={[isMuted ? 0 : volume * 100]}
                              max={100}
                              step={1}
                              onValueChange={([val]) => setVolume(val / 100)}
                              className="w-16"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <Button
                      variant="ghost" size="icon" className="h-7 w-7"
                      onClick={toggleQueue}
                    >
                      <ListMusic className={cn("w-3.5 h-3.5", isQueueOpen && "text-primary")} />
                    </Button>
                  </div>
                </div>

                {/* Live activity ticker — "Now on Mixxclub" */}
                {activities.length > 0 && (
                  <div className="border-t border-border/30 pt-2">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 font-mono">
                      Now on Mixxclub
                    </p>
                    <div className="space-y-1 max-h-16 overflow-hidden">
                      {activities.slice(0, 3).map((a) => (
                        <div key={a.id} className="flex items-center gap-2 text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 animate-pulse" />
                          <span className="text-muted-foreground truncate">
                            <span className="text-foreground font-medium">{a.user}</span>{' '}
                            {a.action}
                          </span>
                          <span className="text-muted-foreground/60 ml-auto shrink-0 text-[10px]">{a.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default UniversalMediaPlayer;
