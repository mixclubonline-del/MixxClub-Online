import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatabaseStats } from '@/components/admin/DatabaseStats';
import { AnalyticsViewsDemo } from '@/components/admin/AnalyticsViewsDemo';
import { Database, BarChart3 } from 'lucide-react';

export default function DatabaseManagement() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Database Management</h1>
        <p className="text-muted-foreground">
          Monitor database health, view analytics, and manage data lifecycle
        </p>
      </div>

      <Tabs defaultValue="stats" className="w-full">
        <TabsList>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Database Statistics
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics Views
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="mt-6">
          <DatabaseStats />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <AnalyticsViewsDemo />
        </TabsContent>
      </Tabs>
    </div>
  );
}
