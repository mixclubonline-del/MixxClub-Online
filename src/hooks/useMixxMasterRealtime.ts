import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { MixxMasterManifest } from '@/lib/mixxmaster/types';

interface RealtimeSession {
  sessionId: string;
  manifest: MixxMasterManifest;
  activeUsers: string[];
  lastUpdate: string;
}

export const useMixxMasterRealtime = (sessionId: string | null) => {
  const [session, setSession] = useState<RealtimeSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    // Subscribe to real-time updates for the session
    const channel = supabase
      .channel(`mixxmaster-session-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'mixxmaster_sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          console.log('Session updated:', payload);
          setSession(prev => ({
            ...prev!,
            manifest: payload.new.manifest_data as unknown as MixxMasterManifest,
            lastUpdate: payload.new.updated_at,
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mixxmaster_versions',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          console.log('New version created:', payload);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Fetch initial session data
    const fetchSession = async () => {
      const { data, error } = await supabase
        .from('mixxmaster_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (data && !error) {
        setSession({
          sessionId: data.id,
          manifest: data.manifest_data as unknown as MixxMasterManifest,
          activeUsers: [],
          lastUpdate: data.updated_at,
        });
      }
    };

    fetchSession();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return { session, isConnected };
};
