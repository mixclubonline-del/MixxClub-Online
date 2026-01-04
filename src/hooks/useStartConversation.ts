import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function useStartConversation() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const startConversation = useCallback(async (recipientId: string, userType: 'artist' | 'engineer' = 'artist') => {
    if (!user) {
      toast.error('Please sign in to send messages');
      return null;
    }

    if (recipientId === user.id) {
      toast.error("You can't message yourself");
      return null;
    }

    try {
      // Check if conversation already exists
      const { data: existingMessages } = await supabase
        .from('direct_messages')
        .select('id')
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`)
        .limit(1);

      // Navigate to messages with recipient param
      const crmPath = userType === 'artist' ? '/artist-crm' : '/engineer-crm';
      navigate(`${crmPath}?tab=messages&recipient=${recipientId}`);

      return recipientId;
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation');
      return null;
    }
  }, [user, navigate]);

  const sendInitialMessage = useCallback(async (recipientId: string, message: string, skipNotification = false) => {
    if (!user) {
      toast.error('Please sign in to send messages');
      return false;
    }

    try {
      const { error } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          message_text: message,
        });

      if (error) throw error;
      
      // Create message notification for recipient (unless skipped, e.g. for hire requests that have their own notification)
      if (!skipNotification) {
        const senderName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Someone';
        await supabase.from('notifications').insert({
          user_id: recipientId,
          type: 'message',
          title: 'New Message',
          message: `${senderName} sent you a message`,
          action_url: '/artist-crm?tab=messages',
          metadata: { sender_id: user.id }
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      return false;
    }
  }, [user]);

  return {
    startConversation,
    sendInitialMessage,
  };
}
