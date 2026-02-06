/**
 * UnlockAttributionToast
 * 
 * Toast utility for showing users how their actions contribute to community milestones.
 * Uses sonner toast with custom styling for milestone attribution.
 */

import { toast } from 'sonner';
import { Sparkles, Zap, Target } from 'lucide-react';
import { ContributionMessage } from '@/hooks/useUnlockContribution';

interface ToastOptions {
  duration?: number;
  showLink?: boolean;
}

/**
 * Show an attribution toast after a user action
 */
export function showAttributionToast(
  contribution: ContributionMessage,
  options: ToastOptions = {}
) {
  const { duration = 4000 } = options;

  const Icon = contribution.isUrgent ? Zap : contribution.remaining <= 10 ? Target : Sparkles;
  const iconColor = contribution.isUrgent ? 'text-orange-500' : 'text-primary';

  toast(contribution.message, {
    icon: <Icon className={`w-4 h-4 ${iconColor}`} />,
    duration,
    className: contribution.isUrgent 
      ? 'border-orange-500/30 bg-orange-500/5' 
      : 'border-primary/30 bg-primary/5',
  });
}

/**
 * Pre-built toast for specific action types
 */
export const attributionToasts = {
  sessionCompleted: (contribution: ContributionMessage | null) => {
    if (contribution) {
      showAttributionToast(contribution);
    }
  },

  projectDelivered: (contribution: ContributionMessage | null) => {
    if (contribution) {
      showAttributionToast(contribution);
    }
  },

  beatUploaded: (contribution: ContributionMessage | null) => {
    if (contribution) {
      showAttributionToast(contribution);
    }
  },

  day1Earned: (contribution: ContributionMessage | null) => {
    if (contribution) {
      showAttributionToast(contribution);
    }
  },

  userJoined: (contribution: ContributionMessage | null) => {
    if (contribution) {
      showAttributionToast({
        ...contribution,
        message: `Welcome! ${contribution.remaining} more members until we unlock ${contribution.milestone.name}.`,
      });
    }
  },
};
