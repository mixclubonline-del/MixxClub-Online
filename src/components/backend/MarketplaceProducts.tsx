/**
 * Marketplace Product Grid Component
 * Displays products from backend with filtering and sorting
 */

import React, { useEffect, useState } from 'react';
import { ShoppingCart, Star } from 'lucide-react';
import { MarketplaceService, type MarketplaceProduct } from '@/services/marketplaceService';
import { useBackendMarketplaceCart } from '@/hooks/useBackendMarketplaceCart';

interface MarketplaceProductsProps {
    userId: string;
    category?: string;
    sortBy?: 'trending' | 'newest' | 'bestselling' | 'rating';
    limit?: number;
}

export const MarketplaceProducts: React.FC<MarketplaceProductsProps> = ({
    userId,
    category,
    sortBy = 'trending',
    limit = 12,
}) => {
    const [products, setProducts] = useState<MarketplaceProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { addItem } = useBackendMarketplaceCart(userId);

    useEffect(() => {
        async function loadProducts() {
            try {
                setLoading(true);
                const items = await MarketplaceService.getProducts({
                    category,
                    sortBy,
                });
                // Slice to limit if needed
                setProducts(items.slice(0, limit));
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err : new Error(String(err)));
                console.error('Failed to load products:', err);
            } finally {
                setLoading(false);
            }
        }

        loadProducts();
    }, [category, sortBy, limit]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 rounded-lg border-2 border-red-200">
                <p className="text-red-600 font-semibold">Failed to load products</p>
                <p className="text-red-500 text-sm">{error.message}</p>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="p-12 text-center bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-lg">No products found</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Product Image Placeholder */}
                    <div className="h-40 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400"></div>

                    {/* Product Info */}
                    <div className="p-4">
                        <h3 className="text-lg font-bold line-clamp-2 mb-2">{product.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description}</p>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < Math.floor(product.rating)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                />
                            ))}
                            <span className="text-xs text-gray-600 ml-1">({product.reviews_count})</span>
                        </div>

                        {/* Price and Action */}
                        <div className="flex justify-between items-center">
                            <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                            <button
                                onClick={() =>
                                    addItem({
                                        product_id: product.id,
                                        quantity: 1,
                                        price: product.price,
                                    })
                                }
                                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                            >
                                <ShoppingCart className="w-4 h-4" />
                                Add
                            </button>
                        </div>

                        {/* Downloads Badge */}
                        {product.downloads > 0 && (
                            <p className="text-xs text-gray-500 mt-2">{product.downloads} downloads</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MarketplaceProducts;
