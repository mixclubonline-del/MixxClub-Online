import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface ProjectCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}

export const ProjectCreationModal = ({ isOpen, onClose, onProjectCreated }: ProjectCreationModalProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    description: '',
    useFortePrep: false
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!user || !formData.title.trim()) {
      toast.error('Please fill in the project name');
      return;
    }

    setIsCreating(true);
    try {
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          title: formData.title,
          description: formData.description || formData.artist,
          client_id: user.id,
          status: 'pending',
          metadata: {
            artist: formData.artist,
            fortePrep: formData.useFortePrep
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Simulate Forte AI preparation if enabled
      if (formData.useFortePrep) {
        setTimeout(async () => {
          const updatedMetadata = {
            artist: formData.artist,
            fortePrep: formData.useFortePrep,
            aiPrep: 'Forte Session Prep:\n- Tracks renamed & colored\n- Buses/auxes routed\n- Silence stripped\n- Ready for Pro Tools / Logic / Studio One',
            fortePrepared: true
          };
          
          await supabase
            .from('projects')
            .update({ metadata: updatedMetadata })
            .eq('id', project.id);
          
          onProjectCreated();
        }, 1500);
      }

      toast.success('Project created successfully!');
      setFormData({ title: '', artist: '', description: '', useFortePrep: false });
      onClose();
      onProjectCreated();
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Project Name</Label>
            <Input
              id="title"
              placeholder="Project Name"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="artist">Artist Name</Label>
            <Input
              id="artist"
              placeholder="Artist Name"
              value={formData.artist}
              onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Track Info / Notes</Label>
            <Textarea
              id="description"
              placeholder="Track Info / Notes"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="fortePrep"
              checked={formData.useFortePrep}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, useFortePrep: checked === true }))
              }
            />
            <Label htmlFor="fortePrep">Auto-prepare session with Forte AI</Label>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};