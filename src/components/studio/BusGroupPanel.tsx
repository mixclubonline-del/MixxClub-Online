import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, X, Volume2, Circle } from 'lucide-react';
import { BusGroup, Track, useAIStudioStore } from '@/stores/aiStudioStore';
import { cn } from '@/lib/utils';

interface BusGroupPanelProps {
  tracks: Track[];
}

/**
 * Bus Groups for routing multiple tracks through shared processing
 */
export const BusGroupPanel = ({ tracks }: BusGroupPanelProps) => {
  const busGroups = useAIStudioStore((state) => state.busGroups);
  const createBusGroup = useAIStudioStore((state) => state.createBusGroup);
  const updateBusGroup = useAIStudioStore((state) => state.updateBusGroup);
  const deleteBusGroup = useAIStudioStore((state) => state.deleteBusGroup);
  
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateGroup = () => {
    if (newGroupName && selectedTracks.size > 0) {
      createBusGroup(newGroupName, Array.from(selectedTracks));
      setNewGroupName('');
      setSelectedTracks(new Set());
      setDialogOpen(false);
    }
  };

  const toggleTrackSelection = (trackId: string) => {
    setSelectedTracks((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      return next;
    });
  };

  return (
    <div
      className="p-4 rounded-lg border space-y-4"
      style={{
        background: 'var(--panel-gradient)',
        borderColor: 'hsl(220, 14%, 28%)',
      }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[hsl(var(--studio-text))] uppercase">
          Bus Groups
        </h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="h-7">
              <Plus className="w-3 h-3 mr-1" />
              New Bus
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Bus Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Bus Group Name</Label>
                <Input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g., Drums, Vocals"
                />
              </div>
              <div>
                <Label>Select Tracks</Label>
                <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                  {tracks.map((track) => (
                    <div
                      key={track.id}
                      onClick={() => toggleTrackSelection(track.id)}
                      className={cn(
                        'p-2 rounded cursor-pointer transition-colors',
                        selectedTracks.has(track.id)
                          ? 'bg-primary/20 border border-primary'
                          : 'bg-card hover:bg-accent'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: track.color || 'hsl(210, 100%, 55%)' }}
                        />
                        <span className="text-sm">{track.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={handleCreateGroup} className="w-full">
                Create Bus Group
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {busGroups.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No bus groups yet. Create one to route tracks through shared processing.
          </p>
        ) : (
          busGroups.map((group) => (
            <div
              key={group.id}
              className="p-3 rounded-lg border"
              style={{
                background: 'hsl(220, 18%, 18%)',
                borderColor: 'hsl(220, 14%, 30%)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ background: group.color }}
                  />
                  <span className="text-sm font-medium text-[hsl(var(--studio-text))]">
                    {group.name}
                  </span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {group.trackIds.length} tracks
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteBusGroup(group.id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>

              <div className="space-y-2">
                {/* Volume */}
                <div className="flex items-center gap-2">
                  <Volume2 className="w-3 h-3 text-[hsl(var(--studio-text-dim))]" />
                  <Slider
                    value={[group.volume]}
                    onValueChange={([value]) =>
                      updateBusGroup(group.id, { volume: value })
                    }
                    max={1}
                    step={0.01}
                    className="flex-1"
                  />
                  <span className="text-xs font-mono text-[hsl(var(--studio-text-dim))] w-8">
                    {Math.round(group.volume * 100)}
                  </span>
                </div>

                {/* Mute/Solo */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Label className="text-xs text-[hsl(var(--studio-text-dim))]">
                      M
                    </Label>
                    <Switch
                      checked={group.mute}
                      onCheckedChange={(mute) => updateBusGroup(group.id, { mute })}
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Label className="text-xs text-[hsl(var(--studio-text-dim))]">
                      S
                    </Label>
                    <Switch
                      checked={group.solo}
                      onCheckedChange={(solo) => updateBusGroup(group.id, { solo })}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
