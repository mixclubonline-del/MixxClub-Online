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

  useEffect(() => {
    if (!user) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    checkMasteringAccess();
  }, [user]);

  const checkMasteringAccess = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_mastering_subscriptions')
        .select(`
          *,
          mastering_packages (
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
        console.error('Error checking mastering access:', error);
        setHasAccess(false);
        return;
      }

      if (data) {
        // Check if subscription is still valid
        const isValid = !data.expires_at || new Date(data.expires_at) > new Date();
        const hasRemainingTracks = data.mastering_packages.track_limit === -1 || 
                                 data.tracks_used < data.mastering_packages.track_limit;
        
        const access = isValid && hasRemainingTracks;
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

  const refreshAccess = () => {
    if (user) {
      checkMasteringAccess();
    }
  };

  return {
    hasAccess,
    loading,
    subscription,
    refreshAccess
  };
};