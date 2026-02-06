/**
 * @deprecated Use useDynamicAssets from '@/hooks/useDynamicAssets' instead.
 * This file is maintained for backward compatibility only.
 */
export { 
  useDynamicAssets as useDynamicLandingAssets,
  type DynamicAsset as LandingAsset,
} from './useDynamicAssets';

// Re-export the hook as default for existing consumers
export { useDynamicAssets as default } from './useDynamicAssets';
