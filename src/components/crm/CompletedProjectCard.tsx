import { useState } from 'react';
import { useFlowNavigation } from '@/core/fabric/useFlow';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle, Calendar, Sparkles } from 'lucide-react';
import { ProjectReviewDialog } from '@/components/review/ProjectReviewDialog';
import PremiereScheduler from '@/components/premieres/PremiereScheduler';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface CompletedProjectCardProps {
  project: any;
}

export const CompletedProjectCard = ({ project }: CompletedProjectCardProps) => {
  const { viewProject } = useFlowNavigation();
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showPremiereScheduler, setShowPremiereScheduler] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [hasPremiere, setHasPremiere] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>('');

  useEffect(() => {
    checkReviewStatus();
    checkPremiereStatus();
    fetchAudioUrl();
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

  const checkPremiereStatus = async () => {
    const { data } = await supabase
      .from('premieres')
      .select('id')
      .eq('project_id', project.id)
      .maybeSingle();
    
    setHasPremiere(!!data);
  };

  const fetchAudioUrl = async () => {
    // Get the latest deliverable or audio file for the project
    const { data: deliverable } = await supabase
      .from('engineer_deliverables')
      .select('file_path')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (deliverable?.file_path) {
      setAudioUrl(deliverable.file_path);
    } else {
      // Fallback to audio_files if no deliverable
      const { data: audioFile } = await supabase
        .from('audio_files')
        .select('file_path')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (audioFile?.file_path) {
        setAudioUrl(audioFile.file_path);
      }
    }
  };

  const isCompleted = project.status === 'completed';

  return (
    <>
      <Card 
        className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => viewProject(project.id)}
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
            
            {isCompleted && audioUrl && (
              hasPremiere ? (
                <Badge variant="secondary" className="px-3 py-1 bg-gradient-to-r from-accent to-accent-blue">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Premiered
                </Badge>
              ) : (
                <Button 
                  variant="default" 
                  size="sm"
                  className="bg-gradient-to-r from-accent to-accent-blue"
                  onClick={() => setShowPremiereScheduler(true)}
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  Schedule Premiere
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

      {audioUrl && (
        <PremiereScheduler
          projectId={project.id}
          audioUrl={audioUrl}
          open={showPremiereScheduler}
          onClose={() => setShowPremiereScheduler(false)}
          onSuccess={() => {
            setHasPremiere(true);
            checkPremiereStatus();
          }}
        />
      )}
    </>
  );
};