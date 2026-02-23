/**
 * MediaShowcase — Orchestrates HeroReel, AudioCard, and PortfolioGrid
 * into a single cohesive profile section.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Music, Camera, Sparkles } from 'lucide-react';
import { HeroReel } from './HeroReel';
import { AudioCard } from './AudioCard';
import { PortfolioGrid } from './PortfolioGrid';
import type { FeaturedMediaItem, PortfolioItem } from './types';

interface MediaShowcaseProps {
    featuredMedia?: FeaturedMediaItem[];
    featuredTrack?: FeaturedMediaItem;
    portfolioItems?: PortfolioItem[];
    accent?: string;
    className?: string;
}

export const MediaShowcase: React.FC<MediaShowcaseProps> = ({
    featuredMedia = [],
    featuredTrack,
    portfolioItems = [],
    accent,
    className,
}) => {
    const hasHeroReel = featuredMedia.length > 0;
    const hasFeaturedTrack = !!featuredTrack;
    const hasPortfolio = portfolioItems.length > 0;
    const hasAnyContent = hasHeroReel || hasFeaturedTrack || hasPortfolio;

    if (!hasAnyContent) {
        return (
            <div className="text-center py-16 text-muted-foreground">
                <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No showcase content yet</p>
                <p className="text-xs mt-1 text-muted-foreground/60">
                    Add featured media from your Brand Hub
                </p>
            </div>
        );
    }

    return (
        <div className={cn('space-y-8', className)}>
            {/* Hero Reel */}
            {hasHeroReel && (
                <section>
                    <HeroReel items={featuredMedia} />
                </section>
            )}

            {/* Featured Track */}
            {hasFeaturedTrack && (
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <Music className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-medium text-foreground">Featured Track</h3>
                    </div>
                    <AudioCard track={featuredTrack} accent={accent} />
                </section>
            )}

            {/* Portfolio */}
            {hasPortfolio && (
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <Camera className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-medium text-foreground">Portfolio</h3>
                    </div>
                    <PortfolioGrid items={portfolioItems} />
                </section>
            )}
        </div>
    );
};
