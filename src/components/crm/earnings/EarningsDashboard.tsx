import { useState } from 'react';
import { usePartnershipEarnings } from '@/hooks/usePartnershipEarnings';
import { EarningsStats } from './EarningsStats';
import { PartnershipList } from './PartnershipList';
import { RevenueChart } from './RevenueChart';
import { NewPartnershipDialog } from './NewPartnershipDialog';
import { ProjectBoard, CreateProjectModal } from '../projects';
import { NotificationsHub } from '../notifications';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Kanban, Bell } from 'lucide-react';

interface EarningsDashboardProps {
  userType: 'artist' | 'engineer';
}

export const EarningsDashboard = ({ userType }: EarningsDashboardProps) => {
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  
  const {
    summary,
    partnerships,
    projects,
    revenueSplits,
    healthScores,
    loading,
    error,
    createPartnership,
    acceptPartnership,
  } = usePartnershipEarnings();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const handleCreatePartnership = async (partnerId: string, userSplit: number) => {
    return await createPartnership({ partnerId, userSplit, userType });
  };

  return (
    <div className="space-y-6">
      {/* Header with New Partnership button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Collaborative Earnings</h2>
          <p className="text-muted-foreground">
            Track revenue splits, projects, and notifications
          </p>
        </div>
        <NewPartnershipDialog
          userType={userType}
          onCreatePartnership={handleCreatePartnership}
        />
      </div>

      {/* Stats Overview */}
      <EarningsStats summary={summary} />

      {/* Tabs for different views */}
      <Tabs defaultValue="earnings" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="earnings" className="gap-2">
            <DollarSign className="w-4 h-4" />
            Earnings
          </TabsTrigger>
          <TabsTrigger value="projects" className="gap-2">
            <Kanban className="w-4 h-4" />
            Project Board
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="earnings" className="space-y-6">
          {/* Revenue Chart */}
          <RevenueChart revenueSplits={revenueSplits} />

          {/* Partnership List */}
          <PartnershipList
            partnerships={partnerships}
            projects={projects}
            healthScores={healthScores}
            userType={userType}
            onAcceptPartnership={acceptPartnership}
          />
        </TabsContent>

        <TabsContent value="projects">
          <ProjectBoard onCreateProject={() => setCreateProjectOpen(true)} />
          <CreateProjectModal 
            open={createProjectOpen} 
            onOpenChange={setCreateProjectOpen} 
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsHub />
        </TabsContent>
      </Tabs>
    </div>
  );
};
