import { AdminLayout } from '@/components/admin/AdminLayout';
import { UserManagement } from '@/components/admin/UserManagement';
import { RefundManager } from '@/components/admin/RefundManager';
import { SecurityMonitorDashboard } from '@/components/admin/SecurityMonitorDashboard';
import { SystemHealthDashboard } from '@/components/admin/SystemHealthDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, DollarSign, Activity, Shield } from 'lucide-react';

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
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="payments">
              <DollarSign className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="system">
              <Activity className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">System</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="payments">
            <RefundManager />
          </TabsContent>

          <TabsContent value="security">
            <SecurityMonitorDashboard />
          </TabsContent>

          <TabsContent value="system">
            <SystemHealthDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
