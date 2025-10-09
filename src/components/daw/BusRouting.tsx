import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Radio, Boxes, Plus, Trash2, Volume2 } from 'lucide-react';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { toast } from 'sonner';

interface Bus {
  id: string;
  name: string;
  color: string;
  volume: number;
  routedTracks: string[];
  output: 'master' | string;
}

export const BusRouting = () => {
  const [buses, setBuses] = useState<Bus[]>([
    { id: 'bus-1', name: 'Drums Bus', color: 'hsl(0, 70%, 50%)', volume: 0.8, routedTracks: [], output: 'master' },
    { id: 'bus-2', name: 'Vocals Bus', color: 'hsl(200, 70%, 50%)', volume: 0.75, routedTracks: [], output: 'master' },
  ]);
  const [newBusName, setNewBusName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  
  const tracks = useAIStudioStore((state) => state.tracks);

  const handleCreateBus = () => {
    if (!newBusName.trim()) {
      toast.error('Please enter a bus name');
      return;
    }

    const newBus: Bus = {
      id: `bus-${Date.now()}`,
      name: newBusName,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      volume: 0.8,
      routedTracks: [],
      output: 'master',
    };

    setBuses([...buses, newBus]);
    setNewBusName('');
    setDialogOpen(false);
    toast.success(`Bus "${newBusName}" created`);
  };

  const handleDeleteBus = (busId: string) => {
    setBuses(buses.filter(b => b.id !== busId));
    toast.success('Bus deleted');
  };

  const handleVolumeChange = (busId: string, value: number[]) => {
    setBuses(buses.map(b => 
      b.id === busId ? { ...b, volume: value[0] } : b
    ));
  };

  const handleRouteTrack = (busId: string, trackId: string) => {
    setBuses(buses.map(b => {
      if (b.id === busId) {
        const isRouted = b.routedTracks.includes(trackId);
        return {
          ...b,
          routedTracks: isRouted 
            ? b.routedTracks.filter(id => id !== trackId)
            : [...b.routedTracks, trackId]
        };
      }
      return b;
    }));
  };

  const handleOutputChange = (busId: string, output: string) => {
    setBuses(buses.map(b => 
      b.id === busId ? { ...b, output } : b
    ));
  };

  return (
    <div className="space-y-4 p-4 rounded-lg border bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Boxes className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Bus Routing</h3>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              New Bus
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Audio Bus</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Bus Name</Label>
                <Input
                  value={newBusName}
                  onChange={(e) => setNewBusName(e.target.value)}
                  placeholder="e.g., Drums, Vocals, FX"
                />
              </div>
              <Button onClick={handleCreateBus} className="w-full">
                Create Bus
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {buses.map((bus) => (
          <div 
            key={bus.id} 
            className="p-3 rounded-lg border"
            style={{ borderLeft: `4px solid ${bus.color}` }}
          >
            <div className="space-y-3">
              {/* Bus Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4" />
                  <span className="font-medium">{bus.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({bus.routedTracks.length} tracks)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleDeleteBus(bus.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4" />
                <Slider
                  value={[bus.volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={(value) => handleVolumeChange(bus.id, value)}
                  className="flex-1"
                />
                <span className="text-xs w-12 text-right">
                  {Math.round(bus.volume * 100)}%
                </span>
              </div>

              {/* Output Routing */}
              <div className="flex items-center gap-2">
                <Label className="text-xs">Output:</Label>
                <Select 
                  value={bus.output}
                  onValueChange={(value) => handleOutputChange(bus.id, value)}
                >
                  <SelectTrigger className="h-7 text-xs flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="master">Master</SelectItem>
                    {buses.filter(b => b.id !== bus.id).map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Track Routing */}
              <div className="space-y-1">
                <Label className="text-xs">Routed Tracks:</Label>
                <div className="grid grid-cols-2 gap-1">
                  {tracks.slice(0, 6).map(track => (
                    <Button
                      key={track.id}
                      variant={bus.routedTracks.includes(track.id) ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleRouteTrack(bus.id, track.id)}
                    >
                      {track.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {buses.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Boxes className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p className="text-sm">No buses created yet</p>
        </div>
      )}
    </div>
  );
};
