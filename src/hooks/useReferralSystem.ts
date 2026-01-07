import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ReferralStats {
  total: number;
  active: number;
  pending: number;
  earnings: number;
}

interface Referral {
  id: string;
  referrer_id: string;
  referred_user_id: string | null;
  referral_code: string;
  status: string;
  commission_earned: number;
  created_at: string;
  referred_user?: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
}

export function useReferralSystem() {
  const { user } = useAuth();
  const [myReferralCode, setMyReferralCode] = useState<string | null>(null);
  const [referralLink, setReferralLink] = useState<string>('');
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    total: 0,
    active: 0,
    pending: 0,
    earnings: 0,
  });
  const [outgoingReferrals, setOutgoingReferrals] = useState<Referral[]>([]);
  const [incomingReferrals, setIncomingReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate a unique referral code
  const generateCode = useCallback(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'MIXX-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }, []);

  // Fetch user's referral data
  const fetchReferralData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch user's referral code (they are the referrer)
      const { data: myReferrals, error: myError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (myError) throw myError;

      // Get or create referral code
      if (myReferrals && myReferrals.length > 0) {
        const code = myReferrals[0].referral_code;
        setMyReferralCode(code);
        setReferralLink(`${window.location.origin}/signup?ref=${code}`);
        setOutgoingReferrals(myReferrals);

        // Calculate stats
        const total = myReferrals.length;
        const active = myReferrals.filter(r => r.status === 'active' || r.status === 'completed').length;
        const pending = myReferrals.filter(r => r.status === 'pending').length;
        const earnings = myReferrals.reduce((sum, r) => sum + (r.commission_earned || 0), 0);

        setReferralStats({ total, active, pending, earnings });
      } else {
        // No referrals yet, generate a code for display purposes
        const newCode = generateCode();
        setMyReferralCode(newCode);
        setReferralLink(`${window.location.origin}/signup?ref=${newCode}`);
      }

      // Fetch referrals where user was referred (incoming)
      const { data: incoming, error: inError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referred_user_id', user.id);

      if (inError) throw inError;
      setIncomingReferrals(incoming || []);

    } catch (err) {
      console.error('Error fetching referral data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load referral data');
    } finally {
      setLoading(false);
    }
  }, [user?.id, generateCode]);

  useEffect(() => {
    fetchReferralData();
  }, [fetchReferralData]);

  // Share referral link
  const shareReferralLink = useCallback(async (platform?: 'twitter' | 'facebook' | 'email' | 'copy') => {
    if (!referralLink) {
      return { success: false, message: 'No referral link available' };
    }

    const shareText = `Join me on MixxClub! Get exclusive access to professional mixing and mastering services. Use my referral link:`;

    try {
      switch (platform) {
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralLink)}`, '_blank');
          break;
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(shareText)}`, '_blank');
          break;
        case 'email':
          window.open(`mailto:?subject=Join me on MixxClub&body=${encodeURIComponent(shareText + '\n\n' + referralLink)}`, '_blank');
          break;
        case 'copy':
        default:
          await navigator.clipboard.writeText(referralLink);
          toast.success('Referral link copied to clipboard!');
          break;
      }
      return { success: true, message: 'Shared successfully' };
    } catch (err) {
      console.error('Error sharing referral link:', err);
      return { success: false, message: 'Failed to share referral link' };
    }
  }, [referralLink]);

  // Copy referral link
  const copyReferralLink = useCallback(async () => {
    if (!referralLink) return;
    
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied to clipboard!');
    } catch (err) {
      console.error('Error copying referral link:', err);
      toast.error('Failed to copy referral link');
    }
  }, [referralLink]);

  // Generate new referral code
  const generateNewReferralCode = useCallback(async () => {
    if (!user?.id) {
      toast.error('Please log in to generate a referral code');
      return;
    }

    try {
      const newCode = generateCode();
      
      // Create a new referral entry with this code
      const { error } = await supabase
        .from('referrals')
        .insert({
          referrer_id: user.id,
          referral_code: newCode,
          status: 'pending',
          commission_earned: 0,
        });

      if (error) throw error;

      setMyReferralCode(newCode);
      setReferralLink(`${window.location.origin}/signup?ref=${newCode}`);
      toast.success('New referral code generated!');
      
      // Refresh data
      await fetchReferralData();
    } catch (err) {
      console.error('Error generating referral code:', err);
      toast.error('Failed to generate new referral code');
    }
  }, [user?.id, generateCode, fetchReferralData]);

  // Get total referral earnings
  const getTotalReferralEarnings = useCallback(() => {
    return referralStats.earnings;
  }, [referralStats.earnings]);

  // Get pending rewards
  const getPendingRewards = useCallback(() => {
    return outgoingReferrals
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + (r.commission_earned || 0), 0);
  }, [outgoingReferrals]);

  return {
    myReferralCode,
    referralLink,
    referralStats,
    outgoingReferrals,
    incomingReferrals,
    loading,
    error,
    shareReferralLink,
    copyReferralLink,
    getTotalReferralEarnings,
    getPendingRewards,
    generateNewReferralCode,
    refreshData: fetchReferralData,
  };
}
