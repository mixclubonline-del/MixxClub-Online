import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, DollarSign, Activity, AlertTriangle, TrendingUp, 
  CheckCircle, Clock, Zap, Shield, Globe
} from "lucide-react";

const systemMetrics = [
  {
    name: 'Active Users',
    value: '1,250',
    change: '+8.2%',
    trend: 'up',
    icon: Users,
    color: 'text-blue-500',
    status: 'healthy'
  },
  {
    name: 'Monthly Revenue',
    value: '$67,000',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-green-500',
    status: 'healthy'
  },
  {
    name: 'System Uptime',
    value: '99.9%',
    change: '0.0%',
    trend: 'stable',
    icon: Activity,
    color: 'text-purple-500',
    status: 'healthy'
  },
  {
    name: 'Response Time',
    value: '127ms',
    change: '-8%',
    trend: 'up',
    icon: Zap,
    color: 'text-yellow-500',
    status: 'healthy'
  }
];

const systemStatus = [
  { system: 'Database', status: 'operational', uptime: 99.9, latency: '12ms' },
  { system: 'API Services', status: 'operational', uptime: 99.8, latency: '45ms' },
  { system: 'File Storage', status: 'operational', uptime: 100, latency: '8ms' },
  { system: 'Email Service', status: 'operational', uptime: 99.5, latency: '320ms' },
  { system: 'Payment Gateway', status: 'operational', uptime: 99.7, latency: '180ms' },
  { system: 'CDN', status: 'degraded', uptime: 98.2, latency: '95ms' }
];

const recentAlerts = [
  {
    id: '1',
    type: 'warning',
    message: 'High API usage detected on payment endpoint',
    time: '5 minutes ago',
    resolved: false
  },
  {
    id: '2',
    type: 'info',
    message: 'Database backup completed successfully',
    time: '1 hour ago',
    resolved: true
  },
  {
    id: '3',
    type: 'success',
    message: 'System update deployed to production',
    time: '2 hours ago',
    resolved: true
  }
];

export function CommandCenterOverview() {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      operational: 'default',
      degraded: 'secondary',
      down: 'destructive'
    };
    return variants[status] || 'outline';
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'info':
        return <Activity className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {systemMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.name}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>{metric.name}</CardDescription>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className={`flex items-center gap-1 mt-1 text-sm ${
                  metric.trend === 'up' ? 'text-green-500' : 
                  metric.trend === 'down' ? 'text-red-500' : 
                  'text-muted-foreground'
                }`}>
                  <TrendingUp className="h-4 w-4" />
                  <span>{metric.change}</span>
                  <span className="text-muted-foreground">vs last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription>Real-time status of all platform services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemStatus.map((system) => (
              <div key={system.system} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{system.system}</span>
                    <Badge variant={getStatusBadge(system.status)}>
                      {system.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{system.uptime}% uptime</span>
                    <span>•</span>
                    <span>{system.latency} latency</span>
                  </div>
                </div>
                <Progress 
                  value={system.uptime} 
                  className={`h-2 ${system.uptime < 99 ? '[&>div]:bg-yellow-500' : ''}`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Recent Alerts
          </CardTitle>
          <CardDescription>System notifications and important events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  alert.resolved ? 'opacity-60' : ''
                }`}
              >
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <div className="font-medium text-sm">{alert.message}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {alert.time}
                  </div>
                </div>
                {alert.resolved && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
