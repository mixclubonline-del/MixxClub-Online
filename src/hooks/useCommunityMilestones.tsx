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

export const useCommunityMilestones = () => {
  return {
    data: [],
    isLoading: false,
    error: null,
  };
};
