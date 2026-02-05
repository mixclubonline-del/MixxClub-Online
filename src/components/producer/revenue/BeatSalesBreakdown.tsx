import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import type { ProducerRevenueAnalytics } from '@/hooks/useProducerRevenueStreams';

interface BeatSalesBreakdownProps {
  analytics: ProducerRevenueAnalytics | null;
  loading: boolean;
}

const COLORS = ['hsl(var(--primary))', 'hsl(280, 100%, 70%)'];

export const BeatSalesBreakdown = ({ analytics, loading }: BeatSalesBreakdownProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics) return null;

  const totalLeases = analytics.revenueByMonth.reduce((sum, m) => sum + m.leases, 0);
  const totalExclusives = analytics.revenueByMonth.reduce((sum, m) => sum + m.exclusives, 0);

  const pieData = [
    { name: 'Leases', value: totalLeases },
    { name: 'Exclusives', value: totalExclusives },
  ].filter(d => d.value > 0);

  const chartData = analytics.revenueByMonth.map(m => ({
    month: m.month,
    Leases: m.leases,
    Exclusives: m.exclusives,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Breakdown Chart */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Monthly Beat Sales</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.some(d => d.Leases > 0 || d.Exclusives > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                />
                <Bar dataKey="Leases" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Exclusives" stackId="a" fill="hsl(280, 100%, 70%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No sales data yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* License Distribution Pie */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">License Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No sales data yet
            </div>
          )}
          
          {/* Stats below pie */}
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Total Leases</p>
              <p className="text-xl font-bold text-foreground">{analytics.leaseSales}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Total Exclusives</p>
              <p className="text-xl font-bold text-foreground">{analytics.exclusiveSales}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
