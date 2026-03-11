/**
 * HubHeader — Standardized section header for all CRM hub interiors.
 * 
 * Provides consistent icon container + title + subtitle pattern with
 * entrance animation and optional right-side action slot.
 */

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface HubHeaderProps {
  /** Icon element (e.g. <Trophy className="w-5 h-5" />) */
  icon: ReactNode;
  /** Main title */
  title: string;
  /** Subtitle / description */
  subtitle?: string;
  /** Role-specific accent for icon background (CSS color) */
  accent?: string;
  /** Optional right-side action (button, badge, etc.) */
  action?: ReactNode;
  /** Additional className for the wrapper */
  className?: string;
}

export const HubHeader: React.FC<HubHeaderProps> = React.memo(({
  icon,
  title,
  subtitle,
  accent,
  action,
  className,
}) => {
  const accentBg = accent
    ? accent.replace(/[\d.]+\)$/, '0.15)')
    : 'hsl(var(--primary) / 0.15)';

  return (
    <motion.div
      className={`flex items-center justify-between ${className || ''}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: accentBg }}
        >
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </motion.div>
  );
};
