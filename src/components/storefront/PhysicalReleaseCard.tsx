/**
 * PhysicalReleaseCard — Fan-facing card for browsing physical releases.
 * 
 * Shows cover art, format badge, edition info, scarcity, dual pricing.
 * Used in store grids, profile pages, and marketplace.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Coins, Disc3, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { PhysicalRelease } from '@/hooks/usePhysicalOrders';
import { PHYSICAL_FORMATS, PACKAGING_TIERS, type PhysicalFormat, type PackagingTier } from '@/hooks/PhysicalMediaConfig';

interface PhysicalReleaseCardProps {
    release: PhysicalRelease;
    onSelect?: (release: PhysicalRelease) => void;
    className?: string;
}

export function PhysicalReleaseCard({ release, onSelect, className }: PhysicalReleaseCardProps) {
    const fc = PHYSICAL_FORMATS[release.format as PhysicalFormat] || PHYSICAL_FORMATS.vinyl_standard;
    const pkg = PACKAGING_TIERS[release.packaging as PackagingTier] || PACKAGING_TIERS.standard;
    const isSoldOut = release.status === 'sold_out';
    const isPreorder = release.status === 'preorder';
    const remainingPct = release.edition_size > 0 ? (release.remaining / release.edition_size) * 100 : 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            onClick={() => !isSoldOut && onSelect?.(release)}
            className={cn(
                'rounded-xl border transition-all cursor-pointer overflow-hidden group',
                isSoldOut
                    ? 'border-white/5 opacity-60'
                    : 'border-white/10 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5',
                className
            )}
        >
            {/* Cover art */}
            <div className="aspect-square bg-gradient-to-br from-violet-500/10 to-purple-500/10 relative overflow-hidden">
                {release.cover_art_url ? (
                    <img src={release.cover_art_url} alt={release.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl">{fc.emoji}</span>
                    </div>
                )}

                {/* Overlay badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <Badge className="bg-violet-500/80 text-white text-[9px] backdrop-blur-sm">
                        {fc.emoji} {fc.label}
                    </Badge>
                    {isPreorder && (
                        <Badge className="bg-blue-500/80 text-white text-[9px] backdrop-blur-sm">
                            📦 Pre-Order
                        </Badge>
                    )}
                </div>

                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                    {release.is_numbered && (
                        <Badge className="bg-amber-500/80 text-white text-[9px] backdrop-blur-sm">
                            #{release.edition_size} Edition
                        </Badge>
                    )}
                    {release.is_signed && (
                        <Badge className="bg-green-500/80 text-white text-[9px] backdrop-blur-sm">
                            ✍️ Signed
                        </Badge>
                    )}
                </div>

                {/* Scarcity indicator */}
                {!isSoldOut && remainingPct <= 20 && (
                    <div className="absolute bottom-2 left-2 right-2">
                        <div className="bg-red-500/80 backdrop-blur-sm text-white text-[10px] font-medium text-center py-1 rounded-lg animate-pulse">
                            🔥 Only {release.remaining} copies left!
                        </div>
                    </div>
                )}

                {isSoldOut && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-xl font-black text-amber-400 tracking-wider">SOLD OUT</span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-3">
                <p className="text-[10px] text-muted-foreground">{release.artist_name}</p>
                <p className="text-sm font-semibold text-foreground mt-0.5 line-clamp-1">{release.title}</p>

                {/* Tracklist teaser */}
                {release.tracklist.length > 0 && (
                    <p className="text-[9px] text-muted-foreground mt-1">
                        {release.tracklist.length} tracks · {release.tracklist.slice(0, 2).map(t => t.title).join(', ')}
                        {release.tracklist.length > 2 && '...'}
                    </p>
                )}

                {/* Packaging badge */}
                <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[9px] text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded-full">
                        {pkg.emoji} {pkg.label}
                    </span>
                    {release.vinyl_color && release.vinyl_color !== 'Classic Black' && (
                        <span className="text-[9px] text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded-full">
                            🎨 {release.vinyl_color}
                        </span>
                    )}
                </div>

                {/* Pricing */}
                <div className="flex items-center justify-between mt-2.5">
                    <span className="text-base font-bold text-foreground">${release.price}</span>
                    {release.coinz_price && (
                        <span className="flex items-center gap-0.5 text-xs text-amber-400 font-medium">
                            <Coins className="h-3 w-3" />
                            {release.coinz_price.toLocaleString()}
                        </span>
                    )}
                </div>

                {/* CTA */}
                {!isSoldOut && (
                    <Button
                        size="sm"
                        className={cn(
                            'w-full mt-2 gap-1.5 text-xs',
                            isPreorder
                                ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/20'
                                : 'bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 border border-violet-500/20'
                        )}
                        onClick={(e) => { e.stopPropagation(); onSelect?.(release); }}
                    >
                        <ShoppingBag className="h-3 w-3" />
                        {isPreorder ? 'Pre-Order Now' : 'Buy Now'}
                    </Button>
                )}
            </div>
        </motion.div>
    );
}
