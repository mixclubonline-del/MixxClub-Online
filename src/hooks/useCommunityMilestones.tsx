import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  return useQuery({
    queryKey: ["community-milestones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_milestones")
        .select(`
          id,
          feature_key,
          milestone_name,
          milestone_description,
          current_value,
          target_value,
          is_unlocked,
          unlocked_at,
          icon_name,
          reward_description
        `)
        .order("display_order");
      
      if (error) {
        console.error("Error fetching community milestones:", error);
        throw error;
      }
      
      // Calculate progress and contributor count
      const milestonesWithProgress = await Promise.all(
        (data || []).map(async (milestone) => {
          const { count } = await supabase
            .from("milestone_contributors")
            .select("user_id", { count: "exact", head: true })
            .eq("milestone_id", milestone.id);

          return {
            ...milestone,
            progress_percentage: Math.round(
              (milestone.current_value / milestone.target_value) * 100
            ),
            contributor_count: count || 0,
          };
        })
      );
      
      return milestonesWithProgress as CommunityMilestone[];
    },
    refetchInterval: 60000, // Refetch every minute
  });
};
