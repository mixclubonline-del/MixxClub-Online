import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  Calendar, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  Music
} from 'lucide-react';
import { format, differenceInDays, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

interface Project {
  id: string;
  title: string;
  status?: string | null;
  deadline?: string | null;
  created_at: string;
  priority?: string | null;
}

interface ProjectTimelineProps {
  projects: Project[];
  loading: boolean;
}

const priorityColors: Record<string, string> = {
  urgent: 'bg-destructive',
  high: 'bg-orange-500',
  medium: 'bg-primary',
  low: 'bg-green-500',
};

export const ProjectTimeline = ({ projects, loading }: ProjectTimelineProps) => {
  const today = new Date();
  
  const timelineData = useMemo(() => {
    const start = startOfMonth(today);
    const end = endOfMonth(addDays(today, 60)); // Show 2 months ahead
    const days = eachDayOfInterval({ start, end });
    
    return {
      days,
      projectsWithDeadlines: projects.filter(p => p.deadline).map(p => ({
        ...p,
        deadlineDate: parseISO(p.deadline!),
        daysUntil: differenceInDays(parseISO(p.deadline!), today),
      })),
    };
  }, [projects, today]);

  const upcomingDeadlines = timelineData.projectsWithDeadlines
    .filter(p => p.daysUntil >= 0 && p.daysUntil <= 7)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const overdueProjects = timelineData.projectsWithDeadlines
    .filter(p => p.daysUntil < 0 && p.status !== 'completed');

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse">
          <CardContent className="h-[300px] bg-muted rounded" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alerts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Overdue Projects */}
        <Card className={overdueProjects.length > 0 ? 'border-destructive/50' : ''}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className={`w-4 h-4 ${overdueProjects.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
              Overdue Projects
              {overdueProjects.length > 0 && (
                <Badge variant="destructive">{overdueProjects.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overdueProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No overdue projects</p>
            ) : (
              <div className="space-y-2">
                {overdueProjects.slice(0, 3).map(project => (
                  <div key={project.id} className="flex items-center justify-between p-2 bg-destructive/10 rounded-lg">
                    <span className="text-sm font-medium truncate">{project.title}</span>
                    <Badge variant="destructive" className="text-xs">
                      {Math.abs(project.daysUntil)} days overdue
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-warning" />
              Due This Week
              <Badge variant="outline">{upcomingDeadlines.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-muted-foreground">No deadlines this week</p>
            ) : (
              <div className="space-y-2">
                {upcomingDeadlines.slice(0, 3).map(project => (
                  <div key={project.id} className="flex items-center justify-between p-2 bg-warning/10 rounded-lg">
                    <span className="text-sm font-medium truncate">{project.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {project.daysUntil === 0 ? 'Today' : `${project.daysUntil}d left`}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gantt-style Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Project Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <div className="min-w-[800px]">
              {/* Days Header */}
              <div className="flex border-b pb-2 mb-4">
                <div className="w-48 shrink-0 font-medium text-sm">Project</div>
                <div className="flex-1 flex">
                  {timelineData.days.slice(0, 31).map((day, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 text-center text-xs ${
                        isToday(day) 
                          ? 'text-primary font-bold' 
                          : 'text-muted-foreground'
                      }`}
                    >
                      <div>{format(day, 'd')}</div>
                      <div className="text-[10px]">{format(day, 'EEE')}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Rows */}
              <div className="space-y-2">
                {projects.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Music className="w-8 h-8 mx-auto mb-2" />
                    <p>No projects to display</p>
                  </div>
                ) : (
                  projects.slice(0, 10).map((project, index) => {
                    const startDay = parseISO(project.created_at);
                    const endDay = project.deadline ? parseISO(project.deadline) : addDays(startDay, 14);
                    
                    return (
                      <motion.div 
                        key={project.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center"
                      >
                        <div className="w-48 shrink-0 pr-4">
                          <span className="text-sm font-medium truncate block">
                            {project.title}
                          </span>
                          <span className="text-xs text-muted-foreground capitalize">
                            {project.status?.replace('_', ' ') || 'planning'}
                          </span>
                        </div>
                        <div className="flex-1 flex h-8 relative">
                          {timelineData.days.slice(0, 31).map((day, i) => {
                            const isStart = isSameDay(day, startDay);
                            const isEnd = isSameDay(day, endDay);
                            const isInRange = day >= startDay && day <= endDay;
                            const isTodayMarker = isToday(day);
                            
                            return (
                              <div 
                                key={i} 
                                className={`flex-1 relative ${isTodayMarker ? 'bg-primary/5' : ''}`}
                              >
                                {isInRange && (
                                  <div 
                                    className={`absolute inset-y-1 inset-x-0 ${
                                      priorityColors[project.priority || 'medium']
                                    } opacity-80 ${isStart ? 'rounded-l-full' : ''} ${isEnd ? 'rounded-r-full' : ''}`}
                                  />
                                )}
                                {isTodayMarker && (
                                  <div className="absolute inset-y-0 left-1/2 w-0.5 bg-primary" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-destructive" />
          <span>Urgent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-500" />
          <span>High</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary" />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500" />
          <span>Low</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-0.5 h-4 bg-primary" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};
