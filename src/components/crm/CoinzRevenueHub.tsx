/**
 * CoinzRevenueHub — CRM dashboard showing artist's coinz earnings.
 * 
 * Revenue breakdown by source, 30-day chart, weekly trend.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Coins, TrendingUp, TrendingDown, BarChart3, Gift, Target, Zap } from 'lucide-react';
import { GlassPanel, HubHeader, HubSkeleton } from '@/components/crm/design';
import { useCoinzRevenue } from '@/hooks/useCoinzRevenue';
import { useMixxWallet } from '@/hooks/useMixxWallet';

const SOURCE_LABELS: Record<string, { label: string; emoji: string }> = {
    tip: { label: 'Tips', emoji: '💝' },
    mission: { label: 'Missions', emoji: '🎯' },
    curator_promotion: { label: 'Curator Promos', emoji: '📢' },
    curator_booking: { label: 'Bookings', emoji: '📅' },
    vault_purchase: { label: 'Vault Sales', emoji: '🏪' },
    referral: { label: 'Referrals', emoji: '🤝' },
    daily_reward: { label: 'Daily Rewards', emoji: '📆' },
    unknown: { label: 'Other', emoji: '🪙' },
};

export function CoinzRevenueHub() {
    const { revenue, isLoading } = useCoinzRevenue();
    const { totalBalance } = useMixxWallet();

    if (isLoading) return <HubSkeleton variant="stats" />;

    const maxDaily = Math.max(...(revenue?.dailyRevenue?.map(d => d.amount) || [1]), 1);

    return (
        <div className="space-y-6">
            <HubHeader
                icon={<Coins className="h-5 w-5 text-amber-400" />}
                title="Coinz Revenue"
                subtitle="Your MixxCoinz earnings breakdown"
                accent="rgba(245, 158, 11, 0.5)"
            />

            {/* Top stats */}
            <div className="grid grid-cols-3 gap-3">
                <GlassPanel padding="p-4" accent="rgba(245, 158, 11, 0.2)">
                    <p className="text-xs text-muted-foreground">Current Balance</p>
                    <p className="text-2xl font-bold text-foreground">{totalBalance.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">🪙 MixxCoinz</p>
                </GlassPanel>

                <GlassPanel padding="p-4" accent="rgba(34, 197, 94, 0.2)">
                    <p className="text-xs text-muted-foreground">Total Earned</p>
                    <p className="text-2xl font-bold text-foreground">{(revenue?.totalEarned || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">all time</p>
                </GlassPanel>

                <GlassPanel padding="p-4" accent="rgba(59, 130, 246, 0.2)">
                    <p className="text-xs text-muted-foreground">This Week</p>
                    <p className="text-2xl font-bold text-foreground">{(revenue?.thisWeek || 0).toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-[10px]">
                        {(revenue?.weeklyTrend || 0) >= 0 ? (
                            <TrendingUp className="h-3 w-3 text-green-400" />
                        ) : (
                            <TrendingDown className="h-3 w-3 text-red-400" />
                        )}
                        <span className={(revenue?.weeklyTrend || 0) >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {Math.abs(revenue?.weeklyTrend || 0)}%
                        </span>
                    </div>
                </GlassPanel>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 30-day chart */}
                <GlassPanel padding="p-4" glow accent="rgba(245, 158, 11, 0.15)">
                    <div className="flex items-center gap-2 mb-3">
                        <BarChart3 className="h-4 w-4 text-amber-400" />
                        <p className="text-sm font-medium text-foreground">Last 30 Days</p>
                    </div>
                    <div className="flex items-end gap-[2px] h-28">
                        {(revenue?.dailyRevenue || []).map((day, i) => (
                            <motion.div
                                key={day.date}
                                className="flex-1 rounded-t-sm bg-amber-500/60 min-h-[1px]"
                                initial={{ height: 0 }}
                                animate={{ height: `${Math.max((day.amount / maxDaily) * 100, 1)}%` }}
                                transition={{ delay: i * 0.02, duration: 0.3 }}
                                title={`${day.date}: ${day.amount} coinz`}
                            />
                        ))}
                    </div>
                </GlassPanel>

                {/* Revenue by source */}
                <GlassPanel padding="p-4" glow accent="rgba(245, 158, 11, 0.15)">
                    <div className="flex items-center gap-2 mb-3">
                        <Target className="h-4 w-4 text-amber-400" />
                        <p className="text-sm font-medium text-foreground">By Source</p>
                    </div>
                    <div className="space-y-2.5">
                        {(revenue?.bySource || []).slice(0, 6).map((src, i) => {
                            const info = SOURCE_LABELS[src.source] || SOURCE_LABELS.unknown;
                            const pct = revenue?.totalEarned ? (src.total / revenue.totalEarned) * 100 : 0;
                            return (
                                <div key={src.source}>
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="text-foreground">
                                            {info.emoji} {info.label}
                                        </span>
                                        <span className="text-muted-foreground font-mono">
                                            {src.total.toLocaleString()} ({src.count})
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full bg-amber-500/60"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ delay: 0.2 + i * 0.05, duration: 0.4 }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {(!revenue?.bySource || revenue.bySource.length === 0) && (
                            <p className="text-xs text-muted-foreground text-center py-4">No earnings yet</p>
                        )}
                    </div>
                </GlassPanel>
            </div>
        </div>
    );
}
