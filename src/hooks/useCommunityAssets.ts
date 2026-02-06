import { useDynamicAssets } from './useDynamicAssets';

/**
 * Convenience hook for community/plaza assets
 * Provides typed access to community imagery with automatic fallbacks
 */
export const useCommunityAssets = () => {
  const { getImageUrl, isLoading } = useDynamicAssets();
  
  return {
    isLoading,
    
    // Community section images
    plaza: getImageUrl('community_plaza'),
    arena: getImageUrl('community_arena'),
    stage: getImageUrl('community_stage'),
    leaderboard: getImageUrl('community_leaderboard'),
    network: getImageUrl('community_network'),
  };
};
