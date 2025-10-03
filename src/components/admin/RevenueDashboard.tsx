import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, TrendingUp, Users, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface RevenueData {
  date: string;
  revenue: number;
  transactions: number;
}

interface RevenueMetrics {
  mrr: number;
  arr: number;
  totalRevenue: number;
  totalTransactions: number;
  averageTransaction: number;
  growthRate: number;
}

export function RevenueDashboard() {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [metrics, setMetrics] = useState<RevenueMetrics>({
    mrr: 0,
    arr: 0,
    totalRevenue: 0,
    totalTransactions: 0,
    averageTransaction: 0,
    growthRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRevenueData();
  }, []);

  const loadRevenueData = async () => {
    try {
      // Get last 30 days of payments
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: payments, error } = await supabase
        .from('payments')
        .select('amount, created_at, status')
        .eq('status', 'completed')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by date
      const dailyRevenue = payments?.reduce((acc: Record<string, RevenueData>, payment) => {
        const date = new Date(payment.created_at).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { date, revenue: 0, transactions: 0 };
        }
        acc[date].revenue += Number(payment.amount);
        acc[date].transactions += 1;
        return acc;
      }, {});

      setRevenueData(Object.values(dailyRevenue || {}));

      // Calculate metrics
      const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const totalTransactions = payments?.length || 0;

      // Calculate MRR (last 30 days average * 12 / 12 = monthly)
      const mrr = totalRevenue / 30 * 30; // Normalize to monthly
      const arr = mrr * 12;

      // Calculate growth rate (compare first 15 days to last 15 days)
      const midpoint = Math.floor(payments?.length || 0 / 2);
      const firstHalf = payments?.slice(0, midpoint).reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const secondHalf = payments?.slice(midpoint).reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const growthRate = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;

      setMetrics({
        mrr,
        arr,
        totalRevenue,
        totalTransactions,
        averageTransaction: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
        growthRate,
      });
    } catch (error) {
      toast.error('Failed to load revenue data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading revenue data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.mrr.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              ARR: ${metrics.arr.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (30d)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.growthRate >= 0 ? '+' : ''}{metrics.growthRate.toFixed(1)}% from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.averageTransaction.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
          <CardDescription>Daily revenue for the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" name="Revenue ($)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Transactions Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Volume</CardTitle>
          <CardDescription>Daily transaction count for the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="transactions" fill="hsl(var(--primary))" name="Transactions" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
