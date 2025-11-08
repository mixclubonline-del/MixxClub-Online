import { useCallback, useMemo } from 'react';
import {
    useMatchingEngineStore,
    type Engineer,
    type Project,
    type Match,
} from '../stores/matchingEngineStore';

/**
 * Hook for using the AI Matching Engine
 * Provides methods to find engineer matches for projects
 */
export const useMatchingEngine = () => {
    const store = useMatchingEngineStore();

    // Memoized engineers list
    const engineers = useMemo(() => store.engineers, [store.engineers]);

    // Memoized projects list
    const projects = useMemo(() => store.projects, [store.projects]);

    // Find matches for a project
    const findMatches = useCallback(
        (projectId: string, topN?: number) => {
            return store.findMatches(projectId, topN);
        },
        [store]
    );

    // Get top matches for a project
    const getTopMatches = useCallback(
        (projectId: string) => {
            return store.getTopMatches(projectId);
        },
        [store]
    );

    // Get engineers by genre
    const getEngineersByGenre = useCallback(
        (genre: string) => {
            return store.getEngineersByGenre(genre);
        },
        [store]
    );

    // Get all matches for a project
    const getProjectMatches = useCallback(
        (projectId: string) => {
            return store.getProjectMatches(projectId);
        },
        [store]
    );

    // Add a new engineer
    const addEngineer = useCallback(
        (engineer: Engineer) => {
            store.addEngineer(engineer);
        },
        [store]
    );

    // Add a new project
    const addProject = useCallback(
        (project: Project) => {
            store.addProject(project);
        },
        [store]
    );

    // Select a match to view details
    const selectMatch = useCallback(
        (match: Match) => {
            store.selectMatch(match);
        },
        [store]
    );

    // Record match outcome (success/failure)
    const recordMatchOutcome = useCallback(
        (matchId: string, success: boolean) => {
            store.recordMatchOutcome(matchId, success);
        },
        [store]
    );

    // Get match statistics
    const matchStats = useMemo(
        () => ({
            successRate: store.matchSuccessRate,
            avgQuality: store.avgMatchQuality,
            totalMatches: store.totalMatchesMade,
        }),
        [store.matchSuccessRate, store.avgMatchQuality, store.totalMatchesMade]
    );

    // Get high confidence matches only
    const getHighConfidenceMatches = useCallback(
        (projectId: string) => {
            const matches = store.getTopMatches(projectId);
            return matches.filter((m) => m.confidence === 'high');
        },
        [store]
    );

    // Get engineers available immediately
    const getAvailableEngineers = useCallback(() => {
        return engineers.filter((e) => e.availability === 'available');
    }, [engineers]);

    // Get top-rated engineers
    const getTopRatedEngineers = useCallback(() => {
        return [...engineers].sort((a, b) => b.rating - a.rating);
    }, [engineers]);

    // Find best match for a project (highest score)
    const findBestMatch = useCallback(
        (projectId: string) => {
            const matches = store.findMatches(projectId, 1);
            return matches[0] || null;
        },
        [store]
    );

    // Get engineer details by ID
    const getEngineer = useCallback(
        (engineerId: string) => {
            return engineers.find((e) => e.id === engineerId) || null;
        },
        [engineers]
    );

    return {
        // Data
        engineers,
        projects,
        selectedMatch: store.selectedMatch,
        topMatches: store.topMatches,

        // Stats
        matchStats,

        // Core methods
        findMatches,
        getTopMatches,
        findBestMatch,
        getHighConfidenceMatches,

        // Filter methods
        getEngineersByGenre,
        getAvailableEngineers,
        getTopRatedEngineers,
        getEngineer,

        // Project methods
        getProjectMatches,

        // Management methods
        addEngineer,
        addProject,
        selectMatch,
        recordMatchOutcome,
    };
};
