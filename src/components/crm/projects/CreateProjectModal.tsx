import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Loader2, Music, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { usePartnershipEarnings } from '@/hooks/usePartnershipEarnings';
import { useToast } from '@/hooks/use-toast';
import { useUsageEnforcement } from '@/hooks/useUsageEnforcement';
import { useNavigate } from 'react-router-dom';

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnershipId?: string;
}

const projectTypes = [
  { value: 'track', label: '🎵 Single Track' },
  { value: 'single', label: '🎶 Single Release' },
  { value: 'ep', label: '💿 EP' },
  { value: 'album', label: '📀 Album' },
  { value: 'remix', label: '🔄 Remix' },
  { value: 'mix', label: '🎚️ Mixing Project' },
  { value: 'master', label: '🎛️ Mastering Project' },
];

export const CreateProjectModal = ({ open, onOpenChange, partnershipId }: CreateProjectModalProps) => {
  const { partnerships, createProject } = usePartnershipEarnings();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { canUseFeature, getFeatureUsage, refreshUsage, tier } = useUsageEnforcement();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectType: 'track',
    selectedPartnership: partnershipId || '',
  });

  const activePartnerships = partnerships.filter(p => p.status === 'active');
  const projectUsage = getFeatureUsage('projects');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canUseFeature('projects')) {
      toast({
        title: 'Project limit reached',
        description: `Your ${tier} plan allows ${projectUsage.limit} projects. Upgrade to create more.`,
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.selectedPartnership) {
      toast({
        title: 'Partnership required',
        description: 'Please select a partnership for this project',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await createProject({
        partnershipId: formData.selectedPartnership,
        title: formData.title,
        description: formData.description,
        projectType: formData.projectType,
      });

      if (result) {
        await refreshUsage();
        toast({
          title: 'Project created!',
          description: `"${formData.title}" has been added to your board`,
        });
        onOpenChange(false);
        setFormData({
          title: '',
          description: '',
          projectType: 'track',
          selectedPartnership: partnershipId || '',
        });
      }
    } catch (err) {
      console.error('Error creating project:', err);
      toast({
        title: 'Error',
        description: 'Failed to create project',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="w-5 h-5 text-primary" />
            Create New Project
          </DialogTitle>
        </DialogHeader>

        {/* Limit Reached Banner */}
        {projectUsage.limitReached && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-destructive">Project limit reached</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You've used all {projectUsage.limit} projects on your <span className="font-medium capitalize">{tier}</span> plan.
                  Upgrade to unlock more.
                </p>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={() => {
                onOpenChange(false);
                navigate('/pricing?feature=projects');
              }}
            >
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Button>
          </div>
        )}

        {/* Form — hidden when limit reached */}
        {!projectUsage.limitReached && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="partnership">Partnership</Label>
              <Select
                value={formData.selectedPartnership}
                onValueChange={(value) => setFormData(prev => ({ ...prev, selectedPartnership: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a partnership" />
                </SelectTrigger>
                <SelectContent>
                  {activePartnerships.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No active partnerships
                    </SelectItem>
                  ) : (
                    activePartnerships.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        Partnership #{p.id.slice(0, 8)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                placeholder="e.g., Summer Vibes EP"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Project Type</Label>
              <Select
                value={formData.projectType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, projectType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the project..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Usage indicator */}
            {!projectUsage.isUnlimited && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{projectUsage.current}/{projectUsage.limit} projects used</span>
                  <span>{projectUsage.remaining} remaining</span>
                </div>
                <Progress value={projectUsage.percentage} className="h-1.5" />
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !formData.title || !formData.selectedPartnership}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Project
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
