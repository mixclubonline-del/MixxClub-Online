 import { useState } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/hooks/useAuth';
 import { toast } from 'sonner';
 
 export function useBeatPurchase() {
   const [loading, setLoading] = useState(false);
   const { user } = useAuth();
 
   const createBeatCheckout = async (
     beatId: string, 
     licenseType: 'lease' | 'exclusive'
   ): Promise<string | null> => {
     if (!user) {
       toast.error('Please sign in to purchase beats');
       return null;
     }
 
     try {
       setLoading(true);
 
       const { data, error } = await supabase.functions.invoke('create-beat-checkout', {
         body: { beatId, licenseType }
       });
 
       if (error) {
         throw new Error(error.message || 'Failed to create checkout');
       }
 
       if (!data?.url) {
         throw new Error('No checkout URL returned');
       }
 
       // Open checkout in new tab
       window.open(data.url, '_blank');
       return data.sessionId;
     } catch (err) {
       console.error('Beat checkout error:', err);
       toast.error(err instanceof Error ? err.message : 'Failed to start checkout');
       return null;
     } finally {
       setLoading(false);
     }
   };
 
   return {
     createBeatCheckout,
     loading,
     isAuthenticated: !!user,
   };
 }
 
 export function useMyPurchases() {
   const [purchases, setPurchases] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const { user } = useAuth();
 
   const fetchPurchases = async () => {
     if (!user) {
       setPurchases([]);
       setLoading(false);
       return;
     }
 
     try {
       setLoading(true);
 
       const { data, error } = await supabase
         .from('beat_purchases')
         .select(`
           id, license_type, amount_cents, status, created_at, downloaded_at,
           beat:beat_id(id, title, audio_url, cover_image_url, producer:producer_id(username, full_name))
         `)
         .eq('buyer_id', user.id)
         .eq('status', 'completed')
         .order('created_at', { ascending: false });
 
       if (error) throw error;
       setPurchases(data || []);
     } catch (err) {
       console.error('Error fetching purchases:', err);
       toast.error('Failed to load purchases');
     } finally {
       setLoading(false);
     }
   };
 
   const markAsDownloaded = async (purchaseId: string) => {
     try {
       await supabase
         .from('beat_purchases')
         .update({ downloaded_at: new Date().toISOString() })
         .eq('id', purchaseId);
       
       setPurchases(prev => 
         prev.map(p => p.id === purchaseId ? { ...p, downloaded_at: new Date().toISOString() } : p)
       );
     } catch (err) {
       console.error('Error marking download:', err);
     }
   };
 
   return {
     purchases,
     loading,
     fetchPurchases,
     markAsDownloaded,
   };
 }