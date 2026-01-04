import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface FollowUser {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  tagline: string | null;
  is_verified: boolean | null;
  follower_count: number | null;
}

export function useSocialGraph(targetUserId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if current user is following target user
  const { data: isFollowing, isLoading: isCheckingFollow } = useQuery({
    queryKey: ["is-following", user?.id, targetUserId],
    queryFn: async () => {
      if (!user?.id || !targetUserId || user.id === targetUserId) return false;
      
      const { data, error } = await supabase
        .from("user_follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user?.id && !!targetUserId && user.id !== targetUserId,
  });

  // Get followers of a user
  const { data: followers, isLoading: isLoadingFollowers } = useQuery({
    queryKey: ["followers", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from("user_follows")
        .select(`
          id,
          created_at,
          follower:profiles!user_follows_follower_id_fkey(
            id,
            username,
            full_name,
            avatar_url,
            tagline,
            is_verified,
            follower_count
          )
        `)
        .eq("following_id", targetUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data?.map(f => f.follower) as FollowUser[] || [];
    },
    enabled: !!targetUserId,
  });

  // Get users that a user is following
  const { data: following, isLoading: isLoadingFollowing } = useQuery({
    queryKey: ["following", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from("user_follows")
        .select(`
          id,
          created_at,
          following:profiles!user_follows_following_id_fkey(
            id,
            username,
            full_name,
            avatar_url,
            tagline,
            is_verified,
            follower_count
          )
        `)
        .eq("follower_id", targetUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data?.map(f => f.following) as FollowUser[] || [];
    },
    enabled: !!targetUserId,
  });

  // Follow a user
  const followMutation = useMutation({
    mutationFn: async (userIdToFollow: string) => {
      if (!user?.id) throw new Error("Must be logged in to follow");
      if (user.id === userIdToFollow) throw new Error("Cannot follow yourself");

      const { data, error } = await supabase
        .from("user_follows")
        .insert({
          follower_id: user.id,
          following_id: userIdToFollow,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, userIdToFollow) => {
      queryClient.invalidateQueries({ queryKey: ["is-following", user?.id, userIdToFollow] });
      queryClient.invalidateQueries({ queryKey: ["followers", userIdToFollow] });
      queryClient.invalidateQueries({ queryKey: ["following", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["public-profile"] });
      toast.success("Following!");
    },
    onError: (error) => {
      console.error("Follow error:", error);
      toast.error("Failed to follow user");
    },
  });

  // Unfollow a user
  const unfollowMutation = useMutation({
    mutationFn: async (userIdToUnfollow: string) => {
      if (!user?.id) throw new Error("Must be logged in to unfollow");

      const { error } = await supabase
        .from("user_follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", userIdToUnfollow);

      if (error) throw error;
    },
    onSuccess: (_, userIdToUnfollow) => {
      queryClient.invalidateQueries({ queryKey: ["is-following", user?.id, userIdToUnfollow] });
      queryClient.invalidateQueries({ queryKey: ["followers", userIdToUnfollow] });
      queryClient.invalidateQueries({ queryKey: ["following", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["public-profile"] });
      toast.success("Unfollowed");
    },
    onError: (error) => {
      console.error("Unfollow error:", error);
      toast.error("Failed to unfollow user");
    },
  });

  // Get mutual connections between current user and target
  const { data: mutualConnections } = useQuery({
    queryKey: ["mutual-connections", user?.id, targetUserId],
    queryFn: async () => {
      if (!user?.id || !targetUserId || user.id === targetUserId) return [];

      // Get users that both current user and target are following
      const { data: myFollowing } = await supabase
        .from("user_follows")
        .select("following_id")
        .eq("follower_id", user.id);

      const { data: theirFollowing } = await supabase
        .from("user_follows")
        .select("following_id")
        .eq("follower_id", targetUserId);

      if (!myFollowing || !theirFollowing) return [];

      const myIds = new Set(myFollowing.map(f => f.following_id));
      const mutualIds = theirFollowing
        .filter(f => myIds.has(f.following_id))
        .map(f => f.following_id);

      if (mutualIds.length === 0) return [];

      const { data: mutuals } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, is_verified")
        .in("id", mutualIds)
        .limit(5);

      return mutuals || [];
    },
    enabled: !!user?.id && !!targetUserId && user.id !== targetUserId,
  });

  return {
    isFollowing,
    isCheckingFollow,
    followers,
    isLoadingFollowers,
    following,
    isLoadingFollowing,
    mutualConnections,
    followUser: followMutation.mutate,
    unfollowUser: unfollowMutation.mutate,
    isFollowPending: followMutation.isPending,
    isUnfollowPending: unfollowMutation.isPending,
  };
}
