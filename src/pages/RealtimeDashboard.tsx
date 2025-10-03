import { AdminLayout } from "@/components/admin/AdminLayout";
import { CustomizableDashboard } from "@/components/admin/CustomizableDashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Radio } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RealtimeDashboard() {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="space-y-6">
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
                <Radio className="h-8 w-8 text-primary" />
                Real-time Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Live updates, online users, and customizable widgets
              </p>
            </div>
          </div>
          <Badge variant="default" className="gap-2 px-4 py-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            Live
          </Badge>
        </div>

        <CustomizableDashboard />
      </div>
    </AdminLayout>
  );
}
