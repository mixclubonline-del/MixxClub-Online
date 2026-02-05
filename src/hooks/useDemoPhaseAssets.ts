 import { useState, useEffect, useMemo } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 
 export type DemoPhaseId = 'problem' | 'discovery' | 'connection' | 'transformation' | 'tribe' | 'invitation';
 
 interface DemoPhaseAsset {
   phaseId: DemoPhaseId;
   imageUrl: string | null;
 }
 
 /**
  * Fetches demo phase background assets from brand_assets table.
  * Looks for assets with context prefix 'demo_phase_'.
  * No prime_* fallbacks - uses gradient-only fallback if asset missing.
  */
 export const useDemoPhaseAssets = () => {
   const [assets, setAssets] = useState<Record<DemoPhaseId, string | null>>({
     problem: null,
     discovery: null,
     connection: null,
     transformation: null,
     tribe: null,
     invitation: null,
   });
   const [isLoading, setIsLoading] = useState(true);
 
   useEffect(() => {
     const fetchDemoPhaseAssets = async () => {
       try {
         const { data, error } = await supabase
           .from('brand_assets')
           .select('asset_context, public_url')
           .like('asset_context', 'demo_phase_%')
           .eq('is_active', true);
 
         if (error) {
           console.error('Error fetching demo phase assets:', error);
           return;
         }
 
         if (data) {
           const mapping: Record<string, string> = {};
           data.forEach((asset) => {
             if (asset.asset_context) {
               // Convert 'demo_phase_problem' -> 'problem'
               const phaseId = asset.asset_context.replace('demo_phase_', '');
               mapping[phaseId] = asset.public_url;
             }
           });
 
           setAssets((prev) => ({
             ...prev,
             ...mapping,
           }));
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
     return assets[phaseId] ?? null;
   };
 
   return useMemo(() => ({
     assets,
     isLoading,
     getAssetForPhase,
   }), [assets, isLoading]);
 };