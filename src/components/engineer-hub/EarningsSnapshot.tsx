import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Award,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface Earning {
  id: string;
  amount: number;
  base_amount: number | null;
  bonus_amount: number | null;
  status: string;
  payment_date: string | null;
  created_at: string;
  project_id?: string;
}

interface EarningsSummary {
  total: number;
  pending: number;
  paid: number;
  bonuses: number;
  previousTotal: number;
}

export default function EarningsSnapshot() {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [summary, setSummary] = useState<EarningsSummary>({
    total: 0,
    pending: 0,
    paid: 0,
    bonuses: 0,
    previousTotal: 0
  });
  const [chartData, setChartData] = useState<Array<{ date: string; amount: number }>>([]);
  const [period, setPeriod] = useState<'30d' | '12m'>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEarnings();
    }
  }, [user, period]);

  const fetchEarnings = async () => {
    try {
      const startDate = period === '30d' 
        ? subDays(new Date(), 30) 
        : subMonths(new Date(), 12);

      const { data, error } = await supabase
        .from('engineer_earnings')
        .select('*')
        .eq('engineer_id', user?.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      setEarnings(data || []);
      calculateSummary(data || []);
      generateChartData(data || []);
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = async (data: Earning[]) => {
    const total = data.reduce((sum, e) => sum + (e.amount || 0), 0);
    const pending = data.filter(e => e.status === 'pending').reduce((sum, e) => sum + (e.amount || 0), 0);
    const paid = data.filter(e => e.status === 'paid').reduce((sum, e) => sum + (e.amount || 0), 0);
    const bonuses = data.reduce((sum, e) => sum + (e.bonus_amount || 0), 0);

    // Fetch previous period for comparison
    const previousStart = period === '30d' 
      ? subDays(new Date(), 60) 
      : subMonths(new Date(), 24);
    const previousEnd = period === '30d' 
      ? subDays(new Date(), 30) 
      : subMonths(new Date(), 12);

    const { data: previousData } = await supabase
      .from('engineer_earnings')
      .select('amount')
      .eq('engineer_id', user?.id)
      .gte('created_at', previousStart.toISOString())
      .lt('created_at', previousEnd.toISOString());

    const previousTotal = (previousData || []).reduce((sum, e) => sum + (e.amount || 0), 0);

    setSummary({ total, pending, paid, bonuses, previousTotal });
  };

  const generateChartData = (data: Earning[]) => {
    const grouped = data.reduce((acc, earning) => {
      const date = format(new Date(earning.created_at), period === '30d' ? 'MMM d' : 'MMM yyyy');
      acc[date] = (acc[date] || 0) + (earning.amount || 0);
      return acc;
    }, {} as Record<string, number>);

    const chartArray = Object.entries(grouped).map(([date, amount]) => ({
      date,
      amount
    }));

    setChartData(chartArray);
  };

  const percentageChange = summary.previousTotal > 0 
    ? ((summary.total - summary.previousTotal) / summary.previousTotal) * 100 
    : 0;

  const isPositiveChange = percentageChange >= 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">${summary.total.toFixed(2)}</p>
                <div className={`flex items-center text-xs mt-1 ${isPositiveChange ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositiveChange ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  <span>{Math.abs(percentageChange).toFixed(1)}% vs last period</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-500">${summary.pending.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paid Out</p>
                <p className="text-2xl font-bold text-green-500">${summary.paid.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-full bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bonuses</p>
                <p className="text-2xl font-bold text-purple-500">${summary.bonuses.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-500/10">
                <Award className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Earnings Over Time</CardTitle>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as '30d' | '12m')}>
            <TabsList>
              <TabsTrigger value="30d">30 Days</TabsTrigger>
              <TabsTrigger value="12m">12 Months</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No earnings data for this period</p>
            </div>
          ) : (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Earnings']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1}
                    fill="url(#colorAmount)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {earnings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No transactions yet</p>
            </div>
          ) : (
            <ScrollArea className="h-[200px]">
              <div className="space-y-3">
                {earnings.slice(-10).reverse().map((earning) => (
                  <div
                    key={earning.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div>
                      <p className="font-medium">${earning.amount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(earning.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      earning.status === 'paid' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {earning.status}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
