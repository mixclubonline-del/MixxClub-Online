import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Database, Zap, HardDrive, Cpu, Globe } from "lucide-react";

interface HealthMetric {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  value: string;
  icon: any;
  description: string;
}

const healthMetrics: HealthMetric[] = [
  {
    name: 'API Response Time',
    status: 'healthy',
    value: '127ms',
    icon: Zap,
    description: 'Average API response time'
  },
  {
    name: 'Database Performance',
    status: 'healthy',
    value: '98.5%',
    icon: Database,
    description: 'Query success rate'
  },
  {
    name: 'Server Uptime',
    status: 'healthy',
    value: '99.9%',
    icon: Activity,
    description: 'Last 30 days uptime'
  },
  {
    name: 'Storage Usage',
    status: 'warning',
    value: '73%',
    icon: HardDrive,
    description: 'Total storage used'
  },
  {
    name: 'CPU Usage',
    status: 'healthy',
    value: '42%',
    icon: Cpu,
    description: 'Average CPU utilization'
  },
  {
    name: 'CDN Status',
    status: 'healthy',
    value: 'Active',
    icon: Globe,
    description: 'Content delivery network'
  }
];

export function SystemHealthMonitor() {
  const getStatusColor = (status: HealthMetric['status']) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500 bg-green-500/10';
      case 'warning':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'critical':
        return 'text-red-500 bg-red-500/10';
    }
  };

  const getStatusBadge = (status: HealthMetric['status']) => {
    const variants = {
      healthy: 'default',
      warning: 'secondary',
      critical: 'destructive'
    };
    return <Badge variant={variants[status] as any}>{status}</Badge>;
  };

  const overallHealth = healthMetrics.filter(m => m.status === 'healthy').length / healthMetrics.length * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>System Health Monitor</CardTitle>
            <CardDescription>Real-time system performance metrics</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-500">{Math.round(overallHealth)}%</div>
            <div className="text-sm text-muted-foreground">System Health</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {healthMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.name}
                className="flex flex-col gap-3 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${getStatusColor(metric.status)}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {getStatusBadge(metric.status)}
                </div>
                
                <div>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="text-sm font-medium text-foreground">{metric.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{metric.description}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Last System Check</h4>
              <p className="text-sm text-muted-foreground">2 minutes ago</p>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              All Systems Operational
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
