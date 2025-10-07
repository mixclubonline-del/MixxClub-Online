import { ChannelStrip } from './ChannelStrip';
import { VUMeter } from './VUMeter';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { cn } from '@/lib/utils';

export const StudioConsole = () => {
  const {
    tracks,
    selectedTrackId,
    masterVolume,
    masterPeakLevel,
    setSelectedTrack,
    updateTrack,
    setMasterVolume,
  } = useAIStudioStore();

  const [isDraggingMaster, setIsDraggingMaster] = useState(false);

  const handleMasterFaderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingMaster(true);
    updateMasterFader(e);
  };

  const handleMasterFaderMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingMaster) return;
    updateMasterFader(e);
  };

  const updateMasterFader = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    const newVolume = Math.max(0, Math.min(1, 1 - (y / height)));
    setMasterVolume(newVolume);
  };

  return (
    <div className="bg-[hsl(var(--studio-panel))] rounded border border-[hsl(var(--studio-border))] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-[hsl(var(--studio-text))]">
          Mixing Console
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-[hsl(var(--studio-text-dim))]">
            {tracks.length} Channels
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--led-green))] animate-pulse" />
        </div>
      </div>

      <div 
        className="flex gap-2 overflow-x-auto pb-2"
        onMouseUp={() => setIsDraggingMaster(false)}
        onMouseLeave={() => setIsDraggingMaster(false)}
      >
        {/* Channel strips */}
        <div className="flex gap-2">
          {tracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-12 text-center">
              <div className="w-12 h-12 rounded bg-[hsl(var(--studio-panel-raised))] border border-[hsl(var(--studio-border))] flex items-center justify-center mb-2">
                <span className="text-xl">🎛️</span>
              </div>
              <p className="text-xs text-[hsl(var(--studio-text-dim))]">
                No tracks loaded
              </p>
              <p className="text-[10px] text-[hsl(var(--studio-text-dim))] mt-1">
                Upload audio to start mixing
              </p>
            </div>
          ) : (
            tracks.map((track) => (
              <ChannelStrip
                key={track.id}
                track={track}
                isSelected={selectedTrackId === track.id}
                onSelect={() => setSelectedTrack(track.id)}
                onVolumeChange={(volume) => 
                  updateTrack(track.id, { volume })
                }
                onPanChange={(pan) => 
                  updateTrack(track.id, { pan })
                }
                onMuteToggle={() => 
                  updateTrack(track.id, { mute: !track.mute })
                }
                onSoloToggle={() => 
                  updateTrack(track.id, { solo: !track.solo })
                }
              />
            ))
          )}
        </div>

        {/* Master section */}
        {tracks.length > 0 && (
          <div
            className={cn(
              'flex flex-col items-center gap-2 p-2 rounded ml-2 border-2',
              'bg-[hsl(var(--studio-panel-raised))] border-[hsl(var(--studio-accent))]',
              'w-20 h-[500px] flex-shrink-0'
            )}
          >
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--studio-accent))]">
                Master
              </span>
              <span className="text-[7px] text-[hsl(var(--studio-text-dim))] uppercase">
                Stereo Out
              </span>
            </div>

            {/* Master VU meters */}
            <div className="flex gap-1">
              <VUMeter 
                level={masterPeakLevel * 0.95} 
                size="sm"
                label="L"
                vertical
              />
              <VUMeter 
                level={masterPeakLevel} 
                size="sm"
                label="R"
                vertical
              />
            </div>

            {/* Master fader */}
            <div className="flex-1 flex flex-col items-center w-full">
              <div 
                className="relative h-full w-3 bg-[hsl(var(--studio-black))] border-2 border-[hsl(var(--studio-accent))] rounded cursor-ns-resize"
                onMouseDown={handleMasterFaderMouseDown}
                onMouseMove={handleMasterFaderMouseMove}
              >
                <div
                  className={cn(
                    'absolute left-1/2 -translate-x-1/2 w-8 h-5 rounded',
                    'bg-[hsl(var(--studio-accent))] border border-[hsl(var(--studio-border))]',
                    'shadow-[0_0_12px_hsl(var(--studio-accent-glow)/0.4)]'
                  )}
                  style={{
                    top: `${(1 - masterVolume) * 100}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1 h-3 bg-black/30 rounded-full" />
                  </div>
                </div>
              </div>
              <span className="text-[8px] font-mono text-[hsl(var(--studio-text-dim))] mt-1">
                {Math.round(masterVolume * 100)}
              </span>
            </div>

            {/* Output LED */}
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                'w-3 h-3 rounded-full',
                masterPeakLevel > 0.95 ? 'bg-[hsl(var(--led-red))]' : 'bg-[hsl(var(--led-green))]',
                'shadow-[0_0_8px_currentColor] animate-pulse'
              )} />
              <span className="text-[7px] text-[hsl(var(--studio-text-dim))]">OUT</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import { useState } from 'react';
