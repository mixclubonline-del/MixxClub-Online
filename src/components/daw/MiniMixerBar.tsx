import { useState } from 'react';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ChevronUp, ChevronDown, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const handleVolumeChange = (trackId: string, value: number[]) => {
    updateTrack(trackId, { volume: value[0] / 100 });
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
                <div
                  key={track.id}
                  className={cn(
                    "flex flex-col border rounded-lg transition-colors cursor-pointer",
                    isSelected && "ring-2"
                  )}
                  style={{
                    width: `${CHANNEL_WIDTH}px`,
                    background: 'linear-gradient(135deg, hsl(220, 20%, 18%) 0%, hsl(220, 20%, 16%) 50%, hsl(220, 20%, 14%) 100%)',
                    borderColor: isSelected ? trackColor : 'hsl(220, 20%, 24%)',
                    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.05), inset 0 -1px 2px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.3)',
                  }}
                  onClick={() => setSelectedTrack(track.id)}
                >
                  {/* Vertical fader */}
                  <div className="flex-1 flex flex-col items-center justify-center p-2">
                    <div className="relative" style={{ height: '100%', width: '20px' }}>
                      <Slider
                        value={[track.volume * 100]}
                        onValueChange={(value) => handleVolumeChange(track.id, value)}
                        max={100}
                        step={1}
                        orientation="vertical"
                        className="h-full"
                      />
                    </div>
                    
                    {/* Volume value */}
                    <div className="mt-2 text-[10px] font-mono" style={{ color: 'hsl(220, 20%, 70%)' }}>
                      {Math.round(track.volume * 100)}
                    </div>
                  </div>

                  {/* M/S buttons */}
                  <div className="flex gap-1 p-1 border-t" style={{ borderColor: 'hsl(220, 20%, 24%)' }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-6 flex-1 text-[10px] font-bold",
                        track.mute && "bg-[hsl(0,70%,50%)]"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTrack(track.id, { mute: !track.mute });
                      }}
                    >
                      M
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-6 flex-1 text-[10px] font-bold",
                        track.solo && "bg-[hsl(50,90%,50%)]"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTrack(track.id, { solo: !track.solo });
                      }}
                    >
                      S
                    </Button>
                  </div>

                  {/* Track name */}
                  <div 
                    className="p-2 text-center text-[10px] font-medium truncate border-t"
                    style={{ 
                      borderColor: 'hsl(220, 20%, 24%)',
                      color: 'hsl(220, 20%, 90%)'
                    }}
                  >
                    {track.name}
                  </div>
                </div>
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
              <div className="flex-1 flex flex-col items-center justify-center p-2">
                <div className="relative" style={{ height: '100%', width: '24px' }}>
                  <Slider
                    value={[masterVolume * 100]}
                    onValueChange={(value) => setMasterVolume(value[0] / 100)}
                    max={100}
                    step={1}
                    orientation="vertical"
                    className="h-full"
                  />
                </div>
                
                <div className="mt-2 text-[10px] font-mono" style={{ color: 'hsl(180, 100%, 50%)' }}>
                  {Math.round(masterVolume * 100)}
                </div>
              </div>

              <div 
                className="p-2 text-center text-[11px] font-bold border-t"
                style={{ 
                  borderColor: 'hsl(220, 20%, 28%)',
                  color: 'hsl(180, 100%, 50%)'
                }}
              >
                MASTER
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
