import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { startOfMonth, subMonths, format } from 'date-fns';

export interface ProducerRevenueStream {
  id: string;
  name: string;
  icon: string;
  amount: number;
  displayAmount: number;
  trend: number;
  color: string;
  description: string;
  transactionCount: number;
}

export interface ProducerRevenueAnalytics {
  totalRevenue: number;
  thisMonth: number;
  lastMonth: number;
  monthlyGrowth: number;
  pendingEarnings: number;
  availableBalance: number;
  totalBeatsSold: number;
  leaseSales: number;
  exclusiveSales: number;
  averageSaleValue: number;
  topSellingBeatId: string | null;
  totalStreamCount: number;
  royaltyEarnings: number;
  activeCollabCount: number;
  streams: ProducerRevenueStream[];
  revenueByMonth: { month: string; leases: number; exclusives: number; royalties: number }[];
  forecasts: { month: string; projected: number; actual?: number }[];
  recentTransactions: {
    id: string;
    type: 'lease' | 'exclusive' | 'royalty' | 'collab';
    amount: number;
    beatTitle?: string;
    artistName?: string;
    date: string;
    status: string;
  }[];
}

export function useProducerRevenueStreams() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['producer-revenue-streams', user?.id],
    queryFn: async (): Promise<ProducerRevenueAnalytics> => {
      if (!user?.id) {
        return getEmptyAnalytics();
      }

      const now = new Date();
      const thisMonthStart = startOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));

      // Fetch all data in parallel
      const [salesRes, royaltiesRes, partnershipsRes] = await Promise.all([
        // Beat sales
        supabase
          .from('beat_purchases')
          .select('*, beat:producer_beats(id, title)')
          .eq('seller_id', user.id)
          .eq('status', 'completed'),
        // Royalties via partnerships
        supabase
          .from('beat_royalties')
          .select(`
            *,
            partnership:partnerships!inner(producer_id, artist_id)
          `)
          .eq('partnership.producer_id', user.id),
        // Active producer partnerships
        supabase
          .from('partnerships')
          .select('*, artist:profiles!partnerships_artist_id_fkey(full_name)')
          .eq('producer_id', user.id)
          .eq('partnership_type', 'producer_artist'),
      ]);

      const sales = salesRes.data || [];
      const royalties = royaltiesRes.data || [];
      const partnerships = partnershipsRes.data || [];

      // Calculate lease sales
      const leaseSales = sales.filter(s => s.license_type === 'lease');
      const leaseTotal = leaseSales.reduce((sum, s) => sum + (s.seller_earnings_cents || 0), 0) / 100;
      const leaseThisMonth = leaseSales
        .filter(s => new Date(s.created_at) >= thisMonthStart)
        .reduce((sum, s) => sum + (s.seller_earnings_cents || 0), 0) / 100;
      const leaseLastMonth = leaseSales
        .filter(s => {
          const d = new Date(s.created_at);
          return d >= lastMonthStart && d < thisMonthStart;
        })
        .reduce((sum, s) => sum + (s.seller_earnings_cents || 0), 0) / 100;

      // Calculate exclusive sales
      const exclusiveSales = sales.filter(s => s.license_type === 'exclusive');
      const exclusiveTotal = exclusiveSales.reduce((sum, s) => sum + (s.seller_earnings_cents || 0), 0) / 100;
      const exclusiveThisMonth = exclusiveSales
        .filter(s => new Date(s.created_at) >= thisMonthStart)
        .reduce((sum, s) => sum + (s.seller_earnings_cents || 0), 0) / 100;
      const exclusiveLastMonth = exclusiveSales
        .filter(s => {
          const d = new Date(s.created_at);
          return d >= lastMonthStart && d < thisMonthStart;
        })
        .reduce((sum, s) => sum + (s.seller_earnings_cents || 0), 0) / 100;

      // Calculate royalties
      const royaltyTotal = royalties.reduce((sum, r) => sum + Number(r.producer_amount || 0), 0);
      const royaltyThisMonth = royalties
        .filter(r => new Date(r.period_end) >= thisMonthStart)
        .reduce((sum, r) => sum + Number(r.producer_amount || 0), 0);
      const royaltyLastMonth = royalties
        .filter(r => {
          const d = new Date(r.period_end);
          return d >= lastMonthStart && d < thisMonthStart;
        })
        .reduce((sum, r) => sum + Number(r.producer_amount || 0), 0);

      // Calculate collab splits (from partnerships producer_earnings)
      const collabTotal = partnerships.reduce((sum, p) => sum + Number(p.producer_earnings || 0), 0);

      // Total streams
      const totalStreamCount = royalties.reduce((sum, r) => sum + (r.stream_count || 0), 0);

      // Calculate trends
      const calcTrend = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      const leaseTrend = calcTrend(leaseThisMonth, leaseLastMonth);
      const exclusiveTrend = calcTrend(exclusiveThisMonth, exclusiveLastMonth);
      const royaltyTrend = calcTrend(royaltyThisMonth, royaltyLastMonth);

      // Build 6 producer revenue streams
      const streams: ProducerRevenueStream[] = [
        {
          id: 'leases',
          name: 'Beat Leases',
          icon: 'disc-3',
          amount: leaseTotal * 100,
          displayAmount: leaseTotal,
          trend: leaseTrend,
          color: 'hsl(var(--primary))',
          description: 'Non-exclusive beat licenses',
          transactionCount: leaseSales.length,
        },
        {
          id: 'exclusives',
          name: 'Exclusive Sales',
          icon: 'crown',
          amount: exclusiveTotal * 100,
          displayAmount: exclusiveTotal,
          trend: exclusiveTrend,
          color: 'hsl(280, 100%, 70%)',
          description: 'Full ownership transfers',
          transactionCount: exclusiveSales.length,
        },
        {
          id: 'royalties',
          name: 'Streaming Royalties',
          icon: 'music',
          amount: royaltyTotal * 100,
          displayAmount: royaltyTotal,
          trend: royaltyTrend,
          color: 'hsl(150, 80%, 50%)',
          description: 'Revenue from released tracks',
          transactionCount: royalties.length,
        },
        {
          id: 'collabs',
          name: 'Collab Splits',
          icon: 'handshake',
          amount: collabTotal * 100,
          displayAmount: collabTotal,
          trend: 0,
          color: 'hsl(45, 100%, 55%)',
          description: 'Partnership revenue shares',
          transactionCount: partnerships.filter(p => p.status === 'active').length,
        },
        {
          id: 'sync',
          name: 'Sync Licensing',
          icon: 'tv',
          amount: 0,
          displayAmount: 0,
          trend: 0,
          color: 'hsl(0, 80%, 60%)',
          description: 'Film/TV/Ad placements',
          transactionCount: 0,
        },
        {
          id: 'samples',
          name: 'Samples & Kits',
          icon: 'package',
          amount: 0,
          displayAmount: 0,
          trend: 0,
          color: 'hsl(200, 100%, 60%)',
          description: 'Sound pack sales',
          transactionCount: 0,
        },
      ];

      const totalRevenue = streams.reduce((sum, s) => sum + s.displayAmount, 0);
      const thisMonth = leaseThisMonth + exclusiveThisMonth + royaltyThisMonth;
      const lastMonth = leaseLastMonth + exclusiveLastMonth + royaltyLastMonth;
      const monthlyGrowth = calcTrend(thisMonth, lastMonth);

      // Find top selling beat
      const beatCounts: Record<string, { count: number; revenue: number }> = {};
      sales.forEach(s => {
        if (s.beat_id) {
          if (!beatCounts[s.beat_id]) {
            beatCounts[s.beat_id] = { count: 0, revenue: 0 };
          }
          beatCounts[s.beat_id].count++;
          beatCounts[s.beat_id].revenue += s.seller_earnings_cents || 0;
        }
      });
      const topBeat = Object.entries(beatCounts).sort((a, b) => b[1].revenue - a[1].revenue)[0];

      // Build monthly breakdown (last 6 months)
      const revenueByMonth: ProducerRevenueAnalytics['revenueByMonth'] = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(now, i));
        const monthEnd = startOfMonth(subMonths(now, i - 1));
        const monthName = format(monthStart, 'MMM');

        const monthLeases = leaseSales
          .filter(s => {
            const d = new Date(s.created_at);
            return d >= monthStart && d < monthEnd;
          })
          .reduce((sum, s) => sum + (s.seller_earnings_cents || 0), 0) / 100;

        const monthExclusives = exclusiveSales
          .filter(s => {
            const d = new Date(s.created_at);
            return d >= monthStart && d < monthEnd;
          })
          .reduce((sum, s) => sum + (s.seller_earnings_cents || 0), 0) / 100;

        const monthRoyalties = royalties
          .filter(r => {
            const d = new Date(r.period_end);
            return d >= monthStart && d < monthEnd;
          })
          .reduce((sum, r) => sum + Number(r.producer_amount || 0), 0);

        revenueByMonth.push({
          month: monthName,
          leases: monthLeases,
          exclusives: monthExclusives,
          royalties: monthRoyalties,
        });
      }

      // Build forecasts
      const avgMonthly = totalRevenue / Math.max(revenueByMonth.filter(m => m.leases + m.exclusives + m.royalties > 0).length, 1);
      const forecasts = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => ({
        month,
        projected: avgMonthly * (1 + (i * 0.05)),
        actual: i < 2 ? avgMonthly * (0.9 + Math.random() * 0.2) : undefined,
      }));

      // Build recent transactions
      const recentTransactions: ProducerRevenueAnalytics['recentTransactions'] = [];
      
      // Add sales
      sales.slice(0, 10).forEach(s => {
        recentTransactions.push({
          id: s.id,
          type: s.license_type === 'exclusive' ? 'exclusive' : 'lease',
          amount: (s.seller_earnings_cents || 0) / 100,
          beatTitle: (s.beat as { title?: string } | null)?.title || 'Unknown Beat',
          date: s.created_at,
          status: s.status || 'completed',
        });
      });

      // Add royalties
      royalties.slice(0, 5).forEach(r => {
        recentTransactions.push({
          id: r.id,
          type: 'royalty',
          amount: r.producer_amount || 0,
          beatTitle: r.platform || 'Streaming',
          date: r.period_end,
          status: r.status || 'pending',
        });
      });

      // Sort by date
      recentTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return {
        totalRevenue,
        thisMonth,
        lastMonth,
        monthlyGrowth,
        pendingEarnings: royalties.filter(r => r.status === 'pending').reduce((sum, r) => sum + Number(r.producer_amount || 0), 0),
        availableBalance: totalRevenue * 0.85,
        totalBeatsSold: sales.length,
        leaseSales: leaseSales.length,
        exclusiveSales: exclusiveSales.length,
        averageSaleValue: sales.length > 0 ? (leaseTotal + exclusiveTotal) / sales.length : 0,
        topSellingBeatId: topBeat?.[0] || null,
        totalStreamCount,
        royaltyEarnings: royaltyTotal,
        activeCollabCount: partnerships.filter(p => p.status === 'active').length,
        streams: streams.sort((a, b) => b.displayAmount - a.displayAmount),
        revenueByMonth,
        forecasts,
        recentTransactions: recentTransactions.slice(0, 10),
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  return {
    analytics: query.data || null,
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
  };
}

function getEmptyAnalytics(): ProducerRevenueAnalytics {
  return {
    totalRevenue: 0,
    thisMonth: 0,
    lastMonth: 0,
    monthlyGrowth: 0,
    pendingEarnings: 0,
    availableBalance: 0,
    totalBeatsSold: 0,
    leaseSales: 0,
    exclusiveSales: 0,
    averageSaleValue: 0,
    topSellingBeatId: null,
    totalStreamCount: 0,
    royaltyEarnings: 0,
    activeCollabCount: 0,
    streams: [],
    revenueByMonth: [],
    forecasts: [],
    recentTransactions: [],
  };
}
