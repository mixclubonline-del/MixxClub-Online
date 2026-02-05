 import { useState, useEffect, useCallback } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 
 export interface MarketplaceBeat {
   id: string;
   title: string;
   producer_id: string;
   genre: string;
   bpm: number;
   key_signature: string;
   tags: string[];
   audio_url: string;
   preview_url: string;
   cover_image_url: string | null;
   price_cents: number;
   exclusive_price_cents: number;
   license_type: 'lease' | 'exclusive' | 'both';
   is_exclusive_available: boolean;
   plays: number;
   downloads: number;
   status: string;
   created_at: string;
   producer: {
     id: string;
     username: string;
     full_name: string;
     avatar_url: string | null;
   };
 }
 
 export interface MarketplaceFilters {
   genre?: string;
   bpmMin?: number;
   bpmMax?: number;
   keySignature?: string;
   priceMin?: number;
   priceMax?: number;
   search?: string;
   sortBy?: 'newest' | 'popular' | 'price_low' | 'price_high';
 }
 
 export function useBeatMarketplace(filters: MarketplaceFilters = {}) {
   const [beats, setBeats] = useState<MarketplaceBeat[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [hasMore, setHasMore] = useState(true);
   const [page, setPage] = useState(0);
   const pageSize = 12;
 
   const fetchBeats = useCallback(async (pageNum: number = 0, reset: boolean = false) => {
     try {
       setLoading(true);
       setError(null);
 
       let query = supabase
         .from('producer_beats')
         .select(`
           id, title, producer_id, genre, bpm, key_signature, tags,
           audio_url, preview_url, cover_image_url, price_cents, 
           exclusive_price_cents, license_type, is_exclusive_available,
           plays, downloads, status, created_at,
           producer:producer_id(id, username, full_name, avatar_url)
         `)
         .eq('status', 'published');
 
       // Apply filters
       if (filters.genre) {
         query = query.eq('genre', filters.genre);
       }
       if (filters.bpmMin) {
         query = query.gte('bpm', filters.bpmMin);
       }
       if (filters.bpmMax) {
         query = query.lte('bpm', filters.bpmMax);
       }
       if (filters.keySignature) {
         query = query.eq('key_signature', filters.keySignature);
       }
       if (filters.priceMin) {
         query = query.gte('price_cents', filters.priceMin * 100);
       }
       if (filters.priceMax) {
         query = query.lte('price_cents', filters.priceMax * 100);
       }
       if (filters.search) {
         query = query.or(`title.ilike.%${filters.search}%,tags.cs.{${filters.search}}`);
       }
 
       // Apply sorting
       switch (filters.sortBy) {
         case 'popular':
           query = query.order('plays', { ascending: false });
           break;
         case 'price_low':
           query = query.order('price_cents', { ascending: true });
           break;
         case 'price_high':
           query = query.order('price_cents', { ascending: false });
           break;
         case 'newest':
         default:
           query = query.order('created_at', { ascending: false });
       }
 
       // Apply pagination
       const offset = pageNum * pageSize;
       query = query.range(offset, offset + pageSize - 1);
 
       const { data, error: fetchError } = await query;
 
       if (fetchError) throw fetchError;
 
       const typedBeats = (data || []) as unknown as MarketplaceBeat[];
 
       if (reset) {
         setBeats(typedBeats);
       } else {
         setBeats(prev => [...prev, ...typedBeats]);
       }
 
       setHasMore(typedBeats.length === pageSize);
       setPage(pageNum);
     } catch (err) {
       console.error('Error fetching marketplace beats:', err);
       setError(err instanceof Error ? err.message : 'Failed to load beats');
     } finally {
       setLoading(false);
     }
   }, [filters]);
 
   useEffect(() => {
     fetchBeats(0, true);
   }, [filters.genre, filters.bpmMin, filters.bpmMax, filters.keySignature, 
       filters.priceMin, filters.priceMax, filters.search, filters.sortBy]);
 
   const loadMore = () => {
     if (!loading && hasMore) {
       fetchBeats(page + 1);
     }
   };
 
   const refresh = () => {
     fetchBeats(0, true);
   };
 
   return {
     beats,
     loading,
     error,
     hasMore,
     loadMore,
     refresh,
   };
 }
 
 export function useBeatDetail(beatId: string | null) {
   const [beat, setBeat] = useState<MarketplaceBeat | null>(null);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
 
   useEffect(() => {
     if (!beatId) {
       setBeat(null);
       return;
     }
 
     const fetchBeat = async () => {
       try {
         setLoading(true);
         setError(null);
 
         const { data, error: fetchError } = await supabase
           .from('producer_beats')
           .select(`
             id, title, producer_id, genre, bpm, key_signature, tags,
             audio_url, preview_url, cover_image_url, price_cents, 
             exclusive_price_cents, license_type, is_exclusive_available,
             plays, downloads, status, created_at,
             producer:producer_id(id, username, full_name, avatar_url)
           `)
           .eq('id', beatId)
           .eq('status', 'published')
           .single();
 
         if (fetchError) throw fetchError;
 
         setBeat(data as unknown as MarketplaceBeat);
       } catch (err) {
         console.error('Error fetching beat:', err);
         setError(err instanceof Error ? err.message : 'Failed to load beat');
       } finally {
         setLoading(false);
       }
     };
 
     fetchBeat();
   }, [beatId]);
 
   return { beat, loading, error };
 }