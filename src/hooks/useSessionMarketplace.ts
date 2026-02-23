/**
 * useSessionMarketplace — The core artist-engineer connection.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// ─── Types ───────────────────────────────────────────────────────

export interface SessionListing {
    id: string; title: string; description: string | null; session_type: string;
    visibility: string; status: string; created_at: string;
    session_state: { genre?: string; budget?: number; deadline?: string; invited_collaborator?: string | null; };
    host: { id: string; full_name: string | null; username: string | null; avatar_url: string | null; role: string | null; };
    applicant_count: number; has_applied: boolean;
}

export interface SessionApplicant {
    id: string; user_id: string; session_id: string; role: string; status: string; created_at: string;
    profile: { id: string; full_name: string | null; username: string | null; avatar_url: string | null; role: string | null; };
}

export interface SessionFilters { genre?: string; serviceType?: string; budgetMin?: number; budgetMax?: number; search?: string; }

// ─── Queries ─────────────────────────────────────────────────────

export function useOpenSessions(filters?: SessionFilters) {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['session-marketplace', 'open', filters],
        queryFn: async (): Promise<SessionListing[]> => {
            let query = supabase
                .from('collaboration_sessions')
                .select(`id, title, description, session_type, visibility, status, created_at, session_state, host_user_id,
                    profiles!collaboration_sessions_host_user_id_fkey (id, full_name, username, avatar_url, role)`)
                .eq('visibility', 'public')
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (filters?.serviceType && filters.serviceType !== 'all') query = query.eq('session_type', filters.serviceType);
            if (filters?.search) query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);

            const { data: sessions, error } = await query;
            if (error) throw error;
            if (!sessions) return [];

            const sessionIds = sessions.map(s => s.id);
            const { data: applicants } = await supabase
                .from('session_participants')
                .select('session_id, user_id')
                .in('session_id', sessionIds.length > 0 ? sessionIds : ['__none__']);

            return sessions.map(session => {
                const sessionApplicants = (applicants || []).filter((a: any) => a.session_id === session.id);
                const hostProfile = session.profiles as any;
                const sessionState = (session.session_state || {}) as SessionListing['session_state'];

                if (filters?.genre && filters.genre !== 'all' && sessionState.genre !== filters.genre) return null;
                if (filters?.budgetMin && (sessionState.budget || 0) < filters.budgetMin) return null;
                if (filters?.budgetMax && (sessionState.budget || 0) > filters.budgetMax) return null;

                return {
                    id: session.id, title: session.title || 'Untitled Session', description: session.description,
                    session_type: session.session_type || 'mixing', visibility: session.visibility || 'public',
                    status: session.status || 'active', created_at: session.created_at, session_state: sessionState,
                    host: { id: hostProfile?.id || session.host_user_id, full_name: hostProfile?.full_name || null,
                        username: hostProfile?.username || null, avatar_url: hostProfile?.avatar_url || null, role: hostProfile?.role || null },
                    applicant_count: sessionApplicants.length,
                    has_applied: user ? sessionApplicants.some((a: any) => a.user_id === user.id) : false,
                } as SessionListing;
            }).filter(Boolean) as SessionListing[];
        },
        staleTime: 30_000,
        refetchInterval: 60_000,
    });
}

export function useMyApplications() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['session-marketplace', 'my-applications', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from('session_participants')
                .select(`id, session_id, role, created_at,
                    collaboration_sessions (id, title, description, session_type, status, session_state, host_user_id,
                        profiles!collaboration_sessions_host_user_id_fkey (id, full_name, username, avatar_url))`)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        enabled: !!user,
        staleTime: 30_000,
    });
}

export function useSessionApplicants(sessionId: string) {
    return useQuery({
        queryKey: ['session-marketplace', 'applicants', sessionId],
        queryFn: async (): Promise<SessionApplicant[]> => {
            const { data, error } = await supabase
                .from('session_participants')
                .select(`id, user_id, session_id, role, created_at,
                    profiles (id, full_name, username, avatar_url, role)`)
                .eq('session_id', sessionId)
                .order('created_at', { ascending: true });
            if (error) throw error;

            return (data || []).map((row: any) => ({
                id: row.id, user_id: row.user_id, session_id: row.session_id,
                role: row.role || 'engineer', status: 'applied', created_at: row.created_at,
                profile: {
                    id: row.profiles?.id || row.user_id, full_name: row.profiles?.full_name || null,
                    username: row.profiles?.username || null, avatar_url: row.profiles?.avatar_url || null,
                    role: row.profiles?.role || null,
                },
            }));
        },
        enabled: !!sessionId,
        staleTime: 15_000,
    });
}

// ─── Mutations ───────────────────────────────────────────────────

export function useApplyToSession() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ sessionId, message }: { sessionId: string; message?: string }) => {
            if (!user) throw new Error('Please sign in to apply');
            const { data: existing } = await supabase.from('session_participants').select('id').eq('session_id', sessionId).eq('user_id', user.id).maybeSingle();
            if (existing) throw new Error('You already applied to this session');
            const { error } = await supabase.from('session_participants').insert({ session_id: sessionId, user_id: user.id, role: 'engineer' });
            if (error) throw error;
        },
        onSuccess: () => {
            toast({ title: '🎧 Application Sent!', description: 'The artist will review your profile and get back to you.' });
            queryClient.invalidateQueries({ queryKey: ['session-marketplace'] });
        },
        onError: (error) => {
            toast({ title: '❌ Could not apply', description: error instanceof Error ? error.message : 'Something went wrong', variant: 'destructive' });
        },
    });
}

export function useAcceptEngineer() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ participantId, sessionId }: { participantId: string; sessionId: string }) => {
            const { error: acceptError } = await supabase.from('session_participants').update({ is_active: true } as any).eq('id', participantId);
            if (acceptError) throw acceptError;
            const { error: sessionError } = await supabase.from('collaboration_sessions').update({ status: 'matched' }).eq('id', sessionId);
            if (sessionError) throw sessionError;
        },
        onSuccess: () => {
            toast({ title: '🤝 Engineer Accepted!', description: 'Your session is now matched. Time to make a hit.' });
            queryClient.invalidateQueries({ queryKey: ['session-marketplace'] });
        },
        onError: (error) => {
            toast({ title: '❌ Could not accept engineer', description: error instanceof Error ? error.message : 'Something went wrong', variant: 'destructive' });
        },
    });
}

export function useSessionMarketplaceStats() {
    return useQuery({
        queryKey: ['session-marketplace', 'stats'],
        queryFn: async () => {
            const { count: openCount } = await supabase.from('collaboration_sessions').select('*', { count: 'exact', head: true }).eq('visibility', 'public').eq('status', 'active');
            const { count: matchedToday } = await supabase.from('collaboration_sessions').select('*', { count: 'exact', head: true }).eq('status', 'matched').gte('created_at', new Date(Date.now() - 86400000).toISOString());
            return { openSessions: openCount || 0, matchedToday: matchedToday || 0 };
        },
        staleTime: 60_000,
    });
}
