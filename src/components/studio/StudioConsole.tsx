import { motion } from 'framer-motion';
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

  return (
    <div className="glass rounded-2xl p-6 border border-[hsl(var(--border)/0.5)] shadow-[var(--shadow-glass)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
          Mixing Console
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground">
            {tracks.length} Channels
          </span>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {/* Channel strips */}
        <div className="flex gap-3">
          {tracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-8 text-center">
              <div className="w-16 h-16 rounded-full glass border border-[hsl(var(--border)/0.5)] flex items-center justify-center mb-3">
                <span className="text-2xl">🎛️</span>
              </div>
              <p className="text-sm text-muted-foreground">
                No tracks loaded
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload audio files to start mixing
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
          <motion.div
            className={cn(
              'flex flex-col items-center gap-3 p-4 rounded-lg ml-4',
              'glass border-2 border-primary shadow-[var(--shadow-glow)]',
              'w-24 h-[400px]'
            )}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Master
              </span>
              <span className="text-[8px] text-muted-foreground uppercase">
                Stereo Out
              </span>
            </div>

            {/* Stereo VU meters */}
            <div className="flex gap-2">
              <VUMeter 
                level={masterPeakLevel * 0.9} 
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
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative h-32 w-1 bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] rounded-full">
                <motion.div
                  className={cn(
                    'absolute left-1/2 -translate-x-1/2 w-8 h-6 rounded',
                    'bg-gradient-to-b from-primary to-primary/80',
                    'border border-[hsl(var(--border))]',
                    'shadow-lg cursor-grab active:cursor-grabbing'
                  )}
                  style={{
                    top: `${(1 - masterVolume) * 100}%`,
                  }}
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={0}
                  onDrag={(_, info) => {
                    const newVolume = Math.max(0, Math.min(1, 1 - ((info.point.y - 60) / 128)));
                    setMasterVolume(newVolume);
                  }}
                />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground mt-2">
                {Math.round(masterVolume * 100)}
              </span>
            </div>

            {/* Master output LED */}
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                'w-4 h-4 rounded-full',
                masterPeakLevel > 0.95 ? 'bg-red-500' : 'bg-green-500',
                'shadow-[0_0_12px_currentColor] animate-pulse'
              )} />
              <span className="text-[8px] text-muted-foreground">OUT</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
