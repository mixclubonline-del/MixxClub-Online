import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Search } from 'lucide-react';
import { SessionQueueCard } from '@/components/engineer/SessionQueueCard';
import { SessionPrepModal } from '@/components/engineer/SessionPrepModal';
import { SessionInvitationsList } from '@/components/collaboration/SessionInvitationsList';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const EngineerCRMDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showPrepModal, setShowPrepModal] = useState(false);

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

  const handleStartSession = (project: any) => {
    setSelectedProject(project);
    setShowPrepModal(true);
  };

  const handleViewDetails = (project: any) => {
    navigate(`/engineer-crm?tab=active-work&project=${project.id}`);
  };

  const getProjectStatus = (project: any): 'new' | 'in_progress' | 'delivered' => {
    if (project.status === 'completed' || project.status === 'delivered') return 'delivered';
    if (project.status === 'in_progress' || project.session_packages?.length > 0) return 'in_progress';
    return 'new';
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
    <>
      <div className="space-y-6">
        {/* Session Invitations */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold">Session Invitations</h2>
          <SessionInvitationsList />
        </div>
        {newSessions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
              <h2 className="text-xl font-bold">New Sessions</h2>
              <span className="text-sm text-muted-foreground">({newSessions.length})</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {newSessions.map((project) => (
                <SessionQueueCard
                  key={project.id}
                  project={project}
                  aiAnalysis={project.ai_match_analysis?.[0]}
                  onViewDetails={() => handleViewDetails(project)}
                  onStartSession={() => handleStartSession(project)}
                  status="new"
                />
              ))}
            </div>
          </div>
        )}

        {inProgress.length > 0 && (
          <div id="in-progress-section" className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              <h2 className="text-xl font-bold">In Progress</h2>
              <span className="text-sm text-muted-foreground">({inProgress.length})</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {inProgress.map((project) => (
                <SessionQueueCard
                  key={project.id}
                  project={project}
                  onViewDetails={() => handleViewDetails(project)}
                  onStartSession={() => handleStartSession(project)}
                  status="in_progress"
                />
              ))}
            </div>
          </div>
        )}

        {awaitingReview.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
              <h2 className="text-xl font-bold">Delivered</h2>
              <span className="text-sm text-muted-foreground">({awaitingReview.length})</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {awaitingReview.map((project) => (
                <SessionQueueCard
                  key={project.id}
                  project={project}
                  onViewDetails={() => handleViewDetails(project)}
                  onStartSession={() => handleStartSession(project)}
                  status="delivered"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedProject && (
        <SessionPrepModal
          open={showPrepModal}
          onClose={() => {
            setShowPrepModal(false);
            setSelectedProject(null);
          }}
          onStartSession={() => {
            navigate(`/session/${selectedProject.id}`);
          }}
          project={selectedProject}
          aiAnalysis={selectedProject.ai_match_analysis?.[0]}
        />
      )}
    </>
  );
};