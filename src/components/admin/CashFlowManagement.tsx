import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { DollarSign, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";

export const CashFlowManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: forecasts, isLoading } = useQuery({
    queryKey: ['cash-flow-forecasts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_forecasts')
        .select('*')
        .eq('forecast_type', 'cash_flow')
        .order('forecast_date', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  const { data: currentBalance } = useQuery({
    queryKey: ['current-balance'],
    queryFn: async () => {
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed');
      
      const { data: payouts } = await supabase
        .from('payout_requests')
        .select('amount')
        .eq('status', 'completed');

      const revenue = payments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
      const expenses = payouts?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;

      return { revenue, expenses, balance: revenue - expenses };
    }
  });

  const generateForecast = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('financial-forecast', {
        body: { forecastType: 'cash_flow', days: 90 }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-flow-forecasts'] });
      toast({
        title: "Forecast Updated",
        description: "Cash flow forecast has been regenerated.",
      });
    },
    onError: () => {
      toast({
        title: "Forecast Failed",
        description: "Failed to generate cash flow forecast.",
        variant: "destructive"
      });
    }
  });

  const chartData = forecasts?.map(f => ({
    date: new Date(f.forecast_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    predicted: Number(f.predicted_value),
    lower: Number(f.confidence_interval_lower),
    upper: Number(f.confidence_interval_upper)
  })) || [];

  // Calculate runway (months until cash runs out)
  const monthlyBurn = currentBalance ? (currentBalance.expenses / 30) : 0;
  const runway = currentBalance && monthlyBurn > 0 ? Math.floor(currentBalance.balance / monthlyBurn) : Infinity;

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${currentBalance?.balance.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">Available cash</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${((currentBalance?.revenue || 0) / 30).toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">Daily average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${monthlyBurn.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">Daily burn rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Runway</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {runway === Infinity ? '∞' : `${runway}d`}
            </div>
            <p className="text-xs text-muted-foreground">
              {runway < 30 ? 'Critical' : runway < 90 ? 'Warning' : 'Healthy'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>90-Day Cash Flow Forecast</CardTitle>
              <CardDescription>AI-powered prediction with confidence intervals</CardDescription>
            </div>
            <Button 
              onClick={() => generateForecast.mutate()}
              disabled={generateForecast.isPending}
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${generateForecast.isPending ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              Loading forecast...
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="upper" 
                  stackId="1"
                  stroke="#3b82f6" 
                  fill="#3b82f620" 
                  name="Upper Bound"
                />
                <Area 
                  type="monotone" 
                  dataKey="predicted" 
                  stackId="2"
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  name="Predicted"
                />
                <Area 
                  type="monotone" 
                  dataKey="lower" 
                  stackId="3"
                  stroke="#3b82f6" 
                  fill="#3b82f620" 
                  name="Lower Bound"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex flex-col items-center justify-center gap-4">
              <p className="text-muted-foreground">No forecast data available</p>
              <Button onClick={() => generateForecast.mutate()}>
                Generate Forecast
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts */}
      {runway < 90 && runway !== Infinity && (
        <Card className="border-orange-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <CardTitle>Cash Flow Alert</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Your current runway is {runway} days. Consider taking action to improve cash flow:
            </p>
            <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground">
              <li>Accelerate collections from outstanding invoices</li>
              <li>Review and optimize operational expenses</li>
              <li>Consider additional financing options</li>
              <li>Focus on high-margin revenue streams</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
