import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * User activity summary from analytics view
 */
export interface UserActivitySummary {
  user_id: string;
  full_name: string;
  email: string;
  projects_as_client: number;
  projects_as_engineer: number;
  audio_files_uploaded: number;
  total_notifications: number;
  last_project_date: string | null;
  user_since: string;
}

/**
 * Project analytics from view
 */
export interface ProjectAnalytics {
  project_id: string;
  title: string;
  status: string;
  client_id: string;
  engineer_id: string | null;
  client_name: string;
  engineer_name: string | null;
  total_files: number;
  stem_files: number;
  total_storage_bytes: number;
  avg_file_duration: number;
  created_at: string;
  updated_at: string;
  project_duration_days: number;
}

/**
 * Revenue summary from view
 */
export interface RevenueSummary {
  month: string;
  total_transactions: number;
  completed_revenue: number;
  pending_revenue: number;
  avg_transaction_value: number;
  unique_customers: number;
}

/**
 * Engineer performance from view
 */
export interface EngineerPerformance {
  engineer_id: string;
  engineer_name: string;
  rating_average: number;
  total_reviews: number;
  total_projects_completed: number;
  years_experience: number;
  specializations: string[];
  active_projects: number;
  avg_project_duration_days: number;
}

/**
 * Database statistics
 */
export interface DatabaseStats {
  table_name: string;
  total_rows: number;
  active_rows: number | null;
  deleted_rows: number | null;
  table_size: string;
}

/**
 * Hook to fetch user activity summary
 */
export function useUserActivitySummary() {
  return useQuery({
    queryKey: ['user-activity-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_activity_summary' as any)
        .select('*')
        .order('user_since', { ascending: false });

      if (error) throw error;
      return data as unknown as UserActivitySummary[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch project analytics
 */
export function useProjectAnalytics() {
  return useQuery({
    queryKey: ['project-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_analytics' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as ProjectAnalytics[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch revenue summary
 */
export function useRevenueSummary() {
  return useQuery({
    queryKey: ['revenue-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('revenue_summary' as any)
        .select('*')
        .order('month', { ascending: false })
        .limit(12); // Last 12 months

      if (error) throw error;
      return data as unknown as RevenueSummary[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch engineer performance
 */
export function useEngineerPerformance() {
  return useQuery({
    queryKey: ['engineer-performance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('engineer_performance' as any)
        .select('*')
        .order('rating_average', { ascending: false });

      if (error) throw error;
      return data as unknown as EngineerPerformance[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch database statistics
 */
export function useDatabaseStats() {
  return useQuery({
    queryKey: ['database-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_database_statistics' as any);

      if (error) throw error;
      return data as unknown as DatabaseStats[];
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}
