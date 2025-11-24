import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, Music, Plus, Zap, Star, Clock, Users } from "lucide-react";
import { toast } from "sonner";

const ArtistDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");

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

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: title.trim(),
          description: description.trim(),
          budget: budget ? parseFloat(budget) : null,
          user_id: user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Project created successfully!');
      setTitle("");
      setDescription("");
      setBudget("");
      setShowCreateForm(false);
      fetchProjects();
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500',
      in_progress: 'bg-blue-500',
      review: 'bg-purple-500',
      completed: 'bg-green-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container px-6 pt-24 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Artist Dashboard</h1>
            <p className="text-muted-foreground">Create and manage your music projects</p>
          </div>
          
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="gap-2 bg-gradient-to-r from-primary to-primary/90"
            size="lg"
          >
            <Plus className="w-5 h-5" />
            New Project
          </Button>
        </div>

        {/* Stats Overview */}
        <CollapsibleCard
          title="Stats Overview"
          storageKey="artist-dashboard-stats"
          contentClassName="pt-0"
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/20">
                  <Music className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-bold text-primary">{projects.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-500/20">
                  <Star className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-500">
                    {projects.filter(p => p.status === 'completed').length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-500/20">
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {projects.filter(p => p.status === 'in_progress').length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-500/20">
                  <Users className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Collaborators</p>
                  <p className="text-2xl font-bold text-purple-500">
                    {projects.filter(p => p.engineer).length}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </CollapsibleCard>

        {/* Create Project Form */}
        {showCreateForm && (
          <CollapsibleCard
            title="Create New Project"
            storageKey="artist-dashboard-create-form"
            className="mb-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20"
            badge={
              <Button 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
                size="sm"
              >
                Cancel
              </Button>
            }
          >
            <form onSubmit={createProject} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter project title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-background/50"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (Optional)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="Enter budget in USD"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your project, genre, goals, and any specific requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-32 bg-background/50"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={creating || !title.trim()}
                className="w-full md:w-auto bg-gradient-to-r from-primary to-primary/90"
              >
                {creating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Creating Project...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Create Project
                  </div>
                )}
              </Button>
            </form>
          </CollapsibleCard>
        )}

        {/* Projects List */}
        <CollapsibleCard
          title="Your Projects"
          storageKey="artist-dashboard-projects-list"
          contentClassName="space-y-6 pt-0"
        >
          
          {projects.length === 0 ? (
            <Card className="p-12 text-center">
              <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first project and start collaborating with professional engineers
              </p>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Your First Project
              </Button>
            </Card>
          ) : (
            <div className="grid gap-6">
              {projects.map((project) => (
                <Card 
                  key={project.id} 
                  className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-primary/50"
                  onClick={() => navigate(`/artist-crm`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold">{project.title}</h3>
                        <Badge className={`${getStatusColor(project.status)} text-white`}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                        {project.budget && (
                          <Badge variant="outline">${project.budget}</Badge>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground">{project.description}</p>
                      
                      <div className="flex items-center gap-6 text-sm">
                        {project.engineer ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              {project.engineer.avatar_url ? (
                                <img src={project.engineer.avatar_url} alt="" className="w-full h-full rounded-full" />
                              ) : (
                                <span className="text-xs">{project.engineer.full_name?.charAt(0)}</span>
                              )}
                            </div>
                            <span>Engineer: {project.engineer.full_name}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>Looking for engineer...</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <Upload className="w-4 h-4" />
                          <span>{project.audio_files?.[0]?.count || 0} files</span>
                        </div>
                        
                        <div className="text-muted-foreground">
                          Created {new Date(project.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" className="ml-4">
                      Manage
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CollapsibleCard>
      </div>
    </div>
  );
};

export default ArtistDashboard;
