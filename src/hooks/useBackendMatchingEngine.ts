/**
 * @deprecated This hook is deprecated. Use useEngineerMatchingAPI instead.
 * The matchingEngineService was using mock data. The new hook queries the live backend.
 * 
 * Migration:
 * - Replace: import { useBackendMatchingEngine } from '@/hooks/useBackendMatchingEngine'
 * - With:    import { useEngineerMatchingAPI } from '@/hooks/useEngineerMatchingAPI'
 */

export { useEngineerMatchingAPI as useBackendMatchingEngine } from './useEngineerMatchingAPI';
