import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TeamMemberManager } from "@/components/admin/TeamMemberManager";
import { RolePermissionsManager } from "@/components/admin/RolePermissionsManager";
import { AdminActivityLog } from "@/components/admin/AdminActivityLog";
import { InternalCollaboration } from "@/components/admin/InternalCollaboration";

export default function TeamManagement() {
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
              <h1 className="text-3xl font-bold">Team Management</h1>
              <p className="text-muted-foreground">
                Manage admin team, roles, permissions, and collaboration
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="members" className="space-y-6">
          <TabsList>
            <TabsTrigger value="members">Team Members</TabsTrigger>
            <TabsTrigger value="permissions">Roles & Permissions</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
            <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <TeamMemberManager />
          </TabsContent>

          <TabsContent value="permissions">
            <RolePermissionsManager />
          </TabsContent>

          <TabsContent value="activity">
            <AdminActivityLog />
          </TabsContent>

          <TabsContent value="collaboration">
            <InternalCollaboration />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
