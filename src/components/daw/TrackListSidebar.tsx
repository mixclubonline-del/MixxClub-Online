import { useState } from 'react';
import { useAIStudioStore, Track } from '@/stores/aiStudioStore';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Volume2, 
  Mic, 
  Circle, 
  Headphones,
  Settings2,
  ChevronRight,
  ChevronLeft,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const TrackListSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredTrack, setHoveredTrack] = useState<string | null>(null);

  const tracks = useAIStudioStore((state) => state.tracks);
  const selectedTrackId = useAIStudioStore((state) => state.selectedTrackId);
  const setSelectedTrack = useAIStudioStore((state) => state.setSelectedTrack);
  const updateTrack = useAIStudioStore((state) => state.updateTrack);
  const removeTrack = useAIStudioStore((state) => state.removeTrack);

  const SIDEBAR_WIDTH = 220;
  const COLLAPSED_WIDTH = 60;

  // Track type icons
  const getTrackIcon = (type: Track['type']) => {
    switch (type) {
      case 'vocal': return '🎤';
      case 'guitar': return '🎸';
      case 'bass': return '🎸';
      case 'drums': return '🥁';
      case 'keys': return '🎹';
      default: return '🔊';
    }
  };

  // Track type colors - Pro Tools inspired
  const getTrackColor = (type: Track['type']): string => {
    const colors: Partial<Record<Track['type'], string>> = {
      vocal: 'hsl(280, 70%, 55%)',
      guitar: 'hsl(15, 85%, 55%)',
      bass: 'hsl(220, 80%, 45%)',
      drums: 'hsl(140, 70%, 45%)',
      keys: 'hsl(180, 75%, 50%)',
      audio: 'hsl(200, 70%, 50%)',
      midi: 'hsl(300, 70%, 50%)',
      bus: 'hsl(0, 0%, 50%)',
      other: 'hsl(50, 90%, 55%)',
    };
    return colors[type] || colors.other || 'hsl(50, 90%, 55%)';
  };

  const handleVolumeChange = (trackId: string, value: number[]) => {
    updateTrack(trackId, { volume: value[0] / 100 });
  };

  const handlePanChange = (trackId: string, value: number[]) => {
    updateTrack(trackId, { pan: (value[0] - 50) / 50 });
  };

  if (isCollapsed) {
    return (
      <div 
        className="flex flex-col border-r"
        style={{
          width: `${COLLAPSED_WIDTH}px`,
          background: 'linear-gradient(135deg, hsl(220, 20%, 14%) 0%, hsl(220, 20%, 12%) 50%, hsl(220, 20%, 10%) 100%)',
          borderColor: 'hsl(220, 20%, 22%)',
          boxShadow: 'inset -1px 0 2px rgba(255,255,255,0.05), 2px 0 8px rgba(0,0,0,0.4)',
        }}
      >
        {/* Collapse button */}
        <div className="p-2 border-b" style={{ borderColor: 'hsl(220, 20%, 22%)' }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(false)}
            className="w-full"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Track icons */}
        <div className="flex-1 overflow-y-auto">
          {tracks.map((track) => {
            const isSelected = selectedTrackId === track.id;
            return (
              <div
                key={track.id}
                onClick={() => setSelectedTrack(track.id)}
                className={cn(
                  "h-[120px] flex items-center justify-center cursor-pointer border-b transition-colors",
                  isSelected && "bg-[hsl(220,20%,20%)]"
                )}
                style={{
                  borderColor: 'hsl(220, 20%, 22%)',
                }}
              >
                <span className="text-2xl">{getTrackIcon(track.type)}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col border-r"
      style={{
        width: `${SIDEBAR_WIDTH}px`,
        background: 'linear-gradient(135deg, hsl(220, 20%, 14%) 0%, hsl(220, 20%, 12%) 50%, hsl(220, 20%, 10%) 100%)',
        borderColor: 'hsl(220, 20%, 22%)',
        boxShadow: 'inset -1px 0 2px rgba(255,255,255,0.05), 2px 0 8px rgba(0,0,0,0.4)',
      }}
    >
      {/* Sidebar Header with Spatial Depth */}
      <div 
        className="p-3 border-b flex items-center justify-between"
        style={{ 
          borderColor: 'hsl(220, 20%, 22%)',
          background: 'linear-gradient(180deg, hsl(220, 20%, 15%) 0%, hsl(220, 20%, 13%) 100%)',
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05), 0 2px 3px rgba(0,0,0,0.3)',
        }}
      >
        <h3 className="text-sm font-semibold" style={{ color: 'hsl(220, 20%, 80%)' }}>
          Tracks
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(true)}
          className="h-7 w-7"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* Track List */}
      <div className="flex-1 overflow-y-auto">
        {tracks.map((track) => {
          const isSelected = selectedTrackId === track.id;
          const isHovered = hoveredTrack === track.id;
          const trackColor = getTrackColor(track.type);

          return (
            <div
              key={track.id}
              className={cn(
                "border-b transition-colors",
                isSelected && "bg-[hsl(220,20%,18%)]"
              )}
              style={{
                height: '120px',
                borderColor: 'hsl(220, 20%, 22%)',
              }}
              onMouseEnter={() => setHoveredTrack(track.id)}
              onMouseLeave={() => setHoveredTrack(null)}
              onClick={() => setSelectedTrack(track.id)}
            >
              <div className="p-3 h-full flex flex-col">
                {/* Track header */}
                <div className="flex items-center gap-2 mb-2">
                  {/* Color indicator */}
                  <div
                    className="w-1 h-12 rounded-full"
                    style={{ background: trackColor }}
                  />

                  <div className="flex-1 min-w-0">
                    {/* Track icon and name */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getTrackIcon(track.type)}</span>
                      <span 
                        className="text-sm font-medium truncate"
                        style={{ color: 'hsl(220, 20%, 90%)' }}
                      >
                        {track.name}
                      </span>
                    </div>

                    {/* Control buttons */}
                    <div className="flex items-center gap-1">
                      {/* Mute */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-6 w-6",
                          track.mute && "bg-[hsl(0,70%,50%)] hover:bg-[hsl(0,70%,45%)]"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTrack(track.id, { mute: !track.mute });
                        }}
                      >
                        <span className="text-[10px] font-bold">M</span>
                      </Button>

                      {/* Solo */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-6 w-6",
                          track.solo && "bg-[hsl(50,90%,50%)] hover:bg-[hsl(50,90%,45%)]"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTrack(track.id, { solo: !track.solo });
                        }}
                      >
                        <span className="text-[10px] font-bold">S</span>
                      </Button>

                      {/* Record Arm */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                      >
                        <Circle className="w-3 h-3" />
                      </Button>

                      {/* Effects indicator */}
                      {track.effects.length > 0 && (
                        <div 
                          className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-medium"
                          style={{ 
                            background: 'hsl(220, 20%, 25%)',
                            color: 'hsl(180, 100%, 50%)'
                          }}
                        >
                          {track.effects.length}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  {isHovered && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTrack(track.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>

                {/* Volume control */}
                <div className="mb-1.5">
                  <div className="flex items-center gap-2 mb-1">
                    <Volume2 className="w-3 h-3" style={{ color: 'hsl(220, 20%, 60%)' }} />
                    <span className="text-[10px]" style={{ color: 'hsl(220, 20%, 60%)' }}>
                      {Math.round(track.volume * 100)}%
                    </span>
                  </div>
                  <Slider
                    value={[track.volume * 100]}
                    onValueChange={(value) => handleVolumeChange(track.id, value)}
                    max={100}
                    step={1}
                    className="cursor-pointer"
                  />
                </div>

                {/* Pan control */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Headphones className="w-3 h-3" style={{ color: 'hsl(220, 20%, 60%)' }} />
                    <span className="text-[10px]" style={{ color: 'hsl(220, 20%, 60%)' }}>
                      {track.pan === 0 ? 'C' : track.pan < 0 ? `L${Math.abs(Math.round(track.pan * 100))}` : `R${Math.round(track.pan * 100)}`}
                    </span>
                  </div>
                  <Slider
                    value={[(track.pan + 1) * 50]}
                    onValueChange={(value) => handlePanChange(track.id, value)}
                    max={100}
                    step={1}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
