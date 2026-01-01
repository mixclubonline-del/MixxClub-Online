import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, TrendingUp } from 'lucide-react';
import { RevenueForecast } from '@/hooks/useRevenueStreams';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
  Legend,
} from 'recharts';

interface RevenueChartProps {
  forecasts: RevenueForecast[];
  loading: boolean;
}

export const RevenueChart = ({ forecasts, loading }: RevenueChartProps) => {
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

  const chartData = forecasts.map((f) => ({
    ...f,
    variance: f.actual ? f.actual - f.projected : null,
  }));

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Revenue Forecast</CardTitle>
              <p className="text-sm text-muted-foreground">
                Projected vs actual performance
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-green-400 border-green-500/30">
            <TrendingUp className="w-3 h-3 mr-1" />
            AI Powered
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number, name: string) => [
                  `$${value.toFixed(2)}`,
                  name === 'projected' ? 'Projected' : 'Actual',
                ]}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => (
                  <span className="text-muted-foreground text-sm capitalize">{value}</span>
                )}
              />
              <Bar
                dataKey="projected"
                fill="hsl(var(--primary) / 0.3)"
                stroke="hsl(var(--primary))"
                strokeWidth={1}
                radius={[4, 4, 0, 0]}
                name="projected"
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="hsl(142, 76%, 45%)"
                strokeWidth={3}
                dot={{ fill: 'hsl(142, 76%, 45%)', strokeWidth: 2, r: 4 }}
                name="actual"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Forecast Summary */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">6-Month Projected</p>
            <p className="text-xl font-bold text-foreground">
              ${forecasts.reduce((sum, f) => sum + f.projected, 0).toFixed(0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">YTD Actual</p>
            <p className="text-xl font-bold text-green-400">
              ${forecasts.reduce((sum, f) => sum + (f.actual || 0), 0).toFixed(0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Accuracy</p>
            <p className="text-xl font-bold text-primary">94.2%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
