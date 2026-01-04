import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Json } from "@/integrations/supabase/types";

export interface PublicProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  cover_image_url: string | null;
  bio: string | null;
  tagline: string | null;
  location: string | null;
  website_url: string | null;
  social_links: Record<string, string>;
  is_verified: boolean;
  follower_count: number;
  following_count: number;
  profile_theme: string;
  pinned_track_id: string | null;
  status_emoji: string | null;
  status_text: string | null;
  is_available_for_collab: boolean;
  last_active_at: string | null;
  profile_views_count: number;
  role: string | null;
  total_xp: number;
  level: number;
  created_at: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  title: string;
  description: string | null;
  metadata: Record<string, unknown>;
  is_public: boolean;
  created_at: string;
}

export function usePublicProfile(username?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch public profile by username
  const { data: profile, isLoading: isLoadingProfile, error } = useQuery({
    queryKey: ["public-profile", username],
    queryFn: async () => {
      if (!username) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        ...data,
        social_links: (data.social_links as Record<string, string>) || {},
        is_verified: data.is_verified ?? false,
        follower_count: data.follower_count ?? 0,
        following_count: data.following_count ?? 0,
        profile_theme: data.profile_theme ?? "default",
        is_available_for_collab: data.is_available_for_collab ?? true,
        profile_views_count: data.profile_views_count ?? 0,
        total_xp: data.total_xp ?? 0,
        level: data.level ?? 1,
      } as PublicProfile;
    },
    enabled: !!username,
  });

  // Fetch profile by ID
  const fetchProfileById = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  };

  // Fetch user activity feed
  const { data: activities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ["user-activity", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from("user_activity")
        .select("*")
        .eq("user_id", profile.id)
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as UserActivity[];
    },
    enabled: !!profile?.id,
  });

  // Log profile view
  const logViewMutation = useMutation({
    mutationFn: async (profileId: string) => {
      if (!profileId) return;
      
      // Don't log if viewing own profile
      if (user?.id === profileId) return;

      const { error } = await supabase
        .from("profile_views")
        .insert({
          profile_id: profileId,
          viewer_id: user?.id || null,
          source: "direct",
        });

      if (error) console.error("Failed to log profile view:", error);
    },
  });

  // Update own profile
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<PublicProfile>) => {
      if (!user?.id) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["public-profile"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  // Create activity
  const createActivityMutation = useMutation({
    mutationFn: async (activity: {
      activity_type: string;
      title: string;
      description?: string;
      metadata?: Record<string, unknown>;
      is_public?: boolean;
    }) => {
      if (!user?.id) throw new Error("Must be logged in");

      const insertData = {
        user_id: user.id,
        activity_type: activity.activity_type,
        title: activity.title,
        description: activity.description || null,
        metadata: (activity.metadata || {}) as Json,
        is_public: activity.is_public ?? true,
      };

      const { data, error } = await supabase
        .from("user_activity")
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-activity"] });
    },
  });

  return {
    profile,
    isLoadingProfile,
    error,
    activities,
    isLoadingActivities,
    logProfileView: logViewMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
    createActivity: createActivityMutation.mutate,
    fetchProfileById,
  };
}
