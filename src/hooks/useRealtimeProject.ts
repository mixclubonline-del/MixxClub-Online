import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

type RealtimeUpdate = {
  type: 'chatMessage' | 'fileUploaded' | 'milestoneUpdated' | 'dailyStreakUpdated' | 'taskUpdate' | 'commentAdded';
  data: any;
};

export const useRealtimeProject = (projectId: string, onUpdate: (update: RealtimeUpdate) => void) => {
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!projectId) return;

    // Create a channel for this specific project
    const channel = supabase
      .channel(`project-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'project_messages'
        },
        (payload) => {
          if (payload.new.project_id === projectId) {
            onUpdate({
              type: 'chatMessage',
              data: {
                id: payload.new.id,
                sender: payload.new.sender_id,
                text: payload.new.content,
                timestamp: payload.new.created_at
              }
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audio_files'
        },
        (payload) => {
          if (payload.new.project_id === projectId) {
            onUpdate({
              type: 'fileUploaded',
              data: {
                id: payload.new.id,
                name: payload.new.file_name,
                url: payload.new.file_path,
                uploadedBy: payload.new.uploaded_by
              }
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tasks'
        },
        (payload) => {
          if (payload.new.project_id === projectId) {
            onUpdate({
              type: 'taskUpdate',
              data: payload.new
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'collaboration_comments'
        },
        (payload) => {
          if (payload.new.project_id === projectId) {
            onUpdate({
              type: 'commentAdded',
              data: payload.new
            });
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [projectId, onUpdate]);

  return channelRef.current;
};