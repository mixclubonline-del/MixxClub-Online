/**
 * TierDiscountBadge — Shows tier-based marketplace discount.
 * 
 * Inline badge that displays the user's tier discount percentage.
 * Hidden if user is newcomer (0% discount).
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Crown, Sparkles, Star, Zap, Shield } from 'lucide-react';

interface TierDiscountBadgeProps {
    tier: string;
    discountPercent: number;
    className?: string;
    showLabel?: boolean;
}

const TIER_CONFIG: Record<string, {
    icon: React.ElementType;
    color: string;
    bg: string;
    border: string;
}> = {
    newcomer: { icon: Shield, color: 'text-muted-foreground', bg: 'bg-muted/50', border: 'border-white/5' },
    supporter: { icon: Star, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    advocate: { icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    champion: { icon: Sparkles, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    legend: { icon: Crown, color: 'text-orange-400', bg: 'bg-gradient-to-r from-orange-500/15 to-amber-500/15', border: 'border-orange-500/30' },
};

export const TierDiscountBadge: React.FC<TierDiscountBadgeProps> = ({
    tier,
    discountPercent,
    className,
    showLabel = true,
}) => {
    if (discountPercent <= 0) return null;

    const config = TIER_CONFIG[tier] || TIER_CONFIG.newcomer;
    const Icon = config.icon;

    return (
        <div className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border',
            config.bg,
            config.color,
            config.border,
            className
        )}>
            <Icon className="h-3 w-3" />
            <span>{discountPercent}% off</span>
            {showLabel && <span className="opacity-60">· {tier}</span>}
        </div>
    );
};
