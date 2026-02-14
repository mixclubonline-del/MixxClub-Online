/**
 * Hook for product wishlists / favorites.
 * Queries wishlists table with optimistic updates.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase as _supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// wishlists table not yet in generated types — untyped client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase: any = _supabase;

export interface WishlistItem {
    id: string;
    product_id: string;
    user_id: string;
    created_at: string;
    product?: {
        id: string;
        title: string;
        price: number;
        image_url?: string;
        seller_name?: string;
        category?: string;
    };
}

/**
 * Fetch user's full wishlist with product details
 */
export const useWishlist = () => {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['wishlist', user?.id],
        queryFn: async () => {
            if (!user) return [] as WishlistItem[];

            const { data, error } = await supabase
                .from('wishlists')
                .select(`
          id, product_id, user_id, created_at,
          marketplace_products:product_id (
            id, title, price, image_url, seller_name, category
          )
        `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('useWishlist error:', error.message);
                return [] as WishlistItem[];
            }

            return (data || []).map((row: Record<string, unknown>) => ({
                id: row.id as string,
                product_id: row.product_id as string,
                user_id: row.user_id as string,
                created_at: row.created_at as string,
                product: row.marketplace_products as WishlistItem['product'],
            })) as WishlistItem[];
        },
        enabled: !!user,
    });
};

/**
 * Check if a specific product is in the user's wishlist
 */
export const useIsWishlisted = (productId: string) => {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['is-wishlisted', productId, user?.id],
        queryFn: async () => {
            if (!user) return false;

            const { data } = await supabase
                .from('wishlists')
                .select('id')
                .eq('user_id', user.id)
                .eq('product_id', productId)
                .maybeSingle();

            return !!data;
        },
        enabled: !!user && !!productId,
    });
};

/**
 * Toggle a product in/out of the wishlist with optimistic updates
 */
export const useToggleWishlist = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (productId: string) => {
            if (!user) throw new Error('Must be signed in');

            // Check if already wishlisted
            const { data: existing } = await supabase
                .from('wishlists')
                .select('id')
                .eq('user_id', user.id)
                .eq('product_id', productId)
                .maybeSingle();

            if (existing) {
                // Remove from wishlist
                const { error } = await supabase
                    .from('wishlists')
                    .delete()
                    .eq('id', existing.id);

                if (error) throw error;
                return { action: 'removed' as const, productId };
            }

            // Add to wishlist
            const { error } = await supabase
                .from('wishlists')
                .insert({ user_id: user.id, product_id: productId });

            if (error) throw error;
            return { action: 'added' as const, productId };
        },
        onMutate: async (productId) => {
            // Optimistic update for the is-wishlisted query
            await queryClient.cancelQueries({ queryKey: ['is-wishlisted', productId, user?.id] });
            const prev = queryClient.getQueryData<boolean>(['is-wishlisted', productId, user?.id]);
            queryClient.setQueryData(['is-wishlisted', productId, user?.id], !prev);
            return { prev };
        },
        onError: (_err, productId, context) => {
            // Revert optimistic update
            queryClient.setQueryData(['is-wishlisted', productId, user?.id], context?.prev);
            toast({ title: 'Error', description: 'Failed to update wishlist', variant: 'destructive' });
        },
        onSettled: (_data, _error, productId) => {
            queryClient.invalidateQueries({ queryKey: ['is-wishlisted', productId, user?.id] });
            queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });
        },
        onSuccess: (data) => {
            toast({
                title: data.action === 'added' ? 'Added to Wishlist' : 'Removed from Wishlist',
                description: data.action === 'added' ? 'You can view your wishlist anytime' : 'Item removed',
            });
        },
    });
};

/**
 * Get wishlist count (for badge display)
 */
export const useWishlistCount = () => {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['wishlist-count', user?.id],
        queryFn: async () => {
            if (!user) return 0;

            const { count } = await supabase
                .from('wishlists')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            return count || 0;
        },
        enabled: !!user,
    });
};
