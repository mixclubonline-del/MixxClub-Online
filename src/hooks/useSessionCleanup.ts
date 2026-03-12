import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useSessionCleanup = (sessionId: string | null) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!sessionId || !user) return;

    // Mark user as active in session
    const markActive = async () => {
      await supabase
        .from('session_participants')
        .update({ is_active: true })
        .eq('session_id', sessionId)
        .eq('user_id', user.id);
    };

    markActive();

    // Cleanup function
    const cleanup = async () => {
      
      
      // Mark participant as inactive
      await supabase
        .from('session_participants')
        .update({ 
          is_active: false,
          left_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)
        .eq('user_id', user.id);

      // Check if session should be ended (no active participants)
      const { data: activeParticipants } = await supabase
        .from('session_participants')
        .select('id')
        .eq('session_id', sessionId)
        .eq('is_active', true);

      if (!activeParticipants || activeParticipants.length === 0) {
        // End the session if no one is active
        await supabase
          .from('collaboration_sessions')
          .update({ 
            status: 'ended',
            ended_at: new Date().toISOString()
          })
          .eq('id', sessionId);
        
        console.log('[SessionCleanup] Session ended - no active participants');
      }
    };

    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [sessionId, user]);

  // Handle browser close/refresh
  useEffect(() => {
    if (!sessionId || !user) return;

    const handleBeforeUnload = async () => {
      // Use sendBeacon for guaranteed delivery
      const data = JSON.stringify({
        session_id: sessionId,
        user_id: user.id,
        action: 'leave'
      });

      // Mark as inactive
      await supabase
        .from('session_participants')
        .update({ 
          is_active: false,
          left_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)
        .eq('user_id', user.id);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionId, user]);
};
