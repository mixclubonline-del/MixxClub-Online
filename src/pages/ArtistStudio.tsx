import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Upload, 
  Music, 
  Sparkles,
  FileAudio,
  CheckCircle,
  Clock,
  TrendingUp,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { AudioFileUpload } from '@/components/crm/AudioFileUpload';

const ArtistStudio = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    genre: '',
    reference_notes: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProjects();
  }, [user, navigate]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          engineer:profiles!projects_engineer_id_fkey(full_name, avatar_url),
          audio_files(count)
        `)
        .eq('client_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    if (!newProject.title) {
      toast.error('Please enter a project title');
      return;
    }

    try {
      setUploading(true);
      const { data, error } = await supabase
        .from('projects')
        .insert({
          title: newProject.title,
          description: newProject.description,
          client_id: user?.id,
          status: 'pending',
          metadata: {
            genre: newProject.genre,
            reference_notes: newProject.reference_notes
          }
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Project created! Upload your files now.');
      setNewProject({ title: '', description: '', genre: '', reference_notes: '' });
      fetchProjects();
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500',
      in_progress: 'bg-blue-500',
      review: 'bg-purple-500',
      completed: 'bg-green-500'
    };
    return colors[status as keyof typeof colors] || 'bg-muted';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Artist Studio</h1>
          <p className="text-muted-foreground">Upload and manage your music sessions</p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">New Upload</TabsTrigger>
            <TabsTrigger value="projects">My Sessions ({projects.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Create New Session
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., My Latest Track"
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your project, the vibe you're going for..."
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="genre">Genre</Label>
                  <Input
                    id="genre"
                    placeholder="Hip-Hop, R&B, Pop, etc."
                    value={newProject.genre}
                    onChange={(e) => setNewProject({ ...newProject, genre: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="reference">Reference Tracks / Notes</Label>
                  <Textarea
                    id="reference"
                    placeholder="Share any reference tracks or specific mixing notes..."
                    value={newProject.reference_notes}
                    onChange={(e) => setNewProject({ ...newProject, reference_notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={createProject} 
                  disabled={uploading}
                  className="w-full gap-2"
                >
                  {uploading ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Create Session
                    </>
                  )}
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/20 rounded-lg">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">AI-Powered Session Preparation</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Our AI automatically analyzes your uploaded files, detects stems, 
                    organizes everything Forte-style, and prepares it for engineers.
                  </p>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Automatic stem separation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      BPM & key detection
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      DAW-ready organization
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Engineer matching
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            {projects.length === 0 ? (
              <Card className="p-12 text-center">
                <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Sessions Yet</h3>
                <p className="text-muted-foreground mb-4">Create your first session to get started</p>
                <Button onClick={() => document.querySelector('[value="upload"]')?.dispatchEvent(new Event('click'))}>
                  <Upload className="w-4 h-4 mr-2" />
                  Create Session
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{project.title}</h3>
                          <Badge className={`${getStatusColor(project.status)} text-white`}>
                            {project.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{project.description}</p>
                        
                        {project.engineer && (
                          <div className="flex items-center gap-2 text-sm mb-3">
                            <Users className="w-4 h-4" />
                            <span>Engineer: {project.engineer.full_name}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <FileAudio className="w-4 h-4" />
                            {project.audio_files?.[0]?.count || 0} files
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(project.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline"
                          onClick={() => navigate(`/project/${project.id}`)}
                        >
                          View Details
                        </Button>
                        {project.status === 'pending' && (
                          <AudioFileUpload projectId={project.id} onFilesUploaded={fetchProjects} />
                        )}
                      </div>
                    </div>

                    {project.status === 'completed' && (
                      <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">Session Complete!</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your mixed/mastered files are ready for download
                        </p>
                      </div>
                    )}

                    {project.status === 'in_progress' && (
                      <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <div className="flex items-center gap-2 text-blue-600">
                          <TrendingUp className="w-5 h-5" />
                          <span className="font-medium">Work in Progress</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {project.engineer?.full_name} is working on your session
                        </p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ArtistStudio;
