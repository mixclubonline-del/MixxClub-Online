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
      vocal: 'hsl(185, 100%, 50%)',
      drums: 'hsl(300, 90%, 65%)',
      bass: 'hsl(270, 100%, 70%)',
      keys: 'hsl(45, 95%, 55%)',
      guitar: 'hsl(330, 90%, 60%)',
      other: 'hsl(210, 100%, 55%)',
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
        'flex flex-col items-center gap-1.5 p-1.5 rounded-lg cursor-pointer transition-all glass-hover',
        'w-12 h-[360px] relative',
        isSelected 
          ? 'border-2' 
          : 'border'
      )}
      style={{
        background: isSelected 
          ? 'linear-gradient(135deg, hsl(var(--card) / 0.9), hsl(var(--card) / 0.75))'
          : 'var(--panel-gradient)',
        boxShadow: isSelected 
          ? 'var(--shadow-glass-lg), 0 0 25px hsl(var(--studio-accent) / 0.5)' 
          : 'var(--shadow-glass)',
        borderColor: isSelected ? 'hsl(var(--studio-accent))' : 'hsl(var(--studio-border) / 0.3)',
      }}
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
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: getTrackColor(track.type) }}
        />
        <span className="text-[8px] font-medium text-[hsl(var(--studio-text))] truncate w-full text-center leading-tight">
          {track.name}
        </span>
      </div>

      {/* Insert slots (2 compact slots) */}
      <div className="flex flex-col gap-0.5 w-full">
        {[1, 2].map((slot) => (
          <div
            key={slot}
            className="h-2 rounded flex items-center justify-center"
            style={{
              background: 'hsl(var(--studio-black))',
              boxShadow: 'var(--shadow-recessed)',
              border: '1px solid hsl(0 0% 0% / 0.6)',
            }}
          >
            <div 
              className="w-0.5 h-0.5 rounded-full"
              style={{
                background: 'hsl(var(--led-off))',
                boxShadow: 'inset 0 1px 2px hsl(0 0% 0% / 0.5)',
              }}
            />
          </div>
        ))}
      </div>

      {/* Pan knob - smaller */}
      <div className="flex flex-col items-center gap-0.5 w-full">
        <div 
          className="relative w-7 h-7 rounded-full cursor-ew-resize"
          style={{
            background: 'var(--knob-gradient)',
            boxShadow: 'var(--shadow-recessed), inset 0 1px 1px hsl(0 0% 30% / 0.3)',
            border: '1px solid hsl(0 0% 0% / 0.5)',
          }}
          onMouseDown={handlePanMouseDown}
          onMouseMove={handlePanMouseMove}
        >
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-[hsl(var(--studio-text-dim))] rounded-full -translate-x-1/2 -translate-y-1/2" />
          {/* Indicator line */}
          <div 
            className="absolute top-1/2 left-1/2 w-0.5 h-2 rounded-full origin-bottom"
            style={{ 
              transform: `translate(-50%, -50%) rotate(${track.pan * 135}deg)`,
              background: 'linear-gradient(180deg, hsl(var(--studio-text)), hsl(var(--studio-text-dim)))',
              boxShadow: '0 0 4px hsl(var(--studio-text) / 0.5)',
            }}
          />
        </div>
      </div>

      {/* VU Meters - Dual L/R compact */}
      <div className="flex gap-0.5">
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

      {/* Fader - more compact */}
      <div className="flex-1 flex flex-col items-center w-full">
        <div 
          className="relative h-full w-2 rounded cursor-ns-resize"
          style={{
            background: 'var(--fader-gradient)',
            boxShadow: 'var(--shadow-recessed-deep)',
            border: '1px solid hsl(0 0% 0% / 0.6)',
          }}
          onMouseDown={handleFaderMouseDown}
          onMouseMove={handleFaderMouseMove}
        >
          {/* Fader rail highlight */}
          <div className="absolute inset-y-0 left-0 w-px bg-[hsl(0_0%_18%/0.5)]" />
          
          {/* Fader cap - smaller */}
          <div
            className={cn(
              'absolute left-1/2 -translate-x-1/2 w-5 h-3 rounded transition-all',
              isDraggingFader && 'scale-110'
            )}
            style={{
              top: `${(1 - track.volume) * 100}%`,
              transform: 'translate(-50%, -50%)',
              background: 'var(--fader-cap-gradient)',
              boxShadow: isDraggingFader 
                ? 'var(--shadow-raised-lg), 0 0 12px hsl(var(--studio-accent) / 0.4)' 
                : 'var(--shadow-raised)',
              borderTop: '1px solid hsl(0 0% 35%)',
              borderBottom: '1px solid hsl(0 0% 5%)',
            }}
          >
            {/* Cap detail line */}
            <div className="absolute inset-x-1 top-1/2 -translate-y-1/2">
              <div className="h-px bg-[hsl(0_0%_30%)]" />
            </div>
          </div>
        </div>
        <span className="text-[7px] font-mono text-[hsl(var(--studio-text-dim))] mt-0.5">
          {Math.round(track.volume * 100)}
        </span>
      </div>

      {/* M/S/R buttons - more compact */}
      <div className="flex flex-col gap-0.5 w-full">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMuteToggle();
          }}
          className={cn(
            'h-4 rounded text-[8px] font-bold transition-all',
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
            'h-4 rounded text-[8px] font-bold transition-all',
            track.solo
              ? 'bg-[hsl(var(--led-yellow))] text-black shadow-[0_0_6px_hsl(var(--led-yellow))]'
              : 'bg-[hsl(var(--studio-panel-raised))] text-[hsl(var(--studio-text-dim))] hover:text-[hsl(var(--studio-text))]'
          )}
        >
          S
        </button>
      </div>
    </div>
  );
};
