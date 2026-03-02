/**
 * CareerPulse — Tier 1 (Scout) — Free for everyone.
 * 
 * The career health dashboard. Shows a composite health score ring,
 * per-metric breakdowns, and action recommendations from Prime Bot.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Activity, TrendingUp, Users, Flame, Zap, Music, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GlassPanel } from '@/components/crm/design';
import { useCareerManager } from '@/hooks/useCareerManager';
import { HEALTH_METRICS, ADVICE_PRIORITY_CONFIG, type HealthMetric, type AIAdvice } from '@/hooks/CareerManagerConfig';

const METRIC_ICONS: Record<HealthMetric, React.ReactNode> = {
    release_cadence: <Music className="h-3.5 w-3.5" />,
    revenue_trend: <DollarSign className="h-3.5 w-3.5" />,
    audience_growth: <Users className="h-3.5 w-3.5" />,
    engagement: <Flame className="h-3.5 w-3.5" />,
    consistency: <Zap className="h-3.5 w-3.5" />,
};

function HealthRing({ score, size = 140 }: { score: number; size?: number }) {
    const radius = (size - 12) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - score / 100);
    const scoreColor = score >= 75 ? '#22d3ee' : score >= 50 ? '#fbbf24' : score >= 25 ? '#f97316' : '#ef4444';

    return (
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={8} />
                <motion.circle
                    cx={size / 2} cy={size / 2} r={radius} fill="none"
                    stroke={scoreColor} strokeWidth={8} strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    className="text-3xl font-black"
                    style={{ color: scoreColor }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {Math.round(score)}
                </motion.span>
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Health</span>
            </div>
        </div>
    );
}

function MetricBar({ metric, value }: { metric: HealthMetric; value: number }) {
    const config = HEALTH_METRICS[metric];
    const level = [...config.levels].reverse().find(l => value >= l.min) || config.levels[0];

    return (
        <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{METRIC_ICONS[metric]}</span>
            <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-muted-foreground">{config.label}</span>
                    <span className={cn('text-[10px] font-medium', level.color)}>{level.label}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full rounded-full"
                        style={{
                            background: value >= 85 ? 'linear-gradient(90deg, #22d3ee, #06b6d4)' :
                                value >= 60 ? 'linear-gradient(90deg, #22c55e, #16a34a)' :
                                    value >= 30 ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' :
                                        'linear-gradient(90deg, #ef4444, #dc2626)',
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    />
                </div>
            </div>
            <span className="text-[10px] text-foreground font-medium w-6 text-right">{Math.round(value)}</span>
        </div>
    );
}

function AdviceCard({ advice }: { advice: AIAdvice }) {
    const priority = ADVICE_PRIORITY_CONFIG[advice.priority];
    return (
        <div className="flex items-start gap-2 p-2.5 bg-white/[0.03] rounded-lg">
            <Badge className={cn('text-[8px] px-1.5 shrink-0 mt-0.5', priority.bgColor, priority.color)}>
                {priority.label}
            </Badge>
            <div>
                <p className="text-xs font-medium text-foreground">{advice.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{advice.description}</p>
            </div>
        </div>
    );
}

export function CareerPulse() {
    const { metrics, recentAdvice, tierConfig, currentTier, tierProgress, nextTierConfig } = useCareerManager();

    return (
        <div className="space-y-4">
            {/* Health Score + Tier */}
            <GlassPanel padding="p-5" glow accent="rgba(6, 182, 212, 0.15)">
                <div className="flex items-center gap-6">
                    <HealthRing score={metrics.healthScore} />
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{tierConfig.emoji}</span>
                            <h3 className="text-sm font-bold text-foreground">{tierConfig.label} Tier</h3>
                        </div>
                        <p className="text-[10px] text-muted-foreground mb-3">{tierConfig.tagline}</p>

                        {/* Quick stats */}
                        <div className="grid grid-cols-3 gap-2">
                            <div className="text-center p-1.5 bg-white/5 rounded-lg">
                                <p className="text-sm font-bold text-foreground">{metrics.uploads}</p>
                                <p className="text-[8px] text-muted-foreground">Tracks</p>
                            </div>
                            <div className="text-center p-1.5 bg-white/5 rounded-lg">
                                <p className="text-sm font-bold text-green-400">${metrics.revenue.toLocaleString()}</p>
                                <p className="text-[8px] text-muted-foreground">Revenue</p>
                            </div>
                            <div className="text-center p-1.5 bg-white/5 rounded-lg">
                                <p className="text-sm font-bold text-foreground">{metrics.sales}</p>
                                <p className="text-[8px] text-muted-foreground">Sales</p>
                            </div>
                        </div>

                        {/* Next tier */}
                        {nextTierConfig && (
                            <div className="mt-3">
                                <div className="flex items-center justify-between text-[10px] mb-1">
                                    <span className="text-muted-foreground">Next: {nextTierConfig.emoji} {nextTierConfig.label}</span>
                                    <span className="text-foreground font-medium">{tierProgress}%</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className={cn('h-full rounded-full bg-gradient-to-r', nextTierConfig.gradientFrom, nextTierConfig.gradientTo)}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${tierProgress}%` }}
                                        transition={{ duration: 1 }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </GlassPanel>

            {/* Health Metrics */}
            <GlassPanel padding="p-4">
                <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-cyan-400" />
                    Career Health Breakdown
                </h4>
                <div className="space-y-2.5">
                    {(Object.keys(HEALTH_METRICS) as HealthMetric[]).map(metric => (
                        <MetricBar key={metric} metric={metric} value={metrics.health[metric]} />
                    ))}
                </div>
            </GlassPanel>

            {/* AI Recommendations */}
            {recentAdvice.length > 0 && (
                <GlassPanel padding="p-4">
                    <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                        Prime Bot Recommendations
                    </h4>
                    <div className="space-y-2">
                        {recentAdvice.map((advice, idx) => (
                            <AdviceCard key={idx} advice={advice} />
                        ))}
                    </div>
                </GlassPanel>
            )}
        </div>
    );
}
