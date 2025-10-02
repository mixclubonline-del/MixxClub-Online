import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StudioPartnership {
  id: string;
  studio_name: string;
  studio_type: string;
  location_city: string;
  location_state: string | null;
  location_country: string;
  equipment_list: string[];
  hourly_rate: number | null;
  day_rate: number | null;
  rating_average: number;
  total_reviews: number;
  is_active: boolean;
}

export const useStudioPartnerships = (filters?: {
  city?: string;
  type?: string;
  maxRate?: number;
}) => {
  return useQuery({
    queryKey: ["studio-partnerships", filters],
    queryFn: async () => {
      let query = supabase
        .from("studio_partnerships")
        .select("*")
        .eq("is_active", true);

      if (filters?.city) {
        query = query.ilike("location_city", `%${filters.city}%`);
      }
      if (filters?.type) {
        query = query.eq("studio_type", filters.type);
      }
      if (filters?.maxRate) {
        query = query.lte("hourly_rate", filters.maxRate);
      }

      const { data, error } = await query.order("rating_average", { ascending: false });

      if (error) throw error;
      return data as StudioPartnership[];
    },
  });
};

export const useStudioDetails = (studioId: string) => {
  return useQuery({
    queryKey: ["studio-details", studioId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_partnerships")
        .select("*")
        .eq("id", studioId)
        .single();

      if (error) throw error;
      return data as StudioPartnership;
    },
    enabled: !!studioId,
  });
};
