import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Music, Clock, Calendar, Package, Upload, Eye } from 'lucide-react';
import { SessionPackageBuilder } from '@/components/engineer/SessionPackageBuilder';
import { EngineerDeliveryUpload } from '@/components/engineer/EngineerDeliveryUpload';
import { MixReviewInterface } from '@/components/artist';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description?: string;
    status: string;
    client_id: string;
    engineer_id?: string;
    progress_percentage?: number;
    estimated_completion_date?: string;
    time_tracked_minutes?: number;
    metadata?: any;
    audio_files?: any[];
    session_packages?: any[];
    engineer_deliverables?: any[];
    profiles?: {
      full_name: string;
      avatar_url?: string;
    };
  };
  onStartSession: (projectId: string) => void;
}

export const ProjectCard = ({ project, onStartSession }: ProjectCardProps) => {
  const { user } = useAuth();
  const [showPackageBuilder, setShowPackageBuilder] = useState(false);
  const [showDeliveryUpload, setShowDeliveryUpload] = useState(false);
  const [showMixReview, setShowMixReview] = useState(false);
  
  const isEngineer = project.engineer_id === user?.id;
  const isArtist = project.client_id === user?.id;
  const audioFileCount = project.audio_files?.[0]?.count || project.audio_files?.length || 0;
  const latestDeliverable = project.engineer_deliverables?.[0];
  const sessionPackage = project.session_packages?.[0];

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500',
      in_progress: 'bg-blue-500', 
      review: 'bg-purple-500',
      completed: 'bg-green-500'
    };
    return colors[status as keyof typeof colors] || 'bg-muted';
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">{project.title}</CardTitle>
              {project.profiles && (
                <p className="text-sm text-muted-foreground mb-2">
                  {isEngineer ? 'Artist' : 'Engineer'}: {project.profiles.full_name}
                </p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`${getStatusColor(project.status)} text-white`}>
                  {project.status.replace('_', ' ')}
                </Badge>
                {project.estimated_completion_date && (
                  <Badge variant="outline" className="gap-1">
                    <Calendar className="w-3 h-3" />
                    Due {format(new Date(project.estimated_completion_date), 'MMM d')}
                  </Badge>
                )}
                {project.time_tracked_minutes && project.time_tracked_minutes > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(project.time_tracked_minutes)}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {project.progress_percentage !== undefined && project.progress_percentage !== null && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{project.progress_percentage}%</span>
              </div>
              <Progress value={project.progress_percentage} />
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4 p-4 md:p-6 pt-0">
          {/* Engineer View - Session Preparation Status */}
          {isEngineer && (
            <div className="space-y-3">
              {!sessionPackage && (
                <div className="p-3 rounded-lg border border-success/20 bg-success/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <p className="font-semibold text-sm">New Session Ready</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {audioFileCount} stems uploaded • Ready to prepare for your DAW
                  </p>
                  <Button 
                    onClick={() => setShowPackageBuilder(true)}
                    size="sm"
                    className="w-full"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Prepare Session Package
                  </Button>
                </div>
              )}

              {sessionPackage && sessionPackage.package_status === 'ready' && (
                <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-sm">Session Package Ready</p>
                    <Badge variant="outline">Downloaded</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {sessionPackage.daw_format?.replace('_', ' ')} session • Ready to work
                  </p>
                  <Button 
                    onClick={() => setShowDeliveryUpload(true)}
                    size="sm"
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Completed Mix
                  </Button>
                </div>
              )}

              {latestDeliverable && (
                <div className="p-3 rounded-lg border border-accent/20 bg-accent/5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-sm">Mix Submitted</p>
                    <Badge>{latestDeliverable.delivery_type?.replace('_', ' ')}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    v{latestDeliverable.version_number} • Awaiting artist review
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Artist View - Mix Review */}
          {isArtist && latestDeliverable && (
            <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm">Mix Ready for Review</p>
                <Badge>{latestDeliverable.delivery_type?.replace('_', ' ')}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                v{latestDeliverable.version_number} • {latestDeliverable.engineer_notes?.slice(0, 60)}...
              </p>
              <Button 
                onClick={() => setShowMixReview(true)}
                size="sm"
                className="w-full"
              >
                <Eye className="w-4 h-4 mr-2" />
                Review Mix
              </Button>
            </div>
          )}

          {/* Artist View - Session Being Prepared */}
          {isArtist && !latestDeliverable && (
            <div className="p-3 rounded-lg border border-muted bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-muted-foreground animate-pulse" />
                <p className="font-semibold text-sm">
                  {sessionPackage?.package_status === 'ready' 
                    ? 'Engineer is working on your mix' 
                    : 'Preparing session for engineer'}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {audioFileCount} stems uploaded • AI analysis complete
              </p>
            </div>
          )}

          {/* File Count */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Music className="w-4 h-4" />
            <span>{audioFileCount} stems</span>
          </div>
        </CardContent>
      </Card>

      {/* Engineer Dialogs */}
      <Dialog open={showPackageBuilder} onOpenChange={setShowPackageBuilder}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prepare DAW Session Package</DialogTitle>
          </DialogHeader>
          <SessionPackageBuilder
            projectId={project.id}
            projectTitle={project.title}
            stemCount={audioFileCount}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showDeliveryUpload} onOpenChange={setShowDeliveryUpload}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Completed Mix</DialogTitle>
          </DialogHeader>
          <EngineerDeliveryUpload
            projectId={project.id}
            projectTitle={project.title}
            onUploadComplete={() => setShowDeliveryUpload(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Artist Dialog */}
      <Dialog open={showMixReview} onOpenChange={setShowMixReview}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Mix</DialogTitle>
          </DialogHeader>
          {latestDeliverable && (
            <MixReviewInterface
              deliverable={latestDeliverable}
              engineerName={project.profiles?.full_name || 'Engineer'}
              projectId={project.id}
              onStatusUpdate={() => setShowMixReview(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};