import { usePartnershipEarnings } from '@/hooks/usePartnershipEarnings';
import { EarningsStats } from './EarningsStats';
import { PartnershipList } from './PartnershipList';
import { RevenueChart } from './RevenueChart';
import { NewPartnershipDialog } from './NewPartnershipDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EarningsDashboardProps {
  userType: 'artist' | 'engineer';
}

export const EarningsDashboard = ({ userType }: EarningsDashboardProps) => {
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
            Track revenue splits and manage partnerships
          </p>
        </div>
        <NewPartnershipDialog
          userType={userType}
          onCreatePartnership={handleCreatePartnership}
        />
      </div>

      {/* Stats Overview */}
      <EarningsStats summary={summary} />

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
    </div>
  );
};
