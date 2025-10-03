import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdminAlerts } from "@/hooks/useAdminAlerts";
import { 
  Bell, CheckCircle, AlertCircle, XCircle, 
  Clock, Loader2
} from "lucide-react";

export function RealTimeAlertsWidget() {
  const { alerts, isLoading, resolveAlert } = useAdminAlerts();

  const unresolvedAlerts = alerts.filter((alert) => !alert.is_resolved);
  const recentAlerts = alerts.slice(0, 5);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'text-red-500';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'high':
        return <XCircle className="h-4 w-4" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4" />;
      case 'low':
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              System Alerts
            </CardTitle>
            <CardDescription>Real-time platform monitoring</CardDescription>
          </div>
          {unresolvedAlerts.length > 0 && (
            <Badge variant="destructive">
              {unresolvedAlerts.length} Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>No alerts - all systems operational</p>
            </div>
          ) : (
            recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-3 border rounded-lg ${
                  alert.is_resolved ? 'opacity-60' : 'bg-accent/50'
                }`}
              >
                <div className={getSeverityColor(alert.severity)}>
                  {getSeverityIcon(alert.severity)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{alert.title}</span>
                    <Badge 
                      variant={alert.is_resolved ? "outline" : "secondary"}
                      className="text-xs capitalize"
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {alert.message}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(alert.created_at).toLocaleString()}</span>
                  </div>
                </div>

                {!alert.is_resolved && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resolveAlert(alert.id)}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
                
                {alert.is_resolved && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
