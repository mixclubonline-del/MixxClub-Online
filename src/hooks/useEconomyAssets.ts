import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EconomyAsset {
  id: string;
  name: string;
  public_url: string;
  asset_context: string;
  prompt_used: string | null;
  created_at: string;
}

type EconomyAssetKey = 
  | 'coin_earned' 
  | 'coin_purchased' 
  | 'coin_hero' 
  | 'coin_celebration';

const ASSET_CONTEXT_MAP: Record<EconomyAssetKey, string[]> = {
  coin_earned: ['economy_coin_earned'],
  coin_purchased: ['economy_coin_purchased'],
  coin_hero: ['economy_coin_hero'],
  coin_celebration: ['economy_coin_celebration'],
};

export function useEconomyAssets() {
  const [assets, setAssets] = useState<EconomyAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('brand_assets')
        .select('id, name, public_url, asset_context, prompt_used, created_at')
        .like('asset_context', 'economy_%')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (data && !error) {
        setAssets(data);
      }
      setIsLoading(false);
    };

    fetchAssets();
  }, []);

  const getAsset = (key: EconomyAssetKey): EconomyAsset | undefined => {
    const patterns = ASSET_CONTEXT_MAP[key] || [];
    return assets.find(asset =>
      patterns.some(pattern => asset.asset_context?.includes(pattern))
    );
  };

  const getAssetUrl = (key: EconomyAssetKey): string | undefined => {
    return getAsset(key)?.public_url;
  };

  const hasAsset = (key: EconomyAssetKey): boolean => {
    return !!getAsset(key);
  };

  // Memoized asset URLs for common access
  const assetUrls = useMemo(() => ({
    earnedCoin: getAssetUrl('coin_earned'),
    purchasedCoin: getAssetUrl('coin_purchased'),
    heroCoin: getAssetUrl('coin_hero'),
    celebrationCoin: getAssetUrl('coin_celebration'),
  }), [assets]);

  return {
    assets,
    isLoading,
    getAsset,
    getAssetUrl,
    hasAsset,
    ...assetUrls,
  };
}

export default useEconomyAssets;
