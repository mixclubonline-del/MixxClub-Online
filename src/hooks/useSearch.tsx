import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface SearchResult {
  result_type: 'profile' | 'project' | 'job';
  result_id: string;
  result_title: string;
  result_description: string | null;
  result_metadata: Record<string, any>;
  relevance: number;
}

export interface SavedSearch {
  id: string;
  user_id: string;
  search_name: string;
  search_type: string;
  search_query: string;
  filters: Record<string, any>;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface SearchHistoryItem {
  id: string;
  user_id: string;
  search_query: string;
  search_type: string;
  filters: Record<string, any>;
  results_count: number;
  created_at: string;
}

/**
 * Hook for global search across multiple tables
 */
export function useGlobalSearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['global-search', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      
      const { data, error } = await supabase.rpc('global_search' as any, {
        search_query: query,
        search_limit: 20
      });

      if (error) throw error;
      return data as unknown as SearchResult[];
    },
    enabled: enabled && query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to get saved searches for current user
 */
export function useSavedSearches() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['saved-searches', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_searches' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as SavedSearch[];
    },
    enabled: !!user,
  });
}

/**
 * Hook to create a saved search
 */
export function useSaveSearch() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (search: {
      search_name: string;
      search_type: string;
      search_query: string;
      filters?: Record<string, any>;
      is_favorite?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('saved_searches' as any)
        .insert({
          user_id: user?.id,
          ...search,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
    },
  });
}

/**
 * Hook to delete a saved search
 */
export function useDeleteSavedSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (searchId: string) => {
      const { error } = await supabase
        .from('saved_searches' as any)
        .delete()
        .eq('id', searchId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
    },
  });
}

/**
 * Hook to get search history for current user
 */
export function useSearchHistory(limit: number = 10) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['search-history', user?.id, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('search_history' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as unknown as SearchHistoryItem[];
    },
    enabled: !!user,
  });
}

/**
 * Hook to record a search in history
 */
export function useRecordSearch() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (search: {
      search_query: string;
      search_type: string;
      filters?: Record<string, any>;
      results_count: number;
    }) => {
      if (!user) return;

      const { error } = await supabase
        .from('search_history' as any)
        .insert({
          user_id: user.id,
          ...search,
        });

      if (error) throw error;
    },
  });
}

/**
 * Hook to get popular searches
 */
export function usePopularSearches(daysAgo: number = 7) {
  return useQuery({
    queryKey: ['popular-searches', daysAgo],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_popular_searches' as any, {
        days_ago: daysAgo,
        result_limit: 10
      });

      if (error) throw error;
      return data as unknown as Array<{
        search_query: string;
        search_count: number;
        avg_results: number;
      }>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to clear search history
 */
export function useClearSearchHistory() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('search_history' as any)
        .delete()
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search-history'] });
    },
  });
}
