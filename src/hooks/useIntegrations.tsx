import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useIntegrationProviders = () => {
  return useQuery({
    queryKey: ["integration-providers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("integration_providers")
        .select("*")
        .eq("is_active", true)
        .order("provider_name");
      
      if (error) throw error;
      return data;
    },
  });
};

export const useUserIntegrations = () => {
  return { data: [], isLoading: false };
};

export const useStreamingConnections = () => {
  return { data: [], isLoading: false };
};

export const useConnectIntegration = () => {
  return { mutate: () => {} };
};

export const useDisconnectIntegration = () => {
  return { mutate: () => {} };
};

export const useIntegrations = () => {
  const providers = useIntegrationProviders();
  
  return {
    providers: providers.data || [],
    userIntegrations: [],
    streamingConnections: [],
    isLoading: providers.isLoading,
    error: providers.error,
  };
};
