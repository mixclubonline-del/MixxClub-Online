import { useState, useEffect } from 'react';
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
import { usePartnershipEarnings } from '@/hooks/usePartnershipEarnings';
import { formatDistanceToNow } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type DbCollaborativeProject = Database['public']['Tables']['collaborative_projects']['Row'];

type ProjectStatus = 'planning' | 'in_progress' | 'review' | 'completed' | 'released';

interface ProjectColumn {
  id: ProjectStatus;
  title: string;
  icon: React.ElementType;
  color: string;
}

const columns: ProjectColumn[] = [
  { id: 'planning', title: 'Planning', icon: Clock, color: 'bg-muted' },
  { id: 'in_progress', title: 'In Progress', icon: PlayCircle, color: 'bg-primary/20' },
  { id: 'review', title: 'Review', icon: AlertCircle, color: 'bg-warning/20' },
  { id: 'completed', title: 'Completed', icon: CheckCircle2, color: 'bg-success/20' },
];

interface ProjectCardProps {
  project: DbCollaborativeProject;
  onMove: (projectId: string, newStatus: ProjectStatus) => void;
}

const ProjectCard = ({ project, onMove }: ProjectCardProps) => {
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
  const { projects, loading, fetchProjects } = usePartnershipEarnings();
  const [localProjects, setLocalProjects] = useState<DbCollaborativeProject[]>([]);

  useEffect(() => {
    setLocalProjects(projects);
  }, [projects]);

  const handleMoveProject = async (projectId: string, newStatus: ProjectStatus) => {
    // Optimistic update
    setLocalProjects(prev => 
      prev.map(p => p.id === projectId ? { ...p, status: newStatus } : p)
    );

    // TODO: Implement actual status update via Supabase
    // For now, just refresh after a delay to simulate
    setTimeout(() => {
      fetchProjects();
    }, 500);
  };

  const getProjectsByStatus = (status: ProjectStatus) => 
    localProjects.filter(p => p.status === status);

  if (loading && localProjects.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map(col => (
          <Card key={col.id} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-5 bg-muted rounded w-24" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-24 bg-muted rounded" />
              ))}
            </CardContent>
          </Card>
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
          <Badge variant="outline">{localProjects.length} projects</Badge>
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
            <Card key={column.id} className={`${column.color} border-none`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {column.title}
                  <Badge variant="secondary" className="ml-auto">
                    {columnProjects.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2 pr-2">
                    <AnimatePresence mode="popLayout">
                      {columnProjects.map(project => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          onMove={handleMoveProject}
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
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
