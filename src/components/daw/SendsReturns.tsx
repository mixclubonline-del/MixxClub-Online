import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { GitBranch, Plus, Trash2, Volume2, Power } from 'lucide-react';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { toast } from 'sonner';

interface Send {
  id: string;
  trackId: string;
  returnId: string;
  level: number;
  preFader: boolean;
}

interface Return {
  id: string;
  name: string;
  color: string;
  volume: number;
  effect: 'reverb' | 'delay' | 'chorus' | 'none';
  enabled: boolean;
}

export const SendsReturns = () => {
  const [returns, setReturns] = useState<Return[]>([
    { id: 'return-1', name: 'Reverb A', color: 'hsl(260, 70%, 50%)', volume: 0.7, effect: 'reverb', enabled: true },
    { id: 'return-2', name: 'Delay A', color: 'hsl(180, 70%, 50%)', volume: 0.6, effect: 'delay', enabled: true },
  ]);
  const [sends, setSends] = useState<Send[]>([]);
  const [newReturnName, setNewReturnName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  
  const tracks = useAIStudioStore((state) => state.tracks);

  const handleCreateReturn = () => {
    if (!newReturnName.trim()) {
      toast.error('Please enter a return name');
      return;
    }

    const newReturn: Return = {
      id: `return-${Date.now()}`,
      name: newReturnName,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      volume: 0.7,
      effect: 'none',
      enabled: true,
    };

    setReturns([...returns, newReturn]);
    setNewReturnName('');
    setDialogOpen(false);
    toast.success(`Return "${newReturnName}" created`);
  };

  const handleDeleteReturn = (returnId: string) => {
    setReturns(returns.filter(r => r.id !== returnId));
    setSends(sends.filter(s => s.returnId !== returnId));
    toast.success('Return deleted');
  };

  const handleReturnVolumeChange = (returnId: string, value: number[]) => {
    setReturns(returns.map(r => 
      r.id === returnId ? { ...r, volume: value[0] } : r
    ));
  };

  const handleToggleReturn = (returnId: string) => {
    setReturns(returns.map(r => 
      r.id === returnId ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const handleSendLevelChange = (sendId: string, value: number[]) => {
    setSends(sends.map(s => 
      s.id === sendId ? { ...s, level: value[0] } : s
    ));
  };

  const handleAddSend = (trackId: string, returnId: string) => {
    const existingSend = sends.find(s => s.trackId === trackId && s.returnId === returnId);
    
    if (existingSend) {
      setSends(sends.filter(s => s.id !== existingSend.id));
      toast.success('Send removed');
    } else {
      const newSend: Send = {
        id: `send-${Date.now()}`,
        trackId,
        returnId,
        level: 0.5,
        preFader: false,
      };
      setSends([...sends, newSend]);
      toast.success('Send added');
    }
  };

  const getTrackSends = (trackId: string) => {
    return sends.filter(s => s.trackId === trackId);
  };

  return (
    <div className="space-y-4">
      {/* Returns Section */}
      <div className="p-4 rounded-lg border bg-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Aux Returns</h3>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                New Return
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Aux Return</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Return Name</Label>
                  <Input
                    value={newReturnName}
                    onChange={(e) => setNewReturnName(e.target.value)}
                    placeholder="e.g., Reverb, Delay, Chorus"
                  />
                </div>
                <Button onClick={handleCreateReturn} className="w-full">
                  Create Return
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {returns.map((ret) => (
            <div 
              key={ret.id} 
              className="p-3 rounded-lg border"
              style={{ borderLeft: `4px solid ${ret.color}` }}
            >
              <div className="space-y-3">
                {/* Return Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={ret.enabled ? "default" : "outline"}
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleToggleReturn(ret.id)}
                    >
                      <Power className="w-3 h-3" />
                    </Button>
                    <span className="font-medium">{ret.name}</span>
                    {ret.effect !== 'none' && (
                      <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {ret.effect}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleDeleteReturn(ret.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

                {/* Return Volume */}
                <div className="flex items-center gap-3">
                  <Volume2 className="w-4 h-4" />
                  <Slider
                    value={[ret.volume]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={(value) => handleReturnVolumeChange(ret.id, value)}
                    className="flex-1"
                    disabled={!ret.enabled}
                  />
                  <span className="text-xs w-12 text-right">
                    {Math.round(ret.volume * 100)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sends Section */}
      <div className="p-4 rounded-lg border bg-card">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="w-5 h-5 text-primary rotate-180" />
          <h3 className="font-semibold">Track Sends</h3>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Select Track:</Label>
          <Select value={selectedTrack || ''} onValueChange={setSelectedTrack}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a track..." />
            </SelectTrigger>
            <SelectContent>
              {tracks.map(track => (
                <SelectItem key={track.id} value={track.id}>{track.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedTrack && (
          <div className="mt-4 space-y-3">
            {returns.map((ret) => {
              const trackSend = sends.find(s => s.trackId === selectedTrack && s.returnId === ret.id);
              
              return (
                <div key={ret.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">{ret.name}</Label>
                    <Button
                      variant={trackSend ? "default" : "outline"}
                      size="sm"
                      className="h-7"
                      onClick={() => handleAddSend(selectedTrack, ret.id)}
                    >
                      {trackSend ? 'Remove' : 'Add'}
                    </Button>
                  </div>
                  
                  {trackSend && (
                    <div className="flex items-center gap-3 pl-4">
                      <Volume2 className="w-4 h-4" />
                      <Slider
                        value={[trackSend.level]}
                        min={0}
                        max={1}
                        step={0.01}
                        onValueChange={(value) => handleSendLevelChange(trackSend.id, value)}
                        className="flex-1"
                      />
                      <span className="text-xs w-12 text-right">
                        {Math.round(trackSend.level * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!selectedTrack && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Select a track to manage sends</p>
          </div>
        )}
      </div>
    </div>
  );
};
