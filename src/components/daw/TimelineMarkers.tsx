import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Flag, Plus, Trash2, Music2, Clock } from 'lucide-react';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { toast } from 'sonner';

interface Marker {
  id: string;
  time: number;
  name: string;
  color: string;
  type: 'marker' | 'section';
}

export const TimelineMarkers = () => {
  const [markers, setMarkers] = useState<Marker[]>([
    { id: '1', time: 0, name: 'Intro', color: 'hsl(180, 70%, 50%)', type: 'section' },
    { id: '2', time: 8, name: 'Verse 1', color: 'hsl(120, 70%, 50%)', type: 'section' },
    { id: '3', time: 16, name: 'Chorus', color: 'hsl(280, 70%, 50%)', type: 'section' },
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newMarkerName, setNewMarkerName] = useState('');
  const [newMarkerType, setNewMarkerType] = useState<'marker' | 'section'>('marker');
  
  const currentTime = useAIStudioStore((state) => state.currentTime);
  const setCurrentTime = useAIStudioStore((state) => state.setCurrentTime);
  const bpm = useAIStudioStore((state) => state.bpm);
  const setBpm = useAIStudioStore((state) => state.setBpm);

  const handleAddMarker = () => {
    if (!newMarkerName.trim()) {
      toast.error('Please enter a marker name');
      return;
    }

    const newMarker: Marker = {
      id: `marker-${Date.now()}`,
      time: currentTime,
      name: newMarkerName,
      color: newMarkerType === 'section' 
        ? `hsl(${Math.random() * 360}, 70%, 50%)`
        : 'hsl(50, 100%, 50%)',
      type: newMarkerType,
    };

    setMarkers([...markers, newMarker].sort((a, b) => a.time - b.time));
    setNewMarkerName('');
    setDialogOpen(false);
    toast.success(`${newMarkerType === 'section' ? 'Section' : 'Marker'} added`);
  };

  const handleDeleteMarker = (id: string) => {
    setMarkers(markers.filter(m => m.id !== id));
    toast.success('Marker deleted');
  };

  const handleJumpToMarker = (time: number) => {
    setCurrentTime(time);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 p-4 rounded-lg border" style={{
      background: 'hsl(220, 20%, 12%)',
      borderColor: 'hsl(220, 20%, 20%)',
    }}>
      {/* Tempo Control */}
      <div className="flex items-center gap-4 p-3 rounded-lg" style={{ background: 'hsl(220, 20%, 14%)' }}>
        <Music2 className="w-4 h-4" style={{ color: 'hsl(180, 70%, 50%)' }} />
        <div className="flex-1">
          <Label className="text-xs">Tempo (BPM)</Label>
          <Input
            type="number"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            min={20}
            max={300}
            className="mt-1"
          />
        </div>
        <div className="text-xs" style={{ color: 'hsl(220, 20%, 70%)' }}>
          {bpm} BPM
        </div>
      </div>

      {/* Current Time */}
      <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'hsl(220, 20%, 14%)' }}>
        <Clock className="w-4 h-4" style={{ color: 'hsl(50, 100%, 50%)' }} />
        <div className="flex-1">
          <Label className="text-xs">Current Time</Label>
          <div className="font-mono text-lg" style={{ color: 'hsl(220, 20%, 90%)' }}>
            {formatTime(currentTime)}
          </div>
        </div>
      </div>

      {/* Add Marker Button */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full gap-2">
            <Plus className="w-4 h-4" />
            Add Marker/Section
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Marker</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Type</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={newMarkerType === 'marker' ? 'default' : 'outline'}
                  onClick={() => setNewMarkerType('marker')}
                  className="flex-1"
                >
                  <Flag className="w-4 h-4 mr-2" />
                  Marker
                </Button>
                <Button
                  variant={newMarkerType === 'section' ? 'default' : 'outline'}
                  onClick={() => setNewMarkerType('section')}
                  className="flex-1"
                >
                  <Music2 className="w-4 h-4 mr-2" />
                  Section
                </Button>
              </div>
            </div>

            <div>
              <Label>Name</Label>
              <Input
                value={newMarkerName}
                onChange={(e) => setNewMarkerName(e.target.value)}
                placeholder="e.g., Verse, Chorus, Drop"
              />
            </div>

            <div>
              <Label>Time</Label>
              <div className="font-mono text-lg p-2 rounded" style={{ 
                background: 'hsl(220, 20%, 14%)',
                color: 'hsl(220, 20%, 90%)'
              }}>
                {formatTime(currentTime)}
              </div>
            </div>

            <Button onClick={handleAddMarker} className="w-full">
              Add {newMarkerType === 'section' ? 'Section' : 'Marker'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Markers List */}
      <div className="space-y-2">
        <Label className="text-xs">Markers & Sections</Label>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {markers.map(marker => (
            <div
              key={marker.id}
              className="flex items-center gap-2 p-2 rounded hover:bg-white/5 transition-colors cursor-pointer"
              onClick={() => handleJumpToMarker(marker.time)}
            >
              <div
                className="w-2 h-full rounded"
                style={{ background: marker.color }}
              />
              {marker.type === 'section' ? (
                <Music2 className="w-4 h-4" style={{ color: marker.color }} />
              ) : (
                <Flag className="w-4 h-4" style={{ color: marker.color }} />
              )}
              <div className="flex-1">
                <div className="text-sm font-medium">{marker.name}</div>
                <div className="text-xs" style={{ color: 'hsl(220, 20%, 60%)' }}>
                  {formatTime(marker.time)}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteMarker(marker.id);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
