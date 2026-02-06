import { useDynamicAssets, DISTRICT_GLOW_COLORS } from './useDynamicAssets';

/**
 * Convenience hook for city district assets
 * Provides typed access to all district imagery with automatic fallbacks
 */
export const useCityAssets = () => {
  const { getImageUrl, getDistrictPortal, isLoading } = useDynamicAssets();
  
  return {
    isLoading,
    
    // Individual district images
    gates: getImageUrl('city_gates'),
    tower: getImageUrl('city_tower'),
    studio: getImageUrl('city_studio'),
    creator: getImageUrl('city_creator'),
    neural: getImageUrl('city_neural'),
    arena: getImageUrl('city_arena'),
    commerce: getImageUrl('city_commerce'),
    data: getImageUrl('city_data'),
    broadcast: getImageUrl('city_broadcast'),
    
    // Get full portal info (image + glow color)
    getDistrictPortal,
    
    // Glow colors for styling
    glowColors: DISTRICT_GLOW_COLORS,
  };
};
