import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuditLogViewer } from "@/components/admin/AuditLogViewer";
import { ComplianceChecker } from "@/components/admin/ComplianceChecker";
import { DataRetentionManager } from "@/components/admin/DataRetentionManager";
import { PrivacyControls } from "@/components/admin/PrivacyControls";

const AuditCompliance = () => {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/admin")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-3xl font-bold tracking-tight">Audit & Compliance</h2>
            </div>
            <p className="text-muted-foreground">
              Monitor system activity, ensure compliance, and manage data retention
            </p>
          </div>
        </div>

        <Tabs defaultValue="audit" className="space-y-4">
          <TabsList>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="retention">Data Retention</TabsTrigger>
            <TabsTrigger value="privacy">Privacy Controls</TabsTrigger>
          </TabsList>

          <TabsContent value="audit" className="space-y-4">
            <AuditLogViewer />
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <ComplianceChecker />
          </TabsContent>

          <TabsContent value="retention" className="space-y-4">
            <DataRetentionManager />
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4">
            <PrivacyControls />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AuditCompliance;
