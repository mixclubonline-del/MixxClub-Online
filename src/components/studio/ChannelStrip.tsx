import { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Headphones } from 'lucide-react';
import { VUMeter } from './VUMeter';
import { cn } from '@/lib/utils';
import { Track } from '@/stores/aiStudioStore';

interface ChannelStripProps {
  track: Track;
  isSelected: boolean;
  onSelect: () => void;
  onVolumeChange: (volume: number) => void;
  onPanChange: (pan: number) => void;
  onMuteToggle: () => void;
  onSoloToggle: () => void;
}

export const ChannelStrip = ({
  track,
  isSelected,
  onSelect,
  onVolumeChange,
  onPanChange,
  onMuteToggle,
  onSoloToggle,
}: ChannelStripProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFaderDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    const newVolume = Math.max(0, Math.min(1, 1 - (y / height)));
    
    onVolumeChange(newVolume);
  };

  return (
    <motion.div
      className={cn(
        'relative flex flex-col items-center gap-3 p-3 rounded-lg',
        'glass border transition-all',
        isSelected 
          ? 'border-primary shadow-[var(--shadow-glow)]' 
          : 'border-[hsl(var(--border)/0.5)] hover:border-[hsl(var(--border))]',
        'w-20 h-[400px]'
      )}
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
    >
      {/* Track label */}
      <div className="flex flex-col items-center gap-1 w-full">
        <span className="text-[10px] font-mono uppercase tracking-wider text-foreground truncate w-full text-center">
          {track.name}
        </span>
        <span className="text-[8px] text-muted-foreground uppercase">
          {track.type}
        </span>
      </div>

      {/* VU Meter */}
      <VUMeter 
        level={track.peakLevel} 
        size="sm"
        vertical
      />

      {/* Fader */}
      <div 
        className="relative flex-1 w-full flex flex-col items-center cursor-ns-resize"
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleFaderDrag}
      >
        {/* Fader track */}
        <div className="relative h-full w-1 bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] rounded-full">
          {/* Fader cap */}
          <motion.div
            className={cn(
              'absolute left-1/2 -translate-x-1/2 w-8 h-6 rounded',
              'bg-gradient-to-b from-[hsl(var(--card))] to-[hsl(var(--card)/0.8)]',
              'border border-[hsl(var(--border))]',
              'shadow-lg cursor-grab active:cursor-grabbing',
              isDragging && 'shadow-[var(--shadow-glow)]'
            )}
            style={{
              top: `${(1 - track.volume) * 100}%`,
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0}
            onDrag={(_, info) => {
              const newVolume = Math.max(0, Math.min(1, 1 - ((info.point.y - 60) / 180)));
              onVolumeChange(newVolume);
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-4 bg-[hsl(var(--primary)/0.3)] rounded-full" />
            </div>
          </motion.div>
        </div>

        {/* Volume value */}
        <span className="text-[8px] font-mono text-muted-foreground mt-1">
          {Math.round(track.volume * 100)}
        </span>
      </div>

      {/* Pan knob */}
      <div className="flex flex-col items-center gap-1">
        <div className="relative w-10 h-10">
          <motion.div
            className={cn(
              'w-full h-full rounded-full',
              'bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--card)/0.8)]',
              'border-2 border-[hsl(var(--border))]',
              'shadow-inner cursor-pointer'
            )}
            style={{
              rotate: `${track.pan * 135}deg`,
            }}
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            onDrag={(_, info) => {
              const angle = Math.atan2(info.offset.y, info.offset.x);
              const newPan = Math.max(-1, Math.min(1, angle / Math.PI));
              onPanChange(newPan);
            }}
          >
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-2 bg-primary rounded-full" />
          </motion.div>
        </div>
        <span className="text-[8px] font-mono text-muted-foreground">
          {track.pan === 0 ? 'C' : track.pan > 0 ? `R${Math.round(Math.abs(track.pan) * 100)}` : `L${Math.round(Math.abs(track.pan) * 100)}`}
        </span>
      </div>

      {/* Mute/Solo buttons */}
      <div className="flex gap-1 w-full">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMuteToggle();
          }}
          className={cn(
            'flex-1 px-2 py-1 rounded text-[10px] font-bold transition-all',
            track.mute
              ? 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]'
              : 'bg-[hsl(var(--card))] text-muted-foreground border border-[hsl(var(--border)/0.5)]'
          )}
        >
          M
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSoloToggle();
          }}
          className={cn(
            'flex-1 px-2 py-1 rounded text-[10px] font-bold transition-all',
            track.solo
              ? 'bg-yellow-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.5)]'
              : 'bg-[hsl(var(--card))] text-muted-foreground border border-[hsl(var(--border)/0.5)]'
          )}
        >
          S
        </button>
      </div>
    </motion.div>
  );
};
