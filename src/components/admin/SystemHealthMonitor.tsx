import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Server, 
  Database, 
  Zap, 
  CheckCircle, 
  AlertTriangle,
  XCircle 
} from "lucide-react";

export const SystemHealthMonitor = () => {
  const services = [
    { 
      name: "API Server", 
      status: "operational", 
      uptime: 99.99, 
      responseTime: "45ms",
      icon: Server 
    },
    { 
      name: "Database", 
      status: "operational", 
      uptime: 99.98, 
      responseTime: "12ms",
      icon: Database 
    },
    { 
      name: "Edge Functions", 
      status: "operational", 
      uptime: 99.95, 
      responseTime: "89ms",
      icon: Zap 
    },
    { 
      name: "Storage", 
      status: "degraded", 
      uptime: 98.5, 
      responseTime: "156ms",
      icon: Activity 
    },
  ];

  const getStatusBadge = (status: string) => {
    const configs = {
      operational: { 
        variant: "default" as const, 
        icon: CheckCircle, 
        className: "bg-green-500" 
      },
      degraded: { 
        variant: "secondary" as const, 
        icon: AlertTriangle, 
        className: "bg-yellow-500" 
      },
      outage: { 
        variant: "destructive" as const, 
        icon: XCircle, 
        className: "bg-red-500" 
      },
    };
    
    const config = configs[status as keyof typeof configs] || configs.operational;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className={`${config.className} gap-1`}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">System Health</h3>
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            All Systems Operational
          </Badge>
        </div>

        <div className="grid gap-4">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div key={service.name} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Response Time: {service.responseTime}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(service.status)}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Uptime</span>
                    <span className="font-medium">{service.uptime}%</span>
                  </div>
                  <Progress value={service.uptime} className="h-2" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">99.97%</p>
            <p className="text-sm text-muted-foreground">Overall Uptime</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">58ms</p>
            <p className="text-sm text-muted-foreground">Avg Response</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">0</p>
            <p className="text-sm text-muted-foreground">Active Incidents</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
