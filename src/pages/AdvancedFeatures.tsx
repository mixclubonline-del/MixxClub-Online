import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdvancedFeaturesDemo } from "@/components/admin/AdvancedFeaturesDemo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export default function AdvancedFeatures() {
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
                <Zap className="h-8 w-8 text-primary" />
                Advanced Data Operations
              </h1>
              <p className="text-muted-foreground mt-2">
                Bulk operations, advanced search, and data export capabilities
              </p>
            </div>
          </div>
          <Badge variant="default" className="gap-2 px-4 py-2">
            <Zap className="h-4 w-4" />
            Step 8 Complete
          </Badge>
        </div>

        <AdvancedFeaturesDemo />
      </div>
    </AdminLayout>
  );
}
