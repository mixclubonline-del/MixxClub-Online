import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useLabelPartnerships = () => {
  return useQuery({
    queryKey: ["label-partnerships"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("label_partnerships")
        .select("*")
        .eq("partnership_status", "active")
        .order("label_name");
      
      if (error) throw error;
      return data;
    },
  });
};

export const useLabelServices = (partnershipId?: string) => {
  return useQuery({
    queryKey: ["label-services", partnershipId],
    queryFn: async () => {
      let query = supabase
        .from("label_services")
        .select("*, label_partnerships(label_name)")
        .eq("is_active", true);
      
      if (partnershipId) {
        query = query.eq("partnership_id", partnershipId);
      }
      
      const { data, error } = await query.order("service_name");
      
      if (error) throw error;
      return data;
    },
  });
};

export const useUserServiceRequests = (userId?: string) => {
  return useQuery({
    queryKey: ["service-requests", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("label_service_requests")
        .select("*, label_services(service_name, price, service_type)")
        .eq("artist_id", userId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useSubmitServiceRequest = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      serviceId, 
      artistId, 
      submissionData 
    }: {
      serviceId: string;
      artistId: string;
      submissionData: any;
    }) => {
      const { data, error } = await supabase
        .from("label_service_requests")
        .insert({
          service_id: serviceId,
          artist_id: artistId,
          submission_data: submissionData,
          request_status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
      toast({
        title: "Request submitted",
        description: "Your service request has been submitted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useLabelServicesHook = () => {
  const partnerships = useLabelPartnerships();
  const services = useLabelServices();
  
  return {
    partnerships: partnerships.data || [],
    services: services.data || [],
    requests: [],
    isLoading: partnerships.isLoading || services.isLoading,
    error: partnerships.error || services.error,
  };
};
