/**
 * BeforeAfterMini — Compact A/B audio toggle for track cards.
 * Shows a waveform with a before/after switch overlay.
 * Falls back to deterministic sine-wave visualization when no audio is available.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface BeforeAfterMiniProps {
  beforeUrl?: string | null;
  afterUrl?: string | null;
  trackTitle: string;
  barCount?: number;
}

export function BeforeAfterMini({
  beforeUrl,
  afterUrl,
  trackTitle,
  barCount = 24,
}: BeforeAfterMiniProps) {
  const [isMastered, setIsMastered] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number>(0);

  const activeUrl = isMastered ? afterUrl : beforeUrl;
  const hasAudio = !!activeUrl;

  // Generate deterministic waveform bars based on track title
  const bars = Array.from({ length: barCount }, (_, i) => {
    const seed = trackTitle.charCodeAt(i % trackTitle.length) + i * 7;
    const base = isMastered ? 0.5 : 0.3;
    const variance = isMastered ? 0.45 : 0.25;
    const height = base + Math.sin(seed * 0.3) * variance;
    return Math.max(0.12, Math.min(1, height));
  });

  // Audio playback
  const togglePlay = useCallback(() => {
    if (!hasAudio) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(activeUrl!);
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(0);
      });
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      cancelAnimationFrame(rafRef.current);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      const tick = () => {
        if (audioRef.current) {
          const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setProgress(isNaN(pct) ? 0 : pct);
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [hasAudio, activeUrl, isPlaying]);

  // Switch source
  useEffect(() => {
    if (audioRef.current) {
      const wasPlaying = isPlaying;
      audioRef.current.pause();
      audioRef.current.src = activeUrl || '';
      if (wasPlaying && activeUrl) {
        audioRef.current.play();
      }
    }
  }, [activeUrl]);

  // Cleanup
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative h-20 mb-4">
      {/* Waveform bars */}
      <div className="flex items-end justify-around gap-0.5 px-2 h-full">
        {bars.map((height, i) => {
          const isBeforeProgress = (i / barCount) * 100 <= progress;
          return (
            <motion.div
              key={i}
              className="w-1 rounded-full"
              style={{
                background: isBeforeProgress && isPlaying
                  ? 'hsl(var(--primary))'
                  : isMastered
                    ? 'hsl(var(--primary) / 0.5)'
                    : 'hsl(var(--muted-foreground) / 0.35)',
              }}
              initial={{ height: '20%' }}
              animate={{ height: `${height * 100}%` }}
              transition={{ duration: 0.4, delay: i * 0.015 }}
            />
          );
        })}
      </div>

      {/* Play button overlay */}
      <button
        onClick={togglePlay}
        className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center border border-primary/30"
          style={{ background: 'hsl(var(--primary) / 0.2)', backdropFilter: 'blur(8px)' }}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-primary" />
          ) : (
            <Play className="w-4 h-4 text-primary ml-0.5" />
          )}
        </div>
      </button>

      {/* Before / After toggle */}
      <div className="absolute top-1 right-1 flex items-center gap-1.5 mg-pill px-2 py-1">
        <span className={`text-[10px] font-semibold transition-colors ${!isMastered ? 'text-foreground' : 'text-muted-foreground/50'}`}>
          RAW
        </span>
        <Switch
          checked={isMastered}
          onCheckedChange={setIsMastered}
          className="scale-[0.6] origin-center"
        />
        <span className={`text-[10px] font-semibold transition-colors ${isMastered ? 'text-primary' : 'text-muted-foreground/50'}`}>
          MIXX'D
        </span>
      </div>
    </div>
  );
}
