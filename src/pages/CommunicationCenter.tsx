import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MessageCircle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EmailTemplateManager } from "@/components/admin/EmailTemplateManager";
import { BulkMessaging } from "@/components/admin/BulkMessaging";
import { CommunicationLogs } from "@/components/admin/CommunicationLogs";
import { NotificationCenter } from "@/components/admin/NotificationCenter";

export default function CommunicationCenter() {
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
                <MessageCircle className="h-8 w-8 text-primary" />
                Communication Center
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage email templates, bulk messaging, and notification settings
              </p>
            </div>
          </div>
          <Badge variant="outline" className="gap-2 px-4 py-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            All Services Operational
          </Badge>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="templates">Email Templates</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Messaging</TabsTrigger>
            <TabsTrigger value="logs">Communication Logs</TabsTrigger>
            <TabsTrigger value="notifications">Notification Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            <EmailTemplateManager />
          </TabsContent>

          <TabsContent value="bulk" className="space-y-6">
            <BulkMessaging />
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <CommunicationLogs />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationCenter />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
