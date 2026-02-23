/**
 * AvatarTierRing — Tier-colored ring around avatars, sitewide.
 * 
 * Wraps an existing Avatar with a glowing ring based on user tier.
 * Drop-in component for any avatar display.
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarTierRingProps {
    tier?: string;
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
    className?: string;
}

const TIER_RING_COLORS: Record<string, {
    ring: string;
    glow: string;
}> = {
    newcomer: {
        ring: 'ring-gray-500/30',
        glow: '',
    },
    supporter: {
        ring: 'ring-blue-400/50',
        glow: 'shadow-[0_0_8px_rgba(96,165,250,0.3)]',
    },
    advocate: {
        ring: 'ring-purple-400/50',
        glow: 'shadow-[0_0_8px_rgba(192,132,252,0.3)]',
    },
    champion: {
        ring: 'ring-amber-400/50',
        glow: 'shadow-[0_0_10px_rgba(251,191,36,0.35)]',
    },
    legend: {
        ring: 'ring-orange-400/60',
        glow: 'shadow-[0_0_12px_rgba(251,146,60,0.4)]',
    },
};

const SIZE_CLASSES = {
    sm: 'ring-[1.5px] rounded-full',
    md: 'ring-2 rounded-full',
    lg: 'ring-[2.5px] rounded-full',
};

export const AvatarTierRing: React.FC<AvatarTierRingProps> = ({
    tier = 'newcomer',
    size = 'md',
    children,
    className,
}) => {
    const colors = TIER_RING_COLORS[tier] || TIER_RING_COLORS.newcomer;

    return (
        <div className={cn(
            'inline-flex',
            SIZE_CLASSES[size],
            colors.ring,
            colors.glow,
            className
        )}>
            {children}
        </div>
    );
};
