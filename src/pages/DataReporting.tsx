import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DataExportManager } from "@/components/admin/DataExportManager";
import { CustomReportBuilder } from "@/components/admin/CustomReportBuilder";
import { BusinessIntelligenceDashboard } from "@/components/admin/BusinessIntelligenceDashboard";

export default function DataReporting() {
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
              <h1 className="text-3xl font-bold">Data & Reporting</h1>
              <p className="text-muted-foreground">
                Export data, build custom reports, and analyze business intelligence
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="business-intelligence" className="space-y-6">
          <TabsList>
            <TabsTrigger value="business-intelligence">Business Intelligence</TabsTrigger>
            <TabsTrigger value="export">Data Export</TabsTrigger>
            <TabsTrigger value="reports">Custom Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="business-intelligence">
            <BusinessIntelligenceDashboard />
          </TabsContent>

          <TabsContent value="export">
            <DataExportManager />
          </TabsContent>

          <TabsContent value="reports">
            <CustomReportBuilder />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
