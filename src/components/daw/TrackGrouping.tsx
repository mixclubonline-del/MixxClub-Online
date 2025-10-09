import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FolderPlus, Folder, ChevronRight, ChevronDown } from 'lucide-react';
import { useAIStudioStore, Track } from '@/stores/aiStudioStore';
import { toast } from 'sonner';

interface TrackGroup {
  id: string;
  name: string;
  color: string;
  trackIds: string[];
  collapsed: boolean;
}

export const TrackGrouping = () => {
  const [groups, setGroups] = useState<TrackGroup[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const tracks = useAIStudioStore((state) => state.tracks);

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    if (selectedTracks.length === 0) {
      toast.error('Please select at least one track');
      return;
    }

    const newGroup: TrackGroup = {
      id: `group-${Date.now()}`,
      name: newGroupName,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      trackIds: selectedTracks,
      collapsed: false,
    };

    setGroups([...groups, newGroup]);
    setNewGroupName('');
    setSelectedTracks([]);
    setDialogOpen(false);
    toast.success(`Group "${newGroupName}" created`);
  };

  const toggleGroup = (groupId: string) => {
    setGroups(groups.map(g => 
      g.id === groupId ? { ...g, collapsed: !g.collapsed } : g
    ));
  };

  const handleTrackSelection = (trackId: string) => {
    setSelectedTracks(prev =>
      prev.includes(trackId)
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  return (
    <div className="space-y-2">
      {/* Create Group Button */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
          >
            <FolderPlus className="w-4 h-4" />
            Create Track Group
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Track Group</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Group Name</Label>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="e.g., Drums, Vocals, etc."
              />
            </div>

            <div>
              <Label>Select Tracks</Label>
              <div className="space-y-2 mt-2 max-h-64 overflow-y-auto">
                {tracks.map(track => (
                  <div key={track.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedTracks.includes(track.id)}
                      onCheckedChange={() => handleTrackSelection(track.id)}
                    />
                    <span className="text-sm">{track.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleCreateGroup} className="w-full">
              Create Group
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Display Groups */}
      <div className="space-y-1">
        {groups.map(group => (
          <div key={group.id}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => toggleGroup(group.id)}
              style={{ borderLeft: `3px solid ${group.color}` }}
            >
              {group.collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              <Folder className="w-4 h-4" />
              <span>{group.name}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                ({group.trackIds.length})
              </span>
            </Button>

            {!group.collapsed && (
              <div className="ml-6 space-y-1">
                {group.trackIds.map(trackId => {
                  const track = tracks.find(t => t.id === trackId);
                  return track ? (
                    <div 
                      key={trackId}
                      className="text-xs py-1 px-2 rounded bg-muted/50 text-foreground hover:bg-muted transition-colors"
                    >
                      {track.name}
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
