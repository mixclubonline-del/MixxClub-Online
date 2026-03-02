/**
 * DemoTransportBar — Unified bottom control bar for the Insider Demo.
 * Replaces scattered header controls with a single glassmorphic strip
 * pinned above the audio visualizer.
 * Includes a swipe-up phase-picker drawer for quick phase jumping.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useHaptics } from '@/hooks/useHaptics';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Settings, RotateCcw, ChevronLeft, ChevronUp,
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
  phases?: Array<{ id: string; title: string }>;
  onSkipToPhase?: (index: number) => void;
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
  phases,
  onSkipToPhase,
}: DemoTransportBarProps) {
  const { light, medium } = useHaptics();
  const [opacity, setOpacity] = useState(1);
  const [pickerOpen, setPickerOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetFade = useCallback(() => {
    setOpacity(1);
    if (timerRef.current) clearTimeout(timerRef.current);
    // Don't fade while picker is open
    if (!pickerOpen) {
      timerRef.current = setTimeout(() => setOpacity(0.7), 4000);
    }
  }, [pickerOpen]);

  useEffect(() => {
    resetFade();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [resetFade]);

  // Auto-close picker after 6s of inactivity
  useEffect(() => {
    if (pickerOpen) {
      if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
      autoCloseRef.current = setTimeout(() => setPickerOpen(false), 6000);
    }
    return () => { if (autoCloseRef.current) clearTimeout(autoCloseRef.current); };
  }, [pickerOpen]);

  const handlePanEnd = useCallback((_: any, info: PanInfo) => {
    if (info.offset.y < -40) {
      setPickerOpen(true);
    } else if (info.offset.y > 40) {
      setPickerOpen(false);
    }
  }, []);

  const handlePickerInteraction = useCallback(() => {
    // Reset auto-close timer on interaction
    if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    autoCloseRef.current = setTimeout(() => setPickerOpen(false), 6000);
    resetFade();
  }, [resetFade]);

  const handlePhaseSelect = useCallback((index: number) => {
    light();
    onSkipToPhase?.(index);
    setPickerOpen(false);
  }, [onSkipToPhase, light]);

  // Haptic-enhanced handlers
  const handleToggle = useCallback(() => { medium(); onToggle(); }, [medium, onToggle]);
  const handlePrev = useCallback(() => { light(); onPrevPhase(); }, [light, onPrevPhase]);
  const handleNext = useCallback(() => { light(); onNextPhase(); }, [light, onNextPhase]);
  const handleRestartWithHaptic = useCallback(() => { medium(); onRestart?.(); }, [medium, onRestart]);

  const getPhaseState = (index: number): 'completed' | 'active' | 'future' => {
    if (index < currentPhase) return 'completed';
    if (index === currentPhase) return 'active';
    return 'future';
  };

  return (
    <motion.div
      className="fixed bottom-36 left-3 right-3 sm:left-4 sm:right-4 z-30 touch-manipulation"
      style={{ opacity }}
      onPointerMove={resetFade}
      onPointerDown={resetFade}
      onPanEnd={handlePanEnd}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-3xl mx-auto flex flex-col">
        {/* Chevron handle — tap to toggle picker */}
        {phases && phases.length > 0 && (
          <button
            onClick={() => { setPickerOpen(prev => !prev); handlePickerInteraction(); }}
            className="self-center mb-1 p-1 rounded-full bg-black/40 backdrop-blur-sm border border-border/10 hover:bg-black/60 transition-colors"
            aria-label={pickerOpen ? 'Close phase picker' : 'Open phase picker'}
          >
            <motion.div
              animate={{ rotate: pickerOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            </motion.div>
          </button>
        )}

        {/* Phase Picker Drawer */}
        <AnimatePresence>
          {pickerOpen && phases && phases.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden mb-1"
              onPointerMove={handlePickerInteraction}
            >
              <div className="bg-black/70 backdrop-blur-xl border border-border/20 rounded-2xl p-3 sm:p-4">
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {phases.map((phase, index) => {
                    const state = getPhaseState(index);
                    return (
                      <button
                        key={phase.id}
                        onClick={() => handlePhaseSelect(index)}
                        className={`
                          flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-xl transition-all duration-200
                          ${state === 'active'
                            ? 'bg-primary/15 border border-primary/50 shadow-[0_0_12px_hsl(var(--primary)/0.3)]'
                            : state === 'completed'
                              ? 'bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-muted/5 border border-border/10 hover:bg-muted/15 opacity-60 hover:opacity-80'
                          }
                        `}
                        aria-label={`Jump to phase ${index + 1}: ${phase.title}`}
                      >
                        {/* Phase number badge */}
                        <span className={`
                          w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold
                          ${state === 'active'
                            ? 'bg-primary text-primary-foreground animate-pulse'
                            : state === 'completed'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-muted/30 text-muted-foreground'
                          }
                        `}>
                          {index + 1}
                        </span>
                        {/* Truncated title */}
                        <span className={`
                          text-[8px] sm:text-[10px] font-medium leading-tight text-center truncate w-full
                          ${state === 'active'
                            ? 'text-primary'
                            : state === 'completed'
                              ? 'text-emerald-400'
                              : 'text-muted-foreground'
                          }
                        `}>
                          {phase.title.length > 8 ? phase.title.slice(0, 8) + '…' : phase.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main transport controls */}
        <div className="bg-black/60 backdrop-blur-xl border border-border/20 rounded-2xl px-3 py-2.5 sm:px-5 sm:py-3 flex items-center gap-2 sm:gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
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
              onClick={handlePrev}
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
                onClick={handleRestartWithHaptic}
                className="h-9 w-9 text-primary hover:bg-primary/10"
                aria-label="Replay demo"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggle}
                className="h-9 w-9 text-primary hover:bg-primary/10"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
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
      </div>
    </motion.div>
  );
}
