import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

import { SharedProjectWorkspace } from '@/components/collaboration/SharedProjectWorkspace';
import { ServiceRecommendations } from '@/components/crm/ServiceRecommendations';
import { EngineerReferralSystem } from '@/components/crm/EngineerReferralSystem';
import { TrackEvolutionTimeline } from '@/components/crm/TrackEvolutionTimeline';
import { MusicalCompatibilityScore } from '@/components/crm/MusicalCompatibilityScore';
import { ProjectReviewDialog } from '@/components/review/ProjectReviewDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (projectId) {
      fetchProject();
    }
  }, [user, projectId]);

  const fetchProject = async () => {
    if (!projectId) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          client:profiles!projects_client_id_fkey(id, full_name),
          engineer:profiles!projects_engineer_id_fkey(id, full_name),
          job_postings(service_type, genre)
        `)
        .eq('id', projectId)
        .single();

      if (error) throw error;
      setProject(data);

      // Check if artist has already reviewed this project
      if (user?.id === data.client_id && data.engineer_id) {
        const { data: reviewData } = await supabase
          .from('project_reviews')
          .select('id')
          .eq('project_id', projectId)
          .eq('artist_id', user.id)
          .maybeSingle();
        
        setHasReviewed(!!reviewData);
      }
    } catch (error: any) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 md:px-6 py-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading project workspace...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 md:px-6 py-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
            <p className="text-muted-foreground mb-6">
              This project doesn't exist or you don't have access to it
            </p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isArtist = user?.id === project.client_id;
  const isEngineer = user?.id === project.engineer_id;

  return (
    <div className="min-h-screen bg-background">
      
      <div className="container px-4 md:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          {/* Review Button for completed projects */}
          {isArtist && project.status === 'completed' && project.engineer_id && (
            <div className="flex items-center gap-3">
              {hasReviewed ? (
                <Badge variant="secondary" className="px-4 py-2">
                  <Star className="w-4 h-4 mr-1 fill-primary" />
                  Review Submitted
                </Badge>
              ) : (
                <Button onClick={() => setShowReviewDialog(true)}>
                  <Star className="w-4 h-4 mr-2" />
                  Rate Engineer
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Main Workspace */}
        <div className="mb-8">
          <SharedProjectWorkspace projectId={projectId!} />
        </div>

        {/* Additional Features */}
        <Tabs defaultValue="evolution" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="evolution">Evolution</TabsTrigger>
            <TabsTrigger value="compatibility">Match</TabsTrigger>
            <TabsTrigger value="recommendations">Next Steps</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="evolution">
            <TrackEvolutionTimeline projectId={projectId!} />
          </TabsContent>

          <TabsContent value="compatibility">
            {project.client_id && project.engineer_id && (
              <MusicalCompatibilityScore
                artistId={project.client_id}
                engineerId={project.engineer_id}
                projectId={projectId}
              />
            )}
          </TabsContent>

          <TabsContent value="recommendations">
            {isArtist && project.job_postings?.[0] && (
              <ServiceRecommendations
                projectId={projectId!}
                currentService={project.job_postings[0].service_type}
                genre={project.job_postings[0].genre}
              />
            )}
          </TabsContent>

          <TabsContent value="team">
            {isEngineer && (
              <EngineerReferralSystem
                projectId={projectId!}
                currentEngineer={{
                  id: project.engineer_id,
                  name: project.engineer.full_name
                }}
              />
            )}
          </TabsContent>
        </Tabs>

        {/* Review Dialog */}
        {project.engineer_id && (
          <ProjectReviewDialog
            open={showReviewDialog}
            onOpenChange={setShowReviewDialog}
            projectId={projectId!}
            engineerId={project.engineer_id}
            engineerName={project.engineer?.full_name}
            onReviewSubmitted={() => {
              setHasReviewed(true);
              fetchProject();
              toast.success('Thank you for your review!');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;