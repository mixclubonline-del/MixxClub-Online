/**
 * UsageLimitBanner — Reusable tier-aware usage warning banner.
 *
 * Renders contextual usage info with tier badge, progress bar, and upgrade CTA.
 * Threshold-driven: shows nothing below 70% unless showAlways is set.
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowUpRight, Gauge, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUsageEnforcement } from '@/hooks/useUsageEnforcement';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const FEATURE_LABELS: Record<string, string> = {
  projects: 'Projects',
  audio_uploads: 'Audio Uploads',
  ai_matching: 'AI Matching',
  storage_mb: 'Storage',
  collaborations: 'Collaborations',
};

type Severity = 'normal' | 'warning' | 'urgent' | 'blocked';

function getSeverity(percentage: number, limitReached: boolean): Severity {
  if (limitReached) return 'blocked';
  if (percentage >= 90) return 'urgent';
  if (percentage >= 70) return 'warning';
  return 'normal';
}

const SEVERITY_CONFIG: Record<Severity, {
  border: string;
  bg: string;
  icon: typeof AlertTriangle;
  iconClass: string;
  message: string;
  progressClass: string;
}> = {
  normal: {
    border: 'border-border/50',
    bg: 'bg-card/50',
    icon: Gauge,
    iconClass: 'text-muted-foreground',
    message: '',
    progressClass: '[&>div]:bg-primary',
  },
  warning: {
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/5',
    icon: TrendingUp,
    iconClass: 'text-amber-500',
    message: 'Approaching limit',
    progressClass: '[&>div]:bg-amber-500',
  },
  urgent: {
    border: 'border-orange-500/50',
    bg: 'bg-orange-500/8',
    icon: AlertTriangle,
    iconClass: 'text-orange-500',
    message: 'Almost at limit',
    progressClass: '[&>div]:bg-orange-500',
  },
  blocked: {
    border: 'border-destructive/50',
    bg: 'bg-destructive/10',
    icon: AlertTriangle,
    iconClass: 'text-destructive',
    message: 'Limit reached',
    progressClass: '[&>div]:bg-destructive',
  },
};

export interface UsageLimitBannerProps {
  /** Feature key from useUsageEnforcement */
  feature: string;
  /** Human-readable label override */
  label?: string;
  /** 'inline' = compact, 'banner' = full-width with CTA */
  variant?: 'inline' | 'banner';
  /** Show even when usage < 70% */
  showAlways?: boolean;
  /** Additional className */
  className?: string;
  /** Callback when upgrade is clicked (e.g. close a parent modal) */
  onUpgradeClick?: () => void;
}

export const UsageLimitBanner: React.FC<UsageLimitBannerProps> = ({
  feature,
  label,
  variant = 'banner',
  showAlways = false,
  className,
  onUpgradeClick,
}) => {
  const navigate = useNavigate();
  const { tier, getFeatureUsage } = useUsageEnforcement();
  const usage = getFeatureUsage(feature);

  const severity = useMemo(() => getSeverity(usage.percentage, usage.limitReached), [usage.percentage, usage.limitReached]);
  const featureLabel = label || FEATURE_LABELS[feature] || feature.replace(/_/g, ' ');

  // Don't render for unlimited features
  if (usage.isUnlimited) return null;

  // Don't render below threshold unless forced
  if (!showAlways && severity === 'normal') return null;

  const config = SEVERITY_CONFIG[severity];
  const Icon = config.icon;

  const handleUpgrade = () => {
    onUpgradeClick?.();
    navigate(`/pricing?feature=${feature}`);
  };

  if (variant === 'inline') {
    return (
      <div className={cn('space-y-1.5', className)}>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Icon className={cn('w-3.5 h-3.5', config.iconClass)} />
            <span>{usage.current}/{usage.limit} {featureLabel.toLowerCase()} used</span>
          </span>
          <span className="flex items-center gap-2">
            {config.message && (
              <span className={cn('font-medium', config.iconClass)}>{config.message}</span>
            )}
            <span>{usage.remaining} remaining</span>
          </span>
        </div>
        <Progress value={usage.percentage} className={cn('h-1.5', config.progressClass)} />
      </div>
    );
  }

  // Banner variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'rounded-xl border p-4 backdrop-blur-sm',
        config.border,
        config.bg,
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'p-2 rounded-lg shrink-0',
          severity === 'blocked' ? 'bg-destructive/20' :
          severity === 'urgent' ? 'bg-destructive/15' :
          severity === 'warning' ? 'bg-accent/30' :
          'bg-muted/50',
        )}>
          <Icon className={cn('w-5 h-5', config.iconClass)} />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            {config.message && (
              <span className={cn('font-semibold text-sm', config.iconClass)}>
                {config.message}
              </span>
            )}
            <Badge variant="outline" className="text-[10px] capitalize border-border/50">
              {tier} plan
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground">
            {severity === 'blocked'
              ? `You've used all ${usage.limit} ${featureLabel.toLowerCase()} on your ${tier} plan. Upgrade to continue.`
              : `${usage.current} of ${usage.limit} ${featureLabel.toLowerCase()} used — ${usage.remaining} remaining.`}
          </p>

          <div className="pt-0.5">
            <Progress value={usage.percentage} className={cn('h-1.5', config.progressClass)} />
          </div>
        </div>

        {severity !== 'normal' && (
          <Button
            size="sm"
            variant={severity === 'blocked' ? 'default' : 'outline'}
            onClick={handleUpgrade}
            className="shrink-0"
          >
            <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
            Upgrade
          </Button>
        )}
      </div>
    </motion.div>
  );
};
