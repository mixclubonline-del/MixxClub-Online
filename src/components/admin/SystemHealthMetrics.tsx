import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, Database, Zap, HardDrive, Cpu, MemoryStick, 
  Globe, TrendingUp, TrendingDown
} from "lucide-react";

interface HealthMetric {
  name: string;
  value: string | number;
  unit?: string;
  status: 'healthy' | 'warning' | 'critical';
  threshold: number;
  current: number;
  icon: any;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
}

const healthMetrics: HealthMetric[] = [
  {
    name: 'API Response Time',
    value: '127',
    unit: 'ms',
    status: 'healthy',
    threshold: 200,
    current: 127,
    icon: Zap,
    trend: 'down',
    trendValue: '-12%'
  },
  {
    name: 'Database Performance',
    value: '45',
    unit: 'ms',
    status: 'healthy',
    threshold: 100,
    current: 45,
    icon: Database,
    trend: 'stable',
    trendValue: '0%'
  },
  {
    name: 'CPU Usage',
    value: '34',
    unit: '%',
    status: 'healthy',
    threshold: 80,
    current: 34,
    icon: Cpu,
    trend: 'up',
    trendValue: '+5%'
  },
  {
    name: 'Memory Usage',
    value: '62',
    unit: '%',
    status: 'warning',
    threshold: 85,
    current: 62,
    icon: MemoryStick,
    trend: 'up',
    trendValue: '+8%'
  },
  {
    name: 'Storage Space',
    value: '45',
    unit: '%',
    status: 'healthy',
    threshold: 90,
    current: 45,
    icon: HardDrive,
    trend: 'up',
    trendValue: '+2%'
  },
  {
    name: 'Network Latency',
    value: '23',
    unit: 'ms',
    status: 'healthy',
    threshold: 100,
    current: 23,
    icon: Globe,
    trend: 'down',
    trendValue: '-7%'
  },
  {
    name: 'System Uptime',
    value: '99.97',
    unit: '%',
    status: 'healthy',
    threshold: 99.9,
    current: 99.97,
    icon: Activity,
    trend: 'stable',
    trendValue: '0%'
  },
  {
    name: 'Error Rate',
    value: '0.03',
    unit: '%',
    status: 'healthy',
    threshold: 1,
    current: 0.03,
    icon: Activity,
    trend: 'down',
    trendValue: '-25%'
  }
];

export function SystemHealthMetrics() {
  const getStatusColor = (status: HealthMetric['status']) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'critical':
        return 'text-red-500';
    }
  };

  const getStatusBadge = (status: HealthMetric['status']) => {
    const variants: Record<string, any> = {
      healthy: 'default',
      warning: 'secondary',
      critical: 'destructive'
    };
    return variants[status];
  };

  const getTrendIcon = (trend?: HealthMetric['trend']) => {
    if (trend === 'up') return <TrendingUp className="h-3 w-3" />;
    if (trend === 'down') return <TrendingDown className="h-3 w-3" />;
    return null;
  };

  const getOverallHealth = () => {
    const critical = healthMetrics.filter(m => m.status === 'critical').length;
    const warning = healthMetrics.filter(m => m.status === 'warning').length;
    
    if (critical > 0) return 'critical';
    if (warning > 0) return 'warning';
    return 'healthy';
  };

  const overallHealth = getOverallHealth();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>System Health Metrics</CardTitle>
            <CardDescription>Real-time performance and resource monitoring</CardDescription>
          </div>
          <Badge variant={getStatusBadge(overallHealth)} className="text-sm px-3 py-1">
            {overallHealth === 'healthy' && 'All Systems Operational'}
            {overallHealth === 'warning' && 'Monitoring Required'}
            {overallHealth === 'critical' && 'Critical Issues Detected'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {healthMetrics.map((metric) => {
            const Icon = metric.icon;
            const progressValue = (metric.current / metric.threshold) * 100;
            
            return (
              <Card key={metric.name}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Icon className={`h-4 w-4 ${getStatusColor(metric.status)}`} />
                    <Badge variant={getStatusBadge(metric.status)} className="text-xs">
                      {metric.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <div className="text-2xl font-bold">
                      {metric.value}
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        {metric.unit}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{metric.name}</div>
                  </div>
                  
                  <Progress 
                    value={Math.min(progressValue, 100)} 
                    className={`h-1 ${
                      metric.status === 'critical' ? '[&>div]:bg-red-500' :
                      metric.status === 'warning' ? '[&>div]:bg-yellow-500' :
                      '[&>div]:bg-green-500'
                    }`}
                  />
                  
                  {metric.trend && (
                    <div className={`flex items-center gap-1 text-xs ${
                      metric.trend === 'up' ? 'text-red-500' :
                      metric.trend === 'down' ? 'text-green-500' :
                      'text-muted-foreground'
                    }`}>
                      {getTrendIcon(metric.trend)}
                      <span>{metric.trendValue} vs last hour</span>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Threshold: {metric.threshold}{metric.unit}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
