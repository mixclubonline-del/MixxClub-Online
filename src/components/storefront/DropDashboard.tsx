/**
 * DropDashboard — CRM view for managing all drops.
 * 
 * Shows live, scheduled, and past drops with hype metrics.
 * Quick actions: launch, end, view analytics.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Flame, Clock, Eye, Users, DollarSign, Plus, ChevronRight,
    Rocket, Archive, TrendingUp, ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassPanel, HubHeader } from '@/components/crm/design';
import { useMerchDrops, type MerchDrop } from '@/hooks/useMerchDrops';
import { DROP_STATUS_CONFIG } from '@/hooks/MerchConfig';
import { useStorefront } from '@/hooks/useStorefront';
import { useAuth } from '@/hooks/useAuth';
import { DropCreator } from './DropCreator';

function DropCard({ drop, onLaunch, onEnd }: {
    drop: MerchDrop;
    onLaunch: (id: string) => void;
    onEnd: (id: string) => void;
}) {
    const statusConfig = DROP_STATUS_CONFIG[drop.status];
    const soldPct = drop.total_quantity > 0 ? Math.round((drop.total_sold / drop.total_quantity) * 100) : 0;
    const isUpcoming = drop.status === 'scheduled' || drop.status === 'draft';
    const isLive = drop.status === 'live';

    const timeUntilLaunch = new Date(drop.launch_date).getTime() - Date.now();
    const daysUntil = Math.max(0, Math.ceil(timeUntilLaunch / (1000 * 60 * 60 * 24)));

    return (
        <GlassPanel
            padding="p-4"
            glow={isLive}
            accent={isLive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(249, 115, 22, 0.1)'}
        >
            <div className="flex items-start justify-between mb-3">
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-base font-bold text-foreground">{drop.name}</h3>
                        <Badge variant="outline" className={cn('text-[10px] px-1.5 border-0', statusConfig.bgColor, statusConfig.color)}>
                            {statusConfig.label}
                        </Badge>
                    </div>
                    {drop.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{drop.description}</p>
                    )}
                </div>
                {isLive && (
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="bg-white/5 rounded-lg p-2 text-center">
                    <ShoppingBag className="h-3 w-3 mx-auto mb-0.5 text-muted-foreground" />
                    <p className="text-sm font-bold text-foreground">{drop.total_sold}</p>
                    <p className="text-[9px] text-muted-foreground">Sold</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                    <Eye className="h-3 w-3 mx-auto mb-0.5 text-muted-foreground" />
                    <p className="text-sm font-bold text-foreground">{drop.view_count}</p>
                    <p className="text-[9px] text-muted-foreground">Views</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                    <Users className="h-3 w-3 mx-auto mb-0.5 text-muted-foreground" />
                    <p className="text-sm font-bold text-foreground">{drop.waitlist_count}</p>
                    <p className="text-[9px] text-muted-foreground">Waitlist</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                    <DollarSign className="h-3 w-3 mx-auto mb-0.5 text-green-400" />
                    <p className="text-sm font-bold text-green-400">${drop.total_revenue.toLocaleString()}</p>
                    <p className="text-[9px] text-muted-foreground">Revenue</p>
                </div>
            </div>

            {/* Sold progress */}
            <div className="mb-3">
                <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-muted-foreground">{drop.total_sold}/{drop.total_quantity} sold</span>
                    <span className={cn(
                        'font-medium',
                        soldPct >= 80 ? 'text-red-400' : soldPct >= 50 ? 'text-amber-400' : 'text-muted-foreground'
                    )}>
                        {soldPct}%
                    </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        className={cn(
                            'h-full rounded-full',
                            soldPct >= 80 ? 'bg-red-500' : soldPct >= 50 ? 'bg-amber-500' : 'bg-orange-500'
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${soldPct}%` }}
                        transition={{ duration: 0.6 }}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                {isUpcoming && daysUntil <= 0 && (
                    <Button
                        size="sm"
                        className="flex-1 gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white"
                        onClick={() => onLaunch(drop.id)}
                    >
                        <Rocket className="h-3.5 w-3.5" />
                        Go Live
                    </Button>
                )}
                {isUpcoming && daysUntil > 0 && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1 border-blue-500/20 text-blue-400"
                        onClick={() => onLaunch(drop.id)}
                    >
                        <Clock className="h-3.5 w-3.5" />
                        {daysUntil}d until launch
                    </Button>
                )}
                {isLive && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1 border-white/10"
                        onClick={() => onEnd(drop.id)}
                    >
                        <Archive className="h-3.5 w-3.5" />
                        End Drop
                    </Button>
                )}
                {drop.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                        {drop.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[9px] text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded-full">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </GlassPanel>
    );
}

export function DropDashboard() {
    const { user } = useAuth();
    const { storefront } = useStorefront(user?.id);
    const { drops, liveDrops, scheduledDrops, pastDrops, updateDropStatus, isLoading } = useMerchDrops(storefront?.id);
    const [showCreator, setShowCreator] = useState(false);

    const handleLaunch = async (dropId: string) => {
        await updateDropStatus({ dropId, status: 'live' });
    };

    const handleEnd = async (dropId: string) => {
        await updateDropStatus({ dropId, status: 'ended' });
    };

    const totalRevenue = drops.reduce((sum, d) => sum + d.total_revenue, 0);
    const totalSold = drops.reduce((sum, d) => sum + d.total_sold, 0);

    return (
        <div className="space-y-5">
            <HubHeader
                icon={<Flame className="h-5 w-5 text-orange-400" />}
                title="Merch Drops"
                subtitle="Limited edition streetwear for your fans"
                accent="rgba(249, 115, 22, 0.5)"
            />

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3">
                <GlassPanel padding="p-3" accent="rgba(239, 68, 68, 0.1)">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-red-400">{liveDrops.length}</p>
                        <p className="text-[10px] text-muted-foreground">Live Now</p>
                    </div>
                </GlassPanel>
                <GlassPanel padding="p-3" accent="rgba(249, 115, 22, 0.1)">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-orange-400">{totalSold}</p>
                        <p className="text-[10px] text-muted-foreground">Total Sold</p>
                    </div>
                </GlassPanel>
                <GlassPanel padding="p-3" accent="rgba(34, 197, 94, 0.1)">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-green-400">${totalRevenue.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">Total Revenue</p>
                    </div>
                </GlassPanel>
            </div>

            {/* Live drops */}
            {liveDrops.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <h3 className="text-sm font-semibold text-foreground">Live Drops</h3>
                    </div>
                    {liveDrops.map(drop => (
                        <DropCard key={drop.id} drop={drop} onLaunch={handleLaunch} onEnd={handleEnd} />
                    ))}
                </div>
            )}

            {/* Scheduled drops */}
            {scheduledDrops.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-blue-400" />
                        Upcoming
                    </h3>
                    {scheduledDrops.map(drop => (
                        <DropCard key={drop.id} drop={drop} onLaunch={handleLaunch} onEnd={handleEnd} />
                    ))}
                </div>
            )}

            {/* Past drops */}
            {pastDrops.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <Archive className="h-3.5 w-3.5 text-muted-foreground" />
                        Past Drops
                    </h3>
                    {pastDrops.map(drop => (
                        <DropCard key={drop.id} drop={drop} onLaunch={handleLaunch} onEnd={handleEnd} />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {drops.length === 0 && !isLoading && (
                <GlassPanel padding="p-8" accent="rgba(249, 115, 22, 0.1)">
                    <div className="text-center">
                        <Flame className="h-12 w-12 mx-auto mb-3 text-orange-400/40" />
                        <h3 className="text-lg font-bold text-foreground mb-1">No drops yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">Create your first limited edition drop and watch it sell out</p>
                    </div>
                </GlassPanel>
            )}

            {/* Create button */}
            <Button
                onClick={() => setShowCreator(true)}
                className="w-full gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white h-11"
            >
                <Plus className="h-4 w-4" />
                Create New Drop 🔥
            </Button>

            {/* Creator modal */}
            {showCreator && (
                <DropCreator onClose={() => setShowCreator(false)} />
            )}
        </div>
    );
}
