import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  Edit2, 
  Save, 
  Clock, 
  DollarSign, 
  Calendar,
  CheckCircle2,
  FileText,
  MessageSquare,
  Activity,
  Target,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { MilestoneTracker } from './MilestoneTracker';
import { ProjectFiles } from './ProjectFiles';
import { ProjectComments } from './ProjectComments';

interface ProjectDetailPanelProps {
  projectId: string | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const ProjectDetailPanel = ({ 
  projectId, 
  open, 
  onClose, 
  onUpdate 
}: ProjectDetailPanelProps) => {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
  });

  useEffect(() => {
    if (projectId && open) {
      fetchProject();
    }
  }, [projectId, open]);

  const fetchProject = async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('collaborative_projects')
        .select(`
          *,
          partnership:partnerships(
            artist:profiles!partnerships_artist_id_fkey(full_name, avatar_url),
            engineer:profiles!partnerships_engineer_id_fkey(full_name, avatar_url)
          ),
          client:crm_clients(name, email)
        `)
        .eq('id', projectId)
        .single();

      if (error) throw error;
      setProject(data);
      setEditData({
        title: data.title || '',
        description: data.description || '',
        status: data.status || 'planning',
        priority: data.priority || 'medium',
      });
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!projectId) return;

    try {
      const { error } = await supabase
        .from('collaborative_projects')
        .update({
          title: editData.title,
          description: editData.description,
          status: editData.status,
          priority: editData.priority,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId);

      if (error) throw error;
      
      toast.success('Project updated');
      setEditing(false);
      fetchProject();
      onUpdate();
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    }
  };

  const statusColors: Record<string, string> = {
    planning: 'bg-muted text-muted-foreground',
    in_progress: 'bg-primary/10 text-primary',
    review: 'bg-warning/10 text-warning',
    completed: 'bg-success/10 text-success',
  };

  if (!open) return null;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl p-0">
        <ScrollArea className="h-full">
          <div className="p-6">
            <SheetHeader className="mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {editing ? (
                    <Input
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      className="text-xl font-bold mb-2"
                    />
                  ) : (
                    <SheetTitle className="text-xl mb-2">
                      {loading ? 'Loading...' : project?.title}
                    </SheetTitle>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={statusColors[project?.status || 'planning']}>
                      {project?.status?.replace('_', ' ') || 'planning'}
                    </Badge>
                    <Badge variant="outline">{project?.project_type || 'track'}</Badge>
                    <Badge variant="outline" className="capitalize">
                      {project?.priority || 'medium'} priority
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {editing ? (
                    <>
                      <Button size="sm" onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </SheetHeader>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid grid-cols-5 w-full mb-6">
                  <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                  <TabsTrigger value="milestones" className="text-xs">Milestones</TabsTrigger>
                  <TabsTrigger value="files" className="text-xs">Files</TabsTrigger>
                  <TabsTrigger value="comments" className="text-xs">Comments</TabsTrigger>
                  <TabsTrigger value="activity" className="text-xs">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Description */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {editing ? (
                        <Textarea
                          value={editData.description}
                          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                          rows={4}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {project?.description || 'No description provided'}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Progress */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Overall Progress</span>
                          <span className="font-medium">{project?.progress_percentage || 0}%</span>
                        </div>
                        <Progress value={project?.progress_percentage || 0} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Deadline</p>
                            <p className="text-sm font-medium">
                              {project?.deadline 
                                ? format(new Date(project.deadline), 'MMM d, yyyy')
                                : 'Not set'
                              }
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                          <DollarSign className="w-5 h-5 text-success" />
                          <div>
                            <p className="text-xs text-muted-foreground">Revenue</p>
                            <p className="text-sm font-medium">
                              ${(project?.total_revenue || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Created</p>
                            <p className="text-sm font-medium">
                              {format(new Date(project?.created_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Client</p>
                            <p className="text-sm font-medium">
                              {project?.client?.name || 'No client assigned'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Team */}
                  {project?.partnership && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Team</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4">
                          {project.partnership.artist && (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={project.partnership.artist.avatar_url} />
                                <AvatarFallback>
                                  {project.partnership.artist.full_name?.[0] || 'A'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">
                                  {project.partnership.artist.full_name}
                                </p>
                                <p className="text-xs text-muted-foreground">Artist</p>
                              </div>
                            </div>
                          )}
                          {project.partnership.engineer && (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={project.partnership.engineer.avatar_url} />
                                <AvatarFallback>
                                  {project.partnership.engineer.full_name?.[0] || 'E'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">
                                  {project.partnership.engineer.full_name}
                                </p>
                                <p className="text-xs text-muted-foreground">Engineer</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="milestones">
                  <MilestoneTracker projectId={projectId!} />
                </TabsContent>

                <TabsContent value="files">
                  <ProjectFiles projectId={projectId!} />
                </TabsContent>

                <TabsContent value="comments">
                  <ProjectComments projectId={projectId!} />
                </TabsContent>

                <TabsContent value="activity">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Activity tracking coming soon
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
