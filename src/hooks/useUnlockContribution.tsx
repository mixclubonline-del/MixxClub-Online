import { useCommunityUnlockables, Unlockable } from './useUnlockables';

export interface ContributionMessage {
  message: string;
  milestone: Unlockable;
  remaining: number;
  isUrgent: boolean;
}

/**
 * Hook to calculate a user's contribution impact toward community milestones.
 * Used after actions like session completion, project delivery, beat upload, etc.
 */
export function useUnlockContribution() {
  const { data: communityUnlockables, platformStats } = useCommunityUnlockables();

  /**
   * Get attribution message for a completed action
   * @param metricType - The metric type that was incremented (e.g., 'sessions_completed', 'user_count')
   * @param actionLabel - Human-readable action name (e.g., 'Session', 'Project')
   */
  const getContributionMessage = (
    metricType: string, 
    actionLabel: string
  ): ContributionMessage | null => {
    // Find the next locked milestone for this metric
    const relevantMilestone = communityUnlockables.find(
      (u) => u.metric_type === metricType && !u.is_unlocked
    );

    if (!relevantMilestone) {
      // All milestones for this metric are unlocked
      return null;
    }

    const remaining = relevantMilestone.target_value - relevantMilestone.current_value;
    const isUrgent = relevantMilestone.progress_percentage >= 80;

    let message: string;

    if (isUrgent && remaining <= 5) {
      message = `🔥 ${actionLabel} complete! Just ${remaining} more until we unlock ${relevantMilestone.name}!`;
    } else if (isUrgent) {
      message = `${actionLabel} complete! We're ${relevantMilestone.progress_percentage}% of the way to ${relevantMilestone.name}!`;
    } else if (remaining <= 10) {
      message = `${actionLabel} logged! Only ${remaining} more until ${relevantMilestone.name}.`;
    } else {
      const impact = ((1 / relevantMilestone.target_value) * 100).toFixed(1);
      message = `${actionLabel} complete! You moved us ${impact}% closer to ${relevantMilestone.name}.`;
    }

    return {
      message,
      milestone: relevantMilestone,
      remaining,
      isUrgent,
    };
  };

  /**
   * Get the next community milestone regardless of metric type
   */
  const getNextCommunityMilestone = (): Unlockable | null => {
    return communityUnlockables.find((u) => !u.is_unlocked) || null;
  };

  /**
   * Get current member count (for display purposes)
   */
  const getCurrentMemberCount = (): number => {
    return platformStats?.userCount || 0;
  };

  return {
    getContributionMessage,
    getNextCommunityMilestone,
    getCurrentMemberCount,
    platformStats,
    isLoading: !communityUnlockables.length,
  };
}
