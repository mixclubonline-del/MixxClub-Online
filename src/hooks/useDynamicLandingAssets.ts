import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LandingAsset {
  id: string;
  name: string;
  public_url: string;
  asset_context: string;
  prompt_used: string | null;
  created_at: string;
}

// Mapping of UI sections to asset_context patterns
const SECTION_ASSET_MAP: Record<string, string[]> = {
  // Hero section backgrounds
  hero_background: ['landing_origin_architect', 'landing_origin_basement', 'landing_origin_penthouse'],
  hero_prime: ['prime_drop', 'prime_hero'],
  
  // Community/People section
  community_artists: ['landing_people_artist_soul', 'landing_people_artist'],
  community_engineers: ['landing_people_engineer_master', 'landing_people_engineer'],
  
  // Journey/transformation section
  journey_transformation: ['landing_journey_transformation', 'landing_journey'],
  
  // Future/CTA section
  future_ownership: ['landing_future_ownership', 'landing_future'],
  
  // Prime character states for InsiderDemo phases
  prime_drop: ['prime_drop'],
  prime_spark: ['prime_spark'],
  prime_community: ['prime_community', 'prime_people'],
  prime_collaboration: ['prime_collaboration'],
  prime_network: ['prime_network'],
  prime_place: ['prime_place'],
  prime_invitation: ['prime_invitation', 'prime_cta'],
};

export const useDynamicLandingAssets = () => {
  const [assets, setAssets] = useState<LandingAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      setIsLoading(true);
      
      // Fetch all active landing and prime assets
      const { data, error } = await supabase
        .from('brand_assets')
        .select('id, name, public_url, asset_context, prompt_used, created_at')
        .or('asset_context.like.landing_%,asset_context.like.prime_%')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (data && !error) {
        setAssets(data);
      }
      setIsLoading(false);
    };

    fetchAssets();
  }, []);

  // Get assets for a specific section (returns array for rotation/selection)
  const getAssetsForSection = (section: keyof typeof SECTION_ASSET_MAP): LandingAsset[] => {
    const patterns = SECTION_ASSET_MAP[section] || [];
    return assets.filter(asset => 
      patterns.some(pattern => asset.asset_context?.includes(pattern))
    );
  };

  // Get a single asset for a section (most recent)
  const getAssetForSection = (section: keyof typeof SECTION_ASSET_MAP): LandingAsset | undefined => {
    const sectionAssets = getAssetsForSection(section);
    return sectionAssets[0]; // Returns most recent due to ordering
  };

  // Get asset URL directly for a section
  const getImageUrl = (section: keyof typeof SECTION_ASSET_MAP): string | undefined => {
    return getAssetForSection(section)?.public_url;
  };

  // Get a random asset from a section (for variety)
  const getRandomAsset = (section: keyof typeof SECTION_ASSET_MAP): LandingAsset | undefined => {
    const sectionAssets = getAssetsForSection(section);
    if (sectionAssets.length === 0) return undefined;
    return sectionAssets[Math.floor(Math.random() * sectionAssets.length)];
  };

  // Check if any assets exist for a section
  const hasAssetsForSection = (section: keyof typeof SECTION_ASSET_MAP): boolean => {
    return getAssetsForSection(section).length > 0;
  };

  // Get all Prime phase images as a map
  const primePhaseImages = useMemo(() => {
    const phases = ['drop', 'spark', 'community', 'collaboration', 'network', 'place', 'invitation'];
    const map: Record<string, string | undefined> = {};
    
    phases.forEach(phase => {
      const key = `prime_${phase}` as keyof typeof SECTION_ASSET_MAP;
      map[phase] = getImageUrl(key);
    });
    
    return map;
  }, [assets]);

  // Get hero backgrounds array for rotation
  const heroBackgrounds = useMemo(() => {
    return getAssetsForSection('hero_background').map(a => a.public_url);
  }, [assets]);

  return {
    assets,
    isLoading,
    getAssetsForSection,
    getAssetForSection,
    getImageUrl,
    getRandomAsset,
    hasAssetsForSection,
    primePhaseImages,
    heroBackgrounds,
  };
};
