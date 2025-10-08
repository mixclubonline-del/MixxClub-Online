import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Plus, 
  Upload, 
  Music, 
  Drum, 
  Guitar, 
  Piano, 
  Mic,
  Volume2,
  VolumeX,
  Trash2,
  Settings
} from 'lucide-react';
import { useAIStudioStore, Track } from '@/stores/aiStudioStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TrackListPanelProps {
  onAddTrack: (type: Track['type']) => void;
  onImportAudio: () => void;
}

export const TrackListPanel = ({ onAddTrack, onImportAudio }: TrackListPanelProps) => {
  const { tracks, updateTrack, removeTrack } = useAIStudioStore();

  const toggleMute = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (track) {
      updateTrack(trackId, { mute: !track.mute });
    }
  };

  const toggleSolo = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (track) {
      // Clear all other solos
      tracks.forEach(t => {
        if (t.id !== trackId && t.solo) {
          updateTrack(t.id, { solo: false });
        }
      });
      updateTrack(trackId, { solo: !track.solo });
    }
  };

  const updateVolume = (trackId: string, volume: number) => {
    updateTrack(trackId, { volume });
  };

  const getTrackIcon = (type: Track['type']) => {
    switch (type) {
      case 'vocal': return <Mic className="w-4 h-4" />;
      case 'drums': return <Drum className="w-4 h-4" />;
      case 'guitar': return <Guitar className="w-4 h-4" />;
      case 'keys': return <Piano className="w-4 h-4" />;
      default: return <Music className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-64 bg-gradient-to-b from-card/40 to-card/20 border-r border-white/10 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Tracks</h3>
          </div>
          <Badge variant="secondary" className="text-xs">
            {tracks.length}
          </Badge>
        </div>

        {/* Add Track Buttons */}
        <div className="space-y-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Add Track
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onAddTrack('vocal')}>
                <Mic className="w-4 h-4 mr-2" />
                Vocal
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddTrack('drums')}>
                <Drum className="w-4 h-4 mr-2" />
                Drums
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddTrack('bass')}>
                <Music className="w-4 h-4 mr-2" />
                Bass
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddTrack('guitar')}>
                <Guitar className="w-4 h-4 mr-2" />
                Guitar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddTrack('keys')}>
                <Piano className="w-4 h-4 mr-2" />
                Keys
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddTrack('other')}>
                <Music className="w-4 h-4 mr-2" />
                Audio
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="default" 
            size="sm" 
            className="w-full gap-2"
            onClick={onImportAudio}
          >
            <Upload className="w-4 h-4" />
            Import Audio
          </Button>
        </div>
      </div>

      {/* Track List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {tracks.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm p-8">
              <Music className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No tracks yet</p>
              <p className="text-xs mt-1">Add a track to get started</p>
            </div>
          ) : (
            tracks.map((track) => (
              <div
                key={track.id}
                className="bg-gradient-to-br from-muted/40 to-muted/20 rounded-lg p-3 border border-white/5 hover:border-white/10 transition-colors"
                style={{
                  borderLeftColor: track.color,
                  borderLeftWidth: '3px'
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getTrackIcon(track.type)}
                      <span className="text-sm font-medium truncate">
                        {track.name}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {track.regions.length} region{track.regions.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTrack(track.id)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

                {/* Solo/Mute Buttons */}
                <div className="flex items-center gap-1 mb-2">
                  <Button
                    variant={track.solo ? "default" : "ghost"}
                    size="sm"
                    onClick={() => toggleSolo(track.id)}
                    className="h-6 text-xs px-2 flex-1"
                  >
                    S
                  </Button>
                  <Button
                    variant={track.mute ? "destructive" : "ghost"}
                    size="sm"
                    onClick={() => toggleMute(track.id)}
                    className="h-6 text-xs px-2 flex-1"
                  >
                    M
                  </Button>
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-2">
                  {track.mute ? (
                    <VolumeX className="w-3 h-3 text-muted-foreground" />
                  ) : (
                    <Volume2 className="w-3 h-3 text-muted-foreground" />
                  )}
                  <Slider
                    value={[track.volume * 100]}
                    onValueChange={(value) => updateVolume(track.id, value[0] / 100)}
                    min={0}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-8 text-right">
                    {Math.round(track.volume * 100)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
