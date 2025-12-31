/**
 * MARKETPLACE SERVICE - Stubbed Implementation
 * The marketplace_products/orders tables don't exist in the database.
 * This provides a mock implementation.
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

// In-memory mock data
const mockProducts: MarketplaceProduct[] = [];
const mockOrders: PurchaseOrder[] = [];

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
        console.warn('MarketplaceService: Using mock data - marketplace_products table not configured');
        let result = [...mockProducts];

        if (filters?.category) {
            result = result.filter(p => p.category === filters.category);
        }
        if (filters?.tags?.length) {
            result = result.filter(p => p.tags.some(t => filters.tags!.includes(t)));
        }
        if (filters?.minRating) {
            result = result.filter(p => p.rating >= filters.minRating!);
        }

        switch (filters?.sortBy) {
            case 'trending':
            case 'bestselling':
                result.sort((a, b) => b.downloads - a.downloads);
                break;
            case 'newest':
                result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                break;
            case 'rating':
                result.sort((a, b) => b.rating - a.rating);
                break;
        }

        return result;
    },

    /**
     * Get product by ID
     */
    async getProduct(productId: string): Promise<MarketplaceProduct | null> {
        console.warn('MarketplaceService: Using mock data - marketplace_products table not configured');
        return mockProducts.find(p => p.id === productId) || null;
    },

    /**
     * Create a new product
     */
    async createProduct(
        sellerId: string,
        product: Omit<MarketplaceProduct, 'id' | 'seller_id' | 'created_at' | 'updated_at' | 'downloads' | 'reviews_count'>
    ): Promise<MarketplaceProduct> {
        console.warn('MarketplaceService: Using mock data - marketplace_products table not configured');
        const newProduct: MarketplaceProduct = {
            ...product,
            id: crypto.randomUUID(),
            seller_id: sellerId,
            downloads: 0,
            reviews_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        mockProducts.push(newProduct);
        return newProduct;
    },

    /**
     * Create purchase order and process Stripe payment
     */
    async createOrder(
        buyerId: string,
        items: CartItem[]
    ): Promise<{ client_secret: string; order_id: string }> {
        console.warn('MarketplaceService: Using mock data - marketplace_orders table not configured');
        const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const orderId = crypto.randomUUID();
        
        const order: PurchaseOrder = {
            id: orderId,
            buyer_id: buyerId,
            items,
            total_amount: totalAmount,
            stripe_payment_intent_id: `mock_pi_${orderId}`,
            status: 'pending',
            created_at: new Date().toISOString(),
        };
        mockOrders.push(order);

        return {
            client_secret: `mock_secret_${orderId}`,
            order_id: orderId,
        };
    },

    /**
     * Confirm purchase and distribute earnings
     */
    async confirmPurchase(orderId: string): Promise<boolean> {
        console.warn('MarketplaceService: Using mock data - marketplace_orders table not configured');
        const order = mockOrders.find(o => o.id === orderId);
        if (order) {
            order.status = 'completed';
            return true;
        }
        return false;
    },

    /**
     * Get seller analytics
     */
    async getSellerAnalytics(sellerId: string): Promise<SellerAnalytics> {
        console.warn('MarketplaceService: Using mock data - get_seller_analytics RPC not available');
        return {
            total_sales: 0,
            total_earnings: 0,
            monthly_revenue: 0,
            total_products: mockProducts.filter(p => p.seller_id === sellerId).length,
            total_downloads: 0,
            average_rating: 0,
            recent_sales: [],
        };
    },

    /**
     * Track product download
     */
    async trackDownload(productId: string, buyerId: string): Promise<boolean> {
        console.warn('MarketplaceService: Using mock data - product_downloads table not configured');
        const product = mockProducts.find(p => p.id === productId);
        if (product) {
            product.downloads += 1;
            return true;
        }
        return false;
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
        console.warn('MarketplaceService: Using mock data - product_reviews table not configured');
        const product = mockProducts.find(p => p.id === productId);
        if (product) {
            product.reviews_count += 1;
            // Simple average update
            product.rating = (product.rating * (product.reviews_count - 1) + rating) / product.reviews_count;
            return true;
        }
        return false;
    },

    /**
     * Get seller's products
     */
    async getSellerProducts(sellerId: string): Promise<MarketplaceProduct[]> {
        console.warn('MarketplaceService: Using mock data - marketplace_products table not configured');
        return mockProducts.filter(p => p.seller_id === sellerId);
    },

    /**
     * Update product
     */
    async updateProduct(
        productId: string,
        updates: Partial<MarketplaceProduct>
    ): Promise<MarketplaceProduct | null> {
        console.warn('MarketplaceService: Using mock data - marketplace_products table not configured');
        const index = mockProducts.findIndex(p => p.id === productId);
        if (index !== -1) {
            mockProducts[index] = { ...mockProducts[index], ...updates, updated_at: new Date().toISOString() };
            return mockProducts[index];
        }
        return null;
    },

    /**
     * Delete product
     */
    async deleteProduct(productId: string): Promise<boolean> {
        console.warn('MarketplaceService: Using mock data - marketplace_products table not configured');
        const index = mockProducts.findIndex(p => p.id === productId);
        if (index !== -1) {
            mockProducts.splice(index, 1);
            return true;
        }
        return false;
    },
};
