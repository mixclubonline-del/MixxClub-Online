import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Static fallback imports for when no database asset exists
import cityGates from '@/assets/city-gates.jpg';
import districtTower from '@/assets/district-tower.jpg';
import districtRsd from '@/assets/district-rsd.jpg';
import districtCreator from '@/assets/district-creator.jpg';
import districtNeural from '@/assets/district-neural.jpg';
import districtArena from '@/assets/district-arena.jpg';
import districtCommerce from '@/assets/district-commerce.jpg';
import districtData from '@/assets/district-data.jpg';
import districtBroadcast from '@/assets/district-broadcast.jpg';
import servicesLobby from '@/assets/services-lobby.jpg';

export interface DynamicAsset {
  id: string;
  name: string;
  public_url: string;
  asset_context: string;
  prompt_used: string | null;
  created_at: string;
}

// Type definitions for page contexts and section keys
export type PageContext = 
  | 'landing' 
  | 'prime' 
  | 'city' 
  | 'community' 
  | 'services' 
  | 'studio' 
  | 'hallway';

export type SectionKey = 
  // Landing
  | 'hero_background' | 'hero_prime' 
  | 'community_artists' | 'community_engineers'
  | 'journey_transformation' | 'future_ownership'
  // Prime phases
  | 'prime_drop' | 'prime_spark' | 'prime_community' 
  | 'prime_collaboration' | 'prime_network' | 'prime_place' | 'prime_invitation'
  // City districts
  | 'city_gates' | 'city_tower' | 'city_studio' | 'city_creator' 
  | 'city_neural' | 'city_arena' | 'city_commerce' | 'city_data' | 'city_broadcast'
  // Community
  | 'community_plaza' | 'community_arena' | 'community_stage' 
  | 'community_leaderboard' | 'community_network'
  // Services
  | 'services_lobby' | 'services_mixing' | 'services_mastering' 
  | 'services_ai' | 'services_distribution'
  // Studio
  | 'studio_hallway_base' | 'studio_hallway_active' | 'studio_session_room';

// Universal mapping of UI sections to asset_context patterns
const SECTION_ASSET_MAP: Record<SectionKey, string[]> = {
  // === Landing/Prime (existing) ===
  hero_background: ['landing_origin_architect', 'landing_origin_basement', 'landing_origin_penthouse'],
  hero_prime: ['prime_drop', 'prime_hero'],
  community_artists: ['landing_people_artist_soul', 'landing_people_artist'],
  community_engineers: ['landing_people_engineer_master', 'landing_people_engineer'],
  journey_transformation: ['landing_journey_transformation', 'landing_journey'],
  future_ownership: ['landing_future_ownership', 'landing_future'],
  
  // Prime character states
  prime_drop: ['prime_drop'],
  prime_spark: ['prime_spark'],
  prime_community: ['prime_community', 'prime_people'],
  prime_collaboration: ['prime_collaboration'],
  prime_network: ['prime_network'],
  prime_place: ['prime_place'],
  prime_invitation: ['prime_invitation', 'prime_cta'],

  // === City Districts (NEW) ===
  city_gates: ['city_gates', 'city_entrance'],
  city_tower: ['district_tower', 'city_tower', 'mixxtech_tower'],
  city_studio: ['district_rsd', 'city_studio', 'rsd_chamber'],
  city_creator: ['district_creator', 'city_creator', 'creator_hub'],
  city_neural: ['district_neural', 'city_neural', 'neural_engine'],
  city_arena: ['district_arena', 'city_arena', 'the_arena'],
  city_commerce: ['district_commerce', 'city_commerce', 'commerce_district'],
  city_data: ['district_data', 'city_data', 'data_realm'],
  city_broadcast: ['district_broadcast', 'city_broadcast', 'broadcast_tower'],

  // === Community Plaza (NEW) ===
  community_plaza: ['community_plaza', 'community_background'],
  community_arena: ['community_arena', 'battle_arena'],
  community_stage: ['community_stage', 'premiere_stage'],
  community_leaderboard: ['community_leaderboard'],
  community_network: ['community_network', 'connection_web'],

  // === Services District (NEW) ===
  services_lobby: ['services_lobby', 'services_background'],
  services_mixing: ['services_mixing', 'mixing_studio'],
  services_mastering: ['services_mastering', 'mastering_suite'],
  services_ai: ['services_ai', 'ai_mastering'],
  services_distribution: ['services_distribution', 'distribution_hub'],

  // === Studio Environments (NEW) ===
  studio_hallway_base: ['studio_hallway_base'],
  studio_hallway_active: ['studio_hallway_active'],
  studio_session_room: ['studio_session_room'],
};

// Static fallback map for when no dynamic asset exists
const STATIC_FALLBACKS: Partial<Record<SectionKey, string>> = {
  city_gates: cityGates,
  city_tower: districtTower,
  city_studio: districtRsd,
  city_creator: districtCreator,
  city_neural: districtNeural,
  city_arena: districtArena,
  city_commerce: districtCommerce,
  city_data: districtData,
  city_broadcast: districtBroadcast,
  services_lobby: servicesLobby,
};

// District glow colors for DistrictPortal
export const DISTRICT_GLOW_COLORS: Record<string, string> = {
  gates: '280 65% 60%',
  tower: '262 83% 58%',
  rsd: '25 95% 53%',
  creator: '280 65% 60%',
  neural: '190 95% 50%',
  arena: '350 80% 55%',
  commerce: '40 95% 55%',
  data: '160 84% 40%',
  broadcast: '250 75% 60%',
};

export const useDynamicAssets = () => {
  const [assets, setAssets] = useState<DynamicAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssets = useCallback(async () => {
    setIsLoading(true);
    
    // Query ALL page-relevant contexts in a single call
    const { data, error } = await supabase
      .from('brand_assets')
      .select('id, name, public_url, asset_context, prompt_used, created_at')
      .or('asset_context.like.landing_%,asset_context.like.prime_%,asset_context.like.city_%,asset_context.like.community_%,asset_context.like.services_%,asset_context.like.studio_%,asset_context.like.hallway_%,asset_context.like.district_%')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setAssets(data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchAssets();

    // Subscribe to real-time changes for live updates
    const channel = supabase
      .channel('dynamic-assets')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'brand_assets',
        },
        () => {
          // Refetch on any change to brand_assets
          fetchAssets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAssets]);

  // Get assets for a specific section (returns array for rotation/selection)
  const getAssetsForSection = useCallback((section: SectionKey): DynamicAsset[] => {
    const patterns = SECTION_ASSET_MAP[section] || [];
    return assets.filter(asset => 
      patterns.some(pattern => asset.asset_context?.includes(pattern))
    );
  }, [assets]);

  // Get a single asset for a section (most recent)
  const getAssetForSection = useCallback((section: SectionKey): DynamicAsset | undefined => {
    const sectionAssets = getAssetsForSection(section);
    return sectionAssets[0]; // Returns most recent due to ordering
  }, [getAssetsForSection]);

  // Get asset URL with optional fallback
  const getImageUrl = useCallback((section: SectionKey, customFallback?: string): string => {
    const dynamicUrl = getAssetForSection(section)?.public_url;
    return dynamicUrl || customFallback || STATIC_FALLBACKS[section] || '';
  }, [getAssetForSection]);

  // Get a random asset from a section (for variety)
  const getRandomAsset = useCallback((section: SectionKey): DynamicAsset | undefined => {
    const sectionAssets = getAssetsForSection(section);
    if (sectionAssets.length === 0) return undefined;
    return sectionAssets[Math.floor(Math.random() * sectionAssets.length)];
  }, [getAssetsForSection]);

  // Check if any assets exist for a section
  const hasAssetsForSection = useCallback((section: SectionKey): boolean => {
    return getAssetsForSection(section).length > 0;
  }, [getAssetsForSection]);

  // Get all Prime phase images as a map
  const primePhaseImages = useMemo(() => {
    const phases = ['drop', 'spark', 'community', 'collaboration', 'network', 'place', 'invitation'] as const;
    const map: Record<string, string | undefined> = {};
    
    phases.forEach(phase => {
      const key = `prime_${phase}` as SectionKey;
      map[phase] = getAssetForSection(key)?.public_url;
    });
    
    return map;
  }, [getAssetForSection]);

  // Get hero backgrounds array for rotation
  const heroBackgrounds = useMemo(() => {
    return getAssetsForSection('hero_background').map(a => a.public_url);
  }, [getAssetsForSection]);

  // Get district portal info with dynamic asset and fallback
  const getDistrictPortal = useCallback((districtId: string): { image: string; glowColor: string } => {
    const sectionKey = `city_${districtId}` as SectionKey;
    return {
      image: getImageUrl(sectionKey),
      glowColor: DISTRICT_GLOW_COLORS[districtId] || '280 65% 60%',
    };
  }, [getImageUrl]);

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
    getDistrictPortal,
    refetch: fetchAssets,
  };
};

// Re-export types for convenience
export type { DynamicAsset as LandingAsset };
