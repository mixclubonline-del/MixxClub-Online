// Re-export from new unified unlockables hook for backwards compatibility
import { useCommunityUnlockables, Unlockable } from './useUnlockables';

export interface CommunityMilestone {
  id: string;
  feature_key: string;
  milestone_name: string;
  milestone_description: string | null;
  current_value: number;
  target_value: number;
  progress_percentage: number;
  is_unlocked: boolean;
  unlocked_at: string | null;
  contributor_count: number;
  icon_name?: string;
  reward_description?: string;
}

// Transform new Unlockable format to old CommunityMilestone format
function transformToMilestone(unlockable: Unlockable): CommunityMilestone {
  return {
    id: unlockable.id,
    feature_key: unlockable.metric_type,
    milestone_name: unlockable.name,
    milestone_description: unlockable.description,
    current_value: unlockable.current_value,
    target_value: unlockable.target_value,
    progress_percentage: unlockable.progress_percentage,
    is_unlocked: unlockable.is_unlocked,
    unlocked_at: unlockable.unlocked_at,
    contributor_count: unlockable.current_value,
    icon_name: unlockable.icon_name,
    reward_description: unlockable.reward_description || undefined,
  };
}

export const useCommunityMilestones = () => {
  const { data, isLoading, error } = useCommunityUnlockables();
  
  return {
    data: data.map(transformToMilestone),
    isLoading,
    error,
  };
};
