import { SupabaseService } from './supabaseClient';
import { supabase } from './supabaseClient';

/**
 * MATCHING ENGINE SERVICE - Backend Integration
 * Handles engineer matching, database operations, and match tracking
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

export const MatchingEngineService = {
    /**
     * Fetch all verified engineers from database
     */
    async getEngineers(filters?: {
        genres?: string[];
        minRating?: number;
        availability?: string;
    }): Promise<EngineerProfile[]> {
        let query = supabase
            .from('engineer_profiles')
            .select('*')
            .eq('verified', true);

        if (filters?.genres?.length) {
            query = query.contains('genres', filters.genres);
        }

        if (filters?.minRating) {
            query = query.gte('rating', filters.minRating);
        }

        if (filters?.availability) {
            query = query.eq('availability', filters.availability);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Failed to fetch engineers:', error);
            return [];
        }

        return data as EngineerProfile[];
    },

    /**
     * Fetch a project by ID
     */
    async getProject(projectId: string): Promise<ProjectProfile | null> {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();

        if (error) {
            console.error('Failed to fetch project:', error);
            return null;
        }

        return data as ProjectProfile;
    },

    /**
     * Call edge function to compute matches
     */
    async findMatches(
        projectId: string,
        topN: number = 5
    ): Promise<MatchResult[]> {
        try {
            const project = await this.getProject(projectId);
            if (!project) throw new Error('Project not found');

            const response = await SupabaseService.callEdgeFunction<{
                matches: MatchResult[];
            }>('match-engineers', {
                project_id: projectId,
                project_genres: project.genres,
                project_budget: project.budget,
                top_n: topN,
            });

            // Save matches to database
            for (const match of response.matches) {
                await this.saveMatch(match);
            }

            return response.matches;
        } catch (error) {
            console.error('Failed to find matches:', error);
            throw error;
        }
    },

    /**
     * Save match result to database
     */
    async saveMatch(match: MatchResult): Promise<MatchResult> {
        const { data, error } = await supabase
            .from('engineer_matches')
            .upsert({
                engineer_id: match.engineer_id,
                project_id: match.project_id,
                match_score: match.match_score,
                genre_match: match.genre_match,
                experience_score: match.experience_score,
                performance_score: match.performance_score,
                price_alignment: match.price_alignment,
                availability_score: match.availability_score,
                confidence: match.confidence,
                reason: match.reason,
                status: 'pending',
            })
            .select()
            .single();

        if (error) {
            console.error('Failed to save match:', error);
            throw error;
        }

        return data as MatchResult;
    },

    /**
     * Record engineer selection
     */
    async acceptMatch(
        matchId: string,
        projectId: string,
        engineerId: string
    ): Promise<boolean> {
        const { error } = await supabase.from('engineer_matches').update({ status: 'accepted' }).eq('id', matchId);

        if (error) {
            console.error('Failed to accept match:', error);
            return false;
        }

        // Log event for analytics
        await supabase.from('match_events').insert({
            match_id: matchId,
            event_type: 'engineer_selected',
            project_id: projectId,
            engineer_id: engineerId,
            timestamp: new Date().toISOString(),
        });

        return true;
    },

    /**
     * Record match completion
     */
    async completeMatch(matchId: string, rating: number, feedback: string): Promise<boolean> {
        const { error } = await supabase
            .from('engineer_matches')
            .update({ status: 'completed' })
            .eq('id', matchId);

        if (error) {
            console.error('Failed to complete match:', error);
            return false;
        }

        // Save rating and feedback
        await supabase.from('match_feedback').insert({
            match_id: matchId,
            rating,
            feedback,
            created_at: new Date().toISOString(),
        });

        // Update engineer rating
        await this.updateEngineerStats(matchId);

        return true;
    },

    /**
     * Get match history for a project
     */
    async getProjectMatches(projectId: string): Promise<MatchResult[]> {
        const { data, error } = await supabase
            .from('engineer_matches')
            .select('*')
            .eq('project_id', projectId)
            .order('match_score', { ascending: false });

        if (error) {
            console.error('Failed to fetch project matches:', error);
            return [];
        }

        return data as MatchResult[];
    },

    /**
     * Get engineer's match history
     */
    async getEngineerMatches(engineerId: string): Promise<MatchResult[]> {
        const { data, error } = await supabase
            .from('engineer_matches')
            .select('*')
            .eq('engineer_id', engineerId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Failed to fetch engineer matches:', error);
            return [];
        }

        return data as MatchResult[];
    },

    /**
     * Update engineer statistics after match completion
     */
    async updateEngineerStats(matchId: string): Promise<boolean> {
        try {
            const { error } = await supabase.rpc('update_engineer_stats_from_match', {
                match_id: matchId,
            });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Failed to update engineer stats:', error);
            return false;
        }
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
        try {
            const { data, error } = await supabase.rpc('get_matching_analytics');

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Failed to get analytics:', error);
            throw error;
        }
    },
};
