/**
 * useGatedContent — Create, manage, and unlock coinz-gated content.
 * 
 * Artists price their exclusive content in coinz.
 * Fans spend coinz to unlock, creating a direct creator economy.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useMixxWallet } from './useMixxWallet';

export interface GatedItem {
    id: string;
    creator_id: string;
    title: string;
    description: string;
    content_type: 'stems' | 'tutorial' | 'behind_scenes' | 'early_access' | 'sample_pack' | 'preset' | 'custom';
    coinz_price: number;
    content_url: string;
    preview_url?: string;
    preview_text?: string;
    total_unlocks: number;
    total_revenue: number;
    is_active: boolean;
    created_at: string;
}

export interface GatedUnlock {
    id: string;
    user_id: string;
    item_id: string;
    coinz_paid: number;
    unlocked_at: string;
}

export interface GatedItemWithUnlock extends GatedItem {
    isUnlocked: boolean;
    unlock?: GatedUnlock;
}

const CONTENT_TYPE_LABELS: Record<string, { label: string; emoji: string }> = {
    stems: { label: 'Stem Pack', emoji: '🎛️' },
    tutorial: { label: 'Tutorial', emoji: '🎓' },
    behind_scenes: { label: 'Behind the Scenes', emoji: '🎬' },
    early_access: { label: 'Early Access', emoji: '🚀' },
    sample_pack: { label: 'Sample Pack', emoji: '🥁' },
    preset: { label: 'Preset Pack', emoji: '🎨' },
    custom: { label: 'Exclusive', emoji: '✨' },
};

// Helper for tables not yet in generated types
const fromAny = (table: string) => (supabase.from as any)(table);

export function useGatedContent(creatorId?: string) {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { spendCoinz, canAfford } = useMixxWallet();

    const itemsQuery = useQuery({
        queryKey: ['gated-content', creatorId],
        queryFn: async () => {
            let query = fromAny('gated_content')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (creatorId) {
                query = query.eq('creator_id', creatorId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return (data || []) as GatedItem[];
        },
        staleTime: 30000,
    });

    const unlocksQuery = useQuery({
        queryKey: ['gated-unlocks', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const { data, error } = await fromAny('gated_content_unlocks')
                .select('*')
                .eq('user_id', user.id);

            if (error) throw error;
            return (data || []) as GatedUnlock[];
        },
        enabled: !!user?.id,
    });

    const itemsWithUnlocks: GatedItemWithUnlock[] = (itemsQuery.data || []).map(item => {
        const unlock = unlocksQuery.data?.find(u => u.item_id === item.id);
        return {
            ...item,
            isUnlocked: !!unlock || item.creator_id === user?.id,
            unlock: unlock || undefined,
        };
    });

    const createItemMutation = useMutation({
        mutationFn: async (input: {
            title: string;
            description: string;
            content_type: GatedItem['content_type'];
            coinz_price: number;
            content_url: string;
            preview_url?: string;
            preview_text?: string;
        }) => {
            if (!user?.id) throw new Error('Not authenticated');

            const { data, error } = await fromAny('gated_content')
                .insert({
                    creator_id: user.id,
                    ...input,
                    is_active: true,
                    total_unlocks: 0,
                    total_revenue: 0,
                })
                .select()
                .single();

            if (error) throw error;
            return data as GatedItem;
        },
        onSuccess: (item) => {
            queryClient.invalidateQueries({ queryKey: ['gated-content'] });
            toast({
                title: '🔒 Gated Content Created!',
                description: `"${item.title}" is now available for ${item.coinz_price} coinz`,
            });
        },
        onError: (error) => {
            toast({
                title: 'Failed to create gated content',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    const unlockItemMutation = useMutation({
        mutationFn: async (itemId: string) => {
            if (!user?.id) throw new Error('Not authenticated');

            const item = itemsQuery.data?.find(i => i.id === itemId);
            if (!item) throw new Error('Item not found');
            if (!canAfford(item.coinz_price)) throw new Error('Insufficient MixxCoinz');

            const alreadyUnlocked = unlocksQuery.data?.some(u => u.item_id === itemId);
            if (alreadyUnlocked) throw new Error('Already unlocked');

            await spendCoinz({
                amount: item.coinz_price,
                source: 'gated_content',
                description: `Unlocked: ${item.title}`,
                referenceType: 'gated_content',
                referenceId: itemId,
            });

            const { error: unlockError } = await fromAny('gated_content_unlocks')
                .insert({
                    user_id: user.id,
                    item_id: itemId,
                    coinz_paid: item.coinz_price,
                });

            if (unlockError) throw unlockError;

            await fromAny('gated_content')
                .update({
                    total_unlocks: item.total_unlocks + 1,
                    total_revenue: item.total_revenue + item.coinz_price,
                })
                .eq('id', itemId);

            // Credit creator atomically
            await (supabase.rpc as any)('earn_coinz', {
                p_user_id: item.creator_id,
                p_amount: item.coinz_price,
                p_source: 'gated_content_sale',
                p_description: `Fan unlocked "${item.title}"`,
                p_reference_type: 'gated_content',
                p_reference_id: itemId,
            });

            return { item };
        },
        onSuccess: ({ item }) => {
            queryClient.invalidateQueries({ queryKey: ['gated-content'] });
            queryClient.invalidateQueries({ queryKey: ['gated-unlocks'] });
            queryClient.invalidateQueries({ queryKey: ['mixx-wallet'] });
            toast({
                title: '🔓 Content Unlocked!',
                description: `You now have access to "${item.title}"`,
            });
        },
        onError: (error) => {
            toast({
                title: 'Unlock Failed',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    return {
        items: itemsWithUnlocks,
        isLoading: itemsQuery.isLoading,
        createItem: createItemMutation.mutateAsync,
        isCreating: createItemMutation.isPending,
        unlockItem: unlockItemMutation.mutateAsync,
        isUnlocking: unlockItemMutation.isPending,
        contentTypeLabels: CONTENT_TYPE_LABELS,
    };
}
