import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Search } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const EngineerCRMDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          audio_files(count),
          profiles:client_id(full_name, avatar_url),
          session_packages(id, package_status, daw_format, expires_at),
          engineer_deliverables(id, version_number, delivery_type, status)
        `)
        .eq('engineer_id', user.id)
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

  const handleStartSession = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    toast.success(`Opening ${project?.title}`);
  };

  // Categorize projects
  const newSessions = projects.filter(p => 
    p.status === 'pending' && (!p.session_packages || p.session_packages.length === 0)
  );
  const inProgress = projects.filter(p => 
    p.status === 'in_progress' || (p.status === 'pending' && p.session_packages?.length > 0)
  );
  const awaitingReview = projects.filter(p => 
    p.status === 'review' || p.engineer_deliverables?.length > 0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your sessions...</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No Active Sessions</h3>
        <p className="text-muted-foreground mb-6">
          Check the Opportunities tab to find new mixing projects
        </p>
        <Button onClick={() => navigate('/engineer-crm?tab=opportunities')}>
          <Search className="w-4 h-4 mr-2" />
          Browse Opportunities
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {newSessions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
            <h2 className="text-xl font-bold">New Sessions</h2>
            <span className="text-sm text-muted-foreground">({newSessions.length})</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {newSessions.map((project) => (
              <ProjectCard key={project.id} project={project} onStartSession={handleStartSession} />
            ))}
          </div>
        </div>
      )}

      {inProgress.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            <h2 className="text-xl font-bold">In Progress</h2>
            <span className="text-sm text-muted-foreground">({inProgress.length})</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {inProgress.map((project) => (
              <ProjectCard key={project.id} project={project} onStartSession={handleStartSession} />
            ))}
          </div>
        </div>
      )}

      {awaitingReview.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
            <h2 className="text-xl font-bold">Awaiting Artist Review</h2>
            <span className="text-sm text-muted-foreground">({awaitingReview.length})</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {awaitingReview.map((project) => (
              <ProjectCard key={project.id} project={project} onStartSession={handleStartSession} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};