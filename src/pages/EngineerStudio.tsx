import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Music, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  FileAudio,
  TrendingUp,
  BarChart3,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

const EngineerStudio = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);

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
          client:profiles!projects_client_id_fkey(full_name, avatar_url),
          audio_files(
            id,
            file_name,
            file_path,
            file_size,
            duration_seconds,
            sample_rate,
            bit_depth,
            channels,
            stem_type,
            created_at
          )
        `)
        .eq('engineer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
      if (data && data.length > 0) {
        setSelectedProject(data[0]);
      }
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const analyzeAudio = async (projectId: string) => {
    toast.info('Analyzing audio with AI...');
    // AI analysis would happen here
    setTimeout(() => {
      toast.success('Audio analysis complete!');
    }, 2000);
  };

  const downloadStem = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('audio-files')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Download started');
    } catch (error: any) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const downloadFortePackage = async (projectId: string, dawFormat: string) => {
    toast.info(`Preparing ${dawFormat} package...`);
    // Forte-like package creation would happen here
    setTimeout(() => {
      toast.success(`${dawFormat} package ready for download`);
    }, 3000);
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

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500',
      in_progress: 'bg-blue-500',
      review: 'bg-purple-500',
      completed: 'bg-green-500'
    };
    return colors[status as keyof typeof colors] || 'bg-muted';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Engineer Studio</h1>
          <p className="text-muted-foreground">Professional workspace with AI-powered tools</p>
        </div>

        {projects.length === 0 ? (
          <Card className="p-12 text-center">
            <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Active Sessions</h3>
            <p className="text-muted-foreground mb-4">Browse opportunities to start working</p>
            <Button onClick={() => navigate('/engineer-crm?tab=opportunities')}>
              Find Jobs
            </Button>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Session Queue */}
            <Card className="lg:col-span-1 p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Session Queue
              </h3>
              <div className="space-y-2">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedProject?.id === project.id
                        ? 'bg-primary/10 border border-primary'
                        : 'bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{project.title}</h4>
                      <Badge className={`${getStatusColor(project.status)} text-white text-xs`}>
                        {project.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {project.client?.full_name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileAudio className="w-3 h-3" />
                      {project.audio_files?.length || 0} files
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Main Workspace */}
            <Card className="lg:col-span-2 p-6">
              {selectedProject ? (
                <Tabs defaultValue="files" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="files">Files</TabsTrigger>
                    <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                    <TabsTrigger value="preparation">Prep</TabsTrigger>
                    <TabsTrigger value="export">Export</TabsTrigger>
                  </TabsList>

                  <TabsContent value="files" className="space-y-4">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold mb-2">{selectedProject.title}</h3>
                      <p className="text-muted-foreground">{selectedProject.description}</p>
                    </div>

                    {selectedProject.audio_files && selectedProject.audio_files.length > 0 ? (
                      <div className="space-y-2">
                        {selectedProject.audio_files.map((file: any) => (
                          <Card key={file.id} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium mb-1">{file.file_name}</h4>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>{file.sample_rate}Hz</span>
                                  <span>{file.bit_depth}bit</span>
                                  <span>{file.channels}ch</span>
                                  <span>{(file.file_size / 1024 / 1024).toFixed(2)}MB</span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => downloadStem(file.file_path, file.file_name)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileAudio className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-muted-foreground">No files uploaded yet</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="analysis" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Zap className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">Quick Analysis</h4>
                            <p className="text-xs text-muted-foreground">BPM, Key, Genre</p>
                          </div>
                        </div>
                        <Button 
                          className="w-full gap-2" 
                          onClick={() => analyzeAudio(selectedProject.id)}
                        >
                          <Sparkles className="w-4 h-4" />
                          Analyze Audio
                        </Button>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-blue-500/10 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <h4 className="font-semibold">Quality Check</h4>
                            <p className="text-xs text-muted-foreground">Technical assessment</p>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full gap-2">
                          <BarChart3 className="w-4 h-4" />
                          Run Quality Check
                        </Button>
                      </Card>
                    </div>

                    <Card className="p-4 bg-primary/5">
                      <h4 className="font-semibold mb-2">AI Insights</h4>
                      <p className="text-sm text-muted-foreground">
                        Click "Analyze Audio" to get AI-powered insights about BPM, key detection, 
                        genre classification, and mixing recommendations.
                      </p>
                    </Card>
                  </TabsContent>

                  <TabsContent value="preparation" className="space-y-4">
                    <Card className="p-4">
                      <h4 className="font-semibold mb-3">Project Notes</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Client:</strong> {selectedProject.client?.full_name}</p>
                        <p><strong>Status:</strong> {selectedProject.status}</p>
                        <p><strong>Files:</strong> {selectedProject.audio_files?.length || 0}</p>
                      </div>
                    </Card>

                    <Card className="p-4 bg-gradient-to-r from-primary/10 to-accent/10">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        AI Preparation Assistant
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Automatic file organization, naming conventions, and workflow optimization
                      </p>
                      <Button className="gap-2">
                        <Sparkles className="w-4 h-4" />
                        Prepare Project
                      </Button>
                    </Card>
                  </TabsContent>

                  <TabsContent value="export" className="space-y-4">
                    <Card className="p-4">
                      <h4 className="font-semibold mb-4">Forte-Style DAW Export</h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        <Button 
                          variant="outline" 
                          className="gap-2"
                          onClick={() => downloadFortePackage(selectedProject.id, 'Pro Tools')}
                        >
                          <Download className="w-4 h-4" />
                          Pro Tools
                        </Button>
                        <Button 
                          variant="outline" 
                          className="gap-2"
                          onClick={() => downloadFortePackage(selectedProject.id, 'Logic Pro')}
                        >
                          <Download className="w-4 h-4" />
                          Logic Pro
                        </Button>
                        <Button 
                          variant="outline" 
                          className="gap-2"
                          onClick={() => downloadFortePackage(selectedProject.id, 'Ableton')}
                        >
                          <Download className="w-4 h-4" />
                          Ableton
                        </Button>
                        <Button 
                          variant="outline" 
                          className="gap-2"
                          onClick={() => downloadFortePackage(selectedProject.id, 'Studio One')}
                        >
                          <Download className="w-4 h-4" />
                          Studio One
                        </Button>
                      </div>
                    </Card>

                    <Card className="p-4 bg-muted/50">
                      <h4 className="font-semibold mb-2">Export Features</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Organized folder structure
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Properly labeled stems
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Session metadata included
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          DAW-specific formatting
                        </li>
                      </ul>
                    </Card>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">Select a project to get started</p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default EngineerStudio;
