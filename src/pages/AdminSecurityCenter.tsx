import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import SecurityMonitor from "@/components/admin/SecurityMonitor";
import QuickActions from "@/components/admin/QuickActions";
import { ThreatIntelligence } from "@/components/admin/ThreatIntelligence";
import { AccessControlMatrix } from "@/components/admin/AccessControlMatrix";
import { SecurityIncidentResponse } from "@/components/admin/SecurityIncidentResponse";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Activity, FileText } from "lucide-react";

export default function AdminSecurityCenter() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!loading && !user) {
        navigate('/auth');
        return;
      }

      if (user) {
        const { data, error } = await supabase.rpc('is_admin', { 
          user_uuid: user.id 
        });
        
        if (error || !data) {
          navigate('/admin');
          return;
        }
        
        setIsAdmin(data);
        setChecking(false);
      }
    };

    checkAdminStatus();
  }, [user, loading, navigate]);

  if (loading || checking || !isAdmin) {
    return <AdminLayout><div className="p-6">Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Security Center
            </h1>
            <p className="text-muted-foreground mt-1">
              Enterprise-grade security monitoring and control
            </p>
          </div>
          <Badge className="bg-green-500/10 text-green-600 dark:text-green-400">
            <Activity className="h-3 w-3 mr-1" />
            Live Monitoring
          </Badge>
        </div>

        {/* Info Banner */}
        <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                AI-Powered Admin Control with Multi-Layer Security
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                All admin chatbot interactions are logged, monitored, and protected with injection detection, 
                rate limiting, and comprehensive audit trails. The AI assistant operates in read-only mode 
                for maximum security.
              </p>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="monitor" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="monitor">
              <Activity className="h-4 w-4 mr-2" />
              Security Monitor
            </TabsTrigger>
            <TabsTrigger value="actions">
              <Zap className="h-4 w-4 mr-2" />
              Quick Actions
            </TabsTrigger>
            <TabsTrigger value="audit">
              <FileText className="h-4 w-4 mr-2" />
              Audit Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monitor" className="space-y-6">
            <SecurityMonitor />
            <ThreatIntelligence />
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            <QuickActions />
            <SecurityIncidentResponse />
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <AccessControlMatrix />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
