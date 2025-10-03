import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CommandCenterOverview } from "@/components/admin/CommandCenterOverview";
import { QuickActionsPanel } from "@/components/admin/QuickActionsPanel";
import { RecentActivityFeed } from "@/components/admin/RecentActivityFeed";
import { Rocket, CheckCircle } from "lucide-react";

export default function AdminCommandCenter() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Rocket className="h-8 w-8 text-primary" />
              Admin Command Center
            </h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive platform control and monitoring dashboard
            </p>
          </div>
          <Badge variant="outline" className="gap-2 px-4 py-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            All Systems Operational
          </Badge>
        </div>

        {/* System Overview */}
        <CommandCenterOverview />

        {/* Bottom Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <QuickActionsPanel />
          <RecentActivityFeed />
        </div>

        {/* Quick Stats Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Snapshot (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 rounded-lg border bg-card">
                <div className="text-sm text-muted-foreground mb-1">New Users</div>
                <div className="text-2xl font-bold">287</div>
                <div className="text-xs text-green-500 mt-1">+18.2% from last month</div>
              </div>
              
              <div className="p-4 rounded-lg border bg-card">
                <div className="text-sm text-muted-foreground mb-1">Total Revenue</div>
                <div className="text-2xl font-bold">$67,000</div>
                <div className="text-xs text-green-500 mt-1">+12.5% from last month</div>
              </div>
              
              <div className="p-4 rounded-lg border bg-card">
                <div className="text-sm text-muted-foreground mb-1">Active Projects</div>
                <div className="text-2xl font-bold">542</div>
                <div className="text-xs text-green-500 mt-1">+8.7% from last month</div>
              </div>
              
              <div className="p-4 rounded-lg border bg-card">
                <div className="text-sm text-muted-foreground mb-1">Support Tickets</div>
                <div className="text-2xl font-bold">23</div>
                <div className="text-xs text-yellow-500 mt-1">3 open, 20 resolved</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
