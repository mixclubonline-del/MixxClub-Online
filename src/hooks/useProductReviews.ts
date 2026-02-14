/**
 * Hook for product reviews & ratings in the marketplace.
 * Queries product_reviews table (creates gracefully if not found).
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase as _supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// product_reviews table not yet in generated types — untyped client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase: any = _supabase;

export interface ProductReview {
    id: string;
    product_id: string;
    user_id: string;
    rating: number; // 1-5
    title: string;
    body: string;
    created_at: string;
    updated_at: string;
    user_name?: string;
    user_avatar?: string;
    helpful_count?: number;
}

export interface ProductRatingStats {
    average: number;
    total: number;
    distribution: Record<number, number>; // { 5: 23, 4: 15, 3: 8, 2: 3, 1: 1 }
}

/**
 * Fetch reviews for a specific product
 */
export const useProductReviews = (productId: string, page = 1, pageSize = 10) => {
    return useQuery({
        queryKey: ['product-reviews', productId, page],
        queryFn: async () => {
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;

            const { data, error, count } = await supabase
                .from('product_reviews')
                .select('*, profiles:user_id(display_name, avatar_url)', { count: 'exact' })
                .eq('product_id', productId)
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) {
                console.error('useProductReviews error:', error.message);
                return { reviews: [] as ProductReview[], total: 0, hasMore: false };
            }

            const reviews: ProductReview[] = (data || []).map((r: Record<string, unknown>) => {
                const profile = r.profiles as Record<string, unknown> | null;
                return {
                    id: r.id as string,
                    product_id: r.product_id as string,
                    user_id: r.user_id as string,
                    rating: r.rating as number,
                    title: (r.title as string) || '',
                    body: (r.body as string) || '',
                    created_at: r.created_at as string,
                    updated_at: r.updated_at as string,
                    user_name: profile?.display_name as string || 'Anonymous',
                    user_avatar: profile?.avatar_url as string || undefined,
                    helpful_count: (r.helpful_count as number) || 0,
                };
            });

            return {
                reviews,
                total: count || 0,
                hasMore: (count || 0) > from + pageSize,
            };
        },
        enabled: !!productId,
    });
};

/**
 * Fetch aggregate rating stats for a product
 */
export const useProductRating = (productId: string) => {
    return useQuery({
        queryKey: ['product-rating', productId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('product_reviews')
                .select('rating')
                .eq('product_id', productId);

            if (error || !data || data.length === 0) {
                return { average: 0, total: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } } as ProductRatingStats;
            }

            const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
            let sum = 0;

            data.forEach((review) => {
                const rating = review.rating as number;
                sum += rating;
                distribution[rating] = (distribution[rating] || 0) + 1;
            });

            return {
                average: Math.round((sum / data.length) * 10) / 10,
                total: data.length,
                distribution,
            } as ProductRatingStats;
        },
        enabled: !!productId,
    });
};

/**
 * Submit a new product review
 */
export const useSubmitReview = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (review: {
            productId: string;
            rating: number;
            title: string;
            body: string;
        }) => {
            if (!user) throw new Error('Must be signed in to leave a review');

            if (review.rating < 1 || review.rating > 5) throw new Error('Rating must be 1-5');
            if (!review.title.trim()) throw new Error('Title is required');
            if (!review.body.trim()) throw new Error('Review body is required');

            // Check for existing review
            const { data: existing } = await supabase
                .from('product_reviews')
                .select('id')
                .eq('product_id', review.productId)
                .eq('user_id', user.id)
                .maybeSingle();

            if (existing) {
                // Update existing review
                const { data, error } = await supabase
                    .from('product_reviews')
                    .update({
                        rating: review.rating,
                        title: review.title.trim(),
                        body: review.body.trim(),
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', existing.id)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            }

            // Insert new review
            const { data, error } = await supabase
                .from('product_reviews')
                .insert({
                    product_id: review.productId,
                    user_id: user.id,
                    rating: review.rating,
                    title: review.title.trim(),
                    body: review.body.trim(),
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            toast({ title: 'Review submitted!', description: 'Thanks for your feedback.' });
            queryClient.invalidateQueries({ queryKey: ['product-reviews', variables.productId] });
            queryClient.invalidateQueries({ queryKey: ['product-rating', variables.productId] });
        },
        onError: (error: Error) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        },
    });
};

/**
 * Check if the current user has already reviewed a product
 */
export const useHasReviewed = (productId: string) => {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['has-reviewed', productId, user?.id],
        queryFn: async () => {
            if (!user) return false;

            const { data } = await supabase
                .from('product_reviews')
                .select('id')
                .eq('product_id', productId)
                .eq('user_id', user.id)
                .maybeSingle();

            return !!data;
        },
        enabled: !!productId && !!user,
    });
};
