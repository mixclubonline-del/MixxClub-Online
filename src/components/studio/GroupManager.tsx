import { useState } from 'react';
import { Users, Plus, Trash2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Track } from '@/stores/aiStudioStore';

interface BusGroup {
  id: string;
  name: string;
  color: string;
  trackIds: string[];
  volume: number;
  mute: boolean;
  solo: boolean;
}

interface VCAGroup {
  id: string;
  name: string;
  trackIds: string[];
  color: string;
}

interface GroupManagerProps {
  tracks: Track[];
  busGroups: BusGroup[];
  vcaGroups: VCAGroup[];
  onCreateBusGroup: (name: string, trackIds: string[]) => void;
  onCreateVCAGroup: (name: string, trackIds: string[]) => void;
  onDeleteGroup: (groupId: string, type: 'bus' | 'vca') => void;
  isOpen: boolean;
  onClose: () => void;
}

export const GroupManager = ({
  tracks,
  busGroups,
  vcaGroups,
  onCreateBusGroup,
  onCreateVCAGroup,
  onDeleteGroup,
  isOpen,
  onClose,
}: GroupManagerProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [groupType, setGroupType] = useState<'bus' | 'vca'>('bus');
  const [groupName, setGroupName] = useState('');
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);

  const handleCreate = () => {
    if (!groupName.trim() || selectedTrackIds.length === 0) return;

    if (groupType === 'bus') {
      onCreateBusGroup(groupName, selectedTrackIds);
    } else {
      onCreateVCAGroup(groupName, selectedTrackIds);
    }

    setGroupName('');
    setSelectedTrackIds([]);
    setShowCreateDialog(false);
  };

  const toggleTrackSelection = (trackId: string) => {
    setSelectedTrackIds(prev =>
      prev.includes(trackId)
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Group Management
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <Button onClick={() => setShowCreateDialog(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Create New Group
            </Button>

            {/* Bus Groups */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Bus Groups ({busGroups.length})
              </h3>
              <div className="space-y-2">
                {busGroups.map(group => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between p-3 rounded border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      <div>
                        <div className="font-medium text-sm">{group.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {group.trackIds.length} tracks
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteGroup(group.id, 'bus')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {busGroups.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No bus groups created
                  </p>
                )}
              </div>
            </div>

            {/* VCA Groups */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                VCA Groups ({vcaGroups.length})
              </h3>
              <div className="space-y-2">
                {vcaGroups.map(group => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between p-3 rounded border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      <div>
                        <div className="font-medium text-sm">{group.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {group.trackIds.length} tracks (relative control)
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteGroup(group.id, 'vca')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {vcaGroups.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No VCA groups created
                  </p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Group Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Group</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Group Type */}
            <div className="flex gap-2">
              <Button
                variant={groupType === 'bus' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setGroupType('bus')}
              >
                Bus Group
              </Button>
              <Button
                variant={groupType === 'vca' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setGroupType('vca')}
              >
                VCA Group
              </Button>
            </div>

            <div className="text-xs text-muted-foreground p-2 rounded bg-muted">
              {groupType === 'bus' 
                ? '📊 Bus Group: Routes tracks to shared bus with effects chain'
                : '🎛️ VCA Group: Controls relative levels without audio routing'}
            </div>

            {/* Group Name */}
            <Input
              placeholder="Group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />

            {/* Track Selection */}
            <div>
              <div className="text-sm font-medium mb-2">Select Tracks</div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {tracks.map(track => (
                  <div
                    key={track.id}
                    className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer"
                    onClick={() => toggleTrackSelection(track.id)}
                  >
                    <Checkbox
                      checked={selectedTrackIds.includes(track.id)}
                      onCheckedChange={() => toggleTrackSelection(track.id)}
                    />
                    <span className="text-sm">{track.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreate}
                disabled={!groupName.trim() || selectedTrackIds.length === 0}
              >
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
