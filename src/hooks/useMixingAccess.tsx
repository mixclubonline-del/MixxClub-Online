import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface MixingSubscription {
  id: string;
  package_id: string;
  status: string;
  tracks_used: number;
  expires_at: string | null;
  mixing_packages: {
    name: string;
    track_limit: number;
  };
}

export const useMixingAccess = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<MixingSubscription | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    checkMixingAccess();
  }, [user]);

  const checkMixingAccess = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_mixing_subscriptions')
        .select(`
          *,
          mixing_packages (
            name,
            track_limit
          )
        `)
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error checking mixing access:', error);
        setHasAccess(false);
        return;
      }

      if (data) {
        // Check if subscription is still valid
        const isValid = !data.expires_at || new Date(data.expires_at) > new Date();
        const hasRemainingTracks = data.mixing_packages.track_limit === -1 || 
                                 data.tracks_used < data.mixing_packages.track_limit;
        
        const access = isValid && hasRemainingTracks;
        setHasAccess(access);
        setSubscription(data);
      } else {
        setHasAccess(false);
        setSubscription(null);
      }
    } catch (error) {
      console.error('Error checking mixing access:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  const refreshAccess = () => {
    if (user) {
      checkMixingAccess();
    }
  };

  return {
    hasAccess,
    loading,
    subscription,
    refreshAccess
  };
};