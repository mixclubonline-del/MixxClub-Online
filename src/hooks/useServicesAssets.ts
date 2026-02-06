import { useDynamicAssets } from './useDynamicAssets';

/**
 * Convenience hook for services district assets
 * Provides typed access to service imagery with automatic fallbacks
 */
export const useServicesAssets = () => {
  const { getImageUrl, isLoading } = useDynamicAssets();
  
  return {
    isLoading,
    
    // Services section images
    lobby: getImageUrl('services_lobby'),
    mixing: getImageUrl('services_mixing'),
    mastering: getImageUrl('services_mastering'),
    ai: getImageUrl('services_ai'),
    distribution: getImageUrl('services_distribution'),
  };
};
