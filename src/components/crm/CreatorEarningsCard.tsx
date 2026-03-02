/**
 * CreatorEarningsCard — Real-time earnings tracker for artists.
 * 
 * Shows today's payouts, breakdown by action type, and trend.
 * This goes in the CRM dashboard so artists see their content earning coinz.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Coins, TrendingUp, Play, MessageSquare, Share2, Heart, Users } from 'lucide-react';
import { GlassPanel } from '@/components/crm/design';
import { useCoinzRevenue } from '@/hooks/useCoinzRevenue';

const ACTION_ICONS: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    creator_payout: { icon: Coins, color: 'text-amber-400', label: 'Content Payouts' },
    tip: { icon: Heart, color: 'text-pink-400', label: 'Tips Received' },
    play_track: { icon: Play, color: 'text-green-400', label: 'Track Plays' },
    comment: { icon: MessageSquare, color: 'text-blue-400', label: 'Comments' },
    share: { icon: Share2, color: 'text-purple-400', label: 'Shares' },
    follow_artist: { icon: Users, color: 'text-cyan-400', label: 'New Followers' },
};

export function CreatorEarningsCard() {
    const { revenue, isLoading } = useCoinzRevenue();

    if (isLoading) {
        return (
            <GlassPanel padding="p-4" accent="rgba(245, 158, 11, 0.15)">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-white/10 rounded w-1/3" />
                    <div className="h-8 bg-white/10 rounded w-1/2" />
                    <div className="space-y-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-3 bg-white/5 rounded w-full" />
                        ))}
                    </div>
                </div>
            </GlassPanel>
        );
    }

    const totalToday = revenue?.thisWeek || 0;

    return (
        <GlassPanel padding="p-4" glow accent="rgba(245, 158, 11, 0.15)">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <Coins className="h-4 w-4 text-amber-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">Content Earnings</p>
                        <p className="text-[10px] text-muted-foreground">Your fans are making you coinz</p>
                    </div>
                </div>
                {(revenue?.weeklyTrend || 0) !== 0 && (
                    <div className={cn(
                        'flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full',
                        (revenue?.weeklyTrend || 0) > 0
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                    )}>
                        <TrendingUp className={cn('h-3 w-3', (revenue?.weeklyTrend || 0) < 0 && 'rotate-180')} />
                        {Math.abs(revenue?.weeklyTrend || 0)}%
                    </div>
                )}
            </div>

            {/* Big number */}
            <div className="text-center mb-4">
                <motion.p
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-bold text-amber-400"
                >
                    {(revenue?.totalEarned || 0).toLocaleString()}
                </motion.p>
                <p className="text-xs text-muted-foreground">Total coinz earned from content</p>
            </div>

            {/* By source breakdown */}
            <div className="space-y-2">
                {(revenue?.bySource || []).slice(0, 5).map((src) => {
                    const config = ACTION_ICONS[src.source] || { icon: Coins, color: 'text-muted-foreground', label: src.source };
                    const Icon = config.icon;
                    const pct = revenue?.totalEarned ? (src.total / revenue.totalEarned) * 100 : 0;

                    return (
                        <div key={src.source} className="flex items-center gap-2">
                            <Icon className={cn('h-3.5 w-3.5 flex-shrink-0', config.color)} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between text-[11px] mb-0.5">
                                    <span className="text-foreground truncate">{config.label}</span>
                                    <span className="text-muted-foreground font-mono ml-2">{src.total.toLocaleString()}</span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className={cn('h-full rounded-full opacity-60', config.color.replace('text-', 'bg-'))}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${pct}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {(!revenue?.bySource || revenue.bySource.length === 0) && (
                <p className="text-xs text-muted-foreground text-center py-3">
                    Upload content and watch the coinz flow in ✨
                </p>
            )}
        </GlassPanel>
    );
}
