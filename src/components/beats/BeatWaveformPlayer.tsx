import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import WaveSurfer from 'wavesurfer.js';

interface BeatWaveformPlayerProps {
  audioUrl: string;
  previewMode?: boolean; // Limits playback to 30 seconds
  compact?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
  className?: string;
}

export function BeatWaveformPlayer({
  audioUrl,
  previewMode = false,
  compact = false,
  onPlay,
  onPause,
  onEnd,
  className,
}: BeatWaveformPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  const PREVIEW_LIMIT = 30; // seconds

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'hsl(var(--muted))',
      progressColor: 'hsl(var(--primary))',
      cursorColor: 'hsl(var(--primary))',
      height: compact ? 40 : 80,
      normalize: true,
      backend: 'MediaElement',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
    });

    wavesurferRef.current = ws;

    ws.on('ready', () => {
      setIsLoading(false);
      setDuration(ws.getDuration());
      ws.setVolume(volume);
    });

    ws.on('audioprocess', () => {
      const current = ws.getCurrentTime();
      setCurrentTime(current);
      
      // Preview mode limit
      if (previewMode && current >= PREVIEW_LIMIT) {
        ws.pause();
        ws.seekTo(0);
        setIsPlaying(false);
        onEnd?.();
      }
    });

    ws.on('finish', () => {
      if (isLooping) {
        ws.seekTo(0);
        ws.play();
      } else {
        setIsPlaying(false);
        onEnd?.();
      }
    });

    ws.on('play', () => {
      setIsPlaying(true);
      onPlay?.();
    });

    ws.on('pause', () => {
      setIsPlaying(false);
      onPause?.();
    });

    ws.load(audioUrl);

    return () => {
      ws.destroy();
    };
  }, [audioUrl, compact]);

  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(isMuted ? 0 : volume);
    }
  }, [volume, isMuted]);

  const togglePlay = useCallback(() => {
    wavesurferRef.current?.playPause();
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleLoop = useCallback(() => {
    setIsLooping(!isLooping);
  }, [isLooping]);

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        togglePlay();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [togglePlay]);

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0"
          onClick={togglePlay}
          disabled={isLoading}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <div ref={containerRef} className="flex-1 h-10" />
        <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
          {formatTime(currentTime)}
        </span>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('space-y-3', className)}
    >
      {/* Waveform */}
      <div 
        ref={containerRef} 
        className={cn(
          'w-full rounded-lg bg-card/50 p-2',
          isLoading && 'animate-pulse'
        )}
      />
      
      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Play/Pause */}
        <Button
          size="icon"
          variant="secondary"
          className="h-10 w-10 rounded-full"
          onClick={togglePlay}
          disabled={isLoading}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
        </Button>

        {/* Time Display */}
        <div className="flex items-center gap-2 text-sm tabular-nums">
          <span>{formatTime(currentTime)}</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">
            {previewMode ? formatTime(Math.min(duration, PREVIEW_LIMIT)) : formatTime(duration)}
          </span>
          {previewMode && duration > PREVIEW_LIMIT && (
            <span className="text-xs text-amber-500 ml-1">(Preview)</span>
          )}
        </div>

        <div className="flex-1" />

        {/* Loop Toggle */}
        <Button
          size="icon"
          variant="ghost"
          className={cn('h-8 w-8', isLooping && 'text-primary')}
          onClick={toggleLoop}
        >
          <Repeat className="h-4 w-4" />
        </Button>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={toggleMute}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-20"
          />
        </div>
      </div>
    </motion.div>
  );
}
