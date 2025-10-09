import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Cloud, CloudUpload, CloudDownload, History, Trash2, Loader2 } from 'lucide-react';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SavedProject {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  version: number;
  data: any;
}

interface CloudProjectManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudProjectManager = ({ isOpen, onClose }: CloudProjectManagerProps) => {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { user } = useAuth();
  const tracks = useAIStudioStore((state) => state.tracks);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('daw_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast.error('Failed to load cloud projects');
    } finally {
      setIsLoading(false);
    }
  };

  const saveProject = async () => {
    if (!user) {
      toast.error('Please sign in to save projects');
      return;
    }

    if (!projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    setIsSaving(true);
    try {
      const projectData = {
        tracks,
        timestamp: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('daw_projects')
        .insert([{
          user_id: user.id,
          name: projectName,
          data: projectData as any,
          version: 1,
        }]);

      if (error) throw error;

      toast.success('Project saved to cloud');
      setProjectName('');
      setDialogOpen(false);
      await loadProjects();
    } catch (error) {
      console.error('Failed to save project:', error);
      toast.error('Failed to save project');
    } finally {
      setIsSaving(false);
    }
  };

  const loadProject = async (project: SavedProject) => {
    try {
      const store = useAIStudioStore.getState();
      
      if (project.data?.tracks) {
        // Clear current tracks
        store.tracks.forEach(track => {
          store.removeTrack(track.id);
        });

        // Load saved tracks
        project.data.tracks.forEach((track: any) => {
          store.addTrack(track);
        });

        toast.success(`Loaded: ${project.name}`);
      }
    } catch (error) {
      console.error('Failed to load project:', error);
      toast.error('Failed to load project');
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('daw_projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      toast.success('Project deleted');
      await loadProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
    }
  };

  if (!user) {
    return null;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="glass p-6 max-w-4xl w-full max-h-[80vh] overflow-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Cloud Projects</h3>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <CloudUpload className="w-4 h-4" />
              Save
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Project to Cloud</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Project Name</Label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="My Awesome Track"
                />
              </div>
              <Button
                onClick={saveProject}
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-4 h-4 mr-2" />
                    Save Project
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
        </div>
      ) : projects.length > 0 ? (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-sm">{project.name}</p>
                <p className="text-xs text-muted-foreground">
                  <History className="w-3 h-3 inline mr-1" />
                  {new Date(project.updated_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => loadProject(project)}
                >
                  <CloudDownload className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteProject(project.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Cloud className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p className="text-sm">No saved projects yet</p>
        </div>
      )}
      
      <div className="flex justify-end mt-6">
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
      </Card>
    </div>
  );
};
