import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  TrendingUp, 
  Clock, 
  CheckCircle 
} from "lucide-react";

export const APIUsageMonitor = () => {
  const endpoints = [
    {
      path: "/api/projects",
      requests: 45234,
      avgResponseTime: "89ms",
      successRate: 99.8,
      trend: "+12%",
    },
    {
      path: "/api/users",
      requests: 32156,
      avgResponseTime: "45ms",
      successRate: 99.9,
      trend: "+8%",
    },
    {
      path: "/api/audio",
      requests: 28943,
      avgResponseTime: "234ms",
      successRate: 98.5,
      trend: "+15%",
    },
    {
      path: "/api/payments",
      requests: 12876,
      avgResponseTime: "156ms",
      successRate: 99.5,
      trend: "+5%",
    },
  ];

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 99.5) return "text-green-500";
    if (rate >= 98) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">API Usage Monitor</h3>
          <Badge className="bg-blue-500">
            <Zap className="h-3 w-3 mr-1" />
            Live
          </Badge>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <p className="text-2xl font-bold">119K</p>
            <p className="text-sm text-muted-foreground">Total Requests</p>
          </div>
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <p className="text-2xl font-bold">128ms</p>
            <p className="text-sm text-muted-foreground">Avg Response</p>
          </div>
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <p className="text-2xl font-bold text-green-500">99.4%</p>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </div>
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <p className="text-2xl font-bold text-blue-500">+10%</p>
            <p className="text-sm text-muted-foreground">vs Last Hour</p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Top Endpoints</h4>
          
          {endpoints.map((endpoint) => (
            <div key={endpoint.path} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm">{endpoint.path}</p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {endpoint.requests.toLocaleString()} requests
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {endpoint.avgResponseTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {endpoint.trend}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className={`text-lg font-bold ${getSuccessRateColor(endpoint.successRate)}`}>
                      {endpoint.successRate}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                </div>
              </div>
              <Progress value={endpoint.successRate} className="h-1" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
