import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BarChart3, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserAnalyticsDashboard } from "@/components/admin/UserAnalyticsDashboard";
import { RevenueAnalyticsDashboard } from "@/components/admin/RevenueAnalyticsDashboard";
import { PerformanceKPIDashboard } from "@/components/admin/PerformanceKPIDashboard";

export default function AdvancedAnalytics() {
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
                <BarChart3 className="h-8 w-8 text-primary" />
                Advanced Analytics Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Comprehensive insights into user behavior, revenue, and platform performance
              </p>
            </div>
          </div>
          <Badge variant="outline" className="gap-2 px-4 py-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Real-time Data
          </Badge>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">User Analytics</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
            <TabsTrigger value="kpis">Performance KPIs</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <UserAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <RevenueAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="kpis" className="space-y-6">
            <PerformanceKPIDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
