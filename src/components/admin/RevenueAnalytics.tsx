import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Users, DollarSign } from "lucide-react";

export const RevenueAnalytics = () => {
  const { data: analytics } = useQuery({
    queryKey: ['revenue-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('revenue_analytics')
        .select('*')
        .order('period_start', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  const { data: subscriptions } = useQuery({
    queryKey: ['subscription-breakdown'],
    queryFn: async () => {
      const [mastering, mixing, distribution] = await Promise.all([
        supabase.from('user_mastering_subscriptions').select('*').eq('status', 'active'),
        supabase.from('user_mixing_subscriptions').select('*').eq('status', 'active'),
        supabase.from('user_distribution_subscriptions').select('*').eq('status', 'active')
      ]);
      return {
        mastering: mastering.data?.length || 0,
        mixing: mixing.data?.length || 0,
        distribution: distribution.data?.length || 0
      };
    }
  });

  const latestMetrics = analytics?.[analytics.length - 1];
  const previousMetrics = analytics?.[analytics.length - 2];
  
  const mrrGrowth = latestMetrics && previousMetrics 
    ? ((latestMetrics.mrr - previousMetrics.mrr) / previousMetrics.mrr * 100).toFixed(1)
    : 0;

  const chartData = analytics?.map(item => ({
    month: new Date(item.period_start).toLocaleDateString('en-US', { month: 'short' }),
    MRR: Number(item.mrr),
    'New MRR': Number(item.new_mrr),
    'Churn MRR': Number(item.churn_mrr),
    'Net MRR': Number(item.new_mrr) - Number(item.churn_mrr)
  })) || [];

  const serviceBreakdown = [
    { name: 'Mastering', value: subscriptions?.mastering || 0, color: '#8b5cf6' },
    { name: 'Mixing', value: subscriptions?.mixing || 0, color: '#3b82f6' },
    { name: 'Distribution', value: subscriptions?.distribution || 0, color: '#10b981' }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${latestMetrics?.mrr?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {Number(mrrGrowth) >= 0 ? (
                <><TrendingUp className="h-3 w-3 text-green-500" /> +{mrrGrowth}%</>
              ) : (
                <><TrendingDown className="h-3 w-3 text-red-500" /> {mrrGrowth}%</>
              )}
              {' '}from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ARR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${latestMetrics?.arr?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Annual Recurring Revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ARPU</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${latestMetrics?.average_revenue_per_user?.toFixed(2) || 0}</div>
            <p className="text-xs text-muted-foreground">Average Revenue Per User</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(latestMetrics?.churn_rate || 0).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Monthly churn rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="mrr" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mrr">MRR Trends</TabsTrigger>
          <TabsTrigger value="growth">Growth Analysis</TabsTrigger>
          <TabsTrigger value="breakdown">Service Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="mrr">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Recurring Revenue</CardTitle>
              <CardDescription>Track your MRR growth over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="MRR" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth">
          <Card>
            <CardHeader>
              <CardTitle>MRR Growth Components</CardTitle>
              <CardDescription>New MRR, Expansion, and Churn</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="New MRR" fill="#10b981" />
                  <Bar dataKey="Churn MRR" fill="#ef4444" />
                  <Bar dataKey="Net MRR" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Service</CardTitle>
              <CardDescription>Subscription distribution across services</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={serviceBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {serviceBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
