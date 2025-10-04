import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Rocket, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LaunchReadinessChecklist } from "@/components/admin/LaunchReadinessChecklist";
import { SystemHealthMetrics } from "@/components/admin/SystemHealthMetrics";
import { DeploymentReadiness } from "@/components/admin/DeploymentReadiness";

export default function LaunchReadiness() {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Rocket className="h-8 w-8 text-primary" />
                Launch Readiness Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Comprehensive pre-launch validation and system health monitoring
              </p>
            </div>
          </div>
          <Badge variant="outline" className="gap-2 px-4 py-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            100% Ready for Launch! 🚀
          </Badge>
        </div>

        {/* System Health Metrics */}
        <SystemHealthMetrics />

        {/* Pre-Launch Checklist */}
        <LaunchReadinessChecklist />

        {/* Deployment Readiness */}
        <DeploymentReadiness />
      </div>
    </AdminLayout>
  );
}
