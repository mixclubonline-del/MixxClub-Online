import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
    id: string;
    title: string;
    description: string;
    category: 'drum-kits' | 'presets' | 'loops' | 'samples' | 'templates';
    price: number;
    creator: {
        id: string;
        name: string;
        avatar?: string;
        verified: boolean;
    };
    image: string;
    rating: number;
    reviews: number;
    downloads: number;
    files: {
        name: string;
        size: string;
        format: string;
    }[];
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface CartItem {
    productId: string;
    product: Product;
    quantity: number;
}

export interface SellerStats {
    totalEarnings: number;
    monthlyEarnings: number;
    totalSales: number;
    totalDownloads: number;
    averageRating: number;
    productsCount: number;
}

interface MarketplaceStore {
    // Products
    products: Product[];
    filteredProducts: Product[];
    selectedCategory: string;
    searchQuery: string;
    sortBy: 'trending' | 'newest' | 'best-selling' | 'rating';

    // Cart
    cart: CartItem[];
    cartTotal: number;

    // Seller Dashboard
    sellerProducts: Product[];
    sellerStats: SellerStats;
    sellerEarnings: Array<{
        date: string;
        amount: number;
        sales: number;
    }>;

    // UI
    isLoading: boolean;
    error: string | null;

    // Actions
    setProducts: (products: Product[]) => void;
    filterProducts: (category: string, query: string, sort: string) => void;
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateCartQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getCartTotal: () => number;

    // Seller actions
    setSellerProducts: (products: Product[]) => void;
    setSellerStats: (stats: SellerStats) => void;
    setSellerEarnings: (earnings: Array<{ date: string; amount: number; sales: number }>) => void;
    uploadProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
    deleteProduct: (productId: string) => void;

    // Search & Filter
    setSearchQuery: (query: string) => void;
    setSelectedCategory: (category: string) => void;
    setSortBy: (sort: 'trending' | 'newest' | 'best-selling' | 'rating') => void;

    // UI
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

const DEFAULT_PRODUCTS: Product[] = [
    {
        id: '1',
        title: '140 Professional Drum Kit',
        description: '140 professionally crafted drum sounds. Perfect for hip-hop, trap, and R&B production.',
        category: 'drum-kits',
        price: 29.99,
        creator: {
            id: 'creator1',
            name: 'Pro Drums Co',
            verified: true,
        },
        image: '🥁',
        rating: 4.9,
        reviews: 342,
        downloads: 12400,
        files: [
            { name: 'drums.wav', size: '2.4GB', format: 'WAV' },
            { name: 'drums-mp3.zip', size: '456MB', format: 'MP3' },
        ],
        tags: ['drums', 'hip-hop', 'trap', 'professional'],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-11-01'),
    },
    {
        id: '2',
        title: 'Synthwave Preset Pack',
        description: '50 dark synthwave presets for Serum. Create cinematic atmospheres instantly.',
        category: 'presets',
        price: 19.99,
        creator: {
            id: 'creator2',
            name: 'Synth Master',
            verified: true,
        },
        image: '🎹',
        rating: 4.8,
        reviews: 287,
        downloads: 8900,
        files: [
            { name: 'serum-presets.fxp', size: '12MB', format: 'FXP' },
        ],
        tags: ['presets', 'serum', 'synthwave', 'cinematic'],
        createdAt: new Date('2024-02-20'),
        updatedAt: new Date('2024-10-15'),
    },
    {
        id: '3',
        title: '808 Essentials Bundle',
        description: '200 premium 808 samples. All you need for modern urban production.',
        category: 'samples',
        price: 34.99,
        creator: {
            id: 'creator3',
            name: 'Bass Academy',
            verified: true,
        },
        image: '🔊',
        rating: 4.7,
        reviews: 421,
        downloads: 15600,
        files: [
            { name: '808-pack.zip', size: '3.2GB', format: 'WAV' },
        ],
        tags: ['808', 'bass', 'urban', 'samples'],
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-11-05'),
    },
];

export const useMarketplaceStore = create<MarketplaceStore>(
    persist(
        (set, get) => ({
            products: DEFAULT_PRODUCTS,
            filteredProducts: DEFAULT_PRODUCTS,
            selectedCategory: 'all',
            searchQuery: '',
            sortBy: 'trending',
            cart: [],
            cartTotal: 0,
            sellerProducts: [],
            sellerStats: {
                totalEarnings: 8420.50,
                monthlyEarnings: 2145.00,
                totalSales: 342,
                totalDownloads: 34521,
                averageRating: 4.85,
                productsCount: 12,
            },
            sellerEarnings: [
                { date: 'Nov 1', amount: 245.50, sales: 12 },
                { date: 'Nov 2', amount: 189.00, sales: 9 },
                { date: 'Nov 3', amount: 312.75, sales: 15 },
                { date: 'Nov 4', amount: 156.25, sales: 7 },
                { date: 'Nov 5', amount: 241.50, sales: 11 },
                { date: 'Nov 6', amount: 398.00, sales: 18 },
                { date: 'Nov 7', amount: 202.00, sales: 10 },
            ],
            isLoading: false,
            error: null,

            setProducts: (products) => set({ products, filteredProducts: products }),

            filterProducts: (category, query, sort) => {
                const { products } = get();
                let filtered = [...products];

                // Category filter
                if (category !== 'all') {
                    filtered = filtered.filter((p) => p.category === category);
                }

                // Search filter
                if (query.trim()) {
                    const q = query.toLowerCase();
                    filtered = filtered.filter(
                        (p) =>
                            p.title.toLowerCase().includes(q) ||
                            p.description.toLowerCase().includes(q) ||
                            p.tags.some((tag) => tag.toLowerCase().includes(q))
                    );
                }

                // Sort
                const sortValue = sort as 'trending' | 'newest' | 'best-selling' | 'rating';
                switch (sortValue) {
                    case 'newest':
                        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                        break;
                    case 'best-selling':
                        filtered.sort((a, b) => b.downloads - a.downloads);
                        break;
                    case 'rating':
                        filtered.sort((a, b) => b.rating - a.rating);
                        break;
                    case 'trending':
                    default:
                        filtered.sort((a, b) => (b.rating * b.downloads) - (a.rating * a.downloads));
                }

                set({ filteredProducts: filtered, selectedCategory: category, searchQuery: query, sortBy: sortValue });
            }, addToCart: (product) => {
                const { cart } = get();
                const existing = cart.find((item) => item.productId === product.id);

                if (existing) {
                    set({
                        cart: cart.map((item) =>
                            item.productId === product.id
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        ),
                    });
                } else {
                    set({ cart: [...cart, { productId: product.id, product, quantity: 1 }] });
                }

                get().getCartTotal();
            },

            removeFromCart: (productId) => {
                const { cart } = get();
                set({ cart: cart.filter((item) => item.productId !== productId) });
                get().getCartTotal();
            },

            updateCartQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeFromCart(productId);
                    return;
                }

                const { cart } = get();
                set({
                    cart: cart.map((item) =>
                        item.productId === productId ? { ...item, quantity } : item
                    ),
                });

                get().getCartTotal();
            },

            clearCart: () => set({ cart: [], cartTotal: 0 }),

            getCartTotal: () => {
                const { cart } = get();
                const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
                set({ cartTotal: total });
                return total;
            },

            setSellerProducts: (products) => set({ sellerProducts: products }),

            setSellerStats: (stats) => set({ sellerStats: stats }),

            setSellerEarnings: (earnings) => set({ sellerEarnings: earnings }),

            uploadProduct: (product) => {
                const newProduct: Product = {
                    ...product,
                    id: `product-${Date.now()}`,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                const { products, sellerProducts } = get();
                set({
                    products: [...products, newProduct],
                    sellerProducts: [...sellerProducts, newProduct],
                });
            },

            deleteProduct: (productId) => {
                const { products, sellerProducts } = get();
                set({
                    products: products.filter((p) => p.id !== productId),
                    sellerProducts: sellerProducts.filter((p) => p.id !== productId),
                });
            },

            setSearchQuery: (query) => set({ searchQuery: query }),

            setSelectedCategory: (category) => set({ selectedCategory: category }),

            setSortBy: (sort) => set({ sortBy: sort }),

            setLoading: (loading) => set({ isLoading: loading }),

            setError: (error) => set({ error }),
        }),
        {
            name: 'marketplace-store',
        }
    )
);
