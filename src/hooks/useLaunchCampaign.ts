/**
 * useLaunchCampaign — Hooks for the First 100 Launch Campaign Engine
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const fromAny = (table: string) => (supabase.from as any)(table);

// ── Invite Waves ──

export interface InviteWave {
  id: string;
  wave_label: string;
  wave_number: number;
  role_filter: string | null;
  target_count: number;
  actual_sent: number;
  status: string;
  sent_at: string | null;
  sent_by: string | null;
  created_at: string;
}

export function useInviteWaves() {
  return useQuery({
    queryKey: ['invite-waves'],
    queryFn: async () => {
      const { data, error } = await fromAny('invite_waves')
        .select('*')
        .order('wave_number', { ascending: true });
      if (error) throw error;
      return (data || []) as InviteWave[];
    },
  });
}

export function useCreateInviteWave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (wave: { wave_label: string; wave_number: number; role_filter?: string; target_count: number }) => {
      const { data, error } = await fromAny('invite_waves')
        .insert(wave)
        .select()
        .single();
      if (error) throw error;
      return data as InviteWave;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invite-waves'] });
      toast.success('Wave created');
    },
    onError: () => toast.error('Failed to create wave'),
  });
}

export function useSendInviteWave() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (waveId: string) => {
      const { data, error } = await supabase.functions.invoke('process-invite-wave', {
        body: { wave_id: waveId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invite-waves'] });
      queryClient.invalidateQueries({ queryKey: ['waitlist-entries'] });
      queryClient.invalidateQueries({ queryKey: ['waitlist-stats'] });
      toast.success('Invite wave sent!');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to send wave'),
  });
}

// ── Launch Campaign Stats ──

export function useLaunchCampaignStats() {
  return useQuery({
    queryKey: ['launch-campaign-stats'],
    queryFn: async () => {
      const [
        { count: waitlistTotal },
        { count: invitedCount },
        { count: convertedCount },
        { data: wavesData },
        { count: profileCount },
      ] = await Promise.all([
        fromAny('waitlist_signups').select('*', { count: 'exact', head: true }),
        fromAny('waitlist_signups').select('*', { count: 'exact', head: true }).eq('status', 'invited'),
        fromAny('waitlist_signups').select('*', { count: 'exact', head: true }).eq('status', 'converted'),
        fromAny('invite_waves').select('actual_sent').eq('status', 'sent'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
      ]);

      const totalInvitesSent = (wavesData || []).reduce((sum: number, w: any) => sum + (w.actual_sent || 0), 0);

      return {
        waitlistTotal: waitlistTotal || 0,
        invitedCount: invitedCount || 0,
        convertedCount: convertedCount || 0,
        totalInvitesSent,
        registeredUsers: profileCount || 0,
        target: 100,
        remaining: Math.max(0, 100 - (profileCount || 0)),
        progress: Math.min(100, ((profileCount || 0) / 100) * 100),
      };
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

// ── Referral Stats (waitlist) ──

export function useWaitlistReferralStats(referralCode?: string) {
  return useQuery({
    queryKey: ['waitlist-referral-stats', referralCode],
    queryFn: async () => {
      if (!referralCode) return { count: 0 };
      const { count, error } = await fromAny('waitlist_signups')
        .select('*', { count: 'exact', head: true })
        .eq('referred_by', referralCode);
      if (error) throw error;
      return { count: count || 0 };
    },
    enabled: !!referralCode,
  });
}

// ── Launch Checklist ──

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  check: () => Promise<boolean>;
}

export function useLaunchChecklist() {
  return useQuery({
    queryKey: ['launch-checklist'],
    queryFn: async () => {
      const checks = await Promise.all([
        // Check waitlist has signups
        fromAny('waitlist_signups').select('*', { count: 'exact', head: true }).then(({ count }: any) => ({
          id: 'waitlist',
          label: 'Waitlist has signups',
          description: 'At least 10 people on the waitlist',
          passed: (count || 0) >= 10,
        })),
        // Check Stripe connected
        supabase.from('payments').select('id', { count: 'exact', head: true }).then(({ error }) => ({
          id: 'stripe',
          label: 'Stripe connected',
          description: 'Payment processing is configured',
          passed: !error,
        })),
        // Check seed data
        supabase.from('courses').select('id', { count: 'exact', head: true }).then(({ count }) => ({
          id: 'content',
          label: 'Seed content present',
          description: 'At least one course or beat available',
          passed: (count || 0) >= 1,
        })),
        // Check invite codes exist
        fromAny('invite_codes').select('*', { count: 'exact', head: true }).eq('is_active', true).then(({ count }: any) => ({
          id: 'invite_codes',
          label: 'Active invite codes',
          description: 'At least one active invite code',
          passed: (count || 0) >= 1,
        })),
        // Check admin exists
        supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('role', 'admin').then(({ count }) => ({
          id: 'admin',
          label: 'Admin account configured',
          description: 'At least one admin user exists',
          passed: (count || 0) >= 1,
        })),
      ]);

      return checks;
    },
    staleTime: 60_000,
  });
}
