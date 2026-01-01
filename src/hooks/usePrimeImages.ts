// Maps each InsiderDemo phase to a specific Prime image from brand-assets bucket
const STORAGE_BASE = 'https://kbbrehnyqpulbxyesril.supabase.co/storage/v1/object/public/brand-assets';

// Phase-to-image mapping using uploaded Prime images
const phaseImageMap: Record<string, string> = {
  drop: `${STORAGE_BASE}/IMG_0502.png`,
  awakening: `${STORAGE_BASE}/IMG_0489.png`,
  mission: `${STORAGE_BASE}/IMG_0491.png`,
  analysis: `${STORAGE_BASE}/IMG_0495.png`,
  studio: `${STORAGE_BASE}/IMG_0497.png`,
  collaboration: `${STORAGE_BASE}/IMG_0499.png`,
  results: `${STORAGE_BASE}/IMG_0501.png`,
  crm: `${STORAGE_BASE}/IMG_0503.png`,
  cta: `${STORAGE_BASE}/IMG_0505.png`,
};

export const usePrimeImages = () => {
  const getImageForPhase = (phaseId: string): string | undefined => {
    return phaseImageMap[phaseId];
  };

  return { getImageForPhase, phaseImageMap };
};
