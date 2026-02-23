/**
 * useMerchDrops — Drop lifecycle engine for limited edition merch.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { DropStatus, GarmentType } from './MerchConfig';

// Helper for tables not yet in generated types
const fromAny = (table: string) => (supabase.from as any)(table);

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

export interface MerchDrop {
    id: string;
    storefront_id: string;
    creator_id: string;
    name: string;
    description?: string;
    banner_url?: string;
    lookbook_images: string[];
    launch_date: string;
    end_date?: string;
    status: DropStatus;
    item_count: number;
    total_quantity: number;
    total_sold: number;
    waitlist_count: number;
    view_count: number;
    total_revenue: number;
    accept_coinz: boolean;
    tags: string[];
    created_at: string;
    updated_at: string;
}

export interface DropItem {
    id: string;
    drop_id: string;
    product_id?: string;
    name: string;
    description?: string;
    garment_type: GarmentType;
    image_url?: string;
    gallery: string[];
    price: number;
    coinz_price?: number;
    sizes: string[];
    colors: string[];
    quantity_total: number;
    quantity_remaining: number;
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

    const dropsQuery = useQuery({
        queryKey: ['merch-drops', storefrontId],
        queryFn: async () => {
            let query = fromAny('merch_drops')
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

    const useDropItems = (dropId?: string) => useQuery({
        queryKey: ['merch-drop-items', dropId],
        queryFn: async () => {
            if (!dropId) return [];
            const { data, error } = await fromAny('merch_drop_items')
                .select('*')
                .eq('drop_id', dropId)
                .order('sort_order', { ascending: true });

            if (error) throw error;
            return (data || []) as DropItem[];
        },
        enabled: !!dropId,
    });

    const createDropMutation = useMutation({
        mutationFn: async (input: CreateDropInput) => {
            if (!user?.id || !storefrontId) throw new Error('Not authenticated');

            const { data, error } = await fromAny('merch_drops')
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

    const addItemMutation = useMutation({
        mutationFn: async ({ dropId, input }: { dropId: string; input: CreateDropItemInput }) => {
            if (!user?.id) throw new Error('Not authenticated');

            const { count } = await fromAny('merch_drop_items')
                .select('id', { count: 'exact', head: true })
                .eq('drop_id', dropId);

            const { data, error } = await fromAny('merch_drop_items')
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
            await fromAny('merch_drops')
                .update({
                    item_count: (count || 0) + 1,
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

    const updateDropStatusMutation = useMutation({
        mutationFn: async ({ dropId, status }: { dropId: string; status: DropStatus }) => {
            const { error } = await fromAny('merch_drops')
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

    const joinWaitlistMutation = useMutation({
        mutationFn: async (dropId: string) => {
            if (!user?.id) throw new Error('Not authenticated');

            const drop = dropsQuery.data?.find(d => d.id === dropId);
            if (!drop) throw new Error('Drop not found');

            await fromAny('merch_drops')
                .update({ waitlist_count: drop.waitlist_count + 1 })
                .eq('id', dropId);

            await fromAny('merch_drop_waitlist')
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

    const purchaseItemMutation = useMutation({
        mutationFn: async ({
            dropId, itemId, size, color, quantity, coinzUsed,
        }: {
            dropId: string; itemId: string; size: string; color: string;
            quantity: number; coinzUsed?: number;
        }) => {
            if (!user?.id) throw new Error('Not authenticated');

            const { data: itemData, error: itemErr } = await fromAny('merch_drop_items')
                .select('*')
                .eq('id', itemId)
                .single();

            if (itemErr || !itemData) throw new Error('Item not found');
            const item = itemData as any;
            if (item.quantity_remaining < quantity) throw new Error('Not enough stock');

            const totalUsd = item.price * quantity;

            const { data: order, error: orderErr } = await fromAny('merch_drop_orders')
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

            await fromAny('merch_drop_items')
                .update({ quantity_remaining: item.quantity_remaining - quantity })
                .eq('id', itemId);

            const drop = dropsQuery.data?.find(d => d.id === dropId);
            if (drop) {
                const newSold = drop.total_sold + quantity;
                const newRevenue = drop.total_revenue + totalUsd;
                const allSoldOut = newSold >= drop.total_quantity;

                await fromAny('merch_drops')
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

    const trackView = async (dropId: string) => {
        const drop = dropsQuery.data?.find(d => d.id === dropId);
        if (drop) {
            await fromAny('merch_drops')
                .update({ view_count: drop.view_count + 1 })
                .eq('id', dropId);
        }
    };

    const liveDrops = dropsQuery.data?.filter(d => d.status === 'live') || [];
    const scheduledDrops = dropsQuery.data?.filter(d => d.status === 'scheduled') || [];
    const pastDrops = dropsQuery.data?.filter(d => d.status === 'ended' || d.status === 'sold_out') || [];

    return {
        drops: dropsQuery.data || [],
        isLoading: dropsQuery.isLoading,
        liveDrops,
        scheduledDrops,
        pastDrops,
        useDropItems,
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
