import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Music, Mic } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAIStudioStore, Track } from '@/stores/aiStudioStore';
import { FileUploadZone } from './FileUploadZone';
import { toast } from 'sonner';

export const TrackControls = () => {
  const { addTrack } = useAIStudioStore();
  const [showUpload, setShowUpload] = useState(false);

  const handleAddTrack = (type: Track['type']) => {
    const newTrack: Track = {
      id: `track-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${Date.now()}`,
      type,
      volume: 0.8,
      pan: 0,
      mute: false,
      solo: false,
      peakLevel: 0,
      rmsLevel: 0,
      regions: [],
      effects: [],
      sends: {},
      color: generateTrackColor(type),
    };

    addTrack(newTrack);
    toast.success(`Added ${type} track`);
  };

  const handleAudioUpload = () => {
    setShowUpload(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Track
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleAddTrack('vocal')}>
            <Mic className="w-4 h-4 mr-2" />
            Vocal Track
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddTrack('drums')}>
            <Music className="w-4 h-4 mr-2" />
            Drums Track
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddTrack('bass')}>
            <Music className="w-4 h-4 mr-2" />
            Bass Track
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddTrack('guitar')}>
            <Music className="w-4 h-4 mr-2" />
            Guitar Track
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddTrack('keys')}>
            <Music className="w-4 h-4 mr-2" />
            Keys Track
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddTrack('other')}>
            <Music className="w-4 h-4 mr-2" />
            Audio Track
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button size="sm" variant="outline" onClick={handleAudioUpload} className="gap-2">
        <Music className="w-4 h-4" />
        Upload Audio
      </Button>

      <FileUploadZone 
        open={showUpload} 
        onClose={() => setShowUpload(false)} 
      />
    </>
  );
};

function generateTrackColor(type: Track['type']): string {
  const colors: Record<Track['type'], string> = {
    vocal: 'hsl(280, 70%, 50%)',
    drums: 'hsl(0, 70%, 50%)',
    bass: 'hsl(260, 70%, 50%)',
    guitar: 'hsl(30, 70%, 50%)',
    keys: 'hsl(180, 70%, 50%)',
    other: 'hsl(200, 70%, 50%)',
  };
  
  return colors[type];
}
