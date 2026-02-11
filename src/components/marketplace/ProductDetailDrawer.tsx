import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, ShoppingCart, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WishlistButton } from './WishlistButton';
import { ProductReviews } from './ProductReviews';
import { useProductRating } from '@/hooks/useProductReviews';

interface ProductDetailDrawerProps {
    item: {
        id: string;
        item_name: string;
        item_description?: string;
        item_type: string;
        price: number;
        preview_urls?: string[];
        sales_count?: number;
        seller_id?: string;
        marketplace_categories?: {
            category_name: string;
        };
    } | null;
    open: boolean;
    onClose: () => void;
    onAddToCart?: () => void;
    onBuyNow?: () => void;
    isPurchasing?: boolean;
}

export function ProductDetailDrawer({
    item,
    open,
    onClose,
    onAddToCart,
    onBuyNow,
    isPurchasing,
}: ProductDetailDrawerProps) {
    const { data: ratingStats } = useProductRating(item?.id ?? '');

    return (
        <AnimatePresence>
            {open && item && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-background border-l border-border z-50 overflow-y-auto"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-muted hover:bg-muted/80 text-foreground transition-colors"
                            aria-label="Close details"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Hero Image — 16:9 per visual standard */}
                        <div className="aspect-video bg-gradient-to-br from-muted to-accent/20 overflow-hidden relative group">
                            {item.preview_urls?.[0] ? (
                                <img
                                    src={item.preview_urls[0]}
                                    alt={item.item_name}
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Package className="h-16 w-16 text-muted-foreground/20" />
                                </div>
                            )}

                            {/* Hover stats overlay — visual standard: stats on hover */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-background via-background/90 to-transparent">
                                <div className="flex gap-3 flex-wrap">
                                    {ratingStats && ratingStats.total > 0 && (
                                        <div className="px-3 py-2 bg-background/95 backdrop-blur rounded-lg border border-border">
                                            <div className="text-xs text-muted-foreground">Rating</div>
                                            <div className="text-lg font-bold text-primary flex items-center gap-1">
                                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                                {ratingStats.average}
                                            </div>
                                        </div>
                                    )}
                                    {item.sales_count && item.sales_count > 0 && (
                                        <div className="px-3 py-2 bg-background/95 backdrop-blur rounded-lg border border-border">
                                            <div className="text-xs text-muted-foreground">Sales</div>
                                            <div className="text-lg font-bold text-primary">{item.sales_count}</div>
                                        </div>
                                    )}
                                    <div className="px-3 py-2 bg-background/95 backdrop-blur rounded-lg border border-border">
                                        <div className="text-xs text-muted-foreground">Price</div>
                                        <div className="text-lg font-bold text-primary">${item.price}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating tech badges — visual standard */}
                            <div className="absolute -bottom-3 -right-3 flex gap-2">
                                <Badge className="bg-primary/20 text-primary border-primary/30 text-xs shadow-lg">
                                    {item.item_type}
                                </Badge>
                                {item.marketplace_categories && (
                                    <Badge className="bg-primary/20 text-primary border-primary/30 text-xs shadow-lg">
                                        {item.marketplace_categories.category_name}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Title & Type — motion entrance */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15, duration: 0.4 }}
                            >
                                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1">{item.item_name}</h2>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {item.item_description || 'No description available.'}
                                </p>
                            </motion.div>

                            {/* Mobile-visible stats — visual standard: always show stats on mobile */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25, duration: 0.4 }}
                                className="grid grid-cols-3 gap-3"
                            >
                                {ratingStats && ratingStats.total > 0 && (
                                    <div className="text-center p-3 rounded-xl bg-muted/30 border border-border/50">
                                        <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                            {ratingStats.average}
                                        </div>
                                        <div className="text-xs text-muted-foreground">{ratingStats.total} reviews</div>
                                    </div>
                                )}
                                {item.sales_count && item.sales_count > 0 && (
                                    <div className="text-center p-3 rounded-xl bg-muted/30 border border-border/50">
                                        <div className="text-2xl font-bold text-primary">{item.sales_count}</div>
                                        <div className="text-xs text-muted-foreground">Sales</div>
                                    </div>
                                )}
                                <div className="text-center p-3 rounded-xl bg-muted/30 border border-border/50">
                                    <div className="text-2xl font-bold text-primary">${item.price}</div>
                                    <div className="text-xs text-muted-foreground">Price</div>
                                </div>
                            </motion.div>

                            {/* Price & Actions */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35, duration: 0.4 }}
                                className="bg-muted/20 rounded-xl p-4 border border-border space-y-4"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-3xl font-bold text-foreground">${item.price}</span>
                                    <WishlistButton productId={item.id} />
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={onAddToCart}
                                    >
                                        <ShoppingCart className="h-4 w-4 mr-2" />
                                        Add to Cart
                                    </Button>
                                    <Button
                                        className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground border-0"
                                        onClick={onBuyNow}
                                        disabled={isPurchasing}
                                    >
                                        <Zap className="h-4 w-4 mr-2" />
                                        Buy Now
                                    </Button>
                                </div>
                            </motion.div>

                            {/* Divider */}
                            <div className="border-t border-border" />

                            {/* Reviews Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.45, duration: 0.4 }}
                            >
                                <ProductReviews productId={item.id} />
                            </motion.div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
