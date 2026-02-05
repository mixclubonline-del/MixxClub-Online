import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProducerRevenueStreams } from '@/hooks/useProducerRevenueStreams';
import {
  ProducerRevenueOverview,
  ProducerRevenueStreamCards,
  BeatSalesBreakdown,
  RoyaltyEarningsPanel,
  RecentTransactionsTable,
} from '@/components/producer/revenue';
import { LayoutDashboard, Disc3, Music, BarChart3 } from 'lucide-react';

export const ProducerRevenueHub = () => {
  const { analytics, loading } = useProducerRevenueStreams();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Producer Revenue</h2>
        <p className="text-muted-foreground mt-1">
          Track beat sales, streaming royalties, and collaboration income
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="sales" className="gap-2">
            <Disc3 className="w-4 h-4" />
            <span className="hidden sm:inline">Beat Sales</span>
          </TabsTrigger>
          <TabsTrigger value="royalties" className="gap-2">
            <Music className="w-4 h-4" />
            <span className="hidden sm:inline">Royalties</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ProducerRevenueOverview analytics={analytics} loading={loading} />
          <ProducerRevenueStreamCards 
            streams={analytics?.streams || []} 
            loading={loading}
            totalRevenue={analytics?.totalRevenue || 0}
          />
          <RecentTransactionsTable 
            transactions={analytics?.recentTransactions || []} 
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <BeatSalesBreakdown analytics={analytics} loading={loading} />
          <RecentTransactionsTable 
            transactions={(analytics?.recentTransactions || []).filter(t => t.type === 'lease' || t.type === 'exclusive')} 
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="royalties" className="space-y-6">
          <RoyaltyEarningsPanel analytics={analytics} loading={loading} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BeatSalesBreakdown analytics={analytics} loading={loading} />
          </div>
          <ProducerRevenueStreamCards 
            streams={analytics?.streams || []} 
            loading={loading}
            totalRevenue={analytics?.totalRevenue || 0}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
