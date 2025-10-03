import { QueryClient } from '@tanstack/react-query';

// Enhanced React Query configuration with aggressive caching
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache for 10 minutes by default
      staleTime: 10 * 60 * 1000,
      // Keep unused data for 30 minutes
      gcTime: 30 * 60 * 1000,
      // Don't refetch on window focus for admin pages
      refetchOnWindowFocus: false,
      // Retry failed requests once
      retry: 1,
      // Don't retry on 404s
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Automatically retry mutations once on failure
      retry: 1,
    },
  },
});

// Cache keys for consistent cache management
export const CACHE_KEYS = {
  // User related
  USERS: ['users'] as const,
  USER_DETAIL: (id: string) => ['users', id] as const,
  USER_ROLES: (id: string) => ['user-roles', id] as const,
  
  // Admin related  
  AUDIT_LOGS: ['audit-logs'] as const,
  CONTACTS: ['contacts'] as const,
  JOBS: ['jobs'] as const,
  NOTIFICATIONS: ['notifications'] as const,
  
  // Projects
  PROJECTS: ['projects'] as const,
  PROJECT_DETAIL: (id: string) => ['projects', id] as const,
  
  // Analytics
  ANALYTICS: ['analytics'] as const,
  REVENUE: ['revenue'] as const,
  
  // Settings
  SETTINGS: ['settings'] as const,
} as const;

// Helper to invalidate related caches
export const invalidateRelatedQueries = async (keys: string[][]) => {
  await Promise.all(
    keys.map((key) => queryClient.invalidateQueries({ queryKey: key }))
  );
};

// Prefetch helper for common admin data
export const prefetchAdminData = async () => {
  // Prefetch commonly accessed admin data on login
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: CACHE_KEYS.AUDIT_LOGS,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),
    queryClient.prefetchQuery({
      queryKey: CACHE_KEYS.ANALYTICS,
      staleTime: 10 * 60 * 1000, // 10 minutes
    }),
  ]);
};
