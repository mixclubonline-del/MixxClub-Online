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
  SlidersHorizontal,
  Kanban
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProjectBoard } from './ProjectBoard';
import { ProjectsList } from './ProjectsList';
import { ProjectTimeline } from './ProjectTimeline';
import { ProjectAnalytics } from './ProjectAnalytics';
import { CreateProjectModal } from './CreateProjectModal';
import { ProjectDetailPanel } from './ProjectDetailPanel';
import { useProjectsHub } from '@/hooks/useProjectsHub';
import { GlassPanel, HubHeader } from '../design';
import { useIsMobile } from '@/hooks/use-mobile';
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

const VIEW_OPTIONS = [
  { value: 'board', label: 'Board', icon: LayoutGrid },
  { value: 'list', label: 'List', icon: List },
  { value: 'timeline', label: 'Timeline', icon: Calendar },
  { value: 'analytics', label: 'Analytics', icon: BarChart3 },
] as const;

export const ProjectsHub = ({ userRole }: ProjectsHubProps) => {
  const [activeView, setActiveView] = useState<'board' | 'list' | 'timeline' | 'analytics'>('board');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [partnerFilter, setPartnerFilter] = useState<string>('all');
  const isMobile = useIsMobile();

  const {
    projects,
    isLoading: loading,
    stats,
    refetch 
  } = useProjectsHub();

  // Extract unique partners for filter dropdown
  const partnerOptions = Array.from(
    new Map(
      projects
        .filter(p => p.partnership)
        .map(p => {
          const partner = userRole === 'artist'
            ? p.partnership?.engineer
            : p.partnership?.artist;
          const partnerId = userRole === 'artist'
            ? p.partnership?.engineer_id
            : p.partnership?.artist_id;
          return [partnerId, partner?.full_name || 'Unknown'] as [string, string];
        })
    ).entries()
  ).map(([, [id, name]]) => ({ id, name }));

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
    const matchesPartner = partnerFilter === 'all' || (() => {
      const partnerId = userRole === 'artist'
        ? project.partnership?.engineer_id
        : project.partnership?.artist_id;
      return partnerId === partnerFilter;
    })();
    return matchesSearch && matchesStatus && matchesPriority && matchesPartner;
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
      <HubHeader
        icon={<Kanban className="w-5 h-5 text-primary" />}
        title="Projects Hub"
        subtitle={`Manage your ${userRole === 'artist' ? 'music projects' : 'client projects'}`}
        action={
          <Button onClick={() => setShowCreateModal(true)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        }
      />

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Projects', value: stats.total, accent: undefined, delay: 0 },
          { label: 'In Progress', value: stats.inProgress, accent: 'rgba(99,102,241,0.35)', delay: 0.1 },
          { label: 'In Review', value: stats.review, accent: 'rgba(234,179,8,0.35)', delay: 0.2 },
          { label: 'Completed', value: stats.completed, accent: 'rgba(34,197,94,0.35)', delay: 0.3 },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stat.delay }}
          >
            <GlassPanel accent={stat.accent} padding="p-4">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </GlassPanel>
          </motion.div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
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
          <SelectTrigger className="w-full sm:w-[140px]">
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
          <SelectTrigger className="w-full sm:w-[140px]">
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
        {partnerOptions.length > 0 && (
          <Select value={partnerFilter} onValueChange={setPartnerFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Partner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Partners</SelectItem>
              {partnerOptions.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* View Tabs — mobile uses Select dropdown */}
      {isMobile ? (
        <Select value={activeView} onValueChange={(v) => setActiveView(v as typeof activeView)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VIEW_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as typeof activeView)}>
          <TabsList className="grid grid-cols-4 w-full max-w-md bg-muted/50">
            {VIEW_OPTIONS.map(opt => (
              <TabsTrigger key={opt.value} value={opt.value} className="gap-2">
                <opt.icon className="w-4 h-4" />
                {opt.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* View Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeView === 'board' && (
            <ProjectBoard onCreateProject={() => setShowCreateModal(true)} />
          )}
          {activeView === 'list' && (
            <ProjectsList
              projects={filteredProjects}
              loading={loading}
              onProjectClick={handleProjectClick}
            />
          )}
          {activeView === 'timeline' && (
            <ProjectTimeline projects={filteredProjects} loading={loading} />
          )}
          {activeView === 'analytics' && (
            <ProjectAnalytics projects={projects} />
          )}
        </motion.div>
      </AnimatePresence>

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
