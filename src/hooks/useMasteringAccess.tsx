import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MasteringPackage {
  id: string;
  name: string;
  track_limit: number;
  features: unknown;
}

interface MasteringSubscription {
  id: string;
  user_id: string;
  package_id: string;
  status: string | null;
  expires_at: string | null;
  started_at: string;
  created_at: string;
  updated_at: string;
  mastering_packages?: MasteringPackage;
  tracks_used?: number;
}

interface MasteringAccessState {
  hasAccess: boolean;
  loading: boolean;
  subscription: MasteringSubscription | null;
  expiresAt: Date | null;
  packageName: string | null;
  trackLimit: number;
  refreshAccess: () => Promise<void>;
}

export const useMasteringAccess = (): MasteringAccessState => {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<MasteringSubscription | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [packageName, setPackageName] = useState<string | null>(null);
  const [trackLimit, setTrackLimit] = useState(0);

  const checkAccess = useCallback(async () => {
    if (!user?.id) {
      setHasAccess(false);
      setSubscription(null);
      setExpiresAt(null);
      setPackageName(null);
      setTrackLimit(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Query active mastering subscriptions with package details
      const { data, error } = await supabase
        .from('user_mastering_subscriptions')
        .select(`
          *,
          mastering_packages (
            id,
            name,
            track_limit,
            features
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error checking mastering access:', error);
        setHasAccess(false);
        setSubscription(null);
        return;
      }

      if (data) {
        // Check if subscription is still valid (not expired)
        const isExpired = data.expires_at ? new Date(data.expires_at) < new Date() : false;
        const isValid = !isExpired;

        setHasAccess(isValid);
        setSubscription(data as MasteringSubscription);
        setExpiresAt(data.expires_at ? new Date(data.expires_at) : null);
        setPackageName(data.mastering_packages?.name || null);
        setTrackLimit(data.mastering_packages?.track_limit || 0);
      } else {
        setHasAccess(false);
        setSubscription(null);
        setExpiresAt(null);
        setPackageName(null);
        setTrackLimit(0);
      }
    } catch (err) {
      console.error('Error in useMasteringAccess:', err);
      setHasAccess(false);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  // Set up realtime subscription for changes
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('mastering-subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_mastering_subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          checkAccess();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, checkAccess]);

  return {
    hasAccess,
    loading,
    subscription,
    expiresAt,
    packageName,
    trackLimit,
    refreshAccess: checkAccess,
  };
};
