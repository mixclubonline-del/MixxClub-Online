import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Cpu, 
  HardDrive, 
  Activity, 
  Network,
  TrendingUp,
  TrendingDown 
} from "lucide-react";

export const PerformanceMetrics = () => {
  const metrics = [
    {
      name: "CPU Usage",
      value: 34,
      icon: Cpu,
      color: "text-blue-500",
      trend: "down",
      change: "-5%",
    },
    {
      name: "Memory Usage",
      value: 62,
      icon: HardDrive,
      color: "text-purple-500",
      trend: "up",
      change: "+3%",
    },
    {
      name: "Database Load",
      value: 45,
      icon: Activity,
      color: "text-green-500",
      trend: "down",
      change: "-8%",
    },
    {
      name: "Network I/O",
      value: 78,
      icon: Network,
      color: "text-orange-500",
      trend: "up",
      change: "+12%",
    },
  ];

  const getProgressColor = (value: number) => {
    if (value < 50) return "bg-green-500";
    if (value < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Performance Metrics</h3>

        <div className="grid gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown;
            
            return (
              <div key={metric.name} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${metric.color}`} />
                    <div>
                      <p className="font-medium">{metric.name}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <TrendIcon className={`h-3 w-3 ${
                          metric.trend === "up" ? "text-red-500" : "text-green-500"
                        }`} />
                        <span className="text-muted-foreground">
                          {metric.change} from last hour
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-2xl font-bold">{metric.value}%</span>
                </div>
                <Progress 
                  value={metric.value} 
                  className={`h-2 ${getProgressColor(metric.value)}`} 
                />
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Requests/min</p>
            <p className="text-2xl font-bold">1,243</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Error Rate</p>
            <p className="text-2xl font-bold text-green-500">0.02%</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
