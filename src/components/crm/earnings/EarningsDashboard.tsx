import { usePartnershipEarnings } from '@/hooks/usePartnershipEarnings';
import { EarningsStats } from './EarningsStats';
import { PartnershipList } from './PartnershipList';
import { RevenueChart } from './RevenueChart';
import { NewPartnershipDialog } from './NewPartnershipDialog';
import { ProjectsHub } from '../projects';
import { NotificationsHub } from '../notifications';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Kanban, Bell } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

interface EarningsDashboardProps {
  userType: 'artist' | 'engineer';
}

const TAB_OPTIONS = [
  { value: 'earnings', label: 'Earnings', icon: DollarSign },
  { value: 'projects', label: 'Project Board', icon: Kanban },
  { value: 'notifications', label: 'Notifications', icon: Bell },
] as const;

export const EarningsDashboard = ({ userType }: EarningsDashboardProps) => {
  const [activeTab, setActiveTab] = useState('earnings');
  const isMobile = useIsMobile();

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

      {/* Tabs — mobile uses Select dropdown */}
      {isMobile ? (
        <>
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TAB_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="mt-4">
            {activeTab === 'earnings' && (
              <div className="space-y-6">
                <RevenueChart revenueSplits={revenueSplits} />
                <PartnershipList
                  partnerships={partnerships}
                  projects={projects}
                  healthScores={healthScores}
                  userType={userType}
                  onAcceptPartnership={acceptPartnership}
                />
              </div>
            )}
            {activeTab === 'projects' && (
              <ProjectsHub userRole={userType} />
            )}
            {activeTab === 'notifications' && (
              <NotificationsHub />
            )}
          </div>
        </>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-muted/50">
            {TAB_OPTIONS.map(opt => (
              <TabsTrigger key={opt.value} value={opt.value} className="gap-2">
                <opt.icon className="w-4 h-4" />
                {opt.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="earnings" className="space-y-6">
            <RevenueChart revenueSplits={revenueSplits} />
            <PartnershipList
              partnerships={partnerships}
              projects={projects}
              healthScores={healthScores}
              userType={userType}
              onAcceptPartnership={acceptPartnership}
            />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectsHub userRole={userType} />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsHub />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
