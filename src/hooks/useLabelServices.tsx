import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface LabelPartnership {
  id: string;
  label_name: string;
  label_description: string | null;
  logo_url: string | null;
  website_url: string | null;
  contact_email: string | null;
  genres_specialized: string[];
  years_established: number | null;
  total_artists: number;
  partnership_tier: 'standard' | 'premium' | 'elite';
  is_active: boolean;
  featured: boolean;
  social_links: any;
  success_stories: any[];
}

export interface LabelService {
  id: string;
  label_id: string;
  service_name: string;
  service_type: 'distribution' | 'marketing' | 'a&r' | 'publishing' | 'sync_licensing' | 'playlist_pitching' | 'pr' | 'full_package';
  service_description: string | null;
  base_price: number | null;
  pricing_model: 'fixed' | 'percentage' | 'hybrid' | 'custom';
  revenue_split_percentage: number | null;
  features: string[];
  requirements: string[];
  turnaround_days: number | null;
  is_available: boolean;
}

export interface LabelServiceRequest {
  id: string;
  artist_id: string;
  service_id: string;
  label_id: string;
  request_message: string;
  artist_links: any;
  audio_samples: string[];
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  label_response: string | null;
  responded_at: string | null;
  created_at: string;
}

export const useLabelPartnerships = (filters?: {
  genre?: string;
  tier?: string;
  featured?: boolean;
}) => {
  return useQuery({
    queryKey: ["label-partnerships", filters],
    queryFn: async () => {
      let query = supabase
        .from("label_partnerships")
        .select("*")
        .eq("is_active", true)
        .order("featured", { ascending: false });

      if (filters?.tier) {
        query = query.eq("partnership_tier", filters.tier);
      }
      if (filters?.featured !== undefined) {
        query = query.eq("featured", filters.featured);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Client-side filtering for genre
      let filteredData = data as LabelPartnership[];
      if (filters?.genre) {
        filteredData = filteredData.filter((label) =>
          label.genres_specialized?.includes(filters.genre!)
        );
      }

      return filteredData;
    },
  });
};

export const useLabelServices = (labelId?: string) => {
  return useQuery({
    queryKey: ["label-services", labelId],
    queryFn: async () => {
      let query = supabase
        .from("label_services")
        .select("*")
        .eq("is_available", true);

      if (labelId) {
        query = query.eq("label_id", labelId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as LabelService[];
    },
  });
};

export const useSubmitServiceRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serviceId,
      labelId,
      requestMessage,
      artistLinks,
      audioSamples,
    }: {
      serviceId: string;
      labelId: string;
      requestMessage: string;
      artistLinks: any;
      audioSamples: string[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("label_service_requests")
        .insert({
          artist_id: user.id,
          service_id: serviceId,
          label_id: labelId,
          request_message: requestMessage,
          artist_links: artistLinks,
          audio_samples: audioSamples,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
      toast.success("Service request submitted successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit request: ${error.message}`);
    },
  });
};

export const useUserServiceRequests = () => {
  return useQuery({
    queryKey: ["service-requests"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("label_service_requests")
        .select(`
          *,
          label_services (*),
          label_partnerships (*)
        `)
        .eq("artist_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};
