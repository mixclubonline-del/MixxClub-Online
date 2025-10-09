import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Volume2, VolumeX, Headphones } from 'lucide-react';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { cn } from '@/lib/utils';

interface DAWMixerConsoleProps {
  onClose: () => void;
}

export const DAWMixerConsole = ({ onClose }: DAWMixerConsoleProps) => {
  const tracks = useAIStudioStore((state) => state.tracks);
  const updateTrack = useAIStudioStore((state) => state.updateTrack);
  const masterVolume = useAIStudioStore((state) => state.masterVolume);
  const setMasterVolume = useAIStudioStore((state) => state.setMasterVolume);

  return (
    <div className="h-80 bg-card border-t border-border flex flex-col">
      {/* Header */}
      <div className="h-10 border-b border-border flex items-center justify-between px-3">
        <span className="text-sm font-semibold">MIXER</span>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Mixer Channels */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-2 p-4 min-w-max h-full">
          {/* Track Channels */}
          {tracks.map((track) => (
            <div
              key={track.id}
              className="w-24 bg-muted/30 rounded-lg p-2 flex flex-col gap-2"
            >
              {/* Track Name */}
              <div className="text-xs font-semibold truncate text-center">
                {track.name}
              </div>

              {/* Track Color */}
              <div
                className="h-1 w-full rounded-full"
                style={{ backgroundColor: track.color || 'hsl(var(--primary))' }}
              />

              {/* Level Meter */}
              <div className="flex-1 bg-background rounded-md p-1 flex flex-col-reverse gap-0.5">
                {Array.from({ length: 12 }).map((_, i) => {
                  const level = track.peakLevel * 12;
                  const isActive = i < level;
                  let color = 'bg-green-500';
                  if (i > 9) color = 'bg-red-500';
                  else if (i > 7) color = 'bg-yellow-500';

                  return (
                    <div
                      key={i}
                      className={cn(
                        'h-2 rounded-sm transition-colors',
                        isActive ? color : 'bg-muted'
                      )}
                    />
                  );
                })}
              </div>

              {/* Fader */}
              <div className="h-32 flex justify-center">
                <Slider
                  orientation="vertical"
                  value={[track.volume * 100]}
                  onValueChange={(v) =>
                    updateTrack(track.id, { volume: v[0] / 100 })
                  }
                  min={0}
                  max={100}
                  step={1}
                  className="h-full"
                />
              </div>

              {/* Volume Display */}
              <div className="text-xs text-center font-mono">
                {Math.round(track.volume * 100)}%
              </div>

              {/* Pan Control */}
              <Slider
                value={[track.pan * 50 + 50]}
                onValueChange={(v) =>
                  updateTrack(track.id, { pan: (v[0] - 50) / 50 })
                }
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="text-xs text-center text-muted-foreground">
                {track.pan === 0 ? 'C' : track.pan < 0 ? `L${Math.abs(Math.round(track.pan * 100))}` : `R${Math.round(track.pan * 100)}`}
              </div>

              {/* Mute/Solo */}
              <div className="flex gap-1">
                <Button
                  variant={track.mute ? "default" : "ghost"}
                  size="sm"
                  className="flex-1 h-7 text-xs"
                  onClick={() => updateTrack(track.id, { mute: !track.mute })}
                >
                  M
                </Button>
                <Button
                  variant={track.solo ? "default" : "ghost"}
                  size="sm"
                  className="flex-1 h-7 text-xs"
                  onClick={() => updateTrack(track.id, { solo: !track.solo })}
                >
                  S
                </Button>
              </div>
            </div>
          ))}

          {/* Master Channel */}
          <div className="w-32 bg-primary/10 border-2 border-primary/30 rounded-lg p-3 flex flex-col gap-2">
            <div className="text-sm font-bold text-center">MASTER</div>

            {/* Master Level Meter */}
            <div className="flex-1 bg-background rounded-md p-1 flex flex-col-reverse gap-0.5">
              {Array.from({ length: 12 }).map((_, i) => {
                const level = masterVolume * 12;
                const isActive = i < level;
                let color = 'bg-green-500';
                if (i > 9) color = 'bg-red-500';
                else if (i > 7) color = 'bg-yellow-500';

                return (
                  <div
                    key={i}
                    className={cn(
                      'h-3 rounded-sm transition-colors',
                      isActive ? color : 'bg-muted'
                    )}
                  />
                );
              })}
            </div>

            {/* Master Fader */}
            <div className="h-32 flex justify-center">
              <Slider
                orientation="vertical"
                value={[masterVolume * 100]}
                onValueChange={(v) => setMasterVolume(v[0] / 100)}
                min={0}
                max={100}
                step={1}
                className="h-full"
              />
            </div>

            <div className="text-sm text-center font-mono font-bold">
              {Math.round(masterVolume * 100)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
