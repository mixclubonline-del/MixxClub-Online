import { motion, useAnimation } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Music, Users, PlayCircle, Share2, PauseCircle,
  History, Download, Eye, Keyboard, Sparkles, Zap
} from 'lucide-react';
import { useProjectPresence } from '@/hooks/useProjectPresence';
import { useAudioWaveform } from '@/hooks/useAudioWaveform';
import { useRealtimeProject } from '@/hooks/useRealtimeProject';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useState, useEffect, useRef } from 'react';

interface EnhancedProjectCardProps {
  project: {
    id: string;
    title: string;
    artist?: string;
    status: string;
    progress_percentage?: number;
    thumbnail?: string;
    xp_earned?: number;
    achievements?: string[];
    streak_days?: number;
    collaborators?: any[];
    ai_health_score?: number;
    ai_suggestions?: string[];
    audio_files?: any[];
  };
  onStartSession?: (projectId: string) => void;
  onClick?: () => void;
}

export const EnhancedProjectCard = ({ project, onStartSession, onClick }: EnhancedProjectCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  
  const { user } = useAuth();
  const { onlineUsers } = useProjectPresence(project.id, user?.id);
  const { waveformData, isPlaying, progress, play, pause } = useAudioWaveform(
    project.audio_files?.[0]?.id
  );

  // Real-time project updates
  useRealtimeProject(project.id, (update) => {
    if (update.type === 'fileUploaded') {
      toast.success('New file uploaded', {
        description: `${update.data?.file_name || 'File'} added to project`
      });
      controls.start({
        scale: [1, 1.02, 1],
        transition: { duration: 0.3 }
      });
    } else if (update.type === 'commentAdded') {
      toast.info('New comment', {
        description: update.data?.comment_text || 'Someone commented on the project'
      });
    }
  });

  // Fetch versions when showing
  useEffect(() => {
    if (showVersions && versions.length === 0) {
      const fetchVersions = async () => {
        const { data } = await supabase
          .from('project_versions')
          .select('*')
          .eq('project_id', project.id)
          .order('version_number', { ascending: false })
          .limit(3);
        
        if (data) setVersions(data);
      };
      fetchVersions();
    }
  }, [showVersions, project.id, versions.length]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isFocused) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        handleAudioPreview();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleShare();
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        handleExport();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onStartSession?.(project.id);
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setShowVersions(!showVersions);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFocused, isPlaying, showVersions, project.id, onStartSession]);

  const handleAudioPreview = () => {
    const audioFile = project.audio_files?.[0];
    if (!audioFile) {
      toast.error('No audio file available');
      return;
    }

    if (isPlaying) {
      pause();
    } else {
      play(audioFile.file_path);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + '/project/' + project.id);
    toast.success('Project link copied to clipboard');
  };

  const handleExport = () => {
    toast.info('Export feature coming soon');
  };

  // Touch gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const deltaX = e.changedTouches[0].clientX - touchStart.x;
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStart.y);

    if (Math.abs(deltaX) > 100 && deltaY < 50) {
      if (deltaX > 0) {
        handleShare();
      } else {
        toast.info('Archive feature coming soon');
      }
    }

    setTouchStart(null);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed": return "from-green-500 to-emerald-500";
      case "in_progress": return "from-blue-500 to-cyan-500";
      case "review": return "from-purple-500 to-pink-500";
      case "pending": return "from-orange-500 to-yellow-500";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const getStatusStage = (status: string) => {
    const stages = ["Upload", "Processing", "Review", "Approved", "Released"];
    const currentIndex = {
      "pending": 0,
      "in_progress": 1,
      "review": 2,
      "completed": 3,
      "released": 4
    }[status?.toLowerCase()] || 0;
    return { stages, currentIndex };
  };

  const { stages, currentIndex } = getStatusStage(project.status);
  const healthColor = (project.ai_health_score || 0) >= 80 ? "text-green-500" : 
                      (project.ai_health_score || 0) >= 60 ? "text-yellow-500" : "text-red-500";

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={onClick}
      tabIndex={0}
      className="focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
    >
      <Card className="relative overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group">
        {/* Gradient Background Effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getStatusColor(project.status)} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

        {/* Online Presence Indicator */}
        {onlineUsers.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-4 left-4 flex items-center gap-2 z-10 backdrop-blur-sm bg-background/80 rounded-full px-3 py-1"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-2 h-2 bg-green-500 rounded-full"
            />
            <span className="text-xs font-medium">
              {onlineUsers.length} {onlineUsers.length === 1 ? 'person' : 'people'} working
            </span>
          </motion.div>
        )}

        {/* Keyboard Shortcuts Hint */}
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 right-4 flex gap-1 z-10 backdrop-blur-sm bg-background/90 rounded-lg px-2 py-1 text-xs"
          >
            <kbd className="px-1 bg-muted rounded"><Keyboard className="w-3 h-3 inline" /></kbd>
            <span className="hidden md:inline">P=Play S=Share E=Export H=History</span>
          </motion.div>
        )}

        {/* Album Art / Thumbnail */}
        <div className="relative h-64 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
          {project.thumbnail ? (
            <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="w-20 h-20 text-muted-foreground/30" />
            </div>
          )}

          {/* Quick Action Buttons - Visible on Hover */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHovered || isFocused ? 1 : 0, y: isHovered || isFocused ? 0 : 10 }}
            className="absolute bottom-4 right-4 flex gap-2 z-10"
          >
            <Button
              size="sm"
              variant="secondary"
              className="backdrop-blur-sm bg-background/80 hover:scale-110 transition-transform"
              onClick={(e) => {
                e.stopPropagation();
                handleAudioPreview();
              }}
            >
              {isPlaying ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="backdrop-blur-sm bg-background/80 hover:scale-110 transition-transform"
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="backdrop-blur-sm bg-background/80 hover:scale-110 transition-transform"
              onClick={(e) => {
                e.stopPropagation();
                setShowVersions(!showVersions);
              }}
            >
              <History className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="backdrop-blur-sm bg-background/80 hover:scale-110 transition-transform"
              onClick={(e) => {
                e.stopPropagation();
                handleExport();
              }}
            >
              <Download className="w-4 h-4" />
            </Button>
          </motion.div>

          {/* XP Badge */}
          {project.xp_earned && (
            <Badge className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 animate-pulse">
              <Zap className="w-3 h-3 mr-1" />
              +{project.xp_earned} XP
            </Badge>
          )}

          {/* Streak Badge */}
          {project.streak_days && project.streak_days > 0 && (
            <Badge className="absolute top-14 left-4 bg-gradient-to-r from-orange-500 to-red-500">
              🔥 {project.streak_days}d
            </Badge>
          )}
        </div>

        <div className="p-8 space-y-5">
          {/* Title & Artist */}
          <div>
            <h3 className="font-bold text-xl mb-2 line-clamp-1">{project.title}</h3>
            {project.artist && (
              <p className="text-base text-muted-foreground">{project.artist}</p>
            )}
          </div>

          {/* Audio Waveform Visualizer */}
          <motion.div
            animate={{ opacity: isHovered ? 1 : 0.7 }}
            className="h-16 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-lg flex items-center px-4 relative overflow-hidden"
          >
            {waveformData?.peaks && waveformData.peaks.length > 0 ? (
              <div className="flex items-center justify-between w-full h-full gap-1">
                {Array.from(waveformData.peaks).map((value, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ 
                      height: `${value * 100}%`,
                      opacity: isPlaying && (i / waveformData.peaks.length) * 100 < progress ? 1 : 0.5
                    }}
                    transition={{ delay: i * 0.01 }}
                    className="bg-primary rounded-full flex-1"
                    style={{ 
                      minWidth: '2px',
                      backgroundColor: isPlaying && (i / waveformData.peaks.length) * 100 < progress 
                        ? 'hsl(var(--primary))' 
                        : 'hsl(var(--primary) / 0.5)'
                    }}
                  />
                ))}
              </div>
            ) : (
              <>
                <motion.div
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                />
                <Music className="w-8 h-8 text-primary/50 mx-auto" />
              </>
            )}
          </motion.div>

          {/* Status Pipeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="font-medium">Progress</span>
              <span className="font-bold">{project.progress_percentage || 0}%</span>
            </div>
            <div className="flex gap-2">
              {stages.map((stage, index) => (
                <motion.div
                  key={stage}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex-1 h-3 rounded-full transition-all duration-500 ${
                    index <= currentIndex 
                      ? `bg-gradient-to-r ${getStatusColor(project.status)}` 
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs">
              {stages.map((stage, index) => (
                <span 
                  key={stage}
                  className={index <= currentIndex ? "text-primary font-medium" : "text-muted-foreground"}
                >
                  {stage}
                </span>
              ))}
            </div>
          </div>

          {/* Collaboration Indicators */}
          {project.collaborators && project.collaborators.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {project.collaborators.slice(0, 3).map((collab: any, index: number) => (
                  <Avatar key={index} className="w-8 h-8 border-2 border-background">
                    <AvatarImage src={collab.avatar} />
                    <AvatarFallback>{collab.name?.[0] || "?"}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{project.collaborators.length} working</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-2" />
              </div>
            </div>
          )}

          {/* AI Insights Panel */}
          {project.ai_health_score !== undefined && (
            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">AI Analysis</span>
                </div>
                <span className={`text-sm font-bold ${healthColor}`}>
                  {project.ai_health_score}%
                </span>
              </div>
              {project.ai_suggestions && project.ai_suggestions.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {project.ai_suggestions[0]}
                </p>
              )}
            </div>
          )}

          {/* Achievements */}
          {project.achievements && project.achievements.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {project.achievements.slice(0, 3).map((achievement: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {achievement}
                </Badge>
              ))}
            </div>
          )}

          {/* Version History Quick View */}
          {showVersions && versions.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 space-y-2"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <History className="w-4 h-4" />
                Version History
              </div>
              {versions.map((version) => (
                <motion.div
                  key={version.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.info(`Version ${version.version_number} preview coming soon`);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">v{version.version_number}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(version.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <Eye className="w-4 h-4 text-muted-foreground" />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Floating Action Button */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute -bottom-6 right-6"
          >
            <Button
              size="lg"
              className="rounded-full shadow-xl hover:shadow-2xl transition-shadow"
              onClick={(e) => {
                e.stopPropagation();
                onStartSession?.(project.id);
              }}
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              Start Session
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};
