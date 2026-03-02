/**
 * useUserProjects — Shared cached query for user project data.
 * 
 * Single source of truth for projects across Dashboard, Growth,
 * ActiveWork, and CommunityChallenges to eliminate duplicate queries.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useUserProjects(userId: string | undefined, role: 'artist' | 'engineer' | 'producer' = 'artist') {
    return useQuery({
        queryKey: ['user-projects', userId, role],
        queryFn: async () => {
            if (!userId) return [];

            // Engineers are linked via engineer_id, others via user_id (client)
            const field = role === 'engineer' ? 'engineer_id' : 'user_id';

            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq(field, userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        },
        enabled: !!userId,
        staleTime: 60_000,
    });
}
