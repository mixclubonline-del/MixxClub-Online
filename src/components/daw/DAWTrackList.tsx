import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Volume2,
  VolumeX,
  Circle,
  Headphones,
  ChevronRight,
  Plus,
  Music,
  Mic,
  Drum,
  Guitar,
  Piano,
} from 'lucide-react';
import { useAIStudioStore, Track } from '@/stores/aiStudioStore';
import { cn } from '@/lib/utils';

export const DAWTrackList = () => {
  const tracks = useAIStudioStore((state) => state.tracks);
  const selectedTrackId = useAIStudioStore((state) => state.selectedTrackId);
  const selectTrack = useAIStudioStore((state) => state.selectTrack);
  const updateTrack = useAIStudioStore((state) => state.updateTrack);
  const addTrack = useAIStudioStore((state) => state.addTrack);

  const getTrackIcon = (type: string) => {
    switch (type) {
      case 'vocal':
        return <Mic className="w-4 h-4" />;
      case 'drums':
        return <Drum className="w-4 h-4" />;
      case 'keys':
        return <Piano className="w-4 h-4" />;
      case 'guitar':
        return <Guitar className="w-4 h-4" />;
      default:
        return <Music className="w-4 h-4" />;
    }
  };

  const handleAddTrack = () => {
    const newTrack: Track = {
      id: `track-${Date.now()}`,
      name: `Track ${tracks.length + 1}`,
      type: 'other',
      volume: 0.8,
      pan: 0,
      mute: false,
      solo: false,
      peakLevel: 0,
      rmsLevel: 0,
      color: 'hsl(var(--primary))',
      regions: [],
      effects: [],
      sends: {},
    };
    addTrack(newTrack);
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="h-10 border-b border-border flex items-center justify-between px-3">
        <span className="text-sm font-semibold">TRACKS</span>
        <Button variant="ghost" size="sm" onClick={handleAddTrack}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Track List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {tracks.map((track) => (
            <div
              key={track.id}
              className={cn(
                'group rounded-md p-2 cursor-pointer transition-colors border',
                selectedTrackId === track.id
                  ? 'bg-primary/10 border-primary/30'
                  : 'bg-muted/30 border-transparent hover:bg-muted/50'
              )}
              onClick={() => selectTrack(track.id)}
            >
              {/* Track Header */}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: track.color || 'hsl(var(--primary))' }}
                />
                {getTrackIcon(track.type)}
                <Input
                  value={track.name}
                  onChange={(e) =>
                    updateTrack(track.id, { name: e.target.value })
                  }
                  className="h-6 px-2 text-sm bg-transparent border-0 focus-visible:ring-0"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Track Controls */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateTrack(track.id, { mute: !track.mute });
                  }}
                >
                  {track.mute ? (
                    <VolumeX className="w-3 h-3 text-destructive" />
                  ) : (
                    <Volume2 className="w-3 h-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateTrack(track.id, { solo: !track.solo });
                  }}
                >
                  <Headphones
                    className={cn(
                      'w-3 h-3',
                      track.solo && 'text-primary'
                    )}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                >
                  <Circle className="w-3 h-3 text-destructive" />
                </Button>
                <div className="flex-1" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>

              {/* Level Meter Preview */}
              <div className="mt-2 h-1 bg-background rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all"
                  style={{ width: `${track.peakLevel * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Master Track */}
      <div className="h-20 border-t border-border p-2">
        <div className="bg-primary/10 border border-primary/30 rounded-md p-2 h-full flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-primary" />
          <span className="text-sm font-bold">MASTER</span>
          <div className="flex-1" />
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Volume2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
