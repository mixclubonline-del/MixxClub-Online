/**
 * usePhysicalOrders — Create, manage, and order physical music releases.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { PhysicalFormat, PackagingTier, PhysicalOrderStatus } from './PhysicalMediaConfig';

const fromAny = (table: string) => (supabase.from as any)(table);

// ═══════════════════════════════════════════
// TYPES (unchanged)
// ═══════════════════════════════════════════

export interface PhysicalRelease {
    id: string; storefront_id: string; creator_id: string; title: string; artist_name: string;
    description?: string; cover_art_url?: string; gallery: string[]; format: PhysicalFormat;
    packaging: PackagingTier; vinyl_color?: string; tracklist: TrackEntry[]; price: number;
    coinz_price?: number; edition_size: number; sold_count: number; remaining: number;
    is_numbered: boolean; is_signed: boolean; is_preorder: boolean; ship_date?: string;
    release_date: string; weight_grams: number; total_revenue: number; linked_album_id?: string;
    status: 'draft' | 'preorder' | 'available' | 'sold_out' | 'discontinued'; tags: string[];
    created_at: string; updated_at: string;
}

export interface TrackEntry { number: number; title: string; duration?: string; side?: 'A' | 'B'; }

export interface PhysicalOrder {
    id: string; release_id: string; buyer_id: string; edition_number?: number; quantity: number;
    amount_paid: number; coinz_used: number; packaging_tier: PackagingTier; is_signed: boolean;
    shipping_address: { name: string; line1: string; line2?: string; city: string; state: string; postal_code: string; country: string; };
    shipping_cost: number; tracking_number?: string; status: PhysicalOrderStatus;
    status_history: { status: PhysicalOrderStatus; date: string }[]; created_at: string; updated_at: string;
}

interface CreateReleaseInput {
    title: string; artist_name: string; description?: string; cover_art_url?: string; gallery?: string[];
    format: PhysicalFormat; packaging: PackagingTier; vinyl_color?: string; tracklist: TrackEntry[];
    price: number; coinz_price?: number; edition_size: number; is_numbered?: boolean; is_signed?: boolean;
    is_preorder?: boolean; ship_date?: string; release_date: string; weight_grams?: number;
    linked_album_id?: string; tags?: string[];
}

interface PlaceOrderInput {
    releaseId: string; quantity: number; coinzUsed?: number;
    shipping_address: PhysicalOrder['shipping_address'];
}

// ═══════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════

export function usePhysicalOrders(storefrontId?: string) {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const releasesQuery = useQuery({
        queryKey: ['physical-releases', storefrontId],
        queryFn: async () => {
            let query = fromAny('physical_releases')
                .select('*')
                .order('release_date', { ascending: false });
            if (storefrontId) query = query.eq('storefront_id', storefrontId);
            const { data, error } = await query;
            if (error) throw error;
            return (data || []) as PhysicalRelease[];
        },
        staleTime: 30000,
    });

    const myOrdersQuery = useQuery({
        queryKey: ['physical-orders', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const { data, error } = await fromAny('physical_orders')
                .select('*').eq('buyer_id', user.id).order('created_at', { ascending: false });
            if (error) throw error;
            return (data || []) as PhysicalOrder[];
        },
        enabled: !!user?.id,
    });

    const useSellerOrders = (releaseId?: string) => useQuery({
        queryKey: ['physical-seller-orders', releaseId],
        queryFn: async () => {
            if (!releaseId) return [];
            const { data, error } = await fromAny('physical_orders')
                .select('*').eq('release_id', releaseId).order('created_at', { ascending: false });
            if (error) throw error;
            return (data || []) as PhysicalOrder[];
        },
        enabled: !!releaseId,
    });

    const createReleaseMutation = useMutation({
        mutationFn: async (input: CreateReleaseInput) => {
            if (!user?.id || !storefrontId) throw new Error('Not authenticated');
            const { data, error } = await fromAny('physical_releases')
                .insert({
                    storefront_id: storefrontId, creator_id: user.id, title: input.title,
                    artist_name: input.artist_name, description: input.description,
                    cover_art_url: input.cover_art_url, gallery: input.gallery || [],
                    format: input.format, packaging: input.packaging, vinyl_color: input.vinyl_color,
                    tracklist: input.tracklist, price: input.price, coinz_price: input.coinz_price,
                    edition_size: input.edition_size, sold_count: 0, remaining: input.edition_size,
                    is_numbered: input.is_numbered || false, is_signed: input.is_signed || false,
                    is_preorder: input.is_preorder || false, ship_date: input.ship_date,
                    release_date: input.release_date, weight_grams: input.weight_grams || 400,
                    total_revenue: 0, linked_album_id: input.linked_album_id,
                    status: input.is_preorder ? 'preorder' : 'available', tags: input.tags || [],
                }).select().single();
            if (error) throw error;
            return data as PhysicalRelease;
        },
        onSuccess: (release) => {
            queryClient.invalidateQueries({ queryKey: ['physical-releases'] });
            toast({ title: '🎵 Physical Release Created!', description: `\"${release.title}\" — ${release.edition_size} copies` });
        },
        onError: (error) => { toast({ title: 'Failed to create release', description: error.message, variant: 'destructive' }); },
    });

    const placeOrderMutation = useMutation({
        mutationFn: async (input: PlaceOrderInput) => {
            if (!user?.id) throw new Error('Not authenticated');
            const release = releasesQuery.data?.find(r => r.id === input.releaseId);
            if (!release) throw new Error('Release not found');
            if (release.remaining < input.quantity) throw new Error('Not enough stock');

            const shippingCost = calcShipping(release.weight_grams, input.shipping_address.country);
            const totalPaid = (release.price * input.quantity) + shippingCost;
            let editionNumber: number | undefined;
            if (release.is_numbered) editionNumber = release.sold_count + 1;

            const statusEntry = { status: 'preorder' as PhysicalOrderStatus, date: new Date().toISOString() };
            const { data: order, error: orderErr } = await fromAny('physical_orders')
                .insert({
                    release_id: input.releaseId, buyer_id: user.id, edition_number: editionNumber,
                    quantity: input.quantity, amount_paid: totalPaid, coinz_used: input.coinzUsed || 0,
                    packaging_tier: release.packaging, is_signed: release.is_signed,
                    shipping_address: input.shipping_address, shipping_cost: shippingCost,
                    status: release.is_preorder ? 'preorder' : 'ready_to_ship', status_history: [statusEntry],
                }).select().single();
            if (orderErr) throw orderErr;

            const newSold = release.sold_count + input.quantity;
            const newRemaining = release.remaining - input.quantity;
            await fromAny('physical_releases')
                .update({ sold_count: newSold, remaining: newRemaining, total_revenue: release.total_revenue + totalPaid, status: newRemaining <= 0 ? 'sold_out' : release.status })
                .eq('id', input.releaseId);

            return order as PhysicalOrder;
        },
        onSuccess: (order) => {
            queryClient.invalidateQueries({ queryKey: ['physical-releases'] });
            queryClient.invalidateQueries({ queryKey: ['physical-orders'] });
            toast({ title: order.edition_number ? `🎵 Order Confirmed! Edition #${order.edition_number}` : '🎵 Order Confirmed!' });
        },
        onError: (error) => { toast({ title: 'Order failed', description: error.message, variant: 'destructive' }); },
    });

    const updateOrderStatusMutation = useMutation({
        mutationFn: async ({ orderId, status }: { orderId: string; status: PhysicalOrderStatus }) => {
            const { data: existing } = await fromAny('physical_orders').select('status_history').eq('id', orderId).single();
            const ex = existing as any;
            const history = Array.isArray(ex?.status_history) ? ex.status_history : [];
            history.push({ status, date: new Date().toISOString() });
            const { error } = await fromAny('physical_orders')
                .update({ status, status_history: history, updated_at: new Date().toISOString() }).eq('id', orderId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['physical-orders'] });
            queryClient.invalidateQueries({ queryKey: ['physical-seller-orders'] });
            toast({ title: '📦 Order status updated' });
        },
    });

    const availableReleases = releasesQuery.data?.filter(r => r.status === 'available' || r.status === 'preorder') || [];
    const soldOutReleases = releasesQuery.data?.filter(r => r.status === 'sold_out') || [];

    return {
        releases: releasesQuery.data || [], isLoading: releasesQuery.isLoading,
        availableReleases, soldOutReleases, myOrders: myOrdersQuery.data || [], useSellerOrders,
        createRelease: createReleaseMutation.mutateAsync, isCreating: createReleaseMutation.isPending,
        placeOrder: placeOrderMutation.mutateAsync, isOrdering: placeOrderMutation.isPending,
        updateOrderStatus: updateOrderStatusMutation.mutateAsync,
    };
}

function calcShipping(weightGrams: number, country: string): number {
    const isUs = country === 'US' || country === 'United States';
    if (isUs) { if (weightGrams <= 200) return 4.99; if (weightGrams <= 500) return 6.99; return 8.99; }
    if (weightGrams <= 200) return 9.99; if (weightGrams <= 500) return 14.99; return 19.99;
}
