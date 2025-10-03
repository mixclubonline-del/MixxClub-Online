import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  ExternalLink,
  Clock 
} from "lucide-react";

export const ErrorTracker = () => {
  const errors = [
    {
      id: 1,
      severity: "critical",
      message: "Database connection timeout in user_profiles query",
      count: 3,
      timestamp: "2 minutes ago",
      status: "investigating",
    },
    {
      id: 2,
      severity: "warning",
      message: "Slow API response on /api/projects endpoint",
      count: 12,
      timestamp: "15 minutes ago",
      status: "monitoring",
    },
    {
      id: 3,
      severity: "info",
      message: "High memory usage detected in edge function",
      count: 1,
      timestamp: "1 hour ago",
      status: "resolved",
    },
    {
      id: 4,
      severity: "critical",
      message: "Failed webhook delivery to Stripe",
      count: 5,
      timestamp: "3 hours ago",
      status: "investigating",
    },
  ];

  const getSeverityBadge = (severity: string) => {
    const configs = {
      critical: { 
        icon: AlertCircle, 
        className: "bg-red-500 text-white" 
      },
      warning: { 
        icon: AlertTriangle, 
        className: "bg-yellow-500 text-white" 
      },
      info: { 
        icon: Info, 
        className: "bg-blue-500 text-white" 
      },
    };
    
    const config = configs[severity as keyof typeof configs];
    const Icon = config.icon;
    
    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {severity}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      investigating: "default",
      monitoring: "secondary",
      resolved: "outline",
    };
    
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Error Tracking</h3>
          <div className="flex items-center gap-2">
            <Badge variant="destructive">4 Active</Badge>
            <Button variant="outline" size="sm">
              View All
              <ExternalLink className="h-3 w-3 ml-2" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {errors.map((error) => (
            <div 
              key={error.id} 
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getSeverityBadge(error.severity)}
                  <Badge variant="outline">{error.count}x</Badge>
                </div>
                {getStatusBadge(error.status)}
              </div>
              
              <p className="font-medium mb-2">{error.message}</p>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                {error.timestamp}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-500">4</p>
            <p className="text-sm text-muted-foreground">Critical</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-500">12</p>
            <p className="text-sm text-muted-foreground">Warnings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">156</p>
            <p className="text-sm text-muted-foreground">Resolved Today</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
