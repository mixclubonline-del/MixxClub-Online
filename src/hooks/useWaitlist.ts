/**
 * useWaitlist — Pre-launch waitlist signup, stats, and management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const fromAny = (table: string) => (supabase.from as any)(table);

export interface WaitlistSignup {
    id: string; email: string; full_name: string | null;
    role_interest: 'artist' | 'engineer' | 'producer' | 'fan' | null;
    social_handle: string | null; referral_source: string | null; invite_code_used: string | null;
    position: number; status: 'waiting' | 'invited' | 'converted';
    created_at: string; invited_at: string | null; converted_at: string | null;
}

export interface WaitlistFormData {
    email: string; full_name?: string; role_interest?: 'artist' | 'engineer' | 'producer' | 'fan';
    social_handle?: string; referral_source?: string; invite_code?: string;
}

export function useWaitlistSignup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: WaitlistFormData): Promise<{ position: number; hasInviteCode: boolean }> => {
            let inviteCodeUsed: string | null = null;
            if (data.invite_code) {
                const { data: codeData, error: codeError } = await fromAny('invite_codes')
                    .select('*').eq('code', data.invite_code.toUpperCase().trim()).eq('is_active', true).maybeSingle();
                if (codeError) throw codeError;
                if (!codeData) throw new Error('Invalid invite code');
                const cd = codeData as any;
                if (cd.expires_at && new Date(cd.expires_at) < new Date()) throw new Error('This invite code has expired');
                if (cd.times_used >= cd.max_uses) throw new Error('This invite code has reached its maximum uses');
                inviteCodeUsed = cd.code;
                await fromAny('invite_codes').update({ times_used: cd.times_used + 1 }).eq('id', cd.id);
            }

            const { data: signup, error } = await fromAny('waitlist_signups')
                .insert({
                    email: data.email.toLowerCase().trim(), full_name: data.full_name || null,
                    role_interest: data.role_interest || null, social_handle: data.social_handle || null,
                    referral_source: data.referral_source || null, invite_code_used: inviteCodeUsed,
                    referred_by: data.referral_source?.startsWith('ref:') ? data.referral_source.replace('ref:', '') : null,
                    status: inviteCodeUsed ? 'invited' : 'waiting',
                    invited_at: inviteCodeUsed ? new Date().toISOString() : null,
                }).select('position').single();

            if (error) {
                if (error.code === '23505') throw new Error('This email is already on the waitlist');
                throw error;
            }
            return { position: (signup as any).position, hasInviteCode: !!inviteCodeUsed };
        },
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['waitlist-stats'] }); },
        onError: (error: Error) => { toast.error(error.message); },
    });
}

export function useWaitlistStats() {
    return useQuery({
        queryKey: ['waitlist-stats'],
        queryFn: async () => {
            const [{ count: totalSignups }, { count: todaySignups }, { count: invitedCount }, { count: convertedCount }] = await Promise.all([
                fromAny('waitlist_signups').select('*', { count: 'exact', head: true }),
                fromAny('waitlist_signups').select('*', { count: 'exact', head: true }).gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
                fromAny('waitlist_signups').select('*', { count: 'exact', head: true }).eq('status', 'invited'),
                fromAny('waitlist_signups').select('*', { count: 'exact', head: true }).eq('status', 'converted'),
            ]);
            return { totalSignups: totalSignups || 0, todaySignups: todaySignups || 0, invitedCount: invitedCount || 0, convertedCount: convertedCount || 0 };
        },
        staleTime: 30_000,
    });
}

export function useWaitlistEntries(page = 0, pageSize = 20) {
    return useQuery({
        queryKey: ['waitlist-entries', page, pageSize],
        queryFn: async () => {
            const from = page * pageSize;
            const to = from + pageSize - 1;
            const { data, error, count } = await fromAny('waitlist_signups').select('*', { count: 'exact' }).order('position', { ascending: true }).range(from, to);
            if (error) throw error;
            return { entries: (data || []) as WaitlistSignup[], totalCount: count || 0, page, pageSize };
        },
    });
}

export function useSendInvite() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (signupId: string) => {
            const { error } = await fromAny('waitlist_signups').update({ status: 'invited', invited_at: new Date().toISOString() }).eq('id', signupId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['waitlist-entries'] });
            queryClient.invalidateQueries({ queryKey: ['waitlist-stats'] });
            toast.success('Invite sent');
        },
    });
}
