import { AdminLayout } from "@/components/admin/AdminLayout";
import { SystemHealthMonitor } from "@/components/admin/SystemHealthMonitor";
import { PerformanceMetrics } from "@/components/admin/PerformanceMetrics";
import { ErrorTracker } from "@/components/admin/ErrorTracker";
import { APIUsageMonitor } from "@/components/admin/APIUsageMonitor";
import { DatabasePerformance } from "@/components/admin/DatabasePerformance";
import { PerformanceDashboard } from "@/components/admin/PerformanceDashboard";
import { BundleAnalyzer } from "@/components/admin/BundleAnalyzer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Server, Database, Zap, AlertCircle, Package } from "lucide-react";

export default function SystemMonitoring() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of system health, performance, and errors
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2">
              <Server className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="database" className="gap-2">
              <Database className="h-4 w-4" />
              Database
            </TabsTrigger>
            <TabsTrigger value="api" className="gap-2">
              <Zap className="h-4 w-4" />
              API Usage
            </TabsTrigger>
            <TabsTrigger value="errors" className="gap-2">
              <AlertCircle className="h-4 w-4" />
              Errors
            </TabsTrigger>
            <TabsTrigger value="bundle" className="gap-2">
              <Package className="h-4 w-4" />
              Bundle
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <SystemHealthMonitor />
              <PerformanceMetrics />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <PerformanceDashboard />
              <BundleAnalyzer />
            </div>
            <ErrorTracker />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <PerformanceMetrics />
            <SystemHealthMonitor />
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <DatabasePerformance />
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <APIUsageMonitor />
          </TabsContent>

          <TabsContent value="errors" className="space-y-6">
            <ErrorTracker />
          </TabsContent>

          <TabsContent value="bundle" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <BundleAnalyzer />
              <PerformanceDashboard />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
