/**
 * ProfileAnalytics — Visitor metrics, engagement stats, and trends.
 * 
 * Displays key metrics with trend indicators, a mini chart,
 * and top referrer sources.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Eye, Users, MessageCircle, Briefcase, TrendingUp, TrendingDown, Globe } from 'lucide-react';
import type { AnalyticsData } from './types';

interface ProfileAnalyticsProps {
    analytics: AnalyticsData;
    accent?: string;
    className?: string;
}

interface MetricCardProps {
    icon: React.ReactNode;
    label: string;
    value: number;
    trend: number;
    delay: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, trend, delay }) => {
    const isPositive = trend >= 0;
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="p-4 rounded-xl bg-white/[0.03] border border-white/8 hover:border-white/15 transition-all"
        >
            <div className="flex items-center justify-between mb-2">
                <div className="text-muted-foreground">{icon}</div>
                <div className={cn(
                    'flex items-center gap-0.5 text-xs font-medium',
                    isPositive ? 'text-green-400' : 'text-red-400'
                )}>
                    {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(trend)}%
                </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{value.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
        </motion.div>
    );
};

export const ProfileAnalytics: React.FC<ProfileAnalyticsProps> = ({
    analytics,
    accent = '#f97316',
    className,
}) => {
    const maxViews = Math.max(...analytics.viewsByDay.map(d => d.views), 1);

    return (
        <div className={cn('space-y-5', className)}>
            {/* Metric cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard
                    icon={<Eye className="h-4 w-4" />}
                    label="Profile Views"
                    value={analytics.profileViews}
                    trend={analytics.profileViewsTrend}
                    delay={0}
                />
                <MetricCard
                    icon={<Users className="h-4 w-4" />}
                    label="Followers"
                    value={analytics.followers}
                    trend={analytics.followersTrend}
                    delay={0.05}
                />
                <MetricCard
                    icon={<MessageCircle className="h-4 w-4" />}
                    label="Messages"
                    value={analytics.messagesSent}
                    trend={analytics.messagesTrend}
                    delay={0.1}
                />
                <MetricCard
                    icon={<Briefcase className="h-4 w-4" />}
                    label="Hire Requests"
                    value={analytics.hireRequests}
                    trend={analytics.hireTrend}
                    delay={0.15}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mini bar chart */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/8"
                >
                    <p className="text-sm font-medium text-foreground mb-3">Views — Last 7 Days</p>
                    <div className="flex items-end gap-1 h-24">
                        {analytics.viewsByDay.map((day, i) => (
                            <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(day.views / maxViews) * 100}%` }}
                                    transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
                                    className="w-full rounded-t-sm min-h-[2px]"
                                    style={{ backgroundColor: accent }}
                                />
                                <span className="text-[9px] text-muted-foreground">{day.day}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Top referrers */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/8"
                >
                    <p className="text-sm font-medium text-foreground mb-3">Top Referrers</p>
                    <div className="space-y-2.5">
                        {analytics.topReferrers.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-4">No referrer data yet</p>
                        ) : (
                            analytics.topReferrers.slice(0, 5).map((ref, i) => {
                                const maxCount = analytics.topReferrers[0]?.count || 1;
                                return (
                                    <div key={ref.source} className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-foreground flex items-center gap-1.5">
                                                <Globe className="h-3 w-3 text-muted-foreground" />
                                                {ref.source}
                                            </span>
                                            <span className="text-muted-foreground">{ref.count}</span>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(ref.count / maxCount) * 100}%` }}
                                                transition={{ delay: 0.4 + i * 0.05, duration: 0.4 }}
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: accent }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
