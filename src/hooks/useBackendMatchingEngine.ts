/**
 * Hook for matching engine integration with backend
 * Provides interface to Supabase matching engine service
 */

import { useEffect, useState, useCallback } from 'react';
import { MatchingEngineService, type MatchResult, type EngineerProfile } from '@/services/matchingEngineService';

export function useBackendMatchingEngine(projectId: string) {
    const [matches, setMatches] = useState<MatchResult[]>([]);
    const [engineers, setEngineers] = useState<EngineerProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const findMatches = useCallback(async (limit = 5) => {
        setLoading(true);
        setError(null);
        try {
            const results = await MatchingEngineService.findMatches(projectId, limit);
            setMatches(results);
            return results;
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            console.error('Failed to find matches:', error);
            return [];
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    const selectEngineer = useCallback(
        async (matchId: string, engineerId: string): Promise<boolean> => {
            try {
                await MatchingEngineService.acceptMatch(matchId, projectId, engineerId);
                return true;
            } catch (err) {
                console.error('Failed to select engineer:', err);
                return false;
            }
        },
        [projectId]
    );

    const completeMatch = useCallback(
        async (matchId: string, rating: number, feedback: string): Promise<boolean> => {
            try {
                await MatchingEngineService.completeMatch(matchId, rating, feedback);
                return true;
            } catch (err) {
                console.error('Failed to complete match:', err);
                return false;
            }
        },
        []
    );

    const getMatchHistory = useCallback(async () => {
        try {
            return await MatchingEngineService.getProjectMatches(projectId);
        } catch (err) {
            console.error('Failed to get match history:', err);
            return [];
        }
    }, [projectId]);

    return {
        matches,
        engineers,
        loading,
        error,
        findMatches,
        selectEngineer,
        completeMatch,
        getMatchHistory,
    };
}
