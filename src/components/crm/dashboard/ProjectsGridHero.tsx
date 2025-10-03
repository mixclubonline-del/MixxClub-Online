import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Play, Clock, CheckCircle, AlertTriangle, Music, 
  User, Calendar, ArrowRight, Sparkles 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProjectsGridHeroProps {
  userRole: 'artist' | 'engineer';
}

export const ProjectsGridHero = ({ userRole }: ProjectsGridHeroProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      const column = userRole === 'artist' ? 'client_id' : 'engineer_id';
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          audio_files(count),
          client:profiles!projects_client_id_fkey(full_name, avatar_url),
          engineer:profiles!projects_engineer_id_fkey(full_name, avatar_url)
        `)
        .eq(column, user?.id)
        .in('status', ['pending', 'in_progress', 'revision'])
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { 
        icon: Clock, 
        color: 'text-yellow-500', 
        bg: 'bg-yellow-500/10',
        label: 'Pending' 
      },
      in_progress: { 
        icon: Play, 
        color: 'text-blue-500', 
        bg: 'bg-blue-500/10',
        label: 'In Progress' 
      },
      review: { 
        icon: AlertTriangle, 
        color: 'text-orange-500', 
        bg: 'bg-orange-500/10',
        label: 'Review' 
      },
      completed: { 
        icon: CheckCircle, 
        color: 'text-green-500', 
        bg: 'bg-green-500/10',
        label: 'Completed' 
      }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const getHealthScore = (project: any) => {
    let score = 100;
    const now = new Date();
    const deadline = new Date(project.deadline);
    const created = new Date(project.created_at);
    const daysUntilDeadline = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDeadline < 0) score -= 50;
    else if (daysUntilDeadline < 3) score -= 30;
    else if (daysUntilDeadline < 7) score -= 10;
    
    const daysSinceCreated = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceCreated > 14 && project.status === 'pending') score -= 20;
    
    return Math.max(0, Math.min(100, score));
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-24 bg-muted rounded" />
          </Card>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-2xl font-bold mb-2">No Active Projects</h3>
        <p className="text-muted-foreground mb-6">
          {userRole === 'artist' 
            ? 'Start a new project to begin creating music' 
            : 'Browse opportunities to find your next gig'}
        </p>
        <Button 
          size="lg" 
          onClick={() => navigate(userRole === 'artist' ? '/artist-crm?tab=opportunities' : '/engineer-crm?tab=opportunities')}
          className="gap-2"
        >
          <Sparkles className="w-5 h-5" />
          {userRole === 'artist' ? 'Find an Engineer' : 'Browse Jobs'}
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold">Active Projects</h2>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate(`/${userRole}-crm?tab=active-work`)}
          className="gap-2"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {projects.map((project, index) => {
          const statusConfig = getStatusConfig(project.status);
          const StatusIcon = statusConfig.icon;
          const healthScore = getHealthScore(project);
          const collaborator = userRole === 'artist' ? project.engineer : project.client;
          
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="p-6 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description || 'No description provided'}
                    </p>
                  </div>
                  <Badge className={statusConfig.bg}>
                    <StatusIcon className={`w-3 h-3 mr-1 ${statusConfig.color}`} />
                    {statusConfig.label}
                  </Badge>
                </div>

                {/* Collaborator */}
                {collaborator && (
                  <div className="flex items-center gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={collaborator.avatar_url} />
                      <AvatarFallback>
                        {collaborator.full_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {userRole === 'artist' ? 'Engineer: ' : 'Artist: '}
                        {collaborator.full_name || 'Not assigned'}
                      </p>
                    </div>
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}

                {/* Health Score */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Project Health</span>
                    <span className={`text-sm font-bold ${getHealthColor(healthScore)}`}>
                      {healthScore}%
                    </span>
                  </div>
                  <Progress value={healthScore} className="h-2" />
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Music className="w-4 h-4" />
                    <span>{project.audio_files?.[0]?.count || 0} files</span>
                  </div>
                  {project.deadline && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(project.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <Button 
                  className="w-full gap-2 group-hover:scale-105 transition-transform"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/project/${project.id}`);
                  }}
                >
                  <Play className="w-4 h-4" />
                  Continue Working
                </Button>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};