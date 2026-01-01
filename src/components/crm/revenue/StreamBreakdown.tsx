import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart as PieChartIcon } from 'lucide-react';
import { RevenueStream } from '@/hooks/useRevenueStreams';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface StreamBreakdownProps {
  streams: RevenueStream[];
  loading: boolean;
  totalRevenue: number;
}

export const StreamBreakdown = ({ streams, loading, totalRevenue }: StreamBreakdownProps) => {
  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Filter streams with value > 0 and sort by amount
  const activeStreams = streams
    .filter(s => s.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6);

  const chartData = activeStreams.map((stream) => ({
    name: stream.name,
    value: stream.amount,
    color: stream.color,
    percentage: ((stream.amount / totalRevenue) * 100).toFixed(1),
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground">{data.name}</p>
          <p className="text-primary">${data.value.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">{data.percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <PieChartIcon className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Revenue Distribution</CardTitle>
              <p className="text-sm text-muted-foreground">
                Breakdown by stream
              </p>
            </div>
          </div>
          <Badge variant="outline">
            {activeStreams.length} active streams
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {chartData.map((stream, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: stream.color }}
              />
              <span className="text-muted-foreground truncate">{stream.name}</span>
              <span className="font-medium text-foreground ml-auto">{stream.percentage}%</span>
            </div>
          ))}
        </div>

        {/* Top Performer */}
        {activeStreams.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-sm text-muted-foreground">Top Performer</p>
            <p className="font-semibold text-foreground">{activeStreams[0].name}</p>
            <p className="text-lg font-bold text-primary">
              ${activeStreams[0].amount.toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
