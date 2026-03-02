/**
 * MARKETPLACE SERVICE - Live Supabase Implementation
 * Connected to marketplace_items, marketplace_purchases, marketplace_categories tables
 */

import { supabase } from '@/integrations/supabase/client';
import { uuid } from '@/lib/uuid';

export interface MarketplaceProduct {
    id: string;
    seller_id: string;
    seller_name: string;
    title: string;
    description: string;
    category: string;
    category_id?: string;
    tags: string[];
    price: number;
    downloads: number;
    rating: number;
    reviews_count: number;
    preview_url?: string;
    download_url?: string;
    item_type: string;
    status: string;
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
    stripe_payment_intent_id?: string;
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
        let query = supabase
            .from('marketplace_items')
            .select(`
                *,
                marketplace_categories(category_name),
                profiles:seller_id(full_name, username)
            `)
            .eq('status', 'active');

        if (filters?.category) {
            query = query.eq('category_id', filters.category);
        }

        // Apply sorting
        switch (filters?.sortBy) {
            case 'trending':
            case 'bestselling':
                query = query.order('sales_count', { ascending: false, nullsFirst: false });
                break;
            case 'newest':
                query = query.order('created_at', { ascending: false });
                break;
            case 'rating':
                query = query.order('sales_count', { ascending: false, nullsFirst: false });
                break;
            default:
                query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching marketplace products:', error);
            return [];
        }

        return (data || []).map((item: any) => ({
            id: item.id,
            seller_id: item.seller_id,
            seller_name: item.profiles?.full_name || item.profiles?.username || 'Unknown Seller',
            title: item.item_name,
            description: item.item_description || '',
            category: item.marketplace_categories?.category_name || 'Uncategorized',
            category_id: item.category_id,
            tags: [],
            price: Number(item.price) || 0,
            downloads: item.sales_count || 0,
            rating: 4.5, // Default rating until reviews system is implemented
            reviews_count: 0,
            preview_url: item.preview_urls?.[0] || undefined,
            download_url: item.files?.download_url || undefined,
            item_type: item.item_type,
            status: item.status,
            created_at: item.created_at,
            updated_at: item.updated_at,
        }));
    },

    /**
     * Get product by ID
     */
    async getProduct(productId: string): Promise<MarketplaceProduct | null> {
        const { data, error } = await supabase
            .from('marketplace_items')
            .select(`
                *,
                marketplace_categories(category_name),
                profiles:seller_id(full_name, username)
            `)
            .eq('id', productId)
            .single();

        if (error || !data) {
            console.error('Error fetching product:', error);
            return null;
        }

        return {
            id: data.id,
            seller_id: data.seller_id,
            seller_name: (data as any).profiles?.full_name || (data as any).profiles?.username || 'Unknown Seller',
            title: data.item_name,
            description: data.item_description || '',
            category: (data as any).marketplace_categories?.category_name || 'Uncategorized',
            category_id: data.category_id || undefined,
            tags: [],
            price: Number(data.price) || 0,
            downloads: data.sales_count || 0,
            rating: 4.5,
            reviews_count: 0,
            preview_url: data.preview_urls?.[0] || undefined,
            download_url: (data.files as any)?.download_url || undefined,
            item_type: data.item_type,
            status: data.status || 'active',
            created_at: data.created_at || new Date().toISOString(),
            updated_at: data.updated_at || new Date().toISOString(),
        };
    },

    /**
     * Create a new product listing
     */
    async createProduct(
        sellerId: string,
        product: {
            title: string;
            description: string;
            category_id?: string;
            price: number;
            item_type: string;
            preview_urls?: string[];
            files?: any;
        }
    ): Promise<MarketplaceProduct | null> {
        const { data, error } = await supabase
            .from('marketplace_items')
            .insert({
                seller_id: sellerId,
                item_name: product.title,
                item_description: product.description,
                category_id: product.category_id,
                price: product.price,
                item_type: product.item_type,
                preview_urls: product.preview_urls,
                files: product.files,
                status: 'active',
                sales_count: 0,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating product:', error);
            return null;
        }

        return {
            id: data.id,
            seller_id: data.seller_id,
            seller_name: '',
            title: data.item_name,
            description: data.item_description || '',
            category: '',
            category_id: data.category_id || undefined,
            tags: [],
            price: Number(data.price),
            downloads: 0,
            rating: 0,
            reviews_count: 0,
            preview_url: data.preview_urls?.[0],
            item_type: data.item_type,
            status: data.status || 'active',
            created_at: data.created_at || new Date().toISOString(),
            updated_at: data.updated_at || new Date().toISOString(),
        };
    },

    /**
     * Create purchase order
     */
    async createOrder(
        buyerId: string,
        items: CartItem[]
    ): Promise<{ client_secret: string; order_id: string }> {
        // For now, create purchases directly. Stripe integration can be added later.
        const purchasePromises = items.map(async (item) => {
            // Get item details
            const { data: itemData } = await supabase
                .from('marketplace_items')
                .select('seller_id, price')
                .eq('id', item.product_id)
                .single();

            if (!itemData) return null;

            // Create purchase record
            const { data: purchase, error } = await supabase
                .from('marketplace_purchases')
                .insert({
                    buyer_id: buyerId,
                    item_id: item.product_id,
                    seller_id: itemData.seller_id,
                    purchase_amount: item.price * item.quantity,
                    status: 'completed',
                })
                .select()
                .single();

            if (!error && purchase) {
                // Increment sales count directly
                const currentCount = (itemData as any).sales_count || 0;
                await supabase
                    .from('marketplace_items')
                    .update({ sales_count: currentCount + 1 })
                    .eq('id', item.product_id);
            }

            return purchase;
        });
        const purchases = await Promise.all(purchasePromises);
        const firstPurchase = purchases.find(p => p !== null);

        return {
            client_secret: `order_${Date.now()}`,
            order_id: firstPurchase?.id || uuid(),
        };
    },

    /**
     * Confirm purchase
     */
    async confirmPurchase(orderId: string): Promise<boolean> {
        const { error } = await supabase
            .from('marketplace_purchases')
            .update({ status: 'completed' })
            .eq('id', orderId);

        return !error;
    },

    /**
     * Get seller analytics
     */
    async getSellerAnalytics(sellerId: string): Promise<SellerAnalytics> {
        // Get total products
        const { count: totalProducts } = await supabase
            .from('marketplace_items')
            .select('*', { count: 'exact', head: true })
            .eq('seller_id', sellerId);

        // Get all purchases for this seller
        const { data: purchases } = await supabase
            .from('marketplace_purchases')
            .select('*')
            .eq('seller_id', sellerId)
            .eq('status', 'completed');

        const totalSales = purchases?.length || 0;
        const totalEarnings = purchases?.reduce((sum, p) => sum + Number(p.purchase_amount), 0) || 0;

        // Calculate monthly revenue (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const monthlyRevenue = purchases
            ?.filter(p => new Date(p.created_at || '') > thirtyDaysAgo)
            .reduce((sum, p) => sum + Number(p.purchase_amount), 0) || 0;

        // Get total downloads (sales_count sum)
        const { data: items } = await supabase
            .from('marketplace_items')
            .select('sales_count')
            .eq('seller_id', sellerId);

        const totalDownloads = items?.reduce((sum, item) => sum + (item.sales_count || 0), 0) || 0;

        return {
            total_sales: totalSales,
            total_earnings: totalEarnings,
            monthly_revenue: monthlyRevenue,
            total_products: totalProducts || 0,
            total_downloads: totalDownloads,
            average_rating: 4.5, // Default until reviews implemented
            recent_sales: (purchases?.slice(0, 10) || []).map(p => ({
                id: p.id,
                buyer_id: p.buyer_id,
                total_amount: Number(p.purchase_amount),
                items: [],
                status: p.status as 'pending' | 'completed' | 'failed',
                created_at: p.created_at || new Date().toISOString(),
            })),
        };
    },

    /**
     * Track product download
     */
    async trackDownload(productId: string, _buyerId: string): Promise<boolean> {
        // Get current count first
        const { data: item } = await supabase
            .from('marketplace_items')
            .select('sales_count')
            .eq('id', productId)
            .single();

        const currentCount = item?.sales_count || 0;

        const { error } = await supabase
            .from('marketplace_items')
            .update({ sales_count: currentCount + 1 })
            .eq('id', productId);

        return !error;
    },

    /**
     * Add product review (stub - reviews table not implemented yet)
     */
    async addReview(
        _productId: string,
        _buyerId: string,
        _rating: number,
        _comment: string
    ): Promise<boolean> {
        console.warn('MarketplaceService: Reviews table not yet implemented');
        return true;
    },

    /**
     * Get seller's products
     */
    async getSellerProducts(sellerId: string): Promise<MarketplaceProduct[]> {
        const { data, error } = await supabase
            .from('marketplace_items')
            .select(`
                *,
                marketplace_categories(category_name)
            `)
            .eq('seller_id', sellerId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching seller products:', error);
            return [];
        }

        return (data || []).map((item: any) => ({
            id: item.id,
            seller_id: item.seller_id,
            seller_name: '',
            title: item.item_name,
            description: item.item_description || '',
            category: item.marketplace_categories?.category_name || 'Uncategorized',
            category_id: item.category_id,
            tags: [],
            price: Number(item.price) || 0,
            downloads: item.sales_count || 0,
            rating: 4.5,
            reviews_count: 0,
            preview_url: item.preview_urls?.[0],
            item_type: item.item_type,
            status: item.status,
            created_at: item.created_at,
            updated_at: item.updated_at,
        }));
    },

    /**
     * Update product
     */
    async updateProduct(
        productId: string,
        updates: Partial<{
            title: string;
            description: string;
            price: number;
            category_id: string;
            preview_urls: string[];
            files: any;
            status: string;
        }>
    ): Promise<MarketplaceProduct | null> {
        const updateData: any = { updated_at: new Date().toISOString() };
        
        if (updates.title) updateData.item_name = updates.title;
        if (updates.description) updateData.item_description = updates.description;
        if (updates.price !== undefined) updateData.price = updates.price;
        if (updates.category_id) updateData.category_id = updates.category_id;
        if (updates.preview_urls) updateData.preview_urls = updates.preview_urls;
        if (updates.files) updateData.files = updates.files;
        if (updates.status) updateData.status = updates.status;

        const { data, error } = await supabase
            .from('marketplace_items')
            .update(updateData)
            .eq('id', productId)
            .select()
            .single();

        if (error || !data) {
            console.error('Error updating product:', error);
            return null;
        }

        return {
            id: data.id,
            seller_id: data.seller_id,
            seller_name: '',
            title: data.item_name,
            description: data.item_description || '',
            category: '',
            tags: [],
            price: Number(data.price),
            downloads: data.sales_count || 0,
            rating: 4.5,
            reviews_count: 0,
            preview_url: data.preview_urls?.[0],
            item_type: data.item_type,
            status: data.status || 'active',
            created_at: data.created_at || new Date().toISOString(),
            updated_at: data.updated_at || new Date().toISOString(),
        };
    },

    /**
     * Delete product (sets status to 'deleted')
     */
    async deleteProduct(productId: string): Promise<boolean> {
        const { error } = await supabase
            .from('marketplace_items')
            .update({ status: 'deleted' })
            .eq('id', productId);

        return !error;
    },

    /**
     * Get categories
     */
    async getCategories(): Promise<Array<{ id: string; name: string; icon?: string }>> {
        const { data, error } = await supabase
            .from('marketplace_categories')
            .select('*')
            .eq('is_active', true)
            .order('category_name');

        if (error) {
            console.error('Error fetching categories:', error);
            return [];
        }

        return (data || []).map(cat => ({
            id: cat.id,
            name: cat.category_name,
            icon: cat.icon || undefined,
        }));
    },

    /**
     * Get user's purchases
     */
    async getUserPurchases(userId: string): Promise<PurchaseOrder[]> {
        const { data, error } = await supabase
            .from('marketplace_purchases')
            .select(`
                *,
                marketplace_items(item_name, item_type, files)
            `)
            .eq('buyer_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching purchases:', error);
            return [];
        }

        return (data || []).map(p => ({
            id: p.id,
            buyer_id: p.buyer_id,
            total_amount: Number(p.purchase_amount),
            items: [{
                product_id: p.item_id,
                quantity: 1,
                price: Number(p.purchase_amount),
            }],
            status: p.status as 'pending' | 'completed' | 'failed',
            created_at: p.created_at || new Date().toISOString(),
        }));
    },
};
