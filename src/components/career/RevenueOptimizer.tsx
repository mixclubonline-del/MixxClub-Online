/**
 * RevenueOptimizer — Tier 3 (Strategist) — Revenue Intelligence.
 * 
 * Revenue breakdown, pricing recs, AI forecast, upsell opportunities.
 * 1000 coinz boost for per-fan lifetime value analysis.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TrendingUp, DollarSign, Package, Ticket, Music2, Coins, Sparkles, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassPanel } from '@/components/crm/design';
import { useCareerManager } from '@/hooks/useCareerManager';
import { CAREER_MODULES } from '@/hooks/CareerManagerConfig';

const STREAMS = [
    { label: 'Streams', value: 1250, pct: 28, color: 'bg-cyan-500', icon: <Music2 className="h-3 w-3" />, trend: 12 },
    { label: 'Merch', value: 890, pct: 20, color: 'bg-purple-500', icon: <Package className="h-3 w-3" />, trend: 35 },
    { label: 'Events', value: 1680, pct: 38, color: 'bg-amber-500', icon: <Ticket className="h-3 w-3" />, trend: -5 },
    { label: 'Coinz', value: 620, pct: 14, color: 'bg-green-500', icon: <Coins className="h-3 w-3" />, trend: 22 },
];

const FORECAST = [
    { month: 'Jan', actual: 2800 }, { month: 'Feb', actual: 3200 }, { month: 'Mar', actual: 2900 },
    { month: 'Apr', actual: 4100 }, { month: 'May', actual: 4440 },
    { month: 'Jun', actual: null, forecast: 5200 }, { month: 'Jul', actual: null, forecast: 5800 },
];

const PRICING_RECS = [
    { product: 'Vinyl LP', current: 32, suggested: 38, reason: 'Similar artists charge $35-42. Your vinyl consistently sells out.', icon: '📀' },
    { product: 'VIP Tickets', current: 50, suggested: 65, reason: 'Your VIP tier sells out 40% faster than GA. Raise price to capture that demand.', icon: '⭐' },
    { product: 'Basic Tee', current: 25, suggested: 30, reason: 'Your brand strength supports a premium. Test at $30 next drop.', icon: '👕' },
];

export function RevenueOptimizer() {
    const { canAffordBoost, boostModule, metrics } = useCareerManager();
    const [isBoosted, setIsBoosted] = useState(false);
    const mod = CAREER_MODULES.revenue_optimizer;
    const totalRevenue = STREAMS.reduce((sum, s) => sum + s.value, 0);
    const maxForecast = Math.max(...FORECAST.map(f => f.actual || f.forecast || 0));

    const handleBoost = async () => {
        try { await boostModule('revenue_optimizer'); setIsBoosted(true); } catch { /* handled */ }
    };

    return (
        <div className="space-y-4">
            {/* Revenue Breakdown */}
            <GlassPanel padding="p-4" glow accent="rgba(34, 197, 94, 0.12)">
                <h4 className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-green-400" />
                    Revenue Breakdown
                </h4>
                <p className="text-2xl font-black text-green-400 mb-3">${totalRevenue.toLocaleString()}</p>

                {/* Stacked bar */}
                <div className="flex h-3 rounded-full overflow-hidden mb-3">
                    {STREAMS.map(s => (
                        <motion.div
                            key={s.label}
                            className={cn('h-full', s.color)}
                            initial={{ width: 0 }}
                            animate={{ width: `${s.pct}%` }}
                            transition={{ duration: 0.6 }}
                        />
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                    {STREAMS.map(s => (
                        <div key={s.label} className="flex items-center gap-2 p-1.5 bg-white/[0.03] rounded-lg">
                            <div className={cn('w-2 h-2 rounded-full', s.color)} />
                            <span className="text-muted-foreground mr-1">{s.icon}</span>
                            <div className="flex-1">
                                <p className="text-[10px] text-muted-foreground">{s.label}</p>
                                <p className="text-xs font-medium text-foreground">${s.value.toLocaleString()}</p>
                            </div>
                            <span className={cn('text-[9px] flex items-center gap-0.5',
                                s.trend > 0 ? 'text-green-400' : 'text-red-400'
                            )}>
                                {s.trend > 0 ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
                                {Math.abs(s.trend)}%
                            </span>
                        </div>
                    ))}
                </div>
            </GlassPanel>

            {/* Revenue Forecast */}
            <GlassPanel padding="p-4">
                <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
                    AI Revenue Forecast
                </h4>
                <div className="flex items-end gap-1 h-24">
                    {FORECAST.map(f => {
                        const val = f.actual || f.forecast || 0;
                        const hPct = (val / maxForecast) * 100;
                        const isForecast = !f.actual;
                        return (
                            <div key={f.month} className="flex-1 flex flex-col items-center gap-0.5">
                                <span className="text-[7px] text-muted-foreground">${(val / 1000).toFixed(1)}k</span>
                                <motion.div
                                    className={cn('w-full rounded-t-sm',
                                        isForecast ? 'border border-dashed border-cyan-500/40' : ''
                                    )}
                                    style={{
                                        background: isForecast
                                            ? 'repeating-linear-gradient(45deg, rgba(6,182,212,0.1), rgba(6,182,212,0.1) 2px, transparent 2px, transparent 4px)'
                                            : 'linear-gradient(180deg, #22c55e, #16a34a)',
                                    }}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${hPct}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                                <span className="text-[7px] text-muted-foreground">{f.month}</span>
                            </div>
                        );
                    })}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                    📈 Projected: <strong className="text-green-400">+31%</strong> revenue growth over next 2 months
                </p>
            </GlassPanel>

            {/* Pricing Recommendations */}
            <GlassPanel padding="p-4">
                <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    Pricing Recommendations
                </h4>
                <div className="space-y-2">
                    {PRICING_RECS.map(rec => (
                        <div key={rec.product} className="p-2.5 bg-white/[0.03] rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-foreground">{rec.icon} {rec.product}</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-muted-foreground line-through">${rec.current}</span>
                                    <span className="text-xs font-bold text-green-400">→ ${rec.suggested}</span>
                                </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground">{rec.reason}</p>
                        </div>
                    ))}
                </div>
            </GlassPanel>

            {/* Boost */}
            {!isBoosted && (
                <GlassPanel padding="p-3" accent="rgba(234, 179, 8, 0.1)">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-foreground flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-amber-400" /> {mod.boostDescription}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{mod.boostCost} coinz</p>
                        </div>
                        <Button size="sm" disabled={!canAffordBoost('revenue_optimizer')} onClick={handleBoost}
                            className="gap-1 text-[10px] bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/20">
                            <Coins className="h-3 w-3" /> Boost
                        </Button>
                    </div>
                </GlassPanel>
            )}
            {isBoosted && (
                <GlassPanel padding="p-4" glow accent="rgba(34, 197, 94, 0.2)">
                    <h4 className="text-xs font-semibold text-green-400 mb-2">💎 Revenue X-Ray Unlocked</h4>
                    <div className="space-y-1.5 text-[11px] text-muted-foreground">
                        <p>👤 <strong className="text-foreground">Avg fan lifetime value:</strong> $47.20 (top 10% = $142)</p>
                        <p>🔄 <strong className="text-foreground">Repeat purchase rate:</strong> 34% of buyers return within 60 days</p>
                        <p>📦 <strong className="text-foreground">Upsell opportunity:</strong> 89 fans who stream daily haven't bought merch yet</p>
                    </div>
                </GlassPanel>
            )}
        </div>
    );
}
