import { AdminLayout } from "@/components/admin/AdminLayout";
import { AuditLogViewer } from "@/components/admin/AuditLogViewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AuditLog() {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin
        </Button>

        <AuditLogViewer />
      </div>
    </AdminLayout>
  );
}
