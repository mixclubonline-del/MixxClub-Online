/**
 * usePartnerProgram Hook
 * Manages partner program data, tier progression, and affiliate functionality
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Partner {
  id: string;
  user_id: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  status: 'pending' | 'active' | 'suspended';
  commission_rate: number;
  affiliate_code: string;
  total_referrals: number;
  total_revenue: number;
  total_commissions: number;
  pending_commissions: number;
  joined_at: string;
  upgraded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TierBenefits {
  name: string;
  commissionRate: number;
  features: string[];
  color: string;
  icon: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_user_id: string | null;
  referral_code: string;
  status: string;
  commission_amount: number | null;
  created_at: string;
  referred_user?: {
    full_name: string | null;
    email: string | null;
  };
}

export const TIER_CONFIG: Record<string, TierBenefits> = {
  bronze: {
    name: 'Bronze',
    commissionRate: 10,
    features: ['Basic dashboard', 'Affiliate links', 'Email support'],
    color: 'from-amber-600 to-amber-800',
    icon: '🥉',
  },
  silver: {
    name: 'Silver',
    commissionRate: 15,
    features: ['Advanced analytics', 'Priority support', 'Custom links', 'Monthly reports'],
    color: 'from-gray-300 to-gray-500',
    icon: '🥈',
  },
  gold: {
    name: 'Gold',
    commissionRate: 20,
    features: ['Co-marketing opportunities', 'Dedicated manager', 'Early access features', 'API access'],
    color: 'from-yellow-400 to-yellow-600',
    icon: '🥇',
  },
  platinum: {
    name: 'Platinum',
    commissionRate: 30,
    features: ['White-label options', 'Revenue share bonuses', 'VIP events', 'Custom integrations', 'Highest commission'],
    color: 'from-purple-400 to-purple-600',
    icon: '💎',
  },
};

export const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 10,
  gold: 50,
  platinum: 200,
};

export interface UsePartnerProgramResult {
  partner: Partner | null;
  isPartner: boolean;
  isLoading: boolean;
  error: Error | null;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  tierBenefits: TierBenefits;
  nextTier: { name: string; referralsNeeded: number; benefits: TierBenefits } | null;
  tierProgress: number;
  stats: {
    totalReferrals: number;
    completedReferrals: number;
    pendingReferrals: number;
    totalEarned: number;
    pendingEarnings: number;
    conversionRate: number;
  };
  referralHistory: Referral[];
  joinProgram: () => Promise<void>;
  isJoining: boolean;
  generateAffiliateLink: (campaign?: string) => string;
  refetch: () => void;
}

export function usePartnerProgram(): UsePartnerProgramResult {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isJoining, setIsJoining] = useState(false);

  // Fetch partner record
  const {
    data: partner,
    isLoading: partnerLoading,
    error: partnerError,
    refetch,
  } = useQuery({
    queryKey: ['partner', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Partner | null;
    },
    enabled: !!user?.id,
  });

  // Fetch referral history from distribution_referrals
  const { data: referralHistory = [] } = useQuery({
    queryKey: ['partner-referrals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('distribution_referrals')
        .select(`
          id,
          referrer_id,
          referred_user_id,
          referral_code,
          status,
          commission_amount,
          created_at,
          referred_user:profiles!distribution_referrals_referred_user_id_fkey(full_name, email)
        `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as Referral[];
    },
    enabled: !!user?.id,
  });

  // Join program mutation
  const joinProgram = useCallback(async () => {
    if (!user?.id) {
      toast.error('Please sign in to join the Partner Program');
      return;
    }

    setIsJoining(true);
    try {
      // Generate unique affiliate code
      const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = 'MIXX-';
        for (let i = 0; i < 6; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
      };

      const affiliateCode = generateCode();

      const { data, error } = await supabase
        .from('partners')
        .insert({
          user_id: user.id,
          affiliate_code: affiliateCode,
          tier: 'bronze',
          status: 'active',
          commission_rate: 10,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error('You are already a partner!');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Welcome to the Partner Program! 🎉');
      queryClient.invalidateQueries({ queryKey: ['partner'] });
    } catch (err) {
      console.error('Failed to join partner program:', err);
      toast.error('Failed to join program. Please try again.');
    } finally {
      setIsJoining(false);
    }
  }, [user?.id, queryClient]);

  // Generate affiliate link
  const generateAffiliateLink = useCallback((campaign?: string) => {
    const baseUrl = window.location.origin;
    const code = partner?.affiliate_code || 'MIXX-DEMO';
    let link = `${baseUrl}?ref=${code}`;
    if (campaign) {
      link += `&utm_campaign=${encodeURIComponent(campaign)}`;
    }
    return link;
  }, [partner?.affiliate_code]);

  // Calculate stats from referral history
  const stats = useMemo(() => {
    const completed = referralHistory.filter(r => r.status === 'active' || r.status === 'completed');
    const pending = referralHistory.filter(r => r.status === 'pending');
    const totalEarned = completed.reduce((sum, r) => sum + (r.commission_amount || 0), 0);
    const pendingEarnings = pending.reduce((sum, r) => sum + (r.commission_amount || 0), 0);

    return {
      totalReferrals: partner?.total_referrals || referralHistory.length,
      completedReferrals: completed.length,
      pendingReferrals: pending.length,
      totalEarned: partner?.total_commissions || totalEarned,
      pendingEarnings: partner?.pending_commissions || pendingEarnings,
      conversionRate: referralHistory.length > 0 
        ? Math.round((completed.length / referralHistory.length) * 100) 
        : 0,
    };
  }, [referralHistory, partner]);

  // Calculate tier and progression
  const tier = partner?.tier || 'bronze';
  const tierBenefits = TIER_CONFIG[tier];
  
  const nextTier = useMemo(() => {
    const tiers = ['bronze', 'silver', 'gold', 'platinum'] as const;
    const currentIndex = tiers.indexOf(tier);
    
    if (currentIndex >= tiers.length - 1) return null;
    
    const next = tiers[currentIndex + 1];
    const needed = TIER_THRESHOLDS[next] - stats.totalReferrals;
    
    return {
      name: TIER_CONFIG[next].name,
      referralsNeeded: Math.max(0, needed),
      benefits: TIER_CONFIG[next],
    };
  }, [tier, stats.totalReferrals]);

  const tierProgress = useMemo(() => {
    if (!nextTier) return 100;
    
    const currentThreshold = TIER_THRESHOLDS[tier];
    const nextThreshold = TIER_THRESHOLDS[nextTier.name.toLowerCase() as keyof typeof TIER_THRESHOLDS];
    const range = nextThreshold - currentThreshold;
    const progress = stats.totalReferrals - currentThreshold;
    
    return Math.min(100, Math.round((progress / range) * 100));
  }, [tier, nextTier, stats.totalReferrals]);

  return {
    partner,
    isPartner: !!partner,
    isLoading: partnerLoading,
    error: partnerError as Error | null,
    tier,
    tierBenefits,
    nextTier,
    tierProgress,
    stats,
    referralHistory,
    joinProgram,
    isJoining,
    generateAffiliateLink,
    refetch,
  };
}

export default usePartnerProgram;
