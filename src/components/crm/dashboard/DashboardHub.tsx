import { useAuth } from '@/hooks/useAuth';
import { useProjectStats } from '@/hooks/useProjectStats';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import { StatsOverview } from './StatsOverview';
import { ActivityFeed } from './ActivityFeed';
import { QuickActions } from './QuickActions';
import { toast } from 'sonner';

interface DashboardHubProps {
  role: 'artist' | 'engineer';
}

export const DashboardHub = ({ role }: DashboardHubProps) => {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useProjectStats(user?.id);
  const { data: activities, isLoading: activitiesLoading } = useRecentActivity(user?.id);

  const handleQuickAction = (action: string) => {
    toast.info(`Feature coming soon: ${action}`);
  };

  if (statsLoading || activitiesLoading) {
    return <div className="animate-pulse">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <StatsOverview stats={stats || { totalProjects: 0, totalMatches: 0, totalRevenue: 0, activeProjects: 0 }} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed activities={activities || []} />
        </div>
        <QuickActions role={role} onAction={handleQuickAction} />
      </div>
    </div>
  );
};
