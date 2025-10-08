import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRevenueAnalytics } from "@/hooks/useRevenueAnalytics";
import { TrendingUp, DollarSign, Calendar, Sparkles } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RevenueAnalytics = () => {
  const { snapshots, forecasts, generateForecast } = useRevenueAnalytics();

  const chartData = snapshots?.map(s => ({
    date: new Date(s.snapshot_date).toLocaleDateString(),
    revenue: s.total_revenue,
    expenses: s.total_expenses,
    net: s.net_income
  })) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Revenue Analytics</h1>
            <p className="text-muted-foreground">
              Track your financial performance and growth
            </p>
          </div>
          <Button onClick={() => generateForecast.mutate()} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Generate Forecast
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${snapshots?.[0]?.total_revenue?.toFixed(2) || '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${snapshots?.[0]?.net_income?.toFixed(2) || '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">After expenses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Forecast</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${forecasts?.[0]?.predicted_revenue?.toFixed(2) || '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">
                {forecasts?.[0]?.confidence_level && `${(forecasts[0].confidence_level * 100).toFixed(0)}% confidence`}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>90-day revenue history</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="net" stroke="hsl(var(--chart-2))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RevenueAnalytics;
