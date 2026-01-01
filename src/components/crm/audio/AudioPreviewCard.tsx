import { useRef, useState, useEffect } from 'react';
import { Play, Pause, SkipBack, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface AudioPreviewCardProps {
  src: string;
  title?: string;
  subtitle?: string;
  className?: string;
  compact?: boolean;
  showWaveform?: boolean;
  autoPlay?: boolean;
}

export const AudioPreviewCard = ({
  src,
  title,
  subtitle,
  className,
  compact = false,
  showWaveform = true,
  autoPlay = false,
}: AudioPreviewCardProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  useEffect(() => {
    // Generate pseudo-waveform data
    const bars = 50;
    const data = Array.from({ length: bars }, () => 
      Math.random() * 0.6 + 0.2
    );
    setWaveformData(data);

    if (autoPlay && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [src, autoPlay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const reset = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={cn(
      "rounded-xl bg-gradient-to-br from-card to-card/80 border border-border/50 overflow-hidden",
      compact ? "p-3" : "p-4",
      className
    )}>
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Title */}
      {(title || subtitle) && !compact && (
        <div className="mb-3">
          {title && <p className="font-medium truncate">{title}</p>}
          {subtitle && <p className="text-sm text-muted-foreground truncate">{subtitle}</p>}
        </div>
      )}

      {/* Waveform Visualization */}
      {showWaveform && (
        <div className="relative h-12 mb-3 flex items-center gap-[2px]">
          {waveformData.map((height, idx) => {
            const isPlayed = (idx / waveformData.length) * 100 <= progress;
            return (
              <motion.div
                key={idx}
                className={cn(
                  "flex-1 rounded-full transition-colors",
                  isPlayed ? "bg-primary" : "bg-muted-foreground/30",
                  isPlaying && isPlayed && "animate-pulse"
                )}
                style={{ height: `${height * 100}%` }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: idx * 0.01 }}
              />
            );
          })}
          
          {/* Progress overlay */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent pointer-events-none"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Progress Slider */}
      <div className="mb-3">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="cursor-pointer"
        />
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={reset}
          className="h-8 w-8"
        >
          <SkipBack className="w-4 h-4" />
        </Button>
        
        <Button 
          onClick={togglePlay}
          size="icon"
          className={cn(
            "h-10 w-10 rounded-full",
            isPlaying && "bg-gradient-to-r from-primary to-purple-600"
          )}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleMute}
          className="h-8 w-8"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Compact title */}
      {title && compact && (
        <p className="text-sm font-medium truncate mt-2 text-center">{title}</p>
      )}
    </div>
  );
};
