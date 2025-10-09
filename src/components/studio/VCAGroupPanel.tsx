import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, X, Move } from 'lucide-react';
import { Track, useAIStudioStore } from '@/stores/aiStudioStore';
import { cn } from '@/lib/utils';

interface VCAGroupPanelProps {
  tracks: Track[];
}

/**
 * VCA Groups for controlling multiple track volumes together
 */
export const VCAGroupPanel = ({ tracks }: VCAGroupPanelProps) => {
  const vcaGroups = useAIStudioStore((state) => state.vcaGroups);
  const createVCAGroup = useAIStudioStore((state) => state.createVCAGroup);
  const updateVCAGroup = useAIStudioStore((state) => state.updateVCAGroup);
  const deleteVCAGroup = useAIStudioStore((state) => state.deleteVCAGroup);
  
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateGroup = () => {
    if (newGroupName && selectedTracks.size > 0) {
      createVCAGroup(newGroupName, Array.from(selectedTracks));
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

  const handleVCAChange = (groupId: string, value: number) => {
    // Value is offset from -1 to 1 (represented as 0 to 1 on slider, mapped to -1 to 1)
    const offset = (value - 0.5) * 2; // Map 0-1 to -1 to 1
    updateVCAGroup(groupId, offset);
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
          VCA Groups
        </h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="h-7">
              <Plus className="w-3 h-3 mr-1" />
              New VCA
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create VCA Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>VCA Group Name</Label>
                <Input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g., All Vocals, Rhythm Section"
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
                Create VCA Group
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {vcaGroups.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No VCA groups yet. Create one to control multiple track volumes together.
          </p>
        ) : (
          vcaGroups.map((group) => (
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
                  onClick={() => deleteVCAGroup(group.id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>

              <div className="space-y-2">
                {/* VCA Control */}
                <div className="flex items-center gap-2">
                  <Move className="w-3 h-3 text-[hsl(var(--studio-text-dim))]" />
                  <Slider
                    value={[(group.value + 1) / 2]} // Map -1 to 1 range to 0 to 1 for slider
                    onValueChange={([value]) => handleVCAChange(group.id, value)}
                    min={0}
                    max={1}
                    step={0.01}
                    className="flex-1"
                  />
                  <span className="text-xs font-mono text-[hsl(var(--studio-text-dim))] w-12">
                    {group.value > 0 ? '+' : ''}{(group.value * 100).toFixed(0)}%
                  </span>
                </div>

                <p className="text-[10px] text-muted-foreground">
                  Adjusts all grouped track volumes relatively
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
