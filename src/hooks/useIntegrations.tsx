import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface IntegrationProvider {
  id: string;
  provider_name: string;
  provider_type: 'daw_plugin' | 'streaming' | 'social_media' | 'analytics' | 'storage' | 'ai_service' | 'distribution';
  provider_description: string | null;
  logo_url: string | null;
  documentation_url: string | null;
  auth_type: 'oauth' | 'api_key' | 'jwt' | 'basic';
  is_active: boolean;
  is_premium: boolean;
  webhook_support: boolean;
  setup_instructions: any;
}

export interface UserIntegration {
  id: string;
  user_id: string;
  provider_id: string;
  connection_status: 'pending' | 'active' | 'expired' | 'revoked' | 'error';
  connection_metadata: any;
  last_sync_at: string | null;
  sync_frequency: 'manual' | 'hourly' | 'daily' | 'weekly' | 'real_time';
  created_at: string;
  integration_providers?: IntegrationProvider;
}

export interface StreamingConnection {
  id: string;
  user_id: string;
  platform_name: 'spotify' | 'apple_music' | 'youtube_music' | 'soundcloud' | 'tidal' | 'deezer' | 'amazon_music';
  artist_profile_id: string | null;
  artist_profile_url: string | null;
  verified: boolean;
  total_streams: number;
  total_listeners: number;
  top_tracks: any[];
  analytics_data: any;
  last_synced_at: string | null;
  is_active: boolean;
}

export const useIntegrationProviders = (type?: string) => {
  return useQuery({
    queryKey: ["integration-providers", type],
    queryFn: async () => {
      let query = supabase
        .from("integration_providers")
        .select("*")
        .eq("is_active", true)
        .order("provider_name");

      if (type) {
        query = query.eq("provider_type", type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as IntegrationProvider[];
    },
  });
};

export const useUserIntegrations = () => {
  return useQuery({
    queryKey: ["user-integrations"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_integrations")
        .select(`
          *,
          integration_providers (*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as UserIntegration[];
    },
  });
};

export const useStreamingConnections = () => {
  return useQuery({
    queryKey: ["streaming-connections"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("streaming_connections")
        .select("*")
        .eq("user_id", user.id)
        .order("platform_name");

      if (error) throw error;
      return data as StreamingConnection[];
    },
  });
};

export const useConnectIntegration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      providerId,
      metadata,
    }: {
      providerId: string;
      metadata?: any;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_integrations")
        .insert({
          user_id: user.id,
          provider_id: providerId,
          connection_status: "pending",
          connection_metadata: metadata || {},
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-integrations"] });
      toast.success("Integration connected successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to connect integration: ${error.message}`);
    },
  });
};

export const useDisconnectIntegration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (integrationId: string) => {
      const { error } = await supabase
        .from("user_integrations")
        .update({ connection_status: "revoked" })
        .eq("id", integrationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-integrations"] });
      toast.success("Integration disconnected");
    },
    onError: (error: Error) => {
      toast.error(`Failed to disconnect: ${error.message}`);
    },
  });
};
