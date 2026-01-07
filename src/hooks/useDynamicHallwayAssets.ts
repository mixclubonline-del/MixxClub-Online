import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HallwayAsset {
  id: string;
  name: string;
  public_url: string;
  asset_type: string;
  asset_context: string;
  is_active: boolean;
  duration_seconds: number | null;
}

/**
 * Hook to fetch and subscribe to active hallway assets
 * Queries brand_assets for studio_hallway_* contexts
 */
export const useDynamicHallwayAssets = () => {
  const [baseAsset, setBaseAsset] = useState<HallwayAsset | null>(null);
  const [activeAsset, setActiveAsset] = useState<HallwayAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('brand_assets')
          .select('id, name, public_url, asset_type, asset_context, is_active, duration_seconds')
          .like('asset_context', 'studio_hallway_%')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (data && !error) {
          const base = data.find(a => a.asset_context === 'studio_hallway_base');
          const active = data.find(a => a.asset_context === 'studio_hallway_active');
          
          setBaseAsset(base || null);
          setActiveAsset(active || null);
        }
      } catch (e) {
        console.error('Failed to fetch hallway assets:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('hallway-assets')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'brand_assets',
          filter: 'asset_context=like.studio_hallway_%'
        },
        () => {
          // Refetch on any change
          fetchAssets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Get current background URL (prefer video over image)
  const getBackgroundUrl = (hasActiveSessions: boolean): string | null => {
    const asset = hasActiveSessions ? (activeAsset || baseAsset) : baseAsset;
    return asset?.public_url || null;
  };

  // Check if current background is video
  const isVideo = (hasActiveSessions: boolean): boolean => {
    const asset = hasActiveSessions ? (activeAsset || baseAsset) : baseAsset;
    return asset?.asset_type === 'video';
  };

  return {
    baseAsset,
    activeAsset,
    isLoading,
    getBackgroundUrl,
    isVideo,
  };
};
