// Maps each InsiderDemo phase to a specific Prime image from brand-assets bucket
const STORAGE_BASE = 'https://kbbrehnyqpulbxyesril.supabase.co/storage/v1/object/public/brand-assets';

// Phase-to-image mapping using uploaded Prime images
const phaseImageMap: Record<string, string> = {
  drop: `${STORAGE_BASE}/IMG_0502.jpeg`,
  awakening: `${STORAGE_BASE}/IMG_0489.jpeg`,
  mission: `${STORAGE_BASE}/IMG_0491.jpeg`,
  analysis: `${STORAGE_BASE}/IMG_0495.jpeg`,
  studio: `${STORAGE_BASE}/IMG_0497.jpeg`,
  collaboration: `${STORAGE_BASE}/IMG_0499.jpeg`,
  results: `${STORAGE_BASE}/IMG_0501.jpeg`,
  crm: `${STORAGE_BASE}/IMG_0503.jpeg`,
  cta: `${STORAGE_BASE}/IMG_0505.jpeg`,
};

export const usePrimeImages = () => {
  const getImageForPhase = (phaseId: string): string | undefined => {
    return phaseImageMap[phaseId];
  };

  return { getImageForPhase, phaseImageMap };
};
