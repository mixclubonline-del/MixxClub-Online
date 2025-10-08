import { useEffect, useRef } from 'react';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AUTOSAVE_INTERVAL = 30000; // 30 seconds

export const useSessionSync = (sessionId: string | null) => {
  const { toast } = useToast();
  const { tracks, tempo, masterVolume } = useAIStudioStore();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSaveRef = useRef<string>('');

  useEffect(() => {
    if (!sessionId) return;

    const saveSession = async () => {
      try {
        const sessionState = JSON.stringify({
          tracks: tracks.map(t => ({
            id: t.id,
            name: t.name,
            volume: t.volume,
            pan: t.pan,
            muted: t.mute,
            solo: t.solo,
            color: t.color,
            effects: t.effects,
            regions: t.regions,
          })),
          tempo,
          masterVolume,
          timestamp: Date.now(),
        });

        // Only save if state changed
        if (sessionState === lastSaveRef.current) return;

        await supabase
          .from('collaboration_sessions')
          .update({
            session_metadata: JSON.parse(sessionState),
            updated_at: new Date().toISOString(),
          })
          .eq('id', sessionId);

        lastSaveRef.current = sessionState;
        
        console.log('Session auto-saved');
      } catch (error) {
        console.error('Error saving session:', error);
        toast({
          title: "Auto-save Failed",
          description: "Could not save session state",
          variant: "destructive",
        });
      }
    };

    // Auto-save on interval
    const intervalId = setInterval(saveSession, AUTOSAVE_INTERVAL);

    // Save on state change (debounced)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(saveSession, 2000);

    return () => {
      clearInterval(intervalId);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [sessionId, tracks, tempo, masterVolume, toast]);

  // Real-time updates subscription
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`session:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'collaboration_sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          console.log('Session updated by another user:', payload);
          // Could sync state here if needed
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);
};
