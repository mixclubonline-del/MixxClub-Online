/**
 * ProfileCoinzBadge — Inline tier badge for public profiles.
 * 
 * Shows tier name, icon, and total earned (not balance).
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Crown, Sparkles, Star, Zap, Shield } from 'lucide-react';

interface ProfileCoinzBadgeProps {
    tier: string;
    totalEarned: number;
    compact?: boolean;
    className?: string;
}

const TIER_CONFIG: Record<string, {
    icon: React.ElementType;
    label: string;
    color: string;
    glowColor: string;
}> = {
    newcomer: { icon: Shield, label: 'Newcomer', color: 'text-gray-400', glowColor: 'rgba(156,163,175,0.3)' },
    supporter: { icon: Star, label: 'Supporter', color: 'text-blue-400', glowColor: 'rgba(96,165,250,0.3)' },
    advocate: { icon: Zap, label: 'Advocate', color: 'text-purple-400', glowColor: 'rgba(192,132,252,0.3)' },
    champion: { icon: Sparkles, label: 'Champion', color: 'text-amber-400', glowColor: 'rgba(251,191,36,0.3)' },
    legend: { icon: Crown, label: 'Legend', color: 'text-orange-400', glowColor: 'rgba(251,146,60,0.4)' },
};

export const ProfileCoinzBadge: React.FC<ProfileCoinzBadgeProps> = ({
    tier,
    totalEarned,
    compact = false,
    className,
}) => {
    const config = TIER_CONFIG[tier] || TIER_CONFIG.newcomer;
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full',
                compact ? 'px-2 py-0.5' : 'px-3 py-1',
                'bg-white/[0.06] border border-white/10 backdrop-blur-sm',
                className
            )}
            style={{ boxShadow: `0 0 12px ${config.glowColor}` }}
        >
            <Icon className={cn('flex-shrink-0', config.color, compact ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
            <span className={cn('font-medium', config.color, compact ? 'text-[10px]' : 'text-xs')}>
                {config.label}
            </span>
            {!compact && (
                <span className="text-[10px] text-muted-foreground ml-0.5">
                    · {totalEarned.toLocaleString()} 🪙
                </span>
            )}
        </motion.div>
    );
};
