import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Static fallback imports
import artistPainFallback from '@/assets/ecosystem/artist-pain.jpg';
import engineerPainFallback from '@/assets/ecosystem/engineer-pain.jpg';
import producerPainFallback from '@/assets/ecosystem/producer-pain.jpg';
import fanDisconnectFallback from '@/assets/ecosystem/fan-disconnect.jpg';
import connectionFallback from '@/assets/ecosystem/connection.jpg';
import cycleFallback from '@/assets/ecosystem/cycle.jpg';
import ctaPortalsFallback from '@/assets/ecosystem/cta-portals.jpg';

export type EcosystemSceneId = 
  | 'artist_pain' 
  | 'engineer_pain' 
  | 'producer_pain' 
  | 'fan_disconnect' 
  | 'connection' 
  | 'ecosystem' 
  | 'cta';

interface EcosystemAsset {
  url: string;
  isVideo: boolean;
}

const SCENE_CONTEXTS: Record<EcosystemSceneId, string> = {
  artist_pain: 'ecosystem_artist_pain',
  engineer_pain: 'ecosystem_engineer_pain',
  producer_pain: 'ecosystem_producer_pain',
  fan_disconnect: 'ecosystem_fan_disconnect',
  connection: 'ecosystem_connection',
  ecosystem: 'ecosystem_cycle',
  cta: 'ecosystem_cta',
};

const STATIC_FALLBACKS: Record<EcosystemSceneId, string> = {
  artist_pain: artistPainFallback,
  engineer_pain: engineerPainFallback,
  producer_pain: producerPainFallback,
  fan_disconnect: fanDisconnectFallback,
  connection: connectionFallback,
  ecosystem: cycleFallback,
  cta: ctaPortalsFallback,
};

const VIDEO_EXTS = ['.mp4', '.webm', '.mov'];

function isVideoUrl(url: string): boolean {
  return VIDEO_EXTS.some((ext) => url.toLowerCase().includes(ext));
}

export function useEcosystemAssets() {
  const [dbAssets, setDbAssets] = useState<Record<string, { url: string; isVideo: boolean }>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const contexts = Object.values(SCENE_CONTEXTS);
        const { data, error } = await supabase
          .from('brand_assets')
          .select('asset_context, public_url, asset_type')
          .in('asset_context', contexts)
          .eq('is_active', true);

        if (!error && data) {
          const map: Record<string, { url: string; isVideo: boolean }> = {};
          data.forEach((a) => {
            if (a.asset_context) {
              map[a.asset_context] = {
                url: a.public_url,
                isVideo: a.asset_type === 'video' || isVideoUrl(a.public_url),
              };
            }
          });
          setDbAssets(map);
        }
      } catch (err) {
        console.error('[EcosystemAssets] fetch failed', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const assets = useMemo(() => {
    const result = {} as Record<EcosystemSceneId, EcosystemAsset>;
    for (const [scene, context] of Object.entries(SCENE_CONTEXTS)) {
      const db = dbAssets[context];
      result[scene as EcosystemSceneId] = db
        ? { url: db.url, isVideo: db.isVideo }
        : { url: STATIC_FALLBACKS[scene as EcosystemSceneId], isVideo: false };
    }
    return result;
  }, [dbAssets]);

  return useMemo(() => ({ assets, isLoading }), [assets, isLoading]);
}
