import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        'Supabase credentials not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
    );
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Service client wrapper for backend API calls
 * Provides type-safe access to Supabase database and edge functions
 */
export const SupabaseService = {
    /**
     * Execute an edge function call
     */
    async callEdgeFunction<T extends Record<string, unknown>>(
        functionName: string,
        payload: Record<string, unknown>,
        options?: { timeout?: number }
    ): Promise<T> {
        try {
            const { data, error } = await supabase.functions.invoke(functionName, {
                body: payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (error) throw error;
            return data as T;
        } catch (error) {
            console.error(`Edge function ${functionName} failed:`, error);
            throw error;
        }
    },

    /**
     * Get the current authenticated user
     */
    async getCurrentUser() {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        return user;
    },

    /**
     * Check if user is authenticated
     */
    async isAuthenticated(): Promise<boolean> {
        const user = await this.getCurrentUser();
        return !!user;
    },
};
