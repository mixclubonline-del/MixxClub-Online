/**
 * @deprecated This hook is deprecated. Use useEngineerMatchingAPI instead for live backend integration.
 * 
 * Migration guide:
 * - Replace: import { useMatchingEngine } from '@/hooks/useMatchingEngine'
 * - With:    import { useEngineerMatchingAPI } from '@/hooks/useEngineerMatchingAPI'
 * 
 * The new hook provides:
 * - findMatches(criteria) - Find engineers matching project criteria
 * - hireEngineer(engineerId, projectDetails) - Create partnership and project
 * - matches, loading, error, hiring - State management
 */

export { useEngineerMatchingAPI as useMatchingEngine } from './useEngineerMatchingAPI';
export type { EngineerMatch as Match, MatchCriteria } from './useEngineerMatchingAPI';

// Re-export the new hook as default for backwards compatibility
export { useEngineerMatchingAPI } from './useEngineerMatchingAPI';
