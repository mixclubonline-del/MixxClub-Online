 import { useState, useEffect, useMemo } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 
export type DemoPhaseId = 'problem' | 'discovery' | 'connection' | 'transformation' | 'studio' | 'marketplace' | 'stage' | 'bag' | 'network' | 'invitation';

interface DemoPhaseAssetData {
  imageUrl: string | null;
  assetType: string | null; // 'image' | 'video' | null
}

/**
 * Fetches demo phase background assets from brand_assets table.
 * Looks for assets with context prefix 'demo_phase_'.
 * Returns both URL and asset_type for video detection.
 */
export const useDemoPhaseAssets = () => {
  const [assets, setAssets] = useState<Record<DemoPhaseId, DemoPhaseAssetData>>({
    problem: { imageUrl: null, assetType: null },
    discovery: { imageUrl: null, assetType: null },
    connection: { imageUrl: null, assetType: null },
    transformation: { imageUrl: null, assetType: null },
    studio: { imageUrl: null, assetType: null },
    marketplace: { imageUrl: null, assetType: null },
    stage: { imageUrl: null, assetType: null },
    bag: { imageUrl: null, assetType: null },
    network: { imageUrl: null, assetType: null },
    invitation: { imageUrl: null, assetType: null },
  });
   const [isLoading, setIsLoading] = useState(true);
 
   useEffect(() => {
     const fetchDemoPhaseAssets = async () => {
       try {
         const { data, error } = await supabase
           .from('brand_assets')
           .select('asset_context, public_url, asset_type')
           .like('asset_context', 'demo_phase_%')
           .eq('is_active', true);
 
         if (error) {
           console.error('Error fetching demo phase assets:', error);
           return;
         }
 
         if (data) {
           const mapping: Record<string, DemoPhaseAssetData> = {};
           data.forEach((asset) => {
             if (asset.asset_context) {
               const phaseId = asset.asset_context.replace('demo_phase_', '');
               mapping[phaseId] = {
                 imageUrl: asset.public_url,
                 assetType: asset.asset_type,
               };
             }
           });
 
           setAssets((prev) => {
             const updated = { ...prev };
             for (const [key, value] of Object.entries(mapping)) {
               if (key in updated) {
                 (updated as any)[key] = value;
               }
             }
             return updated;
           });
         }
       } catch (err) {
         console.error('Failed to fetch demo phase assets:', err);
       } finally {
         setIsLoading(false);
       }
     };
 
     fetchDemoPhaseAssets();
   }, []);
 
   const getAssetForPhase = (phaseId: DemoPhaseId): string | null => {
     return assets[phaseId]?.imageUrl ?? null;
   };

   const getAssetTypeForPhase = (phaseId: DemoPhaseId): string | null => {
     return assets[phaseId]?.assetType ?? null;
   };
 
   return useMemo(() => ({
     assets,
     isLoading,
     getAssetForPhase,
     getAssetTypeForPhase,
   }), [assets, isLoading]);
 };
