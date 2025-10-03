import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SupportTicketManager } from "@/components/admin/SupportTicketManager";
import { UserFeedbackAnalyzer } from "@/components/admin/UserFeedbackAnalyzer";
import { AnnouncementBroadcaster } from "@/components/admin/AnnouncementBroadcaster";
import { CustomerSuccessDashboard } from "@/components/admin/CustomerSuccessDashboard";

export default function CustomerSuccess() {
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
              <h1 className="text-3xl font-bold">Customer Success</h1>
              <p className="text-muted-foreground">
                Support tickets, user feedback, and customer success metrics
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
            <TabsTrigger value="feedback">User Feedback</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <CustomerSuccessDashboard />
          </TabsContent>

          <TabsContent value="tickets">
            <SupportTicketManager />
          </TabsContent>

          <TabsContent value="feedback">
            <UserFeedbackAnalyzer />
          </TabsContent>

          <TabsContent value="announcements">
            <AnnouncementBroadcaster />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
