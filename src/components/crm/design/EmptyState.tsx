/**
 * EmptyState — Illustrated empty state for CRM hubs with zero data.
 * 
 * Replaces bare "No data" text with a centered illustration,
 * descriptive text, and optional CTA button.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { type LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
    /** Lucide icon component */
    icon: LucideIcon;
    /** Main heading */
    title: string;
    /** Supporting description */
    description?: string;
    /** Optional call-to-action button */
    cta?: {
        label: string;
        onClick: () => void;
    };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon,
    title,
    description,
    cta,
}) => {
    return (
        <motion.div
            className="flex flex-col items-center justify-center py-16 px-6 text-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
        >
            <motion.div
                className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/8 flex items-center justify-center mb-5"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
            >
                <Icon className="w-9 h-9 text-muted-foreground/40" />
            </motion.div>

            <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>

            {description && (
                <p className="text-sm text-muted-foreground max-w-xs mb-6">{description}</p>
            )}

            {cta && (
                <Button onClick={cta.onClick} className="gap-2">
                    {cta.label}
                </Button>
            )}
        </motion.div>
    );
};
