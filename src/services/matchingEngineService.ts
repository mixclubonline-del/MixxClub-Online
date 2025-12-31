/**
 * MATCHING ENGINE SERVICE - Stubbed Implementation
 * The engineer_matches and related tables don't match expected schema.
 * This provides a mock implementation.
 */

export interface EngineerProfile {
    id: string;
    user_id: string;
    name: string;
    avatar_url?: string;
    genres: string[];
    experience_years: number;
    rating: number;
    completed_projects: number;
    avg_turnaround_hours: number;
    price_per_track: number;
    availability: 'available' | 'busy' | 'unavailable';
    success_rate: number;
    completion_rate: number;
    skills: string[];
    bio: string;
    portfolio_url?: string;
    verified: boolean;
    joined_date: string;
    stats: {
        total_projects: number;
        on_time_delivery: number;
        client_satisfaction: number;
        average_score: number;
    };
}

export interface ProjectProfile {
    id: string;
    artist_id: string;
    artist_name: string;
    title: string;
    description: string;
    genres: string[];
    budget: number;
    deadline: string;
    skills_required: string[];
    complexity: 'simple' | 'medium' | 'complex';
    priority: 'low' | 'medium' | 'high';
    created_at: string;
}

export interface MatchResult {
    id: string;
    engineer_id: string;
    project_id: string;
    match_score: number;
    genre_match: number;
    experience_score: number;
    performance_score: number;
    price_alignment: number;
    availability_score: number;
    confidence: 'high' | 'medium' | 'low';
    reason: string;
    created_at: string;
    status: 'pending' | 'accepted' | 'declined' | 'completed';
}

// In-memory mock data
const mockEngineers: EngineerProfile[] = [];
const mockProjects: ProjectProfile[] = [];
const mockMatches: MatchResult[] = [];

export const MatchingEngineService = {
    /**
     * Fetch all verified engineers from database
     */
    async getEngineers(filters?: {
        genres?: string[];
        minRating?: number;
        availability?: string;
    }): Promise<EngineerProfile[]> {
        console.warn('MatchingEngineService: Using mock data - engineer_profiles schema mismatch');
        let result = [...mockEngineers];

        if (filters?.genres?.length) {
            result = result.filter(e => e.genres.some(g => filters.genres!.includes(g)));
        }
        if (filters?.minRating) {
            result = result.filter(e => e.rating >= filters.minRating!);
        }
        if (filters?.availability) {
            result = result.filter(e => e.availability === filters.availability);
        }

        return result;
    },

    /**
     * Fetch a project by ID
     */
    async getProject(projectId: string): Promise<ProjectProfile | null> {
        console.warn('MatchingEngineService: Using mock data - projects schema mismatch');
        return mockProjects.find(p => p.id === projectId) || null;
    },

    /**
     * Call edge function to compute matches
     */
    async findMatches(
        projectId: string,
        topN: number = 5
    ): Promise<MatchResult[]> {
        console.warn('MatchingEngineService: Using mock data - match-engineers function not configured');
        return mockMatches.filter(m => m.project_id === projectId).slice(0, topN);
    },

    /**
     * Save match result to database
     */
    async saveMatch(match: MatchResult): Promise<MatchResult> {
        console.warn('MatchingEngineService: Using mock data - engineer_matches table not configured');
        const newMatch = { ...match, id: match.id || crypto.randomUUID() };
        mockMatches.push(newMatch);
        return newMatch;
    },

    /**
     * Record engineer selection
     */
    async acceptMatch(
        matchId: string,
        projectId: string,
        engineerId: string
    ): Promise<boolean> {
        console.warn('MatchingEngineService: Using mock data - engineer_matches table not configured');
        const match = mockMatches.find(m => m.id === matchId);
        if (match) {
            match.status = 'accepted';
            return true;
        }
        return false;
    },

    /**
     * Record match completion
     */
    async completeMatch(matchId: string, rating: number, feedback: string): Promise<boolean> {
        console.warn('MatchingEngineService: Using mock data - engineer_matches table not configured');
        const match = mockMatches.find(m => m.id === matchId);
        if (match) {
            match.status = 'completed';
            return true;
        }
        return false;
    },

    /**
     * Get match history for a project
     */
    async getProjectMatches(projectId: string): Promise<MatchResult[]> {
        console.warn('MatchingEngineService: Using mock data - engineer_matches table not configured');
        return mockMatches.filter(m => m.project_id === projectId);
    },

    /**
     * Get engineer's match history
     */
    async getEngineerMatches(engineerId: string): Promise<MatchResult[]> {
        console.warn('MatchingEngineService: Using mock data - engineer_matches table not configured');
        return mockMatches.filter(m => m.engineer_id === engineerId);
    },

    /**
     * Update engineer statistics after match completion
     */
    async updateEngineerStats(matchId: string): Promise<boolean> {
        console.warn('MatchingEngineService: Using mock data - update_engineer_stats_from_match RPC not available');
        return true;
    },

    /**
     * Get matching analytics
     */
    async getMatchingAnalytics(): Promise<{
        total_matches: number;
        match_success_rate: number;
        avg_match_quality: number;
        top_engineers: EngineerProfile[];
        genre_preferences: Record<string, number>;
    }> {
        console.warn('MatchingEngineService: Using mock data - get_matching_analytics RPC not available');
        return {
            total_matches: mockMatches.length,
            match_success_rate: 0,
            avg_match_quality: 0,
            top_engineers: [],
            genre_preferences: {},
        };
    },
};
