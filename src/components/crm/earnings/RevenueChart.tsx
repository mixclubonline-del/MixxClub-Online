import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

type DbRevenueSplit = Database['public']['Tables']['revenue_splits']['Row'];

interface RevenueChartProps {
  revenueSplits: DbRevenueSplit[];
}

export const RevenueChart = ({ revenueSplits }: RevenueChartProps) => {
  const chartData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i);
      return {
        month: format(date, 'MMM'),
        start: startOfMonth(date),
        end: endOfMonth(date),
        revenue: 0,
      };
    });

    revenueSplits.forEach((split) => {
      const splitDate = new Date(split.created_at);
      const monthData = months.find((m) =>
        isWithinInterval(splitDate, { start: m.start, end: m.end })
      );
      if (monthData) {
        monthData.revenue += split.total_amount;
      }
    });

    return months.map((m) => ({
      month: m.month,
      revenue: m.revenue,
    }));
  }, [revenueSplits]);

  const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue Over Time
          </div>
          <span className="text-lg font-bold text-primary">
            ${totalRevenue.toLocaleString()}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis
                dataKey="month"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
              />
              <Bar
                dataKey="revenue"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
