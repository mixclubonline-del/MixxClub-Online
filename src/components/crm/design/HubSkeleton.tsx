/**
 * HubSkeleton — Standardized loading skeleton for CRM hub interiors.
 * 
 * Provides 4 variant patterns (stats, list, cards, tabs) so every
 * hub has a consistent, premium-feeling loading state instead of
 * bare <Loader2> spinners or ad-hoc skeletons.
 */

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { GlassPanel } from './GlassPanel';

export interface HubSkeletonProps {
    /** Layout variant */
    variant: 'stats' | 'list' | 'cards' | 'tabs';
    /** Number of skeleton items to render */
    count?: number;
}

export const HubSkeleton: React.FC<HubSkeletonProps> = ({ variant, count = 4 }) => {
    switch (variant) {
        case 'stats':
            return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: count }).map((_, i) => (
                        <GlassPanel key={i} padding="p-4">
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-10 h-10 rounded-lg" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-6 w-16 rounded" />
                                    <Skeleton className="h-3 w-20 rounded" />
                                </div>
                            </div>
                        </GlassPanel>
                    ))}
                </div>
            );

        case 'list':
            return (
                <GlassPanel>
                    <div className="space-y-1 mb-5">
                        <Skeleton className="h-5 w-40 rounded" />
                        <Skeleton className="h-3 w-56 rounded" />
                    </div>
                    <div className="space-y-3">
                        {Array.from({ length: count }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/5 rounded" />
                                    <Skeleton className="h-3 w-2/5 rounded" />
                                </div>
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                        ))}
                    </div>
                </GlassPanel>
            );

        case 'cards':
            return (
                <div className="space-y-5">
                    <div className="space-y-1">
                        <Skeleton className="h-5 w-40 rounded" />
                        <Skeleton className="h-3 w-56 rounded" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: count }).map((_, i) => (
                            <GlassPanel key={i} padding="p-5">
                                <Skeleton className="h-8 w-8 rounded-lg mb-4" />
                                <Skeleton className="h-4 w-3/4 rounded mb-2" />
                                <Skeleton className="h-3 w-full rounded mb-1" />
                                <Skeleton className="h-3 w-2/3 rounded mb-4" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-6 w-14 rounded-full" />
                                    <Skeleton className="h-6 w-14 rounded-full" />
                                </div>
                            </GlassPanel>
                        ))}
                    </div>
                </div>
            );

        case 'tabs':
            return (
                <div className="space-y-5">
                    <div className="space-y-1">
                        <Skeleton className="h-5 w-40 rounded" />
                        <Skeleton className="h-3 w-56 rounded" />
                    </div>
                    {/* Tab bar skeleton */}
                    <div className="flex gap-1 p-1 rounded-lg bg-white/[0.03] border border-white/5 w-fit">
                        {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
                            <Skeleton key={i} className="h-8 w-24 rounded-md" />
                        ))}
                    </div>
                    {/* Tab content skeleton */}
                    <GlassPanel>
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3 p-3">
                                    <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-1/2 rounded" />
                                        <Skeleton className="h-3 w-3/4 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassPanel>
                </div>
            );

        default:
            return null;
    }
};
