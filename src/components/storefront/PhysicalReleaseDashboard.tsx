/**
 * PhysicalReleaseDashboard — CRM view for managing physical music releases.
 * 
 * Shows available, pre-order, and sold-out releases with order counts and revenue.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Disc3, Plus, ShoppingBag, DollarSign, Package,
    Clock, Archive, TrendingUp, Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassPanel, HubHeader } from '@/components/crm/design';
import { usePhysicalOrders, type PhysicalRelease } from '@/hooks/usePhysicalOrders';
import { PHYSICAL_FORMATS, PACKAGING_TIERS, ORDER_STATUS_CONFIG, type PhysicalFormat, type PackagingTier } from '@/hooks/PhysicalMediaConfig';
import { useStorefront } from '@/hooks/useStorefront';
import { useAuth } from '@/hooks/useAuth';
import { PhysicalReleaseCreator } from './PhysicalReleaseCreator';

function ReleaseCard({ release }: { release: PhysicalRelease }) {
    const fc = PHYSICAL_FORMATS[release.format as PhysicalFormat] || PHYSICAL_FORMATS.vinyl_standard;
    const pkg = PACKAGING_TIERS[release.packaging as PackagingTier] || PACKAGING_TIERS.standard;
    const soldPct = release.edition_size > 0 ? Math.round((release.sold_count / release.edition_size) * 100) : 0;
    const isSoldOut = release.status === 'sold_out';

    return (
        <GlassPanel
            padding="p-4"
            glow={release.status === 'preorder'}
            accent={isSoldOut ? 'rgba(245, 158, 11, 0.1)' : 'rgba(139, 92, 246, 0.1)'}
        >
            <div className="flex items-start gap-3 mb-3">
                {/* Cover art or emoji */}
                <div className="w-14 h-14 rounded-xl bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {release.cover_art_url ? (
                        <img src={release.cover_art_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-2xl">{fc.emoji}</span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="text-sm font-bold text-foreground truncate">{release.title}</h3>
                        <Badge variant="outline" className={cn(
                            'text-[9px] px-1.5 border-0',
                            release.status === 'preorder' ? 'bg-blue-500/10 text-blue-400' :
                                isSoldOut ? 'bg-amber-500/10 text-amber-400' : 'bg-green-500/10 text-green-400'
                        )}>
                            {release.status === 'preorder' ? '📦 Pre-Order' : isSoldOut ? 'SOLD OUT' : 'Available'}
                        </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{release.artist_name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                        <Badge variant="outline" className="text-[8px] bg-violet-500/10 text-violet-300 border-violet-500/20">{fc.emoji} {fc.label}</Badge>
                        <Badge variant="outline" className="text-[8px] bg-white/5 text-muted-foreground border-white/10">{pkg.emoji} {pkg.label}</Badge>
                        {release.is_numbered && <Badge variant="outline" className="text-[8px] bg-amber-500/10 text-amber-400 border-amber-500/20">#Numbered</Badge>}
                        {release.is_signed && <Badge variant="outline" className="text-[8px] bg-green-500/10 text-green-400 border-green-500/20">✍️ Signed</Badge>}
                    </div>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-white/5 rounded-lg p-2 text-center">
                    <ShoppingBag className="h-3 w-3 mx-auto mb-0.5 text-muted-foreground" />
                    <p className="text-sm font-bold text-foreground">{release.sold_count}</p>
                    <p className="text-[8px] text-muted-foreground">Sold</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                    <Package className="h-3 w-3 mx-auto mb-0.5 text-muted-foreground" />
                    <p className="text-sm font-bold text-foreground">{release.remaining}</p>
                    <p className="text-[8px] text-muted-foreground">Left</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                    <DollarSign className="h-3 w-3 mx-auto mb-0.5 text-green-400" />
                    <p className="text-sm font-bold text-green-400">${release.total_revenue.toLocaleString()}</p>
                    <p className="text-[8px] text-muted-foreground">Revenue</p>
                </div>
            </div>

            {/* Sell-through */}
            <div>
                <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-muted-foreground">{release.sold_count}/{release.edition_size} copies</span>
                    <span className={cn('font-medium', soldPct >= 80 ? 'text-red-400' : soldPct >= 50 ? 'text-amber-400' : 'text-muted-foreground')}>{soldPct}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        className={cn('h-full rounded-full', soldPct >= 80 ? 'bg-red-500' : soldPct >= 50 ? 'bg-amber-500' : 'bg-violet-500')}
                        initial={{ width: 0 }}
                        animate={{ width: `${soldPct}%` }}
                        transition={{ duration: 0.6 }}
                    />
                </div>
            </div>

            {/* Price & vinyl color */}
            <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                <span className="font-medium text-foreground">${release.price}</span>
                {release.vinyl_color && release.vinyl_color !== 'Classic Black' && (
                    <span>🎨 {release.vinyl_color}</span>
                )}
                {release.tracklist.length > 0 && <span>{release.tracklist.length} tracks</span>}
            </div>
        </GlassPanel>
    );
}

export function PhysicalReleaseDashboard() {
    const { user } = useAuth();
    const { storefront } = useStorefront(user?.id);
    const { releases, availableReleases, soldOutReleases, isLoading } = usePhysicalOrders(storefront?.id);
    const [showCreator, setShowCreator] = useState(false);

    const preorders = releases.filter(r => r.status === 'preorder');
    const available = releases.filter(r => r.status === 'available');
    const totalRevenue = releases.reduce((sum, r) => sum + r.total_revenue, 0);
    const totalSold = releases.reduce((sum, r) => sum + r.sold_count, 0);

    return (
        <div className="space-y-5">
            <HubHeader
                icon={<Disc3 className="h-5 w-5 text-violet-400" />}
                title="Physical Releases"
                subtitle="Vinyl, CDs, cassettes & collector's editions"
                accent="rgba(139, 92, 246, 0.5)"
            />

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3">
                <GlassPanel padding="p-3" accent="rgba(139, 92, 246, 0.1)">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-violet-400">{releases.length}</p>
                        <p className="text-[10px] text-muted-foreground">Releases</p>
                    </div>
                </GlassPanel>
                <GlassPanel padding="p-3" accent="rgba(249, 115, 22, 0.1)">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-orange-400">{totalSold}</p>
                        <p className="text-[10px] text-muted-foreground">Copies Sold</p>
                    </div>
                </GlassPanel>
                <GlassPanel padding="p-3" accent="rgba(34, 197, 94, 0.1)">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-green-400">${totalRevenue.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">Revenue</p>
                    </div>
                </GlassPanel>
            </div>

            {/* Pre-orders */}
            {preorders.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-blue-400" /> Pre-Orders Open
                    </h3>
                    {preorders.map(r => <ReleaseCard key={r.id} release={r} />)}
                </div>
            )}

            {/* Available */}
            {available.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <Disc3 className="h-3.5 w-3.5 text-violet-400" /> Available Now
                    </h3>
                    {available.map(r => <ReleaseCard key={r.id} release={r} />)}
                </div>
            )}

            {/* Sold out */}
            {soldOutReleases.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <Archive className="h-3.5 w-3.5 text-muted-foreground" /> Sold Out
                    </h3>
                    {soldOutReleases.map(r => <ReleaseCard key={r.id} release={r} />)}
                </div>
            )}

            {/* Empty */}
            {releases.length === 0 && !isLoading && (
                <GlassPanel padding="p-8" accent="rgba(139, 92, 246, 0.1)">
                    <div className="text-center">
                        <Disc3 className="h-12 w-12 mx-auto mb-3 text-violet-400/40" />
                        <h3 className="text-lg font-bold text-foreground mb-1">No physical releases yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">Create your first vinyl, CD, or cassette release</p>
                    </div>
                </GlassPanel>
            )}

            {/* Create button */}
            <Button
                onClick={() => setShowCreator(true)}
                className="w-full gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white h-11"
            >
                <Plus className="h-4 w-4" />
                Create Physical Release 🎵
            </Button>

            {showCreator && (
                <PhysicalReleaseCreator onClose={() => setShowCreator(false)} />
            )}
        </div>
    );
}
