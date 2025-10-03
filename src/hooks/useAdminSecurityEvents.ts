import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  description: string;
  admin_id?: string;
  ip_address?: string;
  user_agent?: string;
  details?: any;
  auto_action_taken?: string;
  is_resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
}

export const useAdminSecurityEvents = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events, isLoading } = useQuery({
    queryKey: ["admin-security-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_security_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as SecurityEvent[];
    },
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ["security-dashboard-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_security_dashboard_stats");

      if (error) throw error;
      return data;
    },
  });

  const resolveEvent = useMutation({
    mutationFn: async ({
      eventId,
      notes,
    }: {
      eventId: string;
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("admin_security_events")
        .update({
          is_resolved: true,
          resolved_by: user.id,
          resolved_at: new Date().toISOString(),
          resolution_notes: notes,
        })
        .eq("id", eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-security-events"] });
      queryClient.invalidateQueries({ queryKey: ["security-dashboard-stats"] });
      toast({
        title: "Event resolved",
        description: "Security event has been marked as resolved",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to resolve event: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const logSecurityEvent = useMutation({
    mutationFn: async (event: {
      event_type: string;
      severity: string;
      description: string;
      details?: any;
      auto_action?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase.rpc("log_security_event", {
        p_event_type: event.event_type,
        p_severity: event.severity,
        p_admin_id: user?.id || null,
        p_description: event.description,
        p_details: event.details || {},
        p_auto_action: event.auto_action || "none",
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-security-events"] });
      queryClient.invalidateQueries({ queryKey: ["security-dashboard-stats"] });
    },
  });

  return {
    events: events || [],
    dashboardStats,
    isLoading,
    resolveEvent: resolveEvent.mutate,
    logSecurityEvent: logSecurityEvent.mutate,
  };
};
