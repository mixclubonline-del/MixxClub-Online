import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, Star, Download, TrendingUp, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMarketplace } from '@/hooks/useMarketplace';

const CATEGORIES = [
    { id: 'all', name: '🎵 All', count: 1250 },
    { id: 'drum-kits', name: '🥁 Drum Kits', count: 342 },
    { id: 'presets', name: '🎹 Presets', count: 456 },
    { id: 'loops', name: '🔁 Loops', count: 389 },
    { id: 'samples', name: '🔊 Samples', count: 278 },
    { id: 'templates', name: '📋 Templates', count: 185 },
];

const SORT_OPTIONS = [
    { id: 'trending', name: 'Trending' },
    { id: 'newest', name: 'Newest' },
    { id: 'best-selling', name: 'Best Selling' },
    { id: 'rating', name: 'Top Rated' },
];

export const MarketplaceHub = () => {
    const {
        filteredProducts,
        selectedCategory,
        searchQuery,
        sortBy,
        cart,
        handleSearch,
        handleCategoryChange,
        handleSortChange,
        handleAddToCart,
    } = useMarketplace();

    const [showFilters, setShowFilters] = useState(false);
    const [localSearch, setLocalSearch] = useState(searchQuery);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(localSearch);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-bold text-white">🎵 Sound Marketplace</h1>
                        <Button variant="outline" className="relative">
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            Cart ({cart.length})
                            {cart.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {cart.length}
                                </span>
                            )}
                        </Button>
                    </div>

                    {/* Search bar */}
                    <form onSubmit={handleSearchSubmit} className="relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search drum kits, presets, samples..."
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-violet-500 focus:outline-none"
                        />
                    </form>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar - Filters */}
                    <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden'} lg:block`}>
                        <div className="space-y-6">
                            {/* Categories */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-white">Categories</h3>
                                    <button
                                        onClick={() => setShowFilters(false)}
                                        className="lg:hidden"
                                        aria-label="Close filters"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => handleCategoryChange(cat.id)}
                                            className={`w-full text-left px-4 py-2 rounded-lg transition-all ${selectedCategory === cat.id
                                                ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white'
                                                : 'text-slate-300 hover:bg-slate-800'
                                                }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span>{cat.name}</span>
                                                <span className="text-sm opacity-70">({cat.count})</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sort */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4">Sort By</h3>
                                <div className="space-y-2">
                                    {SORT_OPTIONS.map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => handleSortChange(option.id as 'trending' | 'newest' | 'best-selling' | 'rating')}
                                            className={`w-full text-left px-4 py-2 rounded-lg transition-all ${sortBy === option.id
                                                ? 'bg-violet-500 text-white'
                                                : 'text-slate-300 hover:bg-slate-800'
                                                }`}
                                        >
                                            {option.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4">Price Range</h3>
                                <div className="space-y-3">
                                    {['Under $15', '$15 - $30', '$30 - $50', '$50+'].map((range) => (
                                        <label key={range} className="flex items-center cursor-pointer">
                                            <input type="checkbox" className="w-4 h-4 rounded" />
                                            <span className="ml-3 text-slate-300">{range}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Rating Filter */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4">Rating</h3>
                                <div className="space-y-2">
                                    {[5, 4, 3, 2].map((stars) => (
                                        <label key={stars} className="flex items-center cursor-pointer">
                                            <input type="checkbox" className="w-4 h-4 rounded" />
                                            <span className="ml-3 flex items-center text-slate-300">
                                                {Array.from({ length: stars }).map((_, i) => (
                                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                ))}
                                                <span className="ml-2">& up</span>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main content - Products */}
                    <div className="lg:col-span-3">
                        {/* Top bar */}
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-slate-400">
                                Showing {filteredProducts.length} results
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                                className="lg:hidden"
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Filters
                            </Button>
                        </div>

                        {/* Products grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map((product) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="group bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden hover:border-violet-500/50 transition-all hover:bg-slate-800"
                                >
                                    {/* Product image */}
                                    <div className="h-48 bg-gradient-to-br from-violet-500/10 to-pink-500/10 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">
                                        {product.image}
                                    </div>

                                    {/* Product info */}
                                    <div className="p-4">
                                        <h3 className="font-bold text-white mb-2 line-clamp-2">
                                            {product.title}
                                        </h3>

                                        {/* Creator */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-sm text-slate-400">
                                                by {product.creator.name}
                                            </span>
                                            {product.creator.verified && (
                                                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                                                    ✓ Verified
                                                </span>
                                            )}
                                        </div>

                                        {/* Rating and reviews */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="flex items-center">
                                                {Array.from({ length: Math.floor(product.rating) }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-sm font-bold text-white">
                                                {product.rating}
                                            </span>
                                            <span className="text-sm text-slate-400">
                                                ({product.reviews} reviews)
                                            </span>
                                        </div>

                                        {/* Downloads */}
                                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                                            <Download className="w-4 h-4" />
                                            <span>{product.downloads.toLocaleString()} downloads</span>
                                        </div>

                                        {/* Price and button */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
                                                ${product.price}
                                            </span>
                                            <Button
                                                onClick={() => handleAddToCart(product)}
                                                className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600"
                                            >
                                                Add to Cart
                                            </Button>
                                        </div>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {product.tags.slice(0, 2).map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Empty state */}
                        {filteredProducts.length === 0 && (
                            <div className="text-center py-20">
                                <p className="text-xl text-slate-400 mb-4">
                                    No products found matching your search
                                </p>
                                <Button
                                    onClick={() => {
                                        handleCategoryChange('all');
                                        setLocalSearch('');
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="bg-gradient-to-r from-violet-600/20 to-pink-600/20 border-t border-slate-700 py-12 mt-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Want to Sell Your Own Sounds?
                    </h2>
                    <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                        Upload your drum kits, presets, and samples. Earn 70% of every sale. Join 500+ sellers making passive income.
                    </p>
                    <Button className="bg-gradient-to-r from-violet-500 to-pink-500 px-8 py-3 text-lg">
                        Become a Seller
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default MarketplaceHub;
