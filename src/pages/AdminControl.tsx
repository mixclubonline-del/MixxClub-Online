import { AdminLayout } from '@/components/admin/AdminLayout';
import { UserManagement } from '@/components/admin/UserManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminControl() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Control Panel</h1>
          <p className="text-muted-foreground mt-2">
            Manage users, content, and platform operations
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="system">System Health</TabsTrigger>
            <TabsTrigger value="disputes">Disputes</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="content">
            <div className="text-center py-12 text-muted-foreground">
              Content moderation coming soon
            </div>
          </TabsContent>

          <TabsContent value="system">
            <div className="text-center py-12 text-muted-foreground">
              System health monitor coming soon
            </div>
          </TabsContent>

          <TabsContent value="disputes">
            <div className="text-center py-12 text-muted-foreground">
              Dispute manager coming soon
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
