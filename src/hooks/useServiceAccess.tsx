import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ServiceSubscription {
  id: string;
  package_id: string;
  status: string;
  tracks_used: number;
  expires_at: string | null;
}

interface MixingSubscription extends ServiceSubscription {
  mixing_packages: {
    name: string;
    track_limit: number;
  };
}

interface MasteringSubscription extends ServiceSubscription {
  mastering_packages: {
    name: string;
    track_limit: number;
  };
}

export const useServiceAccess = () => {
  const [mixingAccess, setMixingAccess] = useState(false);
  const [masteringAccess, setMasteringAccess] = useState(false);
  const [collaborationAccess, setCollaborationAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mixingSubscription, setMixingSubscription] = useState<MixingSubscription | null>(null);
  const [masteringSubscription, setMasteringSubscription] = useState<MasteringSubscription | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setMixingAccess(false);
      setMasteringAccess(false);
      setCollaborationAccess(false);
      setLoading(false);
      return;
    }

    checkServiceAccess();
  }, [user]);

  const checkServiceAccess = async () => {
    try {
      setLoading(true);
      
      // Check mixing access
      const { data: mixingData, error: mixingError } = await supabase
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

      if (!mixingError && mixingData) {
        const isValid = !mixingData.expires_at || new Date(mixingData.expires_at) > new Date();
        const hasRemainingTracks = mixingData.mixing_packages.track_limit === -1 || 
                                 mixingData.tracks_used < mixingData.mixing_packages.track_limit;
        
        setMixingAccess(isValid && hasRemainingTracks);
        setMixingSubscription(mixingData as MixingSubscription);
      }

      // Check mastering access
      const { data: masteringData, error: masteringError } = await supabase
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

      if (!masteringError && masteringData) {
        const isValid = !masteringData.expires_at || new Date(masteringData.expires_at) > new Date();
        const hasRemainingTracks = masteringData.mastering_packages.track_limit === -1 || 
                                 masteringData.tracks_used < masteringData.mastering_packages.track_limit;
        
        setMasteringAccess(isValid && hasRemainingTracks);
        setMasteringSubscription(masteringData as MasteringSubscription);
      }

      // Collaboration access if user has either service
      setCollaborationAccess(
        (mixingData && mixingData.status === 'active') || 
        (masteringData && masteringData.status === 'active')
      );
    } catch (error) {
      console.error('Error checking service access:', error);
      setMixingAccess(false);
      setMasteringAccess(false);
      setCollaborationAccess(false);
    } finally {
      setLoading(false);
    }
  };

  const refreshAccess = () => {
    if (user) {
      checkServiceAccess();
    }
  };

  return {
    mixingAccess,
    masteringAccess,
    collaborationAccess,
    loading,
    mixingSubscription,
    masteringSubscription,
    refreshAccess
  };
};
