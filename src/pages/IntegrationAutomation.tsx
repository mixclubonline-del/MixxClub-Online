import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { APIKeyManager } from "@/components/admin/APIKeyManager";
import { WebhookConfiguration } from "@/components/admin/WebhookConfiguration";
import { AutomationWorkflows } from "@/components/admin/AutomationWorkflows";
import { IntegrationDirectory } from "@/components/admin/IntegrationDirectory";

export default function IntegrationAutomation() {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Integration & Automation</h1>
              <p className="text-muted-foreground">
                Manage API keys, webhooks, workflows, and third-party integrations
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="integrations" className="space-y-6">
          <TabsList>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>

          <TabsContent value="integrations">
            <IntegrationDirectory />
          </TabsContent>

          <TabsContent value="api-keys">
            <APIKeyManager />
          </TabsContent>

          <TabsContent value="webhooks">
            <WebhookConfiguration />
          </TabsContent>

          <TabsContent value="automation">
            <AutomationWorkflows />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
