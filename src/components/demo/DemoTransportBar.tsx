/**
 * DemoTransportBar — Unified bottom control bar for the Insider Demo.
 * Replaces scattered header controls with a single glassmorphic strip
 * pinned above the audio visualizer.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Settings, RotateCcw, ChevronLeft,
} from 'lucide-react';

interface DemoTransportBarProps {
  isPlaying: boolean;
  onToggle: () => void;
  currentPhase: number;
  totalPhases: number;
  phaseTitle: string;
  phaseProgress: number;
  onPrevPhase: () => void;
  onNextPhase: () => void;
  volume: number;
  onVolumeChange: (v: number) => void;
  isMuted: boolean;
  onMuteToggle: () => void;
  isAutoPlay: boolean;
  onAutoPlayToggle: () => void;
  liteMode: boolean;
  onLiteModeToggle: () => void;
  onBack?: () => void;
  hasEnded?: boolean;
  onRestart?: () => void;
}

export function DemoTransportBar({
  isPlaying,
  onToggle,
  currentPhase,
  totalPhases,
  phaseTitle,
  phaseProgress,
  onPrevPhase,
  onNextPhase,
  volume,
  onVolumeChange,
  isMuted,
  onMuteToggle,
  isAutoPlay,
  onAutoPlayToggle,
  liteMode,
  onLiteModeToggle,
  onBack,
  hasEnded,
  onRestart,
}: DemoTransportBarProps) {
  const [opacity, setOpacity] = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetFade = useCallback(() => {
    setOpacity(1);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpacity(0.7), 4000);
  }, []);

  useEffect(() => {
    resetFade();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [resetFade]);

  return (
    <motion.div
      className="fixed bottom-36 left-3 right-3 sm:left-4 sm:right-4 z-30 touch-manipulation"
      style={{ opacity }}
      onPointerMove={resetFade}
      onPointerDown={resetFade}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-3xl mx-auto bg-black/60 backdrop-blur-xl border border-border/20 rounded-2xl px-3 py-2.5 sm:px-5 sm:py-3 flex items-center gap-2 sm:gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        {/* Left: Transport Controls */}
        <div className="flex items-center gap-1">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/20"
              aria-label="Exit demo"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevPhase}
            disabled={currentPhase === 0}
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/20 disabled:opacity-30"
            aria-label="Previous phase"
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          {hasEnded && onRestart ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRestart}
              className="h-9 w-9 text-primary hover:bg-primary/10"
              aria-label="Replay demo"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-9 w-9 text-primary hover:bg-primary/10"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={onNextPhase}
            disabled={currentPhase >= totalPhases - 1}
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/20 disabled:opacity-30"
            aria-label="Next phase"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Center: Phase Info */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {isAutoPlay && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
              {phaseTitle}
            </span>
            <span className="text-xs text-muted-foreground shrink-0">
              {currentPhase + 1}/{totalPhases}
            </span>
          </div>
          <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
              style={{ width: `${phaseProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Right: Audio & Settings */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMuteToggle}
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/20"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/20"
                aria-label="Demo settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="end"
              sideOffset={12}
              className="w-56 bg-black/80 backdrop-blur-xl border-border/30 p-4 space-y-4"
            >
              {/* Volume */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium">Volume</label>
                <Slider
                  value={[volume]}
                  min={0}
                  max={1}
                  step={0.05}
                  onValueChange={([v]) => onVolumeChange(v)}
                  className="w-full"
                />
              </div>

              {/* Auto-Sync */}
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground font-medium">Auto-sync phases</label>
                <Switch checked={isAutoPlay} onCheckedChange={onAutoPlayToggle} />
              </div>

              {/* Lite Mode */}
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground font-medium">Lite mode</label>
                <Switch checked={liteMode} onCheckedChange={onLiteModeToggle} />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </motion.div>
  );
}
