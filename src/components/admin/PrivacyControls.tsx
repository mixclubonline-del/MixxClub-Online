import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Download, Trash2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const PrivacyControls = () => {
  const { toast } = useToast();

  const { data: dataRequests } = useQuery({
    queryKey: ["user-data-requests"],
    queryFn: async () => {
      // Mock data for now - in production this would query a user_data_requests table
      return [
        {
          id: "1",
          user_id: "user-1",
          request_type: "export",
          status: "pending",
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          user_id: "user-2",
          request_type: "deletion",
          status: "completed",
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
    },
  });

  const handleExportData = (userId: string) => {
    toast({
      title: "Exporting user data",
      description: "User data export has been initiated",
    });
  };

  const handleDeleteData = (userId: string) => {
    toast({
      title: "Data deletion initiated",
      description: "User data will be permanently deleted within 30 days",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Privacy Controls
        </CardTitle>
        <CardDescription>
          Manage GDPR data subject requests and user privacy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4">
            <div className="space-y-2">
              <FileText className="h-8 w-8 text-primary" />
              <h3 className="font-semibold">Export Requests</h3>
              <div className="text-3xl font-bold">
                {dataRequests?.filter(r => r.request_type === "export").length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Pending exports</p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-2">
              <Trash2 className="h-8 w-8 text-destructive" />
              <h3 className="font-semibold">Deletion Requests</h3>
              <div className="text-3xl font-bold">
                {dataRequests?.filter(r => r.request_type === "deletion").length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Pending deletions</p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-2">
              <Shield className="h-8 w-8 text-green-500" />
              <h3 className="font-semibold">Consent Rate</h3>
              <div className="text-3xl font-bold">98%</div>
              <p className="text-sm text-muted-foreground">Users with active consent</p>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Recent Data Requests</h3>
          {dataRequests?.map((request) => (
            <Card key={request.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {request.request_type === "export" ? (
                      <Download className="h-4 w-4" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span className="font-medium">
                      {request.request_type === "export" ? "Data Export" : "Data Deletion"}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    User ID: {request.user_id}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(request.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={request.status === "completed" ? "default" : "secondary"}
                  >
                    {request.status}
                  </Badge>
                  {request.status === "pending" && (
                    <Button
                      size="sm"
                      onClick={() =>
                        request.request_type === "export"
                          ? handleExportData(request.user_id)
                          : handleDeleteData(request.user_id)
                      }
                    >
                      Process
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
