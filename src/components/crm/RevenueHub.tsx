import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRevenueStreams } from '@/hooks/useRevenueStreams';
import { RevenueOverview } from './revenue/RevenueOverview';
import { RevenueStreamCards } from './revenue/RevenueStreamCards';
import { PaymentIntegration } from './revenue/PaymentIntegration';
import { EarningsTimeline } from './revenue/EarningsTimeline';
import { RevenueGoals } from './revenue/RevenueGoals';
import { RevenueChart } from './revenue/RevenueChart';
import { StreamBreakdown } from './revenue/StreamBreakdown';
import { LayoutDashboard, Wallet, Target, BarChart3 } from 'lucide-react';

interface RevenueHubProps {
  userType: 'artist' | 'engineer' | 'producer';
  userId?: string;
}

export const RevenueHub: React.FC<RevenueHubProps> = ({ userType }) => {
  const { analytics, loading, refetch } = useRevenueStreams();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Revenue Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          Track all 10 revenue streams, manage payouts, and set goals
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="payouts" className="gap-2">
            <Wallet className="w-4 h-4" />
            <span className="hidden sm:inline">Payouts</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="gap-2">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Goals</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <RevenueOverview analytics={analytics} loading={loading} />
          <RevenueStreamCards
            streams={analytics?.streams || []}
            loading={loading}
            totalRevenue={analytics?.totalRevenue || 0}
          />
          <EarningsTimeline analytics={analytics} loading={loading} />
        </TabsContent>

        <TabsContent value="payouts" className="space-y-6">
          <PaymentIntegration
            analytics={analytics}
            loading={loading}
            onPayoutRequest={refetch}
          />
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <RevenueGoals analytics={analytics} loading={loading} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart
              forecasts={analytics?.forecasts || []}
              loading={loading}
            />
            <StreamBreakdown
              streams={analytics?.streams || []}
              loading={loading}
              totalRevenue={analytics?.totalRevenue || 0}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RevenueHub;
