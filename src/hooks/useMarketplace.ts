import { useCallback, useMemo } from 'react';
import { useMarketplaceStore, Product } from '@/stores/marketplaceStore';

export const useMarketplace = () => {
    const {
        products,
        filteredProducts,
        cart,
        cartTotal,
        selectedCategory,
        searchQuery,
        sortBy,
        sellerStats,
        sellerEarnings,
        sellerProducts,
        filterProducts,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getCartTotal,
        setSearchQuery,
        setSelectedCategory,
        setSortBy,
        uploadProduct,
        deleteProduct,
        setSellerStats,
        setSellerEarnings,
        setSellerProducts,
    } = useMarketplaceStore();

    // Search and filter
    const handleSearch = useCallback(
        (query: string) => {
            filterProducts(selectedCategory, query, sortBy);
        },
        [filterProducts, selectedCategory, sortBy]
    );

    const handleCategoryChange = useCallback(
        (category: string) => {
            filterProducts(category, searchQuery, sortBy);
        },
        [filterProducts, searchQuery, sortBy]
    );

    const handleSortChange = useCallback(
        (sort: 'trending' | 'newest' | 'best-selling' | 'rating') => {
            filterProducts(selectedCategory, searchQuery, sort);
        },
        [filterProducts, selectedCategory, searchQuery]
    );

    // Cart management
    const handleAddToCart = useCallback(
        (product: Product) => {
            addToCart(product);
        },
        [addToCart]
    );

    const handleRemoveFromCart = useCallback(
        (productId: string) => {
            removeFromCart(productId);
        },
        [removeFromCart]
    );

    const handleUpdateQuantity = useCallback(
        (productId: string, quantity: number) => {
            updateCartQuantity(productId, quantity);
        },
        [updateCartQuantity]
    );

    const handleCheckout = useCallback(async () => {
        try {
            // Simulate checkout process
            // In real implementation, this would call Stripe API
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart,
                    total: cartTotal,
                }),
            });

            if (response.ok) {
                clearCart();
                return { success: true };
            }
            return { success: false, error: 'Checkout failed' };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Checkout error' };
        }
    }, [cart, cartTotal, clearCart]);

    // Product management for sellers
    const handleUploadProduct = useCallback(
        (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
            uploadProduct(product);
        },
        [uploadProduct]
    );

    const handleDeleteProduct = useCallback(
        (productId: string) => {
            deleteProduct(productId);
        },
        [deleteProduct]
    );

    // Statistics
    const stats = useMemo(
        () => ({
            totalProducts: products.length,
            cartItemsCount: cart.length,
            cartItemsTotal: cart.reduce((sum, item) => sum + item.quantity, 0),
            sellerTotalEarnings: sellerStats.totalEarnings,
            sellerMonthlyEarnings: sellerStats.monthlyEarnings,
            sellerAverageRating: sellerStats.averageRating,
        }),
        [products, cart, sellerStats]
    );

    return {
        // Products
        products,
        filteredProducts,
        selectedCategory,
        searchQuery,
        sortBy,

        // Cart
        cart,
        cartTotal,

        // Seller
        sellerStats,
        sellerEarnings,
        sellerProducts,

        // Handlers
        handleSearch,
        handleCategoryChange,
        handleSortChange,
        handleAddToCart,
        handleRemoveFromCart,
        handleUpdateQuantity,
        handleCheckout,
        handleUploadProduct,
        handleDeleteProduct,

        // Stats
        stats,
    };
};
