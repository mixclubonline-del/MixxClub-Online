import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  LayoutGrid, 
  List, 
  Calendar, 
  BarChart3, 
  Search,
  Filter,
  SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProjectBoard } from './ProjectBoard';
import { ProjectsList } from './ProjectsList';
import { ProjectTimeline } from './ProjectTimeline';
import { ProjectAnalytics } from './ProjectAnalytics';
import { CreateProjectModal } from './CreateProjectModal';
import { ProjectDetailPanel } from './ProjectDetailPanel';
import { useProjectsHub } from '@/hooks/useProjectsHub';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProjectsHubProps {
  userRole: 'artist' | 'engineer';
}

export const ProjectsHub = ({ userRole }: ProjectsHubProps) => {
  const [activeView, setActiveView] = useState<'board' | 'list' | 'timeline' | 'analytics'>('board');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const {
    projects,
    isLoading: loading,
    stats,
    refetch 
  } = useProjectsHub();

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleProjectClick = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  const handleCloseDetail = () => {
    setSelectedProjectId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Projects Hub</h2>
          <p className="text-muted-foreground">
            Manage your {userRole === 'artist' ? 'music projects' : 'client projects'}
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border rounded-lg p-4"
        >
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Projects</div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-primary/10 border border-primary/20 rounded-lg p-4"
        >
          <div className="text-2xl font-bold text-primary">{stats.inProgress}</div>
          <div className="text-sm text-muted-foreground">In Progress</div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-warning/10 border border-warning/20 rounded-lg p-4"
        >
          <div className="text-2xl font-bold text-warning">{stats.review}</div>
          <div className="text-sm text-muted-foreground">In Review</div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-success/10 border border-success/20 rounded-lg p-4"
        >
          <div className="text-2xl font-bold text-success">{stats.completed}</div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </motion.div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[140px]">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* View Tabs */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as typeof activeView)}>
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="board" className="gap-2">
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Board</span>
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">List</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Timeline</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-6"
          >
            <TabsContent value="board" className="mt-0">
              <ProjectBoard 
                onCreateProject={() => setShowCreateModal(true)} 
              />
            </TabsContent>

            <TabsContent value="list" className="mt-0">
              <ProjectsList 
                projects={filteredProjects}
                loading={loading}
                onProjectClick={handleProjectClick}
              />
            </TabsContent>

            <TabsContent value="timeline" className="mt-0">
              <ProjectTimeline 
                projects={filteredProjects}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <ProjectAnalytics projects={projects} />
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>

      {/* Create Project Modal */}
      <CreateProjectModal
        open={showCreateModal}
        onOpenChange={(open) => {
          setShowCreateModal(open);
          if (!open) refetch();
        }}
      />

      {/* Project Detail Panel */}
      <ProjectDetailPanel
        projectId={selectedProjectId}
        open={!!selectedProjectId}
        onClose={handleCloseDetail}
        onUpdate={refetch}
      />
    </div>
  );
};
