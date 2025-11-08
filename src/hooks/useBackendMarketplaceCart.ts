/**
 * Hook for marketplace integration with backend
 * Provides shopping cart and checkout functionality
 */

import { useState, useCallback } from 'react';
import { MarketplaceService, type CartItem } from '@/services/marketplaceService';

export function useBackendMarketplaceCart(userId: string) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const addItem = useCallback((item: CartItem) => {
        setCartItems((prev) => {
            const existing = prev.find((i) => i.product_id === item.product_id);
            if (existing) {
                return prev.map((i) =>
                    i.product_id === item.product_id
                        ? { ...i, quantity: i.quantity + item.quantity }
                        : i
                );
            }
            return [...prev, item];
        });
    }, []);

    const removeItem = useCallback((productId: string) => {
        setCartItems((prev) => prev.filter((item) => item.product_id !== productId));
    }, []);

    const updateQuantity = useCallback((productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(productId);
        } else {
            setCartItems((prev) =>
                prev.map((item) =>
                    item.product_id === productId ? { ...item, quantity } : item
                )
            );
        }
    }, [removeItem]);

    const getTotalPrice = useCallback(() => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    }, [cartItems]);

    const checkout = useCallback(async () => {
        if (cartItems.length === 0) {
            setError(new Error('Cart is empty'));
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await MarketplaceService.createOrder(userId, cartItems);
            // Clear cart after successful order creation
            setCartItems([]);
            return result;
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            console.error('Checkout failed:', error);
            return null;
        } finally {
            setLoading(false);
        }
    }, [userId, cartItems]);

    return {
        cartItems,
        loading,
        error,
        addItem,
        removeItem,
        updateQuantity,
        getTotalPrice,
        checkout,
        clearCart: () => setCartItems([]),
    };
}
