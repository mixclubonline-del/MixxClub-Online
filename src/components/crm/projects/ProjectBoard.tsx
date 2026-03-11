import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  GripVertical, 
  Clock, 
  CheckCircle2, 
  PlayCircle, 
  AlertCircle,
  Music,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjectsHub } from '@/hooks/useProjectsHub';
import { formatDistanceToNow } from 'date-fns';
import { GlassPanel } from '../design';
import { toast } from 'sonner';
import type { Project } from '@/hooks/useProjectsHub';

type ProjectStatus = 'planning' | 'in_progress' | 'review' | 'completed';

interface ProjectColumn {
  id: ProjectStatus;
  title: string;
  icon: React.ElementType;
  accentVar: string;
}

const columns: ProjectColumn[] = [
  { id: 'planning', title: 'Planning', icon: Clock, accentVar: 'rgba(156,163,175,0.35)' },
  { id: 'in_progress', title: 'In Progress', icon: PlayCircle, accentVar: 'rgba(99,102,241,0.35)' },
  { id: 'review', title: 'Review', icon: AlertCircle, accentVar: 'rgba(234,179,8,0.35)' },
  { id: 'completed', title: 'Completed', icon: CheckCircle2, accentVar: 'rgba(34,197,94,0.35)' },
];

interface ProjectCardProps {
  project: Project;
  onMove: (projectId: string, newStatus: ProjectStatus) => void;
  isUpdating: boolean;
}

const ProjectCard = ({ project, onMove, isUpdating }: ProjectCardProps) => {
  const getTypeIcon = (type: string | null) => {
    switch (type) {
      case 'single': return '🎵';
      case 'ep': return '💿';
      case 'album': return '📀';
      case 'remix': return '🔄';
      default: return '🎧';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group"
    >
      <Card className="bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-200 cursor-grab active:cursor-grabbing">
        <CardContent className="p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-lg">{getTypeIcon(project.project_type)}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {project.project_type || 'track'}
            </Badge>
          </div>
          
          <h4 className="font-medium text-sm line-clamp-2">{project.title}</h4>
          
          {project.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
            </div>
            {project.total_revenue && project.total_revenue > 0 && (
              <Badge variant="secondary" className="text-xs">
                ${project.total_revenue.toLocaleString()}
              </Badge>
            )}
          </div>

          {/* Quick status change buttons (visible on hover) */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {columns.map(col => (
              col.id !== project.status && (
                <Button
                  key={col.id}
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  disabled={isUpdating}
                  onClick={() => onMove(project.id, col.id)}
                >
                  <col.icon className="w-3 h-3 mr-1" />
                  {col.title}
                </Button>
              )
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface ProjectBoardProps {
  onCreateProject?: () => void;
}

export const ProjectBoard = ({ onCreateProject }: ProjectBoardProps) => {
  const { projects, isLoading, updateStatus, isUpdating } = useProjectsHub();

  const handleMoveProject = async (projectId: string, newStatus: ProjectStatus) => {
    try {
      await updateStatus(projectId, newStatus);
    } catch {
      toast.error('Failed to move project');
    }
  };

  const getProjectsByStatus = (status: ProjectStatus) => 
    projects.filter(p => p.status === status);

  if (isLoading && projects.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map(col => (
          <GlassPanel key={col.id} accent={col.accentVar}>
            <div className="animate-pulse space-y-3">
              <div className="h-5 bg-muted rounded w-24" />
              {[1, 2].map(i => (
                <div key={i} className="h-24 bg-muted/50 rounded" />
              ))}
            </div>
          </GlassPanel>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Project Board</h3>
          <Badge variant="outline">{projects.length} projects</Badge>
        </div>
        {onCreateProject && (
          <Button onClick={onCreateProject} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map(column => {
          const columnProjects = getProjectsByStatus(column.id);
          const Icon = column.icon;
          
          return (
            <GlassPanel key={column.id} accent={column.accentVar} glow>
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{column.title}</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {columnProjects.length}
                </Badge>
              </div>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2 pr-2">
                  <AnimatePresence mode="popLayout">
                    {columnProjects.map(project => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onMove={handleMoveProject}
                        isUpdating={isUpdating}
                      />
                    ))}
                  </AnimatePresence>
                  
                  {columnProjects.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No projects in {column.title.toLowerCase()}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </GlassPanel>
          );
        })}
      </div>
    </div>
  );
};
