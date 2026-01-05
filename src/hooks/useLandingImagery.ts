import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LandingImage {
  id: string;
  name: string;
  public_url: string;
  asset_context: string;
  prompt_used: string | null;
  created_at: string;
}

export const useLandingImagery = () => {
  const [images, setImages] = useState<LandingImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchImages = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('brand_assets')
      .select('id, name, public_url, asset_context, prompt_used, created_at')
      .like('asset_context', 'landing_%')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setImages(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const getImagesByPhase = (phase: string): LandingImage[] => {
    return images.filter(img => img.asset_context?.startsWith(`landing_${phase}`));
  };

  const getOriginImages = () => getImagesByPhase('origin');
  const getPeopleImages = () => getImagesByPhase('people');
  const getJourneyImages = () => getImagesByPhase('journey');
  const getFutureImages = () => getImagesByPhase('future');

  return {
    images,
    isLoading,
    refetch: fetchImages,
    getOriginImages,
    getPeopleImages,
    getJourneyImages,
    getFutureImages,
    getImagesByPhase,
  };
};
