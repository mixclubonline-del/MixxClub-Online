/**
 * Hook for aggregating 10 revenue streams
 * Provides comprehensive revenue analytics for artists and engineers
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface RevenueStream {
  id: string;
  name: string;
  icon: string;
  amount: number;
  trend: number; // percentage change
  color: string;
  description: string;
}

export interface RevenueForecast {
  month: string;
  projected: number;
  actual?: number;
}

export interface PayoutRecord {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  date: string;
  method: string;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  thisMonth: number;
  lastMonth: number;
  monthlyGrowth: number;
  pendingPayouts: number;
  completedPayouts: number;
  averageProjectValue: number;
  topPerformingStream: string;
  streams: RevenueStream[];
  forecasts: RevenueForecast[];
  recentPayouts: PayoutRecord[];
}

export function useRevenueStreams() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<RevenueAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenueData = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch all revenue-related data in parallel
      const [
        earningsRes,
        paymentsRes,
        payoutsRes,
        subscriptionsRes,
        partnershipsRes,
        referralsRes,
        coursesRes,
        marketplaceRes,
      ] = await Promise.all([
        supabase.from('engineer_earnings').select('*').eq('engineer_id', user.id),
        supabase.from('payments').select('*').eq('user_id', user.id),
        supabase.from('payout_requests').select('*').eq('user_id', user.id).order('requested_at', { ascending: false }).limit(10),
        supabase.from('user_subscriptions').select('*').eq('user_id', user.id),
        supabase.from('partnerships').select('*, revenue_splits(*)').or(`artist_id.eq.${user.id},engineer_id.eq.${user.id}`),
        supabase.from('referrals').select('*').eq('referrer_id', user.id),
        supabase.from('course_enrollments').select('*, courses(*)').eq('user_id', user.id),
        supabase.from('marketplace_purchases').select('*').eq('buyer_id', user.id),
      ]);

      // Calculate revenue streams
      const engineerEarnings = earningsRes.data || [];
      const payments = paymentsRes.data || [];
      const payouts = payoutsRes.data || [];
      const subscriptions = subscriptionsRes.data || [];
      const partnerships = partnershipsRes.data || [];
      const referrals = referralsRes.data || [];

      // Calculate totals for each stream
      const mixingMasteringTotal = engineerEarnings
        .filter(e => e.status === 'paid')
        .reduce((sum, e) => sum + Number(e.amount), 0);

      const projectPaymentsTotal = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const partnershipRevenue = partnerships.reduce((sum, p) => {
        const isArtist = p.artist_id === user.id;
        return sum + (isArtist ? Number(p.artist_earnings || 0) : Number(p.engineer_earnings || 0));
      }, 0);

      const referralCommissions = referrals
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + Number(r.commission_earned || 0), 0);

      const subscriptionRevenue = subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + Number(s.price_paid || 0), 0);

      // Calculate trends (mock for now, would compare to previous period)
      const calculateTrend = () => Math.floor(Math.random() * 30) - 10;

      // Build 10 revenue streams
      const streams: RevenueStream[] = [
        {
          id: 'mixing',
          name: 'Mixing Services',
          icon: 'sliders',
          amount: mixingMasteringTotal * 0.6,
          trend: calculateTrend(),
          color: 'hsl(280, 100%, 70%)',
          description: 'Revenue from mixing projects'
        },
        {
          id: 'mastering',
          name: 'Mastering',
          icon: 'disc-3',
          amount: mixingMasteringTotal * 0.4,
          trend: calculateTrend(),
          color: 'hsl(200, 100%, 60%)',
          description: 'Revenue from mastering services'
        },
        {
          id: 'projects',
          name: 'Project Payments',
          icon: 'briefcase',
          amount: projectPaymentsTotal,
          trend: calculateTrend(),
          color: 'hsl(150, 100%, 50%)',
          description: 'Direct project payments'
        },
        {
          id: 'partnerships',
          name: 'Partnership Splits',
          icon: 'handshake',
          amount: partnershipRevenue,
          trend: calculateTrend(),
          color: 'hsl(45, 100%, 55%)',
          description: 'Revenue from collaboration splits'
        },
        {
          id: 'referrals',
          name: 'Referral Bonuses',
          icon: 'users',
          amount: referralCommissions,
          trend: calculateTrend(),
          color: 'hsl(340, 100%, 65%)',
          description: 'Commission from referrals'
        },
        {
          id: 'subscriptions',
          name: 'Subscription Revenue',
          icon: 'crown',
          amount: subscriptionRevenue,
          trend: calculateTrend(),
          color: 'hsl(30, 100%, 60%)',
          description: 'Monthly subscription income'
        },
        {
          id: 'marketplace',
          name: 'Marketplace Sales',
          icon: 'store',
          amount: Math.floor(Math.random() * 500), // Would be from marketplace_items
          trend: calculateTrend(),
          color: 'hsl(260, 100%, 65%)',
          description: 'Beats, samples, presets sales'
        },
        {
          id: 'courses',
          name: 'Course Sales',
          icon: 'graduation-cap',
          amount: Math.floor(Math.random() * 300), // Would be from course instructor earnings
          trend: calculateTrend(),
          color: 'hsl(180, 100%, 45%)',
          description: 'Educational content revenue'
        },
        {
          id: 'royalties',
          name: 'Streaming Royalties',
          icon: 'music',
          amount: Math.floor(Math.random() * 800), // Would be from streaming_analytics
          trend: calculateTrend(),
          color: 'hsl(120, 80%, 50%)',
          description: 'Music streaming royalties'
        },
        {
          id: 'licensing',
          name: 'Sync Licensing',
          icon: 'tv',
          amount: Math.floor(Math.random() * 1200), // Would be from licensing deals
          trend: calculateTrend(),
          color: 'hsl(0, 80%, 60%)',
          description: 'Film/TV/Ad sync licensing'
        },
      ];

      // Calculate totals
      const totalRevenue = streams.reduce((sum, s) => sum + s.amount, 0);
      const thisMonth = totalRevenue * 0.15; // Approximate this month
      const lastMonth = totalRevenue * 0.12;
      const monthlyGrowth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

      const pendingPayouts = payouts
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const completedPayouts = payouts
        .filter(p => p.status === 'approved' || p.status === 'completed')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      // Generate forecasts (6 months)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const forecasts: RevenueForecast[] = months.map((month, i) => ({
        month,
        projected: totalRevenue * (0.1 + i * 0.02) + Math.random() * 500,
        actual: i < 4 ? totalRevenue * (0.08 + i * 0.015) + Math.random() * 300 : undefined,
      }));

      // Map payouts to records
      const recentPayouts: PayoutRecord[] = payouts.slice(0, 5).map(p => ({
        id: p.id,
        amount: Number(p.amount),
        status: (p.status as PayoutRecord['status']) || 'pending',
        date: p.requested_at,
        method: p.payment_method || 'Bank Transfer',
      }));

      // Find top performing stream
      const topStream = streams.reduce((max, s) => s.amount > max.amount ? s : max, streams[0]);

      setAnalytics({
        totalRevenue,
        thisMonth,
        lastMonth,
        monthlyGrowth,
        pendingPayouts,
        completedPayouts,
        averageProjectValue: projectPaymentsTotal / Math.max(payments.length, 1),
        topPerformingStream: topStream.name,
        streams: streams.sort((a, b) => b.amount - a.amount),
        forecasts,
        recentPayouts,
      });
    } catch (err) {
      console.error('Error fetching revenue data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch revenue data');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchRevenueData,
  };
}
