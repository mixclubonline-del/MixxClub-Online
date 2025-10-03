import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Settings, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FeatureFlagsManager } from "@/components/admin/FeatureFlagsManager";
import { PlatformSettings } from "@/components/admin/PlatformSettings";
import { ABTestingManager } from "@/components/admin/ABTestingManager";

export default function PlatformConfiguration() {
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
                <Settings className="h-8 w-8 text-primary" />
                Platform Configuration
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage feature flags, platform settings, and A/B testing experiments
              </p>
            </div>
          </div>
          <Badge variant="outline" className="gap-2 px-4 py-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Configuration Synced
          </Badge>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="features" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="features">Feature Flags</TabsTrigger>
            <TabsTrigger value="settings">Platform Settings</TabsTrigger>
            <TabsTrigger value="abtesting">A/B Testing</TabsTrigger>
          </TabsList>

          <TabsContent value="features" className="space-y-6">
            <FeatureFlagsManager />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <PlatformSettings />
          </TabsContent>

          <TabsContent value="abtesting" className="space-y-6">
            <ABTestingManager />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
