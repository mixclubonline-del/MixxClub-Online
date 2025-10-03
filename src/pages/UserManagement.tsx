import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { UserManagementTable } from "@/components/admin/UserManagementTable";
import { UserDetailsPanel } from "@/components/admin/UserDetailsPanel";
import { UserRoleManager } from "@/components/admin/UserRoleManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Shield, Activity } from "lucide-react";

export default function UserManagement() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions across the platform
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              All Users
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-2">
              <Shield className="h-4 w-4" />
              Role Management
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="h-4 w-4" />
              Activity Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <UserManagementTable onSelectUser={setSelectedUserId} />
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <UserRoleManager />
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <div className="text-center py-12 text-muted-foreground">
              Activity log coming soon
            </div>
          </TabsContent>
        </Tabs>

        <UserDetailsPanel 
          userId={selectedUserId} 
          onClose={() => setSelectedUserId(null)} 
        />
      </div>
    </AdminLayout>
  );
}
