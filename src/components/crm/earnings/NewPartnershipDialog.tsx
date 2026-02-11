import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Plus, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NewPartnershipDialogProps {
  userType: 'artist' | 'engineer' | 'producer';
  onCreatePartnership: (partnerId: string, userSplit: number) => Promise<unknown>;
}

export const NewPartnershipDialog = ({
  userType,
  onCreatePartnership,
}: NewPartnershipDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [partnerId, setPartnerId] = useState('');
  const [splitPercentage, setSplitPercentage] = useState(50);

  const handleSubmit = async () => {
    if (!partnerId.trim()) {
      toast({
        title: 'Partner ID Required',
        description: 'Please enter your partner\'s ID',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await onCreatePartnership(partnerId, splitPercentage);

      if (result) {
        toast({
          title: 'Partnership Created',
          description: 'Invitation sent to your partner',
        });
        setOpen(false);
        setPartnerId('');
        setSplitPercentage(50);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create partnership',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Partnership
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create Partnership
          </DialogTitle>
          <DialogDescription>
            Set up a revenue sharing partnership with {userType === 'artist' ? 'an engineer' : userType === 'engineer' ? 'an artist' : 'an artist or engineer'}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="partner-id">Partner ID</Label>
            <Input
              id="partner-id"
              placeholder={`Enter ${userType === 'artist' ? "engineer" : userType === 'engineer' ? "artist" : "partner"}'s user ID`}
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Your partner can find their ID in their profile settings
            </p>
          </div>

          <div className="space-y-4">
            <Label>Revenue Split</Label>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Your share</span>
              <span className="font-medium text-primary">{splitPercentage}%</span>
            </div>
            <Slider
              value={[splitPercentage]}
              onValueChange={([value]) => setSplitPercentage(value)}
              max={100}
              min={0}
              step={5}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <div className="flex justify-between">
                <span>You ({userType})</span>
                <span className="font-medium">{splitPercentage}%</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Partner ({userType === 'artist' ? 'engineer' : userType === 'engineer' ? 'artist' : 'collaborator'})</span>
                <span className="font-medium">{100 - splitPercentage}%</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Partnership'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
