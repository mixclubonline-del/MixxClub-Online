import { supabase } from './supabaseClient';
import { SupabaseService } from './supabaseClient';

/**
 * MARKETPLACE SERVICE - Backend Integration
 * Handles product listings, purchases, and seller analytics
 */

export interface MarketplaceProduct {
    id: string;
    seller_id: string;
    seller_name: string;
    title: string;
    description: string;
    category: string;
    tags: string[];
    price: number;
    downloads: number;
    rating: number;
    reviews_count: number;
    preview_url?: string;
    download_url?: string;
    created_at: string;
    updated_at: string;
}

export interface CartItem {
    product_id: string;
    quantity: number;
    price: number;
}

export interface PurchaseOrder {
    id: string;
    buyer_id: string;
    total_amount: number;
    items: CartItem[];
    stripe_payment_intent_id: string;
    status: 'pending' | 'completed' | 'failed';
    created_at: string;
}

export interface SellerAnalytics {
    total_sales: number;
    total_earnings: number;
    monthly_revenue: number;
    total_products: number;
    total_downloads: number;
    average_rating: number;
    recent_sales: PurchaseOrder[];
}

export const MarketplaceService = {
    /**
     * Get all products with filters
     */
    async getProducts(filters?: {
        category?: string;
        tags?: string[];
        minRating?: number;
        sortBy?: 'trending' | 'newest' | 'bestselling' | 'rating';
    }): Promise<MarketplaceProduct[]> {
        let query = supabase.from('marketplace_products').select('*');

        if (filters?.category) {
            query = query.eq('category', filters.category);
        }

        if (filters?.tags?.length) {
            query = query.contains('tags', filters.tags);
        }

        if (filters?.minRating) {
            query = query.gte('rating', filters.minRating);
        }

        // Apply sorting
        switch (filters?.sortBy) {
            case 'trending':
                query = query.order('downloads', { ascending: false });
                break;
            case 'bestselling':
                query = query.order('downloads', { ascending: false });
                break;
            case 'newest':
                query = query.order('created_at', { ascending: false });
                break;
            case 'rating':
                query = query.order('rating', { ascending: false });
                break;
        }

        const { data, error } = await query;

        if (error) {
            console.error('Failed to fetch products:', error);
            return [];
        }

        return data as MarketplaceProduct[];
    },

    /**
     * Get product by ID
     */
    async getProduct(productId: string): Promise<MarketplaceProduct | null> {
        const { data, error } = await supabase
            .from('marketplace_products')
            .select('*')
            .eq('id', productId)
            .single();

        if (error) {
            console.error('Failed to fetch product:', error);
            return null;
        }

        return data as MarketplaceProduct;
    },

    /**
     * Create a new product
     */
    async createProduct(
        sellerId: string,
        product: Omit<MarketplaceProduct, 'id' | 'seller_id' | 'created_at' | 'updated_at' | 'downloads' | 'reviews_count'>
    ): Promise<MarketplaceProduct> {
        const { data, error } = await supabase
            .from('marketplace_products')
            .insert({
                seller_id: sellerId,
                ...product,
                downloads: 0,
                reviews_count: 0,
            })
            .select()
            .single();

        if (error) {
            console.error('Failed to create product:', error);
            throw error;
        }

        return data as MarketplaceProduct;
    },

    /**
     * Create purchase order and process Stripe payment
     */
    async createOrder(
        buyerId: string,
        items: CartItem[]
    ): Promise<{ client_secret: string; order_id: string }> {
        try {
            const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

            // Create order in database
            const { data: orderData, error: orderError } = await supabase
                .from('marketplace_orders')
                .insert({
                    buyer_id: buyerId,
                    items,
                    total_amount: totalAmount,
                    status: 'pending',
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // Call edge function to create Stripe payment intent
            const response = await SupabaseService.callEdgeFunction<{
                client_secret: string;
            }>('create-marketplace-checkout', {
                order_id: orderData.id,
                amount: totalAmount,
                buyer_id: buyerId,
                items,
            });

            // Update order with Stripe ID
            await supabase
                .from('marketplace_orders')
                .update({
                    stripe_payment_intent_id: response.client_secret.split('_secret_')[0],
                })
                .eq('id', orderData.id);

            return {
                client_secret: response.client_secret,
                order_id: orderData.id,
            };
        } catch (error) {
            console.error('Failed to create order:', error);
            throw error;
        }
    },

    /**
     * Confirm purchase and distribute earnings
     */
    async confirmPurchase(orderId: string): Promise<boolean> {
        try {
            // Update order status
            const { error } = await supabase
                .from('marketplace_orders')
                .update({ status: 'completed' })
                .eq('id', orderId);

            if (error) throw error;

            // Call edge function to process seller payouts (70/30 split)
            await SupabaseService.callEdgeFunction('process-marketplace-payouts', {
                order_id: orderId,
            });

            // Increment product download counts
            const { data: order } = await supabase.from('marketplace_orders').select('items').eq('id', orderId).single();

            if (order?.items) {
                for (const item of order.items) {
                    await supabase.rpc('increment_product_downloads', {
                        product_id: item.product_id,
                        count: item.quantity,
                    });
                }
            }

            return true;
        } catch (error) {
            console.error('Failed to confirm purchase:', error);
            return false;
        }
    },

    /**
     * Get seller analytics
     */
    async getSellerAnalytics(sellerId: string): Promise<SellerAnalytics> {
        try {
            const { data, error } = await supabase.rpc('get_seller_analytics', {
                seller_id_param: sellerId,
            });

            if (error) throw error;
            return data as SellerAnalytics;
        } catch (error) {
            console.error('Failed to get seller analytics:', error);
            throw error;
        }
    },

    /**
     * Track product download
     */
    async trackDownload(productId: string, buyerId: string): Promise<boolean> {
        try {
            const { error } = await supabase.from('product_downloads').insert({
                product_id: productId,
                buyer_id: buyerId,
                downloaded_at: new Date().toISOString(),
            });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Failed to track download:', error);
            return false;
        }
    },

    /**
     * Add product review
     */
    async addReview(
        productId: string,
        buyerId: string,
        rating: number,
        comment: string
    ): Promise<boolean> {
        try {
            const { error } = await supabase.from('product_reviews').insert({
                product_id: productId,
                buyer_id: buyerId,
                rating,
                comment,
                created_at: new Date().toISOString(),
            });

            if (error) throw error;

            // Update product rating
            await supabase.rpc('update_product_rating', {
                product_id: productId,
            });

            return true;
        } catch (error) {
            console.error('Failed to add review:', error);
            return false;
        }
    },

    /**
     * Get seller's products
     */
    async getSellerProducts(sellerId: string): Promise<MarketplaceProduct[]> {
        const { data, error } = await supabase
            .from('marketplace_products')
            .select('*')
            .eq('seller_id', sellerId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Failed to fetch seller products:', error);
            return [];
        }

        return data as MarketplaceProduct[];
    },

    /**
     * Update product
     */
    async updateProduct(
        productId: string,
        updates: Partial<MarketplaceProduct>
    ): Promise<MarketplaceProduct | null> {
        const { data, error } = await supabase
            .from('marketplace_products')
            .update(updates)
            .eq('id', productId)
            .select()
            .single();

        if (error) {
            console.error('Failed to update product:', error);
            return null;
        }

        return data as MarketplaceProduct;
    },

    /**
     * Delete product
     */
    async deleteProduct(productId: string): Promise<boolean> {
        const { error } = await supabase.from('marketplace_products').delete().eq('id', productId);

        if (error) {
            console.error('Failed to delete product:', error);
            return false;
        }

        return true;
    },
};
