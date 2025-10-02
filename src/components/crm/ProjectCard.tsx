import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Music, Upload, Users, Download, Calendar, Clock } from 'lucide-react';
import { AudioFileUpload } from './AudioFileUpload';
import { BeforeAfterPlayer } from './BeforeAfterPlayer';
import { format } from 'date-fns';

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    status: string;
    progress_percentage?: number;
    estimated_completion_date?: string;
    time_tracked_minutes?: number;
    metadata?: any;
    audio_files?: any[];
    engineer?: {
      full_name: string;
      avatar_url?: string;
    };
  };
  onStartSession: (projectId: string) => void;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

export const ProjectCard = ({ project, onStartSession, selected, onSelect }: ProjectCardProps) => {
  const [autoBounce, setAutoBounce] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500',
      in_progress: 'bg-blue-500', 
      review: 'bg-purple-500',
      completed: 'bg-green-500'
    };
    return colors[status as keyof typeof colors] || 'bg-muted';
  };

  const handleFilesUploaded = (files: string[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const aiPrep = project.metadata?.aiPrep || 'No AI preparation yet';
  const fortePrepared = project.metadata?.fortePrepared || false;
  const artist = project.metadata?.artist || 'Unknown Artist';

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow ${onSelect ? 'cursor-pointer' : ''}`}>
      <CardHeader className="p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {onSelect && (
              <Checkbox
                checked={selected}
                onCheckedChange={() => onSelect(project.id)}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">{project.title}</CardTitle>
              <p className="text-muted-foreground mb-1">Artist: {artist}</p>
              <p className="text-muted-foreground mb-2">{project.description}</p>
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
        <div className="p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
          <p className="text-primary font-medium whitespace-pre-line">{aiPrep}</p>
        </div>

        <AudioFileUpload 
          projectId={project.id} 
          onFilesUploaded={handleFilesUploaded}
        />

        <div className="flex items-center space-x-2">
          <Checkbox
            id={`autoBounce-${project.id}`}
            checked={autoBounce}
            onCheckedChange={(checked) => setAutoBounce(checked === true)}
          />
          <Label htmlFor={`autoBounce-${project.id}`}>Auto-bounce stems via Forte</Label>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <BeforeAfterPlayer
                key={`${project.id}-${index}`}
                title={file}
                beforeSrc={`/audio/raw/${file}`}
                afterSrc={`/audio/processed/${file}`}
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-4">
          {project.engineer && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                {project.engineer.avatar_url ? (
                  <img 
                    src={project.engineer.avatar_url} 
                    alt="" 
                    className="w-full h-full rounded-full" 
                  />
                ) : (
                  <span className="text-xs">{project.engineer.full_name?.charAt(0)}</span>
                )}
              </div>
              <span>Engineer: {project.engineer.full_name}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1 text-sm">
            <Music className="w-4 h-4" />
            <span>{project.audio_files?.length || uploadedFiles.length} files</span>
          </div>
        </div>

        <Button 
          onClick={() => onStartSession(project.id)}
          className="w-full gap-2"
        >
          <Users className="w-4 h-4" />
          Start Session
        </Button>

        {fortePrepared && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">DAW Downloads:</h4>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="w-3 h-3" />
                Pro Tools
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="w-3 h-3" />
                Logic
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="w-3 h-3" />
                Studio One
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};