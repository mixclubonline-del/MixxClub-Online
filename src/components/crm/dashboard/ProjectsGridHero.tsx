import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Music, Sparkles, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EnhancedProjectCard } from '@/components/crm/EnhancedProjectCard';
import { Skeleton } from '@/components/ui/skeleton';

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
          audio_files(*),
          client:profiles!projects_client_id_fkey(full_name, avatar_url),
          engineer:profiles!projects_engineer_id_fkey(full_name, avatar_url)
        `)
        .eq(column, user?.id)
        .in('status', ['pending', 'in_progress', 'revision'])
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      
      // Transform data to match EnhancedProjectCard props
      const transformedProjects = (data || []).map(project => ({
        ...project,
        artist: userRole === 'artist' 
          ? user?.user_metadata?.full_name || 'You' 
          : project.client?.full_name,
        collaborators: [
          userRole === 'artist' ? project.engineer : project.client
        ].filter(Boolean).map(c => ({
          name: c.full_name,
          avatar: c.avatar_url
        })),
        ai_health_score: getHealthScore(project),
        ai_suggestions: generateAISuggestions(project),
        xp_earned: project.status === 'completed' ? 50 : undefined,
        streak_days: undefined // This could come from a separate calculation
      }));
      
      setProjects(transformedProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const getHealthScore = (project: any) => {
    let score = 100;
    const now = new Date();
    
    if (!project.deadline) return score;
    
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

  const generateAISuggestions = (project: any) => {
    const suggestions = [];
    const healthScore = getHealthScore(project);
    
    if (healthScore < 60) {
      suggestions.push('⚠️ Project at risk - deadline approaching');
    }
    if (!project.audio_files || project.audio_files.length === 0) {
      suggestions.push('📁 Upload audio files to get started');
    }
    if (project.status === 'pending' && project.audio_files?.length > 0) {
      suggestions.push('🚀 Ready to start mixing');
    }
    
    return suggestions;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="space-y-4">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-24 w-full" />
              </div>
            </Card>
          ))}
        </div>
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold">Active Projects</h2>
          <p className="text-muted-foreground mt-1">
            {projects.length} project{projects.length !== 1 ? 's' : ''} in progress
          </p>
        </div>
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => navigate(`/${userRole}-crm?tab=active-work`)}
          className="gap-2"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 pb-12">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <EnhancedProjectCard
              project={project}
              onStartSession={(projectId) => {
                navigate(`/project/${projectId}`);
              }}
              onClick={() => navigate(`/project/${project.id}`)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};