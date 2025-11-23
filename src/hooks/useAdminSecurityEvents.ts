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
  created_at: string;
}

export const useAdminSecurityEvents = () => {
  return {
    events: [],
    dashboardStats: null,
    isLoading: false,
    resolveEvent: async () => {},
    logSecurityEvent: async () => {},
  };
};
