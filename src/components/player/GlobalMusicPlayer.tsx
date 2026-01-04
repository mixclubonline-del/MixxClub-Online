import React, { useState } from 'react';
import { useGlobalPlayer } from '@/contexts/GlobalPlayerContext';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Shuffle, Repeat, Repeat1, ListMusic, ChevronUp, ChevronDown,
  Music2, Heart, Plus
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

export const GlobalMusicPlayer: React.FC = () => {
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

  const handleRepeatClick = () => {
    const modes: ('none' | 'one' | 'all')[] = ['none', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    setRepeatMode(modes[(currentIndex + 1) % modes.length]);
  };

  if (!currentTrack) return null;

  return (
    <>
      <AnimatePresence>
        {isQueueOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-20 w-80 bg-card border-l border-border z-40 shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Queue</h3>
              <p className="text-sm text-muted-foreground">{queue.length} tracks</p>
            </div>
            <div className="overflow-y-auto h-[calc(100%-60px)]">
              {queue.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <ListMusic className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Queue is empty</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {queue.map((track, index) => (
                    <div 
                      key={`${track.id}-${index}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      {track.artworkUrl ? (
                        <img 
                          src={track.artworkUrl} 
                          alt={track.title}
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center">
                          <Music2 className="w-5 h-5 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{track.title}</p>
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

      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border shadow-2xl",
          "md:bottom-0 md:left-0 md:right-0",
          "transition-all duration-300"
        )}
        style={{ 
          marginBottom: 'env(safe-area-inset-bottom)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 64px)',
        }}
      >
        {/* Progress bar - clickable */}
        <div 
          className="absolute top-0 left-0 right-0 h-1 bg-muted cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            seek(percent * duration);
          }}
        >
          <motion.div 
            className="h-full bg-primary"
            style={{ width: `${progress}%` }}
          />
          <div className="absolute top-0 left-0 right-0 h-2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Track info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {currentTrack.artworkUrl ? (
                <img 
                  src={currentTrack.artworkUrl} 
                  alt={currentTrack.title}
                  className="w-12 h-12 rounded-lg object-cover shadow-lg"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shadow-lg">
                  <Music2 className="w-6 h-6 text-primary-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-sm truncate text-foreground">
                  {currentTrack.title}
                </h4>
                <p className="text-xs text-muted-foreground truncate">
                  {currentTrack.artist}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Heart className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Main controls */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleShuffle}
                className={cn(
                  "hidden md:flex",
                  isShuffled && "text-primary"
                )}
              >
                <Shuffle className="w-4 h-4" />
              </Button>
              
              <Button variant="ghost" size="icon" onClick={previous}>
                <SkipBack className="w-5 h-5" />
              </Button>
              
              <Button 
                size="icon" 
                onClick={toggle}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </Button>
              
              <Button variant="ghost" size="icon" onClick={next}>
                <SkipForward className="w-5 h-5" />
              </Button>

              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleRepeatClick}
                className={cn(
                  "hidden md:flex",
                  repeatMode !== 'none' && "text-primary"
                )}
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="w-4 h-4" />
                ) : (
                  <Repeat className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Time & Volume */}
            <div className="hidden md:flex items-center gap-4 flex-1 justify-end">
              <span className="text-xs text-muted-foreground min-w-[80px] text-center">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              <div 
                className="flex items-center gap-2"
                onMouseEnter={() => setShowVolume(true)}
                onMouseLeave={() => setShowVolume(false)}
              >
                <Button variant="ghost" size="icon" onClick={toggleMute}>
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
                <AnimatePresence>
                  {showVolume && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 80, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                    >
                      <Slider
                        value={[isMuted ? 0 : volume * 100]}
                        max={100}
                        step={1}
                        onValueChange={([val]) => setVolume(val / 100)}
                        className="w-20"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleQueue}
                className={cn(isQueueOpen && "text-primary")}
              >
                <ListMusic className="w-4 h-4" />
              </Button>

              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default GlobalMusicPlayer;
