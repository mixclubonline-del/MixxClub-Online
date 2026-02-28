import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type PromoSceneId = 'hook' | 'answer' | 'proof' | 'culture' | 'cta';

interface PromoAsset {
  url: string | null;
  isVideo: boolean;
}

const SCENE_CONTEXTS: Record<PromoSceneId, { primary: string; fallback: string }> = {
  hook:    { primary: 'promo_hook',    fallback: 'demo_phase_problem' },
  answer:  { primary: 'promo_answer',  fallback: 'demo_phase_discovery' },
  proof:   { primary: 'promo_proof',   fallback: 'demo_phase_transformation' },
  culture: { primary: 'promo_culture', fallback: 'demo_phase_tribe' },
  cta:     { primary: 'promo_cta',     fallback: 'demo_phase_invitation' },
};

const VIDEO_EXTS = ['.mp4', '.webm', '.mov'];

function isVideoUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return VIDEO_EXTS.some((ext) => lower.includes(ext));
}

export function usePromoAssets() {
  const [assets, setAssets] = useState<Record<PromoSceneId, PromoAsset>>({
    hook: { url: null, isVideo: false },
    answer: { url: null, isVideo: false },
    proof: { url: null, isVideo: false },
    culture: { url: null, isVideo: false },
    cta: { url: null, isVideo: false },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const allContexts = Object.values(SCENE_CONTEXTS).flatMap((c) => [c.primary, c.fallback]);
        const { data, error } = await supabase
          .from('brand_assets')
          .select('asset_context, public_url, asset_type')
          .in('asset_context', allContexts)
          .eq('is_active', true);

        if (error) { console.warn('[PromoAssets]', error.message); return; }

        const byContext: Record<string, { url: string; type: string | null }> = {};
        data?.forEach((a) => { if (a.asset_context) byContext[a.asset_context] = { url: a.public_url, type: a.asset_type }; });

        const resolved: Record<string, PromoAsset> = {} as any;
        for (const [scene, { primary, fallback }] of Object.entries(SCENE_CONTEXTS)) {
          const match = byContext[primary] ?? byContext[fallback];
          resolved[scene] = match
            ? { url: match.url, isVideo: match.type === 'video' || isVideoUrl(match.url) }
            : { url: null, isVideo: false };
        }
        setAssets(resolved as Record<PromoSceneId, PromoAsset>);
      } catch (err) {
        console.error('[PromoAssets] fetch failed', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return useMemo(() => ({ assets, isLoading }), [assets, isLoading]);
}
