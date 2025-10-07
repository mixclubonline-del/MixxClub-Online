import { Play, Pause, Square, Circle, SkipBack, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TransportControlsProps {
  isPlaying: boolean;
  isRecording: boolean;
  currentTime: number;
  duration: number;
  tempo: number;
  onPlay: () => void;
  onStop: () => void;
  onRecord: () => void;
  onTempoChange: (tempo: number) => void;
}

export const TransportControls = ({
  isPlaying,
  isRecording,
  currentTime,
  duration,
  tempo,
  onPlay,
  onStop,
  onRecord,
  onTempoChange,
}: TransportControlsProps) => {
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const transportButton = (
    icon: React.ReactNode,
    onClick: () => void,
    active = false,
    variant: 'default' | 'record' = 'default'
  ) => (
    <motion.button
      onClick={onClick}
      className={cn(
        'p-3 rounded-lg transition-all',
        'border border-[hsl(var(--border)/0.5)]',
        active 
          ? variant === 'record'
            ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]'
            : 'bg-primary text-primary-foreground shadow-[var(--shadow-glow)]'
          : 'glass hover:bg-[hsl(var(--card)/0.9)]'
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {icon}
    </motion.button>
  );

  return (
    <div className="glass rounded-2xl p-4 border border-[hsl(var(--border)/0.5)] shadow-[var(--shadow-glass)]">
      <div className="flex items-center gap-6">
        {/* Time display */}
        <div className="flex flex-col gap-1">
          <div className="font-mono text-2xl tabular-nums text-foreground">
            {formatTime(currentTime)}
          </div>
          <div className="font-mono text-xs text-muted-foreground tabular-nums">
            / {formatTime(duration)}
          </div>
        </div>

        {/* Transport buttons */}
        <div className="flex items-center gap-2">
          {transportButton(<SkipBack className="w-5 h-5" />, () => {}, false)}
          {transportButton(
            <Square className="w-5 h-5" />, 
            onStop,
            false
          )}
          {transportButton(
            isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />,
            onPlay,
            isPlaying
          )}
          {transportButton(<SkipForward className="w-5 h-5" />, () => {}, false)}
          {transportButton(
            <Circle className="w-5 h-5" />,
            onRecord,
            isRecording,
            'record'
          )}
        </div>

        {/* Tempo control */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase text-muted-foreground">Tempo</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={tempo}
                onChange={(e) => onTempoChange(Number(e.target.value))}
                className={cn(
                  'w-16 px-2 py-1 rounded',
                  'bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)]',
                  'text-sm font-mono text-foreground',
                  'focus:outline-none focus:border-primary'
                )}
                min={40}
                max={240}
              />
              <span className="text-xs text-muted-foreground">BPM</span>
            </div>
          </div>
        </div>

        {/* Recording indicator */}
        {isRecording && (
          <motion.div
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/50"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs font-semibold text-red-500">REC</span>
          </motion.div>
        )}
      </div>
    </div>
  );
};
