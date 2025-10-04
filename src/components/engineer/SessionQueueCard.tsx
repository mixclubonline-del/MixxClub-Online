import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Music, Sparkles, User, Play } from 'lucide-react';
import { motion } from 'framer-motion';

interface SessionQueueCardProps {
  project: any;
  aiAnalysis?: any;
  onViewDetails: () => void;
  onStartSession: () => void;
  status: 'new' | 'in_progress' | 'delivered';
}

export const SessionQueueCard = ({
  project,
  aiAnalysis,
  onViewDetails,
  onStartSession,
  status,
}: SessionQueueCardProps) => {
  const statusConfig = {
    new: {
      badge: 'New',
      badgeVariant: 'default' as const,
      action: 'Start Session',
      icon: Play,
    },
    in_progress: {
      badge: 'In Progress',
      badgeVariant: 'secondary' as const,
      action: 'Continue',
      icon: Music,
    },
    delivered: {
      badge: 'Delivered',
      badgeVariant: 'outline' as const,
      action: 'View Project',
      icon: Music,
    },
  };

  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="relative overflow-hidden group hover:shadow-elegant transition-all duration-300">
        {status === 'new' && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}

        <div className="p-6 relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold">{project.title || 'Untitled Project'}</h3>
                <Badge variant={config.badgeVariant}>{config.badge}</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{project.client?.full_name || 'Artist'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Analysis Preview (if available) */}
          {aiAnalysis && status === 'new' && (
            <div className="mb-4 p-3 bg-primary/10 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">AI Session Prep</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                {aiAnalysis.detected_genre && (
                  <div>
                    <div className="text-muted-foreground">Genre</div>
                    <div className="font-semibold">{aiAnalysis.detected_genre}</div>
                  </div>
                )}
                {aiAnalysis.key_signature && (
                  <div>
                    <div className="text-muted-foreground">Key</div>
                    <div className="font-semibold">{aiAnalysis.key_signature}</div>
                  </div>
                )}
                {aiAnalysis.tempo_bpm && (
                  <div>
                    <div className="text-muted-foreground">Tempo</div>
                    <div className="font-semibold">{aiAnalysis.tempo_bpm} BPM</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Track Info */}
          <div className="flex items-center justify-between text-sm mb-4">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {project.audio_files?.length || 0} audio file(s)
              </span>
            </div>
            {project.package_type && (
              <Badge variant="outline" className="text-xs">
                {project.package_type}
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={onStartSession} className="flex-1 gap-2">
              <config.icon className="w-4 h-4" />
              {config.action}
            </Button>
            <Button onClick={onViewDetails} variant="outline">
              Details
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
