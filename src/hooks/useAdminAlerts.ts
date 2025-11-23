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
  return {
    alerts: [],
    isLoading: false,
    createAlert: async (alert: any) => {},
    resolveAlert: async (id: string) => {},
  };
};
