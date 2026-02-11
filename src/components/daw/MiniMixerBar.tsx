import { useState } from 'react';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ChevronUp, ChevronDown, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EnhancedChannelStrip } from './EnhancedChannelStrip';
import { ALSEnergyOrb, ALSTrackStrip } from './ALSMeter';

export const MiniMixerBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const tracks = useAIStudioStore((state) => state.tracks);
  const selectedTrackId = useAIStudioStore((state) => state.selectedTrackId);
  const setSelectedTrack = useAIStudioStore((state) => state.setSelectedTrack);
  const updateTrack = useAIStudioStore((state) => state.updateTrack);
  const masterVolume = useAIStudioStore((state) => state.masterVolume);
  const setMasterVolume = useAIStudioStore((state) => state.setMasterVolume);

  const CHANNEL_WIDTH = 80;
  const MINI_HEIGHT = 100;
  const EXPANDED_HEIGHT = 200;

  const height = isCollapsed ? 0 : isExpanded ? EXPANDED_HEIGHT : MINI_HEIGHT;

  // Track type colors
  const getTrackColor = (type: string): string => {
    const colors: Record<string, string> = {
      vocal: 'hsl(280, 70%, 55%)',
      guitar: 'hsl(15, 85%, 55%)',
      bass: 'hsl(220, 80%, 45%)',
      drums: 'hsl(140, 70%, 45%)',
      keys: 'hsl(180, 75%, 50%)',
      other: 'hsl(50, 90%, 55%)',
    };
    return colors[type] || colors.other;
  };

  const handleVolumeChange = (trackId: string, value: number) => {
    updateTrack(trackId, { volume: value });
  };

  const handlePanChange = (trackId: string, value: number) => {
    updateTrack(trackId, { pan: value });
  };

  return (
    <div
      className="border-t transition-all duration-300"
      style={{
        height: `${height}px`,
        background: 'linear-gradient(180deg, hsl(220, 20%, 13%) 0%, hsl(220, 20%, 11%) 100%)',
        borderColor: 'hsl(220, 20%, 22%)',
        overflow: 'hidden',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.05)',
      }}
    >
      {/* Toggle button with Depth */}
      <div
        className="border-b px-4 py-1 flex items-center justify-between cursor-pointer"
        style={{
          borderColor: 'hsl(220, 20%, 22%)',
          background: 'linear-gradient(180deg, hsl(220, 20%, 14%) 0%, hsl(220, 20%, 12%) 100%)',
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)',
        }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: 'hsl(220, 20%, 80%)' }}>
            Mixer
          </span>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
        >
          {isCollapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </Button>
      </div>

      {/* Mixer channels */}
      {!isCollapsed && (
        <div className="h-full overflow-x-auto overflow-y-hidden">
          <div className="flex gap-2 p-3 h-full">
            {/* Track channels */}
            {tracks.map((track) => {
              const isSelected = selectedTrackId === track.id;
              const trackColor = getTrackColor(track.type);

              return (
                <EnhancedChannelStrip
                  key={track.id}
                  track={track}
                  isSelected={isSelected}
                  onSelect={() => setSelectedTrack(track.id)}
                  onVolumeChange={(value) => handleVolumeChange(track.id, value)}
                  onPanChange={(value) => handlePanChange(track.id, value)}
                  onMuteToggle={() => updateTrack(track.id, { mute: !track.mute })}
                  onSoloToggle={() => updateTrack(track.id, { solo: !track.solo })}
                  trackColor={trackColor}
                />
              );
            })}

            {/* Master channel with Elevated Effect */}
            <div
              className="flex flex-col border-2 rounded-lg"
              style={{
                width: `${CHANNEL_WIDTH}px`,
                background: 'linear-gradient(135deg, hsl(220, 20%, 20%) 0%, hsl(220, 20%, 18%) 50%, hsl(220, 20%, 16%) 100%)',
                borderColor: 'hsl(180, 100%, 50%)',
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.3), inset 0 1px 2px rgba(0, 255, 255, 0.1), inset 0 -1px 2px rgba(0,0,0,0.4)',
              }}
            >
              <div className="flex-1 flex flex-col items-center justify-center p-2 gap-2">
                <div className="flex items-center gap-2" style={{ height: '100%' }}>
                  {/* ALS Thermal Meter */}
                  <ALSTrackStrip height={60} />

                  {/* Master Fader */}
                  <div style={{ height: '100%', width: '24px' }}>
                    <Slider
                      value={[masterVolume * 100]}
                      onValueChange={(value) => setMasterVolume(value[0] / 100)}
                      max={100}
                      step={1}
                      orientation="vertical"
                      className="h-full"
                    />
                  </div>
                </div>

                <div className="mt-2 text-[10px] font-mono" style={{ color: 'hsl(180, 100%, 50%)' }}>
                  {Math.round(masterVolume * 100)}
                </div>
              </div>

              <div
                className="p-2 text-center text-[11px] font-bold border-t flex items-center justify-center gap-1"
                style={{
                  borderColor: 'hsl(220, 20%, 28%)',
                  color: 'hsl(180, 100%, 50%)'
                }}
              >
                <ALSEnergyOrb size={10} />
                MASTER
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
