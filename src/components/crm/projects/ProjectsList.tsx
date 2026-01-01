import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Music, 
  Calendar, 
  DollarSign, 
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  PlayCircle
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Project {
  id: string;
  title: string;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  deadline?: string | null;
  created_at: string;
  total_revenue?: number | null;
  progress_percentage?: number | null;
  project_type?: string | null;
}

interface ProjectsListProps {
  projects: Project[];
  loading: boolean;
  onProjectClick: (projectId: string) => void;
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  planning: { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted' },
  in_progress: { icon: PlayCircle, color: 'text-primary', bg: 'bg-primary/10' },
  review: { icon: AlertCircle, color: 'text-warning', bg: 'bg-warning/10' },
  completed: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
};

const priorityConfig: Record<string, { color: string; bg: string }> = {
  urgent: { color: 'text-destructive', bg: 'bg-destructive/10' },
  high: { color: 'text-orange-500', bg: 'bg-orange-500/10' },
  medium: { color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  low: { color: 'text-green-500', bg: 'bg-green-500/10' },
};

export const ProjectsList = ({ projects, loading, onProjectClick }: ProjectsListProps) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-muted rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
              <div className="h-6 w-20 bg-muted rounded" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No projects found</h3>
        <p className="text-muted-foreground">
          Create your first project to get started
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {projects.map((project, index) => {
        const status = statusConfig[project.status || 'planning'];
        const StatusIcon = status.icon;
        const priority = priorityConfig[project.priority || 'medium'];

        return (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card 
              className="p-4 hover:border-primary/30 transition-colors cursor-pointer"
              onClick={() => onProjectClick(project.id)}
            >
              <div className="flex items-center gap-4">
                {/* Project Icon */}
                <div className={`w-12 h-12 rounded-lg ${status.bg} flex items-center justify-center`}>
                  <StatusIcon className={`w-6 h-6 ${status.color}`} />
                </div>

                {/* Project Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{project.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {project.project_type || 'track'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {project.description || 'No description'}
                  </p>
                </div>

                {/* Priority Badge */}
                <Badge className={`${priority.bg} ${priority.color} border-0 hidden sm:flex`}>
                  {project.priority || 'medium'}
                </Badge>

                {/* Progress */}
                <div className="hidden md:flex items-center gap-2 w-24">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${project.progress_percentage || 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8">
                    {project.progress_percentage || 0}%
                  </span>
                </div>

                {/* Deadline */}
                <div className="hidden lg:flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {project.deadline 
                    ? format(new Date(project.deadline), 'MMM d')
                    : 'No deadline'
                  }
                </div>

                {/* Revenue */}
                {project.total_revenue && project.total_revenue > 0 && (
                  <div className="hidden xl:flex items-center gap-1 text-sm font-medium text-success">
                    <DollarSign className="w-4 h-4" />
                    {project.total_revenue.toLocaleString()}
                  </div>
                )}

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onProjectClick(project.id);
                    }}>
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                      Edit Project
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                      Add Milestone
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Mobile: Show additional info */}
              <div className="flex items-center gap-4 mt-3 sm:hidden">
                <Badge className={`${priority.bg} ${priority.color} border-0`}>
                  {project.priority || 'medium'}
                </Badge>
                <div className="flex items-center gap-2 flex-1">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${project.progress_percentage || 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {project.progress_percentage || 0}%
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
