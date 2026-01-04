import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface SuggestedUser {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  tagline: string | null;
  follower_count: number;
}

interface UseSuggestedUsersOptions {
  limit?: number;
  excludeUserId?: string;
  preferRole?: "artist" | "engineer";
}

export function useSuggestedUsers(options: UseSuggestedUsersOptions = {}) {
  const { user } = useAuth();
  const { limit = 5, excludeUserId, preferRole } = options;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["suggested-users", user?.id, limit, excludeUserId, preferRole],
    queryFn: async () => {
      if (!user) return [];

      // Get users the current user is already following
      const { data: following } = await supabase
        .from("user_follows")
        .select("following_id")
        .eq("follower_id", user.id);

      const followingIds = following?.map((f) => f.following_id) || [];
      const excludeIds = [user.id, ...followingIds];
      if (excludeUserId) excludeIds.push(excludeUserId);

      // Get user's role to suggest opposite roles
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      const userRole = userProfile?.role;
      const targetRole = preferRole || (userRole === "artist" ? "engineer" : "artist");

      // Query for suggested users prioritizing opposite roles and high follower counts
      let query = supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, role, tagline, follower_count")
        .not("id", "in", `(${excludeIds.join(",")})`)
        .not("username", "is", null)
        .order("follower_count", { ascending: false, nullsFirst: false })
        .limit(limit * 2); // Get more to filter

      const { data: profiles, error } = await query;

      if (error) throw error;

      // Sort to prioritize target role
      const sorted = (profiles || []).sort((a, b) => {
        if (a.role === targetRole && b.role !== targetRole) return -1;
        if (b.role === targetRole && a.role !== targetRole) return 1;
        return (b.follower_count || 0) - (a.follower_count || 0);
      });

      return sorted.slice(0, limit) as SuggestedUser[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    suggestedUsers: data || [],
    isLoading,
    error,
    refetch,
  };
}
