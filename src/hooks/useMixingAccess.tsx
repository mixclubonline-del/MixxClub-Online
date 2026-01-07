import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MixingSubscription {
  id: string;
  user_id: string;
  package_name: string;
  status: string | null;
  expires_at: string | null;
  started_at: string;
  created_at: string;
  updated_at: string;
}

interface MixingAccessState {
  hasAccess: boolean;
  loading: boolean;
  subscription: MixingSubscription | null;
  packageName: string | null;
  expiresAt: Date | null;
  refreshAccess: () => Promise<void>;
}

export const useMixingAccess = (): MixingAccessState => {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<MixingSubscription | null>(null);
  const [packageName, setPackageName] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  const checkAccess = useCallback(async () => {
    if (!user?.id) {
      setHasAccess(false);
      setSubscription(null);
      setPackageName(null);
      setExpiresAt(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Query active mixing subscriptions
      const { data, error } = await supabase
        .from('user_mixing_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error checking mixing access:', error);
        setHasAccess(false);
        setSubscription(null);
        return;
      }

      if (data) {
        // Check if subscription is still valid (not expired)
        const isExpired = data.expires_at ? new Date(data.expires_at) < new Date() : false;
        const isValid = !isExpired;

        setHasAccess(isValid);
        setSubscription(data);
        setPackageName(data.package_name);
        setExpiresAt(data.expires_at ? new Date(data.expires_at) : null);
      } else {
        setHasAccess(false);
        setSubscription(null);
        setPackageName(null);
        setExpiresAt(null);
      }
    } catch (err) {
      console.error('Error in useMixingAccess:', err);
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
      .channel('mixing-subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_mixing_subscriptions',
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
    packageName,
    expiresAt,
    refreshAccess: checkAccess,
  };
};
