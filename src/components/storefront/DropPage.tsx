/**
 * DropPage — Fan-facing drop experience.
 * 
 * The Supreme-style drop page:
 * - Hero banner with drop name
 * - Countdown (or LIVE indicator)
 * - Item gallery with scarcity badges
 * - Size/color selector with visual swatches
 * - Purchase with coinz integration
 * - Social proof: "X items remaining", "X people viewing"
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    ShoppingBag, Coins, AlertTriangle, Check, Flame,
    ChevronLeft, ChevronRight, Loader2, Users, Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMerchDrops, type DropItem as DropItemType } from '@/hooks/useMerchDrops';
import { GARMENT_TYPES, MERCH_COLORS, DROP_STATUS_CONFIG, type GarmentType } from '@/hooks/MerchConfig';
import { DropCountdown } from './DropCountdown';
import { useMixxWallet } from '@/hooks/useMixxWallet';
import { useAuth } from '@/hooks/useAuth';

interface DropPageProps {
    dropId: string;
    storefrontId: string;
}

function ScarcityBadge({ remaining, total }: { remaining: number; total: number }) {
    const pct = (remaining / total) * 100;
    if (remaining <= 0) {
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]">SOLD OUT</Badge>;
    }
    if (pct <= 10) {
        return (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px] animate-pulse">
                🔥 Only {remaining} left!
            </Badge>
        );
    }
    if (pct <= 30) {
        return (
            <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px]">
                ⚡ {remaining} remaining
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="text-[10px] border-white/10 text-muted-foreground">
            {remaining} available
        </Badge>
    );
}

function ItemCard({ item, isLive, onSelect }: {
    item: DropItemType;
    isLive: boolean;
    onSelect: (item: DropItemType) => void;
}) {
    const gc = GARMENT_TYPES[item.garment_type as GarmentType] || GARMENT_TYPES.custom;
    const isSoldOut = item.quantity_remaining <= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            onClick={() => !isSoldOut && isLive && onSelect(item)}
            className={cn(
                'rounded-xl border transition-all cursor-pointer overflow-hidden group',
                isSoldOut
                    ? 'border-white/5 opacity-60'
                    : 'border-white/10 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5'
            )}
        >
            {/* Image area */}
            <div className="aspect-square bg-white/[0.03] relative overflow-hidden">
                {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-5xl">{gc.emoji}</span>
                    </div>
                )}

                {/* Scarcity badge overlay */}
                <div className="absolute top-2 right-2">
                    <ScarcityBadge remaining={item.quantity_remaining} total={item.quantity_total} />
                </div>

                {isSoldOut && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-lg font-bold text-red-400 tracking-wider">SOLD OUT</span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-3">
                <p className="text-xs text-muted-foreground">{gc.label}</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{item.name}</p>
                <div className="flex items-center justify-between mt-2">
                    <span className="text-base font-bold text-foreground">${item.price}</span>
                    {item.coinz_price && (
                        <span className="flex items-center gap-0.5 text-xs text-amber-400 font-medium">
                            <Coins className="h-3 w-3" />
                            {item.coinz_price.toLocaleString()}
                        </span>
                    )}
                </div>

                {/* Color swatches preview */}
                <div className="flex gap-1 mt-2">
                    {item.colors.slice(0, 6).map((colorName) => {
                        const color = MERCH_COLORS.find(c => c.name === colorName);
                        return (
                            <div
                                key={colorName}
                                className="w-4 h-4 rounded-full border border-white/10"
                                style={{ background: color?.hex || '#333' }}
                                title={colorName}
                            />
                        );
                    })}
                    {item.colors.length > 6 && (
                        <span className="text-[9px] text-muted-foreground self-center ml-0.5">+{item.colors.length - 6}</span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export function DropPage({ dropId, storefrontId }: DropPageProps) {
    const { user } = useAuth();
    const { drops, useDropItems, purchaseItem, joinWaitlist, trackView, isPurchasing } = useMerchDrops(storefrontId);
    const { data: items = [] } = useDropItems(dropId);
    const { canAfford } = useMixxWallet();

    const drop = drops.find(d => d.id === dropId);
    const [selectedItem, setSelectedItem] = useState<DropItemType | null>(null);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [useCoinz, setUseCoinz] = useState(false);

    // Track view on mount
    useEffect(() => { trackView(dropId); }, [dropId]);

    if (!drop) return null;

    const isLive = drop.status === 'live';
    const isUpcoming = drop.status === 'scheduled' || drop.status === 'draft';
    const statusConfig = DROP_STATUS_CONFIG[drop.status];

    const handlePurchase = async () => {
        if (!selectedItem || !selectedSize || !selectedColor) return;
        await purchaseItem({
            dropId,
            itemId: selectedItem.id,
            size: selectedSize,
            color: selectedColor,
            quantity,
            coinzUsed: useCoinz ? (selectedItem.coinz_price || 0) * quantity : 0,
        });
        setSelectedItem(null);
    };

    return (
        <div className="min-h-screen bg-[#0a0a1a]">
            {/* Hero */}
            <div className="relative h-[40vh] min-h-[300px] overflow-hidden">
                {drop.banner_url ? (
                    <img src={drop.banner_url} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-500/20 via-red-500/10 to-purple-500/10" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-[#0a0a1a]/50 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <Badge variant="outline" className={cn('mb-2 text-[10px]', statusConfig.bgColor, statusConfig.color)}>
                        {statusConfig.label}
                    </Badge>
                    <h1 className="text-3xl sm:text-4xl font-black text-white mb-1">{drop.name}</h1>
                    {drop.description && (
                        <p className="text-sm text-white/60 max-w-lg">{drop.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-white/40">
                        <span>{drop.item_count} items</span>
                        <span>{drop.total_quantity} total units</span>
                        <span>👁 {drop.view_count} views</span>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
                {/* Countdown or Live indicator */}
                {isUpcoming && (
                    <div className="text-center">
                        <DropCountdown launchDate={drop.launch_date} variant="full" />
                        <Button
                            onClick={() => joinWaitlist(dropId)}
                            variant="outline"
                            className="mt-4 gap-2 border-orange-500/20 text-orange-400 hover:bg-orange-500/10"
                        >
                            <Bell className="h-4 w-4" />
                            Join Waitlist ({drop.waitlist_count})
                        </Button>
                    </div>
                )}

                {/* Items grid */}
                <div>
                    <h2 className="text-lg font-bold text-foreground mb-4">
                        {isLive ? 'Shop the Drop' : 'Preview Items'}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {items.map((item) => (
                            <ItemCard key={item.id} item={item} isLive={isLive} onSelect={setSelectedItem} />
                        ))}
                    </div>
                </div>

                {/* Lookbook */}
                {drop.lookbook_images.length > 0 && (
                    <div>
                        <h2 className="text-lg font-bold text-foreground mb-4">Lookbook</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {drop.lookbook_images.map((img, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="aspect-[3/4] rounded-xl overflow-hidden"
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Purchase drawer */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                        onClick={() => setSelectedItem(null)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="absolute bottom-0 left-0 right-0 bg-[#0d0d1a] border-t border-white/10 rounded-t-2xl max-h-[80vh] overflow-y-auto p-5"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Item header */}
                            <div className="flex items-start gap-4 mb-5">
                                <div className="w-20 h-20 rounded-xl bg-white/5 overflow-hidden flex-shrink-0">
                                    {selectedItem.image_url ? (
                                        <img src={selectedItem.image_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl">
                                            {GARMENT_TYPES[selectedItem.garment_type as GarmentType]?.emoji || '👕'}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {GARMENT_TYPES[selectedItem.garment_type as GarmentType]?.label}
                                    </p>
                                    <h3 className="text-lg font-bold text-foreground">{selectedItem.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xl font-bold text-foreground">${selectedItem.price}</span>
                                        <ScarcityBadge remaining={selectedItem.quantity_remaining} total={selectedItem.quantity_total} />
                                    </div>
                                </div>
                            </div>

                            {/* Size selector */}
                            <div className="mb-4">
                                <p className="text-xs text-muted-foreground mb-2">Size</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedItem.sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={cn(
                                                'px-4 py-2 rounded-lg text-sm font-medium border transition-all min-w-[48px]',
                                                selectedSize === size
                                                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                                                    : 'bg-white/5 text-foreground border-white/10 hover:border-white/20'
                                            )}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color selector */}
                            <div className="mb-4">
                                <p className="text-xs text-muted-foreground mb-2">
                                    Color{selectedColor && ` — ${selectedColor}`}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedItem.colors.map((colorName) => {
                                        const color = MERCH_COLORS.find(c => c.name === colorName);
                                        return (
                                            <button
                                                key={colorName}
                                                onClick={() => setSelectedColor(colorName)}
                                                title={colorName}
                                                className={cn(
                                                    'w-10 h-10 rounded-full border-2 transition-all relative',
                                                    selectedColor === colorName
                                                        ? 'border-orange-400 ring-2 ring-orange-400/30 scale-110'
                                                        : 'border-white/15 hover:border-white/30'
                                                )}
                                                style={{ background: color?.hex || '#333' }}
                                            >
                                                {selectedColor === colorName && (
                                                    <Check className={cn(
                                                        'h-4 w-4 absolute inset-0 m-auto',
                                                        color?.textOnColor === 'black' ? 'text-black' : 'text-white'
                                                    )} />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Quantity */}
                            <div className="mb-4 flex items-center gap-3">
                                <p className="text-xs text-muted-foreground">Qty</p>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-foreground flex items-center justify-center"
                                    >
                                        -
                                    </button>
                                    <span className="w-10 text-center text-sm font-bold text-foreground">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(q => Math.min(selectedItem.limit_per_customer, q + 1))}
                                        className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-foreground flex items-center justify-center"
                                    >
                                        +
                                    </button>
                                </div>
                                <span className="text-[10px] text-muted-foreground">
                                    Max {selectedItem.limit_per_customer} per person
                                </span>
                            </div>

                            {/* Coinz option */}
                            {selectedItem.coinz_price && (
                                <div className="mb-5 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Coins className="h-4 w-4 text-amber-400" />
                                        <div>
                                            <p className="text-sm font-medium text-foreground">Pay with MixxCoinz</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {(selectedItem.coinz_price * quantity).toLocaleString()} 🪙 instead of ${(selectedItem.price * quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setUseCoinz(!useCoinz)}
                                        className={cn(
                                            'px-3 py-1 rounded-lg text-xs font-medium transition-all',
                                            useCoinz
                                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                                : 'bg-white/5 text-muted-foreground border border-white/10'
                                        )}
                                    >
                                        {useCoinz ? '✓ Using Coinz' : 'Use Coinz'}
                                    </button>
                                </div>
                            )}

                            {/* Purchase button */}
                            <Button
                                onClick={handlePurchase}
                                disabled={!selectedSize || !selectedColor || isPurchasing}
                                className="w-full h-12 gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-base font-bold rounded-xl"
                            >
                                {isPurchasing ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <ShoppingBag className="h-5 w-5" />
                                )}
                                {isPurchasing
                                    ? 'Processing...'
                                    : useCoinz
                                        ? `Buy for ${((selectedItem.coinz_price || 0) * quantity).toLocaleString()} 🪙`
                                        : `Buy for $${(selectedItem.price * quantity).toFixed(2)}`
                                }
                            </Button>

                            {(!selectedSize || !selectedColor) && (
                                <p className="text-[10px] text-amber-400 text-center mt-2">
                                    <AlertTriangle className="h-3 w-3 inline" /> Select size and color to purchase
                                </p>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
