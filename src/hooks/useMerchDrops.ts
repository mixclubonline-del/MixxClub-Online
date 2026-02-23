/**
 * useMerchDrops — Drop lifecycle engine for limited edition merch.
 * 
 * A "drop" is a time-limited collection with:
 * - Scheduled launch date with countdown
 * - Limited quantities per item (scarcity)
 * - Hype metrics (waitlist count, views)
 * - Status transitions: draft → scheduled → live → sold_out/ended
 * 
 * This is what separates MixxClub merch from Shopify.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { DropStatus, GarmentType } from './MerchConfig';

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

export interface MerchDrop {
    id: string;
    storefront_id: string;
    creator_id: string;
    /** Collection name, e.g. "Midnight Sessions Vol. 1" */
    name: string;
    description?: string;
    /** Hero banner for the drop page */
    banner_url?: string;
    /** Lookbook images — styled photos of merch */
    lookbook_images: string[];
    /** When the drop goes live */
    launch_date: string;
    /** When the drop ends (null = until sold out) */
    end_date?: string;
    status: DropStatus;
    /** Number of unique items in this drop */
    item_count: number;
    /** Total quantity across all items */
    total_quantity: number;
    /** How many have been sold */
    total_sold: number;
    /** Waitlist signups */
    waitlist_count: number;
    /** Page views */
    view_count: number;
    /** Total revenue from this drop in USD */
    total_revenue: number;
    /** Coinz accepted for this drop */
    accept_coinz: boolean;
    /** Tags/vibes for discoverability */
    tags: string[];
    created_at: string;
    updated_at: string;
}

export interface DropItem {
    id: string;
    drop_id: string;
    /** Link to merch_products if product already exists */
    product_id?: string;
    name: string;
    description?: string;
    garment_type: GarmentType;
    /** Primary image */
    image_url?: string;
    /** Additional images */
    gallery: string[];
    /** Base price in USD */
    price: number;
    /** Price in coinz (null = no coinz option) */
    coinz_price?: number;
    /** Available sizes */
    sizes: string[];
    /** Available colors */
    colors: string[];
    /** Total quantity available */
    quantity_total: number;
    /** Remaining quantity */
    quantity_remaining: number;
    /** Max per customer */
    limit_per_customer: number;
    sort_order: number;
    created_at: string;
}

export interface DropOrder {
    id: string;
    drop_id: string;
    item_id: string;
    buyer_id: string;
    size: string;
    color: string;
    quantity: number;
    amount_paid: number;
    coinz_used: number;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
    shipping_address?: Record<string, string>;
    created_at: string;
}

interface CreateDropInput {
    name: string;
    description?: string;
    banner_url?: string;
    lookbook_images?: string[];
    launch_date: string;
    end_date?: string;
    accept_coinz?: boolean;
    tags?: string[];
}

interface CreateDropItemInput {
    name: string;
    description?: string;
    garment_type: GarmentType;
    image_url?: string;
    gallery?: string[];
    price: number;
    coinz_price?: number;
    sizes: string[];
    colors: string[];
    quantity_total: number;
    limit_per_customer?: number;
}

// ═══════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════

export function useMerchDrops(storefrontId?: string) {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // ── Fetch drops ──────────────────────

    const dropsQuery = useQuery({
        queryKey: ['merch-drops', storefrontId],
        queryFn: async () => {
            let query = supabase
                .from('merch_drops')
                .select('*')
                .order('launch_date', { ascending: false });

            if (storefrontId) {
                query = query.eq('storefront_id', storefrontId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return (data || []) as MerchDrop[];
        },
        staleTime: 30000,
    });

    // ── Fetch items for a specific drop ──

    const useDropItems = (dropId?: string) => useQuery({
        queryKey: ['merch-drop-items', dropId],
        queryFn: async () => {
            if (!dropId) return [];
            const { data, error } = await supabase
                .from('merch_drop_items')
                .select('*')
                .eq('drop_id', dropId)
                .order('sort_order', { ascending: true });

            if (error) throw error;
            return (data || []) as DropItem[];
        },
        enabled: !!dropId,
    });

    // ── Create drop ──────────────────────

    const createDropMutation = useMutation({
        mutationFn: async (input: CreateDropInput) => {
            if (!user?.id || !storefrontId) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('merch_drops')
                .insert({
                    storefront_id: storefrontId,
                    creator_id: user.id,
                    name: input.name,
                    description: input.description,
                    banner_url: input.banner_url,
                    lookbook_images: input.lookbook_images || [],
                    launch_date: input.launch_date,
                    end_date: input.end_date,
                    status: 'draft',
                    item_count: 0,
                    total_quantity: 0,
                    total_sold: 0,
                    waitlist_count: 0,
                    view_count: 0,
                    total_revenue: 0,
                    accept_coinz: input.accept_coinz ?? true,
                    tags: input.tags || [],
                })
                .select()
                .single();

            if (error) throw error;
            return data as MerchDrop;
        },
        onSuccess: (drop) => {
            queryClient.invalidateQueries({ queryKey: ['merch-drops'] });
            toast({
                title: '🔥 Drop Created!',
                description: `"${drop.name}" is ready for items`,
            });
        },
        onError: (error) => {
            toast({ title: 'Failed to create drop', description: error.message, variant: 'destructive' });
        },
    });

    // ── Add item to drop ──────────────────

    const addItemMutation = useMutation({
        mutationFn: async ({ dropId, input }: { dropId: string; input: CreateDropItemInput }) => {
            if (!user?.id) throw new Error('Not authenticated');

            // Get current item count for sort order
            const { count } = await supabase
                .from('merch_drop_items')
                .select('id', { count: 'exact', head: true })
                .eq('drop_id', dropId);

            const { data, error } = await supabase
                .from('merch_drop_items')
                .insert({
                    drop_id: dropId,
                    name: input.name,
                    description: input.description,
                    garment_type: input.garment_type,
                    image_url: input.image_url,
                    gallery: input.gallery || [],
                    price: input.price,
                    coinz_price: input.coinz_price,
                    sizes: input.sizes,
                    colors: input.colors,
                    quantity_total: input.quantity_total,
                    quantity_remaining: input.quantity_total,
                    limit_per_customer: input.limit_per_customer || 3,
                    sort_order: (count || 0) + 1,
                })
                .select()
                .single();

            if (error) throw error;

            // Update drop totals
            await supabase
                .from('merch_drops')
                .update({
                    item_count: (count || 0) + 1,
                    total_quantity: supabase.rpc ? input.quantity_total : input.quantity_total, // simplified
                })
                .eq('id', dropId);

            return data as DropItem;
        },
        onSuccess: (item) => {
            queryClient.invalidateQueries({ queryKey: ['merch-drop-items'] });
            queryClient.invalidateQueries({ queryKey: ['merch-drops'] });
            toast({
                title: '✅ Item Added',
                description: `"${item.name}" added to drop`,
            });
        },
        onError: (error) => {
            toast({ title: 'Failed to add item', description: error.message, variant: 'destructive' });
        },
    });

    // ── Schedule / Launch drop ──────────────

    const updateDropStatusMutation = useMutation({
        mutationFn: async ({ dropId, status }: { dropId: string; status: DropStatus }) => {
            const { error } = await supabase
                .from('merch_drops')
                .update({
                    status,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', dropId);

            if (error) throw error;
            return { dropId, status };
        },
        onSuccess: ({ status }) => {
            queryClient.invalidateQueries({ queryKey: ['merch-drops'] });
            const messages: Record<string, string> = {
                scheduled: '📅 Drop scheduled! Countdown begins.',
                live: '🔴 DROP IS LIVE! Let\'s go!',
                ended: '✅ Drop ended.',
                sold_out: '🔥 SOLD OUT!',
            };
            toast({ title: messages[status] || 'Status updated' });
        },
    });

    // ── Join waitlist ──────────────────────

    const joinWaitlistMutation = useMutation({
        mutationFn: async (dropId: string) => {
            if (!user?.id) throw new Error('Not authenticated');

            // Increment waitlist count
            const drop = dropsQuery.data?.find(d => d.id === dropId);
            if (!drop) throw new Error('Drop not found');

            await supabase
                .from('merch_drops')
                .update({ waitlist_count: drop.waitlist_count + 1 })
                .eq('id', dropId);

            // Record waitlist entry
            await supabase
                .from('merch_drop_waitlist')
                .insert({
                    drop_id: dropId,
                    user_id: user.id,
                });

            return { dropId };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['merch-drops'] });
            toast({
                title: '🔔 You\'re on the list!',
                description: 'We\'ll notify you when this drop goes live',
            });
        },
    });

    // ── Purchase item from drop ──────────────

    const purchaseItemMutation = useMutation({
        mutationFn: async ({
            dropId, itemId, size, color, quantity, coinzUsed,
        }: {
            dropId: string; itemId: string; size: string; color: string;
            quantity: number; coinzUsed?: number;
        }) => {
            if (!user?.id) throw new Error('Not authenticated');

            // Check availability
            const { data: item, error: itemErr } = await supabase
                .from('merch_drop_items')
                .select('*')
                .eq('id', itemId)
                .single();

            if (itemErr || !item) throw new Error('Item not found');
            if (item.quantity_remaining < quantity) throw new Error('Not enough stock');

            const totalUsd = item.price * quantity;

            // Record order
            const { data: order, error: orderErr } = await supabase
                .from('merch_drop_orders')
                .insert({
                    drop_id: dropId,
                    item_id: itemId,
                    buyer_id: user.id,
                    size,
                    color,
                    quantity,
                    amount_paid: totalUsd,
                    coinz_used: coinzUsed || 0,
                    status: 'confirmed',
                })
                .select()
                .single();

            if (orderErr) throw orderErr;

            // Decrement stock
            await supabase
                .from('merch_drop_items')
                .update({ quantity_remaining: item.quantity_remaining - quantity })
                .eq('id', itemId);

            // Update drop totals
            const drop = dropsQuery.data?.find(d => d.id === dropId);
            if (drop) {
                const newSold = drop.total_sold + quantity;
                const newRevenue = drop.total_revenue + totalUsd;
                const allSoldOut = newSold >= drop.total_quantity;

                await supabase
                    .from('merch_drops')
                    .update({
                        total_sold: newSold,
                        total_revenue: newRevenue,
                        status: allSoldOut ? 'sold_out' : drop.status,
                    })
                    .eq('id', dropId);
            }

            return order as DropOrder;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['merch-drops'] });
            queryClient.invalidateQueries({ queryKey: ['merch-drop-items'] });
            toast({
                title: '🛍️ Order Confirmed!',
                description: 'Your merch is on its way!',
            });
        },
        onError: (error) => {
            toast({ title: 'Purchase failed', description: error.message, variant: 'destructive' });
        },
    });

    // ── Track view ──────────────────────

    const trackView = async (dropId: string) => {
        const drop = dropsQuery.data?.find(d => d.id === dropId);
        if (drop) {
            await supabase
                .from('merch_drops')
                .update({ view_count: drop.view_count + 1 })
                .eq('id', dropId);
        }
    };

    // ── Computed helpers ──────────────────

    const liveDrops = dropsQuery.data?.filter(d => d.status === 'live') || [];
    const scheduledDrops = dropsQuery.data?.filter(d => d.status === 'scheduled') || [];
    const pastDrops = dropsQuery.data?.filter(d => d.status === 'ended' || d.status === 'sold_out') || [];

    return {
        drops: dropsQuery.data || [],
        isLoading: dropsQuery.isLoading,
        liveDrops,
        scheduledDrops,
        pastDrops,

        // Sub-queries
        useDropItems,

        // Mutations
        createDrop: createDropMutation.mutateAsync,
        isCreating: createDropMutation.isPending,
        addItem: addItemMutation.mutateAsync,
        isAddingItem: addItemMutation.isPending,
        updateDropStatus: updateDropStatusMutation.mutateAsync,
        joinWaitlist: joinWaitlistMutation.mutateAsync,
        purchaseItem: purchaseItemMutation.mutateAsync,
        isPurchasing: purchaseItemMutation.isPending,
        trackView,
    };
}
