import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePrimeImages = () => {
  const [phaseImageMap, setPhaseImageMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrimeImages = async () => {
      const { data, error } = await supabase
        .from('brand_assets')
        .select('asset_context, public_url')
        .like('asset_context', 'prime_%')
        .eq('is_active', true);

      if (data && !error) {
        const mapping: Record<string, string> = {};
        data.forEach((asset) => {
          if (asset.asset_context) {
            // Convert 'prime_drop' -> 'drop'
            const phaseId = asset.asset_context.replace('prime_', '');
            mapping[phaseId] = asset.public_url;
          }
        });
        setPhaseImageMap(mapping);
      }
      setIsLoading(false);
    };

    fetchPrimeImages();
  }, []);

  const getImageForPhase = (phaseId: string): string | undefined => {
    return phaseImageMap[phaseId];
  };

  return { getImageForPhase, phaseImageMap, isLoading };
};
