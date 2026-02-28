import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, Loader2, PackageOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWishlist, useToggleWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';

export function WishlistPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { data: wishlistItems, isLoading } = useWishlist();
    const toggleWishlist = useToggleWishlist();

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-accent/5">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Card className="p-8 text-center max-w-md">
                        <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h1 className="text-2xl font-bold mb-2">Sign In Required</h1>
                        <p className="text-muted-foreground mb-6">Please sign in to view your wishlist.</p>
                        <Button onClick={() => navigate('/auth?mode=signin')}>Sign In</Button>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <>
            <SEOHead
                title="My Wishlist - Mixxclub Marketplace"
                description="View and manage your saved marketplace items"
            />

            <div className="min-h-screen bg-gradient-to-b from-background to-accent/5 py-12">
                <div className="container max-w-5xl mx-auto px-4">
                    {/* Header — motion entrance */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 0.6 }}
                        className="flex items-center justify-between mb-8"
                    >
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold">My Wishlist</h1>
                            <p className="text-muted-foreground mt-1">
                                {wishlistItems?.length || 0} saved item{(wishlistItems?.length || 0) !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                    </motion.div>

                    {isLoading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : !wishlistItems || wishlistItems.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <Card className="p-12 text-center">
                                <PackageOpen className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                                <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
                                <p className="text-muted-foreground mb-6">
                                    Browse the marketplace and save items you love.
                                </p>
                                <Button onClick={() => navigate('/marketplace')}>Browse Marketplace</Button>
                            </Card>
                        </motion.div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {wishlistItems.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-50px' }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                    whileHover={{ y: -4, scale: 1.01 }}
                                >
                                    <Card
                                        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group h-full"
                                        onClick={() => navigate(`/marketplace/${item.product_id}`)}
                                    >
                                        {/* Product image — 16:9 aspect-video per standard */}
                                        {item.product?.image_url ? (
                                            <div className="aspect-video bg-accent/30 overflow-hidden">
                                                <img
                                                    src={item.product.image_url}
                                                    alt={item.product.title}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center">
                                                <ShoppingCart className="w-8 h-8 text-muted-foreground/40" />
                                            </div>
                                        )}

                                        <div className="p-4">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-semibold truncate">{item.product?.title || 'Unknown Product'}</h3>
                                                    {item.product?.seller_name && (
                                                        <p className="text-sm text-muted-foreground">by {item.product.seller_name}</p>
                                                    )}
                                                </div>
                                                <span className="font-bold text-primary whitespace-nowrap">
                                                    ${item.product?.price?.toFixed(2) || '0.00'}
                                                </span>
                                            </div>

                                            {item.product?.category && (
                                                <span className="inline-block text-xs bg-accent px-2 py-0.5 rounded mt-2">
                                                    {item.product.category}
                                                </span>
                                            )}

                                            <div className="flex gap-2 mt-4">
                                                <Button size="sm" className="flex-1 gap-1" variant="default">
                                                    <ShoppingCart className="w-3.5 h-3.5" />
                                                    Add to Cart
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleWishlist.mutate(item.product_id);
                                                    }}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
