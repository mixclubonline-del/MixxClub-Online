import { useState, useEffect, useCallback } from 'react';
import { useMixingAccess } from './useMixingAccess';
import { useMasteringAccess } from './useMasteringAccess';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ServiceAccessState {
  mixingAccess: boolean;
  masteringAccess: boolean;
  collaborationAccess: boolean;
  loading: boolean;
  mixingSubscription: ReturnType<typeof useMixingAccess>['subscription'];
  masteringSubscription: ReturnType<typeof useMasteringAccess>['subscription'];
  mixingPackageName: string | null;
  masteringPackageName: string | null;
  refreshAccess: () => Promise<void>;
}

export const useServiceAccess = (): ServiceAccessState => {
  const { user } = useAuth();
  const mixingState = useMixingAccess();
  const masteringState = useMasteringAccess();
  const [collaborationAccess, setCollaborationAccess] = useState(false);
  const [collaborationLoading, setCollaborationLoading] = useState(true);

  const checkCollaborationAccess = useCallback(async () => {
    if (!user?.id) {
      setCollaborationAccess(false);
      setCollaborationLoading(false);
      return;
    }

    try {
      setCollaborationLoading(true);

      // Check if user has any active collaboration sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('session_participants')
        .select('session_id')
        .eq('user_id', user.id)
        .limit(1);

      if (sessionsError) {
        console.error('Error checking collaboration access:', sessionsError);
        setCollaborationAccess(false);
        return;
      }

      // User has collaboration access if they've participated in any session
      // or if they have mixing/mastering access
      const hasCollabHistory = sessions && sessions.length > 0;
      const hasServiceAccess = mixingState.hasAccess || masteringState.hasAccess;
      
      setCollaborationAccess(hasCollabHistory || hasServiceAccess);
    } catch (err) {
      console.error('Error in checkCollaborationAccess:', err);
      setCollaborationAccess(false);
    } finally {
      setCollaborationLoading(false);
    }
  }, [user?.id, mixingState.hasAccess, masteringState.hasAccess]);

  useEffect(() => {
    checkCollaborationAccess();
  }, [checkCollaborationAccess]);

  const refreshAccess = useCallback(async () => {
    await Promise.all([
      mixingState.refreshAccess(),
      masteringState.refreshAccess(),
      checkCollaborationAccess(),
    ]);
  }, [mixingState, masteringState, checkCollaborationAccess]);

  const loading = mixingState.loading || masteringState.loading || collaborationLoading;

  return {
    mixingAccess: mixingState.hasAccess,
    masteringAccess: masteringState.hasAccess,
    collaborationAccess,
    loading,
    mixingSubscription: mixingState.subscription,
    masteringSubscription: masteringState.subscription,
    mixingPackageName: mixingState.packageName,
    masteringPackageName: masteringState.packageName,
    refreshAccess,
  };
};
