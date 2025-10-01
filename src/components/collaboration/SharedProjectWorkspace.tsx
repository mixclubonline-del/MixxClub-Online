import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Music, MessageSquare, FileAudio, TrendingUp, Clock, 
  CheckCircle, Play, Pause, Volume2, Music2, Sparkles 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { MusicalMilestones } from './MusicalMilestones';
import { AudioComments } from './AudioComments';
import { ReferenceTracksBoard } from './ReferenceTracksBoard';

interface SharedProjectWorkspaceProps {
  projectId: string;
}

interface ProjectDetails {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  genre: string | null;
  client: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  engineer: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
  audio_files: any[];
}

export const SharedProjectWorkspace = ({ projectId }: SharedProjectWorkspaceProps) => {
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    fetchProjectDetails();
    setupRealtimeSubscription();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          client:profiles!projects_client_id_fkey(id, full_name, avatar_url),
          engineer:profiles!projects_engineer_id_fkey(id, full_name, avatar_url),
          audio_files(*)
        `)
        .eq('id', projectId)
        .single();

      if (error) throw error;

      setProject(data as any);
      calculateCompletion(data);
    } catch (error: any) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project workspace');
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletion = (projectData: any) => {
    let completed = 0;
    const total = 5;

    if (projectData.audio_files?.length > 0) completed++;
    if (projectData.engineer) completed++;
    if (projectData.status === 'in_progress') completed++;
    if (projectData.status === 'review') completed += 2;
    if (projectData.status === 'completed') completed = total;

    setCompletionPercentage((completed / total) * 100);
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`project-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `id=eq.${projectId}`
        },
        () => {
          fetchProjectDetails();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audio_files',
          filter: `project_id=eq.${projectId}`
        },
        () => {
          fetchProjectDetails();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      pending: { label: 'Waiting to Start', color: 'bg-yellow-500', icon: Clock },
      in_progress: { label: 'Creating Magic', color: 'bg-blue-500', icon: Music2 },
      review: { label: 'Final Polish', color: 'bg-purple-500', icon: Sparkles },
      completed: { label: 'Track Complete', color: 'bg-green-500', icon: CheckCircle }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  const isParticipant = () => {
    if (!user || !project) return false;
    return user.id === project.client.id || user.id === project.engineer?.id;
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading studio workspace...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!project) {
    return (
      <Card className="p-8 text-center">
        <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Project not found</h3>
        <p className="text-muted-foreground">This project may have been deleted or you don't have access</p>
      </Card>
    );
  }

  if (!isParticipant()) {
    return (
      <Card className="p-8 text-center">
        <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
        <p className="text-muted-foreground">You don't have access to this project workspace</p>
      </Card>
    );
  }

  const statusInfo = getStatusInfo(project.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 via-purple-500/10 to-accent/10 border-primary/20">
        <div className="space-y-6">
          {/* Title and Status */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Music className="w-6 h-6 text-primary" />
                <h1 className="text-3xl font-bold">{project.title}</h1>
              </div>
              {project.description && (
                <p className="text-muted-foreground mb-4">{project.description}</p>
              )}
              {project.genre && (
                <Badge variant="secondary" className="mb-4">
                  {project.genre}
                </Badge>
              )}
            </div>
            <Badge className={`${statusInfo.color} text-white flex items-center gap-2 px-4 py-2`}>
              <StatusIcon className="w-4 h-4" />
              {statusInfo.label}
            </Badge>
          </div>

          {/* Collaborators */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2 border-background">
                <AvatarImage src={project.client.avatar_url || ''} />
                <AvatarFallback className="bg-primary/10">
                  {project.client.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{project.client.full_name}</p>
                <p className="text-xs text-muted-foreground">Artist</p>
              </div>
            </div>

            {project.engineer && (
              <>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Music2 className="w-4 h-4" />
                  <span className="text-sm">collaborating with</span>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border-2 border-background">
                    <AvatarImage src={project.engineer.avatar_url || ''} />
                    <AvatarFallback className="bg-primary/10">
                      {project.engineer.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{project.engineer.full_name}</p>
                    <p className="text-xs text-muted-foreground">Engineer</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Track Journey Progress</span>
              <span className="font-bold text-primary">{completionPercentage.toFixed(0)}%</span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {project.audio_files?.length || 0} files uploaded • Created {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Card>

      {/* Workspace Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="audio" className="gap-2">
            <FileAudio className="w-4 h-4" />
            Audio Files
            {project.audio_files?.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {project.audio_files.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="milestones" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Milestones
          </TabsTrigger>
          <TabsTrigger value="references" className="gap-2">
            <Music className="w-4 h-4" />
            References
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <FileAudio className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{project.audio_files?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Audio Files</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <MessageSquare className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">-</div>
                  <div className="text-sm text-muted-foreground">Comments</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Clock className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {Math.floor((Date.now() - new Date(project.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="text-sm text-muted-foreground">Days Active</div>
                </div>
              </div>
            </Card>
          </div>

          <AudioComments projectId={projectId} audioFiles={project.audio_files} />
        </TabsContent>

        <TabsContent value="audio" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileAudio className="w-5 h-5 text-primary" />
              Project Audio Files
            </h3>
            {project.audio_files && project.audio_files.length > 0 ? (
              <div className="space-y-3">
                {project.audio_files.map((file: any) => (
                  <div key={file.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Music className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.file_name}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{(file.file_size / 1024 / 1024).toFixed(2)} MB</span>
                          {file.duration_seconds && (
                            <span>{Math.floor(file.duration_seconds / 60)}:{String(file.duration_seconds % 60).padStart(2, '0')}</span>
                          )}
                          <span>{new Date(file.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileAudio className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No audio files uploaded yet</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="mt-6">
          <MusicalMilestones projectId={projectId} status={project.status} />
        </TabsContent>

        <TabsContent value="references" className="mt-6">
          <ReferenceTracksBoard projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};