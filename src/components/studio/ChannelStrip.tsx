import { useState } from 'react';
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
  const [isDraggingFader, setIsDraggingFader] = useState(false);
  const [isDraggingPan, setIsDraggingPan] = useState(false);

  const getTrackColor = (type: Track['type']) => {
    const colors: Record<Track['type'], string> = {
      vocal: 'hsl(var(--wave-vocal))',
      drums: 'hsl(var(--wave-drums))',
      bass: 'hsl(var(--wave-bass))',
      keys: 'hsl(var(--wave-keys))',
      guitar: 'hsl(var(--wave-guitar))',
      other: 'hsl(var(--wave-other))',
    };
    return colors[type] || colors.other;
  };

  const handleFaderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingFader(true);
    updateFader(e);
  };

  const handleFaderMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingFader) return;
    updateFader(e);
  };

  const updateFader = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    const newVolume = Math.max(0, Math.min(1, 1 - (y / height)));
    onVolumeChange(newVolume);
  };

  const handlePanMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingPan(true);
    updatePan(e);
  };

  const handlePanMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingPan) return;
    updatePan(e);
  };

  const updatePan = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const newPan = (x / width) * 2 - 1; // -1 to 1
    onPanChange(Math.max(-1, Math.min(1, newPan)));
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 p-2 rounded bg-[hsl(var(--studio-panel))] border transition-all cursor-pointer',
        isSelected 
          ? 'border-[hsl(var(--studio-accent))] shadow-[0_0_12px_hsl(var(--studio-accent-glow)/0.3)]' 
          : 'border-[hsl(var(--studio-border))] hover:border-[hsl(var(--studio-panel-raised))]',
        'w-16 h-[500px]'
      )}
      onClick={onSelect}
      onMouseUp={() => {
        setIsDraggingFader(false);
        setIsDraggingPan(false);
      }}
      onMouseLeave={() => {
        setIsDraggingFader(false);
        setIsDraggingPan(false);
      }}
    >
      {/* Track name & type */}
      <div className="flex flex-col items-center gap-0.5 w-full">
        <div 
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: getTrackColor(track.type) }}
        />
        <span className="text-[9px] font-medium text-[hsl(var(--studio-text))] truncate w-full text-center">
          {track.name}
        </span>
        <span className="text-[7px] text-[hsl(var(--studio-text-dim))] uppercase">
          {track.type}
        </span>
      </div>

      {/* Insert slots (4 slots) */}
      <div className="flex flex-col gap-0.5 w-full">
        {[1, 2, 3, 4].map((slot) => (
          <div
            key={slot}
            className="h-3 rounded bg-[hsl(var(--studio-black))] border border-[hsl(var(--studio-border))] flex items-center justify-center"
          >
            <div className="w-1 h-1 rounded-full bg-[hsl(var(--led-off))]" />
          </div>
        ))}
      </div>

      {/* Mini EQ graph placeholder */}
      <div className="w-full h-6 bg-[hsl(var(--studio-black))] border border-[hsl(var(--studio-border))] rounded relative overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d="M 0 80 Q 25 60, 50 50 T 100 40"
            stroke={getTrackColor(track.type)}
            strokeWidth="2"
            fill="none"
            opacity="0.4"
          />
        </svg>
      </div>

      {/* Pan knob */}
      <div className="flex flex-col items-center gap-0.5 w-full">
        <div 
          className="relative w-10 h-10 rounded-full bg-[hsl(var(--studio-black))] border border-[hsl(var(--studio-border))] cursor-ew-resize"
          onMouseDown={handlePanMouseDown}
          onMouseMove={handlePanMouseMove}
        >
          <div 
            className="absolute top-1/2 left-1/2 w-1 h-3 bg-[hsl(var(--studio-text))] rounded-full origin-bottom"
            style={{ 
              transform: `translate(-50%, -50%) rotate(${track.pan * 135}deg)`,
            }}
          />
        </div>
        <span className="text-[7px] font-mono text-[hsl(var(--studio-text-dim))]">
          {track.pan === 0 ? 'C' : track.pan > 0 ? `R${Math.round(Math.abs(track.pan) * 50)}` : `L${Math.round(Math.abs(track.pan) * 50)}`}
        </span>
      </div>

      {/* VU Meters - Dual L/R */}
      <div className="flex gap-1">
        <VUMeter 
          level={track.peakLevel * 0.95} 
          size="sm"
          label="L"
          vertical
        />
        <VUMeter 
          level={track.peakLevel} 
          size="sm"
          label="R"
          vertical
        />
      </div>

      {/* Fader */}
      <div className="flex-1 flex flex-col items-center w-full">
        <div 
          className="relative h-full w-2 bg-[hsl(var(--studio-black))] border border-[hsl(var(--studio-border))] rounded cursor-ns-resize"
          onMouseDown={handleFaderMouseDown}
          onMouseMove={handleFaderMouseMove}
        >
          <div
            className={cn(
              'absolute left-1/2 -translate-x-1/2 w-6 h-4 rounded-sm',
              'bg-[hsl(var(--studio-panel-raised))] border border-[hsl(var(--studio-border))]',
              'shadow-sm transition-shadow',
              isDraggingFader && 'shadow-[0_0_8px_hsl(var(--studio-accent-glow)/0.3)]'
            )}
            style={{
              top: `${(1 - track.volume) * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-0.5 h-2 bg-[hsl(var(--studio-text-dim))] rounded-full" />
            </div>
          </div>
        </div>
        <span className="text-[7px] font-mono text-[hsl(var(--studio-text-dim))] mt-1">
          {Math.round(track.volume * 100)}
        </span>
      </div>

      {/* M/S/R buttons */}
      <div className="flex flex-col gap-0.5 w-full">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMuteToggle();
          }}
          className={cn(
            'h-5 rounded text-[9px] font-bold transition-all',
            track.mute
              ? 'bg-[hsl(var(--led-red))] text-white shadow-[0_0_6px_hsl(var(--led-red))]'
              : 'bg-[hsl(var(--studio-panel-raised))] text-[hsl(var(--studio-text-dim))] hover:text-[hsl(var(--studio-text))]'
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
            'h-5 rounded text-[9px] font-bold transition-all',
            track.solo
              ? 'bg-[hsl(var(--led-yellow))] text-black shadow-[0_0_6px_hsl(var(--led-yellow))]'
              : 'bg-[hsl(var(--studio-panel-raised))] text-[hsl(var(--studio-text-dim))] hover:text-[hsl(var(--studio-text))]'
          )}
        >
          S
        </button>
        <button
          className="h-5 rounded text-[9px] font-bold bg-[hsl(var(--studio-panel-raised))] text-[hsl(var(--studio-text-dim))] hover:text-[hsl(var(--led-red))] transition-all"
        >
          R
        </button>
      </div>

      {/* Channel number */}
      <div className="text-[7px] font-mono text-[hsl(var(--studio-text-dim))]">
        {track.id.split('-')[1]}
      </div>
    </div>
  );
};
