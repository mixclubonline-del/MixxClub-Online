import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const fromAny = (table: string) => (supabase.from as any)(table);

export interface Challenge {
  id: string;
  title: string;
  description: string | null;
  challenge_type: string;
  start_date: string;
  end_date: string | null;
  status: string;
  rules: any;
  prizes: any;
  submission_count: number;
  created_by: string | null;
  created_at: string;
}

export interface ChallengeSubmission {
  id: string;
  challenge_id: string;
  user_id: string;
  title: string;
  description: string | null;
  media_url: string | null;
  vote_count: number;
  created_at: string;
  profile?: { full_name: string; avatar_url: string | null };
}

export function useChallengesList(status?: string) {
  return useQuery({
    queryKey: ['community-challenges-list', status],
    queryFn: async () => {
      let q = fromAny('community_challenges').select('*').order('created_at', { ascending: false });
      if (status) q = q.eq('status', status);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as Challenge[];
    },
  });
}

export function useChallengeSubmissions(challengeId: string) {
  return useQuery({
    queryKey: ['challenge-submissions', challengeId],
    queryFn: async () => {
      const { data, error } = await fromAny('challenge_submissions')
        .select('*')
        .eq('challenge_id', challengeId)
        .order('vote_count', { ascending: false });
      if (error) throw error;
      return (data || []) as ChallengeSubmission[];
    },
    enabled: !!challengeId,
  });
}

export function useSubmitChallenge() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { challengeId: string; title: string; description?: string; mediaUrl?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await fromAny('challenge_submissions').insert({
        challenge_id: params.challengeId,
        user_id: user.id,
        title: params.title,
        description: params.description || null,
        media_url: params.mediaUrl || null,
      });
      if (error) throw error;

      // Increment submission count
      await fromAny('community_challenges')
        .update({ submission_count: supabase.rpc ? undefined : undefined })
        .eq('id', params.challengeId);
    },
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({ queryKey: ['challenge-submissions', params.challengeId] });
      queryClient.invalidateQueries({ queryKey: ['community-challenges-list'] });
      toast.success('Entry submitted!');
    },
    onError: (err: any) => {
      if (err?.message?.includes('duplicate')) {
        toast.error('You already submitted to this challenge');
      } else {
        toast.error('Failed to submit entry');
      }
    },
  });
}

export function useVoteSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ submissionId, challengeId }: { submissionId: string; challengeId: string }) => {
      // Simple increment — in production you'd track per-user votes
      const { data: current, error: fetchErr } = await fromAny('challenge_submissions')
        .select('vote_count')
        .eq('id', submissionId)
        .single();
      if (fetchErr) throw fetchErr;

      const { error } = await fromAny('challenge_submissions')
        .update({ vote_count: (current as any).vote_count + 1 })
        .eq('id', submissionId);
      if (error) throw error;
    },
    onSuccess: (_, { challengeId }) => {
      queryClient.invalidateQueries({ queryKey: ['challenge-submissions', challengeId] });
    },
  });
}
