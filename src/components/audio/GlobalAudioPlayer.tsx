import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Music, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useGlobalAudio } from '@/hooks/useGlobalAudio';

export function GlobalAudioPlayer() {
  const {
    isPlaying,
    volume,
    isMuted,
    isLoading,
    duration,
    currentTime,
    toggle,
    setVolume,
    toggleMute,
    seek,
  } = useGlobalAudio();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 transition-all duration-300",
      "bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl",
      isExpanded ? "w-80" : "w-auto"
    )}>
      {/* Compact View */}
      <div className="flex items-center gap-2 p-2">
        {/* Expand/Collapse */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </Button>

        {/* Play/Pause */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-10 w-10 shrink-0 rounded-full",
            "bg-primary/20 hover:bg-primary/30 text-primary",
            isPlaying && "animate-pulse"
          )}
          onClick={toggle}
          disabled={isLoading}
        >
          {isLoading ? (
            <Music className="h-5 w-5 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </Button>

        {/* Title (only when expanded) */}
        {isExpanded && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-foreground">
              MixClub Theme
            </p>
            <p className="text-xs text-muted-foreground">
              {formatTime(currentTime)} / {formatTime(duration)}
            </p>
          </div>
        )}

        {/* Volume Control */}
        <div 
          className="relative"
          onMouseEnter={() => setShowVolumeSlider(true)}
          onMouseLeave={() => setShowVolumeSlider(false)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={toggleMute}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>

          {/* Volume Slider Popup */}
          {showVolumeSlider && (
            <div className="absolute bottom-full right-0 mb-2 p-3 bg-background/95 backdrop-blur-xl border border-border rounded-lg shadow-lg">
              <Slider
                orientation="vertical"
                value={[isMuted ? 0 : volume * 100]}
                onValueChange={(v) => setVolume(v[0] / 100)}
                max={100}
                step={1}
                className="h-24"
              />
            </div>
          )}
        </div>
      </div>

      {/* Expanded View - Progress Bar */}
      {isExpanded && (
        <div className="px-4 pb-3">
          {/* Progress Bar */}
          <div 
            className="relative h-1 bg-muted rounded-full cursor-pointer group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percent = x / rect.width;
              seek(percent * duration);
            }}
          >
            <div 
              className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 h-3 w-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>

          {/* Audio Reactive Indicator */}
          {isPlaying && (
            <div className="flex justify-center gap-0.5 mt-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-primary rounded-full animate-pulse"
                  style={{
                    height: `${8 + Math.random() * 12}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
