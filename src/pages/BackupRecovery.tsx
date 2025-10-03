import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BackupManager } from "@/components/admin/BackupManager";
import { RestoreManager } from "@/components/admin/RestoreManager";
import { DisasterRecoveryPlan } from "@/components/admin/DisasterRecoveryPlan";

const BackupRecovery = () => {
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
              <h2 className="text-3xl font-bold tracking-tight">Backup & Recovery</h2>
            </div>
            <p className="text-muted-foreground">
              Manage database backups and disaster recovery procedures
            </p>
          </div>
        </div>

        <Tabs defaultValue="backup" className="space-y-4">
          <TabsList>
            <TabsTrigger value="backup">Backups</TabsTrigger>
            <TabsTrigger value="restore">Restore</TabsTrigger>
            <TabsTrigger value="dr">Disaster Recovery</TabsTrigger>
          </TabsList>

          <TabsContent value="backup" className="space-y-4">
            <BackupManager />
          </TabsContent>

          <TabsContent value="restore" className="space-y-4">
            <RestoreManager />
          </TabsContent>

          <TabsContent value="dr" className="space-y-4">
            <DisasterRecoveryPlan />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default BackupRecovery;
