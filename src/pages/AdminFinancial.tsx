import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AIFinancialController } from '@/components/admin/AIFinancialController';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { DollarSign, TrendingUp, Users, CreditCard, Calendar, Sparkles } from 'lucide-react';

interface FinancialStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalPayouts: number;
  pendingPayouts: number;
  activeSubscriptions: number;
  totalTransactions: number;
}

export default function AdminFinancial() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<FinancialStats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalPayouts: 0,
    pendingPayouts: 0,
    activeSubscriptions: 0,
    totalTransactions: 0,
  });
  const [dataLoading, setDataLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      checkAdminStatus();
      fetchFinancialData();
    }
  }, [user, loading, navigate, timeRange]);

  const checkAdminStatus = async () => {
    const { data, error } = await supabase.rpc('is_admin', { user_uuid: user?.id });
    if (error || !data) {
      navigate('/');
    }
  };

  const fetchFinancialData = async () => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));

      const [paymentsRes, payoutsRes, subscriptionsRes] = await Promise.all([
        supabase
          .from('payments')
          .select('amount, created_at')
          .eq('status', 'completed'),
        supabase
          .from('payout_requests')
          .select('amount, status'),
        supabase
          .from('user_mixing_subscriptions')
          .select('id')
          .eq('status', 'active'),
      ]);

      if (paymentsRes.error) throw paymentsRes.error;
      if (payoutsRes.error) throw payoutsRes.error;

      const payments = paymentsRes.data || [];
      const payouts = payoutsRes.data || [];
      
      const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const monthlyRevenue = payments
        .filter((p) => new Date(p.created_at) >= startDate)
        .reduce((sum, p) => sum + Number(p.amount), 0);
      
      const totalPayouts = payouts
        .filter((p) => p.status === 'completed')
        .reduce((sum, p) => sum + Number(p.amount), 0);
      
      const pendingPayouts = payouts
        .filter((p) => p.status === 'pending')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      setStats({
        totalRevenue,
        monthlyRevenue,
        totalPayouts,
        pendingPayouts,
        activeSubscriptions: subscriptionsRes.data?.length || 0,
        totalTransactions: payments.length,
      });
    } catch (error: any) {
      toast.error('Failed to fetch financial data');
    } finally {
      setDataLoading(false);
    }
  };

  if (loading || dataLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Financial Management</h1>
            <p className="text-muted-foreground">
              AI-powered financial insights and analytics
            </p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="ai" className="space-y-4">
          <TabsList>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="overview">Financial Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-4">
            <AIFinancialController />
          </TabsContent>

          <TabsContent value="overview" className="space-y-4">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">All time revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Period Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Last {timeRange} days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalPayouts.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Completed payouts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
              <CreditCard className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.pendingPayouts.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
              <p className="text-xs text-muted-foreground">Current subscribers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions}</div>
              <p className="text-xs text-muted-foreground">Completed payments</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
            <CardDescription>Key metrics and insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Net Revenue</p>
                <p className="text-2xl font-bold text-green-500">
                  ${(stats.totalRevenue - stats.totalPayouts).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  Revenue after payouts
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Average Transaction</p>
                <p className="text-2xl font-bold">
                  ${stats.totalTransactions > 0
                    ? (stats.totalRevenue / stats.totalTransactions).toFixed(2)
                    : '0.00'}
                </p>
                <p className="text-xs text-muted-foreground">Per transaction</p>
              </div>
            </div>
          </CardContent>
        </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
