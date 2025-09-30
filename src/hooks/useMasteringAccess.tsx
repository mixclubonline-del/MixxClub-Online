import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface MasteringSubscription {
  id: string;
  package_id: string;
  status: string;
  tracks_used: number;
  expires_at: string | null;
  mastering_packages: {
    name: string;
    track_limit: number;
  };
}

export const useMasteringAccess = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<MasteringSubscription | null>(null);
  const { user } = useAuth();

  const checkAccess = async () => {
    if (!user) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_mastering_subscriptions')
        .select(`
          *,
          mastering_packages (
            name,
            track_limit
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Check if subscription is valid
        const isExpired = data.expires_at && new Date(data.expires_at) < new Date();
        const hasTracksLeft = data.mastering_packages.track_limit === -1 || 
                            data.tracks_used < data.mastering_packages.track_limit;
        
        const access = !isExpired && hasTracksLeft;
        setHasAccess(access);
        setSubscription(data);
      } else {
        setHasAccess(false);
        setSubscription(null);
      }
    } catch (error) {
      console.error('Error checking mastering access:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAccess();
  }, [user]);

  const incrementTrackUsage = async () => {
    if (!subscription) return;

    try {
      const { error } = await supabase
        .from('user_mastering_subscriptions')
        .update({ tracks_used: subscription.tracks_used + 1 })
        .eq('id', subscription.id);

      if (error) throw error;

      // Update local state
      setSubscription(prev => prev ? {
        ...prev,
        tracks_used: prev.tracks_used + 1
      } : null);

      // Recheck access after incrementing
      await checkAccess();
    } catch (error) {
      console.error('Error incrementing track usage:', error);
    }
  };

  return {
    hasAccess,
    loading,
    subscription,
    checkAccess,
    incrementTrackUsage
  };
};