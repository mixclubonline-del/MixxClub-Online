/**
 * GlassPanel — Shared glassmorphic container for all CRM hub interiors.
 * 
 * Replaces inconsistent bare <Card> usage with a unified visual language
 * that matches the premium CRMPortal shell. Supports role-specific accents,
 * optional glow orbs, and hover lift effects.
 */

import React, { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface GlassPanelProps {
    /** Role-specific accent color, e.g. 'rgba(168, 85, 247, 0.35)' */
    accent?: string;
    /** Show ambient glow orb in corner */
    glow?: boolean;
    /** Enable hover lift and border glow */
    hoverable?: boolean;
    /** Additional className */
    className?: string;
    /** Inner padding override (default: p-6) */
    padding?: string;
    /** Click handler — makes the panel a button */
    onClick?: () => void;
    children: ReactNode;
}

export const GlassPanel: React.FC<GlassPanelProps> = React.memo(({
    accent,
    glow = false,
    hoverable = false,
    className,
    padding = 'p-6',
    onClick,
    children,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const accentColor = accent || 'hsl(var(--primary))';

    const Component = onClick ? motion.button : motion.div;

    return (
        <Component
            className={cn(
                'relative overflow-hidden rounded-2xl text-left',
                padding,
                hoverable && 'cursor-pointer',
                className,
            )}
            onClick={onClick}
            onMouseEnter={() => hoverable && setIsHovered(true)}
            onMouseLeave={() => hoverable && setIsHovered(false)}
            whileHover={hoverable ? { y: -3, scale: 1.005 } : undefined}
            whileTap={onClick ? { scale: 0.98 } : undefined}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
                background: isHovered
                    ? `linear-gradient(135deg, ${accentColor.replace(/[\d.]+\)$/, '0.08)')}, rgba(255,255,255,0.03))`
                    : 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: `1px solid ${isHovered && hoverable
                    ? accentColor.replace(/[\d.]+\)$/, '0.3)')
                    : 'rgba(255,255,255,0.08)'}`,
                boxShadow: isHovered && hoverable
                    ? `0 12px 40px -8px ${accentColor.replace(/[\d.]+\)$/, '0.15)')}`
                    : 'none',
            }}
        >
            {/* Top-edge highlight */}
            <div
                className="absolute top-0 left-6 right-6 h-px"
                style={{
                    background: `linear-gradient(90deg, transparent, rgba(255,255,255,${isHovered ? '0.15' : '0.06'}), transparent)`,
                }}
            />

            {/* Ambient glow orb */}
            {glow && (
                <div
                    className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none blur-3xl opacity-20"
                    style={{ background: accentColor }}
                />
            )}

            {/* Content */}
            <div className="relative z-10">{children}</div>
        </Component>
    );
});

GlassPanel.displayName = 'GlassPanel';
