import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TenantManager } from "@/components/admin/TenantManager";
import { WhiteLabelConfigurator } from "@/components/admin/WhiteLabelConfigurator";
import { TenantAnalytics } from "@/components/admin/TenantAnalytics";

const MultiTenancy = () => {
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
              <h2 className="text-3xl font-bold tracking-tight">Multi-Tenancy</h2>
            </div>
            <p className="text-muted-foreground">
              Manage tenant organizations and white-label configurations
            </p>
          </div>
        </div>

        <Tabs defaultValue="tenants" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
            <TabsTrigger value="branding">White Label</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="tenants" className="space-y-4">
            <TenantManager />
          </TabsContent>

          <TabsContent value="branding" className="space-y-4">
            <WhiteLabelConfigurator />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <TenantAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default MultiTenancy;
