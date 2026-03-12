/**
 * useAdminSupport — Hook for admin support inbox CRUD + reply actions.
 * Manages contact_submissions lifecycle: fetch, filter, status update, reply.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type SubmissionStatus = 'new' | 'in_progress' | 'resolved';

export function useAdminSupport(statusFilter: SubmissionStatus | 'all' = 'all', search: string = '') {
  const queryClient = useQueryClient();

  const submissions = useQuery({
    queryKey: ['admin-support', statusFilter, search],
    queryFn: async () => {
      let query = supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,message.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 30_000,
  });

  const unreadCount = useQuery({
    queryKey: ['admin-support-unread'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('contact_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');
      if (error) throw error;
      return count || 0;
    },
    staleTime: 30_000,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: SubmissionStatus }) => {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support'] });
      queryClient.invalidateQueries({ queryKey: ['admin-support-unread'] });
      toast.success('Status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  const sendReply = useMutation({
    mutationFn: async ({ submissionId, recipientEmail, recipientName, replyMessage }: {
      submissionId: string;
      recipientEmail: string;
      recipientName: string;
      replyMessage: string;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('admin-reply-contact', {
        body: { submissionId, recipientEmail, recipientName, replyMessage },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support'] });
      queryClient.invalidateQueries({ queryKey: ['admin-support-unread'] });
      toast.success('Reply sent successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to send reply'),
  });

  return {
    submissions,
    unreadCount,
    updateStatus,
    sendReply,
  };
}
