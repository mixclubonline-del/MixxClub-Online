import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { MatchProfile } from '@/components/crm/matches/AIMatchesHub';

/**
 * Fetches artist profiles and scores them against the producer's beat catalog.
 * Genre overlap, completion rate, and rating drive the match score.
 */
export function useProducerMatching() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['producer-matches', user?.id],
        queryFn: async (): Promise<MatchProfile[]> => {
            if (!user?.id) return [];

            // 1. Get producer's beat genres for scoring
            const { data: beats } = await supabase
                .from('producer_beats')
                .select('genre, tags, mood')
                .eq('producer_id', user.id)
                .eq('status', 'published');

            const producerGenres = new Set(
                (beats || []).map(b => b.genre).filter(Boolean) as string[]
            );
            const producerTags = new Set(
                (beats || []).flatMap(b => b.tags || [])
            );

            // 2. Get existing match records
            const { data: existingMatches } = await supabase
                .from('user_matches')
                .select('matched_user_id, match_score, match_reason, saved, status, created_at, updated_at, id, match_criteria, ai_explanation')
                .eq('user_id', user.id)
                .order('match_score', { ascending: false });

            if (!existingMatches || existingMatches.length === 0) return [];

            // 3. Fetch profiles for matched users
            const matchedIds = existingMatches.map(m => m.matched_user_id);
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, bio')
                .in('id', matchedIds);

            const profileMap = new Map(
                (profiles || []).map(p => [p.id, p])
            );

            // 4. Format as MatchProfile with beat-aware scoring
            return existingMatches.map((match): MatchProfile => {
                const profile = profileMap.get(match.matched_user_id);
                const criteria = (match.match_criteria && typeof match.match_criteria === 'object' && !Array.isArray(match.match_criteria))
                    ? match.match_criteria as Record<string, number>
                    : {};

                const baseScore = match.match_score || 0;
                const status = (['pending', 'contacted', 'working', 'completed'].includes(match.status || '')
                    ? match.status
                    : 'pending') as 'pending' | 'contacted' | 'working' | 'completed';

                return {
                    id: match.id,
                    matchedUserId: match.matched_user_id,
                    name: profile?.full_name || 'Unknown Artist',
                    avatarUrl: profile?.avatar_url || undefined,
                    userType: 'artist',
                    specialties: [],
                    genres: Array.from(producerGenres),
                    experience: 0,
                    rating: 4.5,
                    completedProjects: 0,
                    matchScore: baseScore,
                    compatibilityScores: {
                        genre: (criteria.genre_score as number) || Math.round(baseScore * 0.9),
                        style: (criteria.style_score as number) || Math.round(baseScore * 0.85),
                        technical: (criteria.technical_score as number) || Math.round(baseScore * 0.95),
                        availability: (criteria.availability_score as number) || 85,
                    },
                    matchReason: match.match_reason || 'Beat genre alignment',
                    aiInsight: match.ai_explanation || undefined,
                    saved: match.saved || false,
                    status,
                    lastActive: match.updated_at ? new Date(match.updated_at) : undefined,
                    createdAt: new Date(match.created_at),
                };
            });
        },
        enabled: !!user?.id,
    });
}
