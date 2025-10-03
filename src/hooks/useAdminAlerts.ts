import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AdminAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  metadata: any;
  is_resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export const useAdminAlerts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ["admin-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as AdminAlert[];
    },
  });

  const createAlert = useMutation({
    mutationFn: async (alert: {
      alert_type: string;
      severity: string;
      title: string;
      message: string;
      metadata?: any;
    }) => {
      const { data, error } = await supabase
        .from("admin_alerts")
        .insert([alert])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-alerts"] });
      toast({
        title: "Alert created",
        description: "New admin alert has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create alert: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const resolveAlert = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from("admin_alerts")
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-alerts"] });
      toast({
        title: "Alert resolved",
        description: "Alert has been marked as resolved",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to resolve alert: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    alerts: alerts || [],
    isLoading,
    createAlert: createAlert.mutate,
    resolveAlert: resolveAlert.mutate,
  };
};
