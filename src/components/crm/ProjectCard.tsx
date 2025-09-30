import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Music, Upload, Users, Download } from 'lucide-react';
import { AudioFileUpload } from './AudioFileUpload';
import { BeforeAfterPlayer } from './BeforeAfterPlayer';

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    status: string;
    metadata?: any;
    audio_files?: any[];
    engineer?: {
      full_name: string;
      avatar_url?: string;
    };
  };
  onStartSession: (projectId: string) => void;
}

export const ProjectCard = ({ project, onStartSession }: ProjectCardProps) => {
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

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{project.title}</CardTitle>
            <p className="text-muted-foreground mb-1">Artist: {artist}</p>
            <p className="text-muted-foreground mb-2">{project.description}</p>
            <Badge className={`${getStatusColor(project.status)} text-white`}>
              {project.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
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