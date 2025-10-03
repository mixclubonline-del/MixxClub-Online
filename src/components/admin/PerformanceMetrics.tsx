import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const responseTimeData = [
  { time: '00:00', value: 120 },
  { time: '04:00', value: 115 },
  { time: '08:00', value: 145 },
  { time: '12:00', value: 180 },
  { time: '16:00', value: 165 },
  { time: '20:00', value: 135 },
  { time: '24:00', value: 125 },
];

const throughputData = [
  { time: '00:00', requests: 450 },
  { time: '04:00', requests: 320 },
  { time: '08:00', requests: 680 },
  { time: '12:00', requests: 920 },
  { time: '16:00', requests: 850 },
  { time: '20:00', requests: 720 },
  { time: '24:00', requests: 580 },
];

const metrics = [
  { name: 'Avg Response Time', value: '127ms', change: -8, trend: 'down' },
  { name: 'Requests/Min', value: '685', change: 12, trend: 'up' },
  { name: 'Error Rate', value: '0.12%', change: -15, trend: 'down' },
  { name: 'Cache Hit Rate', value: '94.2%', change: 3, trend: 'up' },
];

export function PerformanceMetrics() {
  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.name}>
            <CardHeader className="pb-2">
              <CardDescription>{metric.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center gap-1 mt-1 text-sm">
                {getTrendIcon(metric.trend)}
                <span className={metric.change > 0 ? 'text-green-500' : 'text-red-500'}>
                  {Math.abs(metric.change)}%
                </span>
                <span className="text-muted-foreground">vs last hour</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Response Time (24h)</CardTitle>
            <CardDescription>Average API response time in milliseconds</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="time" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request Throughput (24h)</CardTitle>
            <CardDescription>Total requests per time period</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={throughputData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="time" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="requests" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
