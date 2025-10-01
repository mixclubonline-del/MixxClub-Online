import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle } from 'lucide-react';
import { ProjectReviewDialog } from '@/components/review/ProjectReviewDialog';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface CompletedProjectCardProps {
  project: any;
}

export const CompletedProjectCard = ({ project }: CompletedProjectCardProps) => {
  const navigate = useNavigate();
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    checkReviewStatus();
  }, [project.id]);

  const checkReviewStatus = async () => {
    if (!project.engineer_id) return;

    const { data } = await supabase
      .from('project_reviews')
      .select('id')
      .eq('project_id', project.id)
      .maybeSingle();
    
    setHasReviewed(!!data);
  };

  const isCompleted = project.status === 'completed';

  return (
    <>
      <Card 
        className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => navigate(`/project/${project.id}`)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{project.title}</h3>
              {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
          </div>
          <Badge variant={isCompleted ? "default" : "outline"} className="ml-2">
            {project.status}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          {project.engineer ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                {project.engineer.full_name?.[0] || 'E'}
              </div>
              <span>{project.engineer.full_name}</span>
            </div>
          ) : (
            <span className="text-yellow-500">No engineer assigned</span>
          )}
          <span>•</span>
          <span>{project.audio_files?.[0]?.count || 0} files</span>
        </div>
        
        <div className="pt-4 border-t flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            Created {new Date(project.created_at).toLocaleDateString()}
          </span>
          
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            {isCompleted && project.engineer_id && (
              hasReviewed ? (
                <Badge variant="secondary" className="px-3 py-1">
                  <Star className="w-3 h-3 mr-1 fill-primary" />
                  Reviewed
                </Badge>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowReviewDialog(true)}
                >
                  <Star className="w-4 h-4 mr-1" />
                  Leave Review
                </Button>
              )
            )}
            <Button variant="ghost" size="sm">
              View Details
            </Button>
          </div>
        </div>
      </Card>

      {project.engineer_id && (
        <ProjectReviewDialog
          open={showReviewDialog}
          onOpenChange={setShowReviewDialog}
          projectId={project.id}
          engineerId={project.engineer_id}
          engineerName={project.engineer?.full_name}
          onReviewSubmitted={() => {
            setHasReviewed(true);
            checkReviewStatus();
          }}
        />
      )}
    </>
  );
};