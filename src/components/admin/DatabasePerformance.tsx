import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Activity, 
  Clock, 
  TrendingUp 
} from "lucide-react";

export const DatabasePerformance = () => {
  const metrics = {
    activeConnections: 45,
    maxConnections: 100,
    queryPerSecond: 1243,
    avgQueryTime: "12ms",
    slowQueries: 3,
    cacheHitRate: 96.8,
  };

  const slowQueries = [
    {
      query: "SELECT * FROM projects WHERE status = 'active'",
      executionTime: "234ms",
      calls: 156,
      table: "projects",
    },
    {
      query: "SELECT * FROM audio_files WITH multiple joins",
      executionTime: "189ms",
      calls: 89,
      table: "audio_files",
    },
    {
      query: "Complex aggregation on user_analytics",
      executionTime: "167ms",
      calls: 45,
      table: "user_analytics",
    },
  ];

  const connectionPercentage = (metrics.activeConnections / metrics.maxConnections) * 100;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Database Performance</h3>
          <Badge className="bg-green-500">
            <Activity className="h-3 w-3 mr-1" />
            Healthy
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-blue-500" />
              <p className="text-sm text-muted-foreground">Active Connections</p>
            </div>
            <p className="text-2xl font-bold mb-2">
              {metrics.activeConnections} / {metrics.maxConnections}
            </p>
            <Progress value={connectionPercentage} className="h-2" />
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-green-500" />
              <p className="text-sm text-muted-foreground">Queries/Second</p>
            </div>
            <p className="text-2xl font-bold mb-2">{metrics.queryPerSecond}</p>
            <div className="flex items-center gap-1 text-sm text-green-500">
              <TrendingUp className="h-3 w-3" />
              +12% from last hour
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <p className="text-sm text-muted-foreground">Avg Query Time</p>
            </div>
            <p className="text-2xl font-bold">{metrics.avgQueryTime}</p>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-orange-500" />
              <p className="text-sm text-muted-foreground">Cache Hit Rate</p>
            </div>
            <p className="text-2xl font-bold text-green-500">{metrics.cacheHitRate}%</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Slow Queries</h4>
            <Badge variant="outline">{metrics.slowQueries} detected</Badge>
          </div>

          {slowQueries.map((query, index) => (
            <div key={index} className="p-3 border rounded-lg bg-yellow-500/5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-mono text-sm">{query.query}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>Table: {query.table}</span>
                    <span>{query.calls} calls</span>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-yellow-500/20">
                  {query.executionTime}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
