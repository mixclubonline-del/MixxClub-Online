import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign, TrendingUp, CreditCard, ArrowUpRight, AlertTriangle,
  RefreshCw, Shield, BarChart3, Users, Loader2, ArrowDownRight, Receipt, Zap
} from 'lucide-react';
import { AdminStripeCommandCenter } from './AdminStripeCommandCenter';
import { format, subDays, startOfDay } from 'date-fns';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { toast } from 'sonner';

interface PaymentRow {
  id: string;
  amount: number;
  status: string;
  payment_type: string;
  package_type: string | null;
  currency: string;
  created_at: string;
  completed_at: string | null;
  refund_amount: number | null;
  user_id: string;
  stripe_customer_id: string | null;
}

interface PayoutRow {
  id: string;
  gross_amount: number;
  platform_fee: number;
  net_amount: number;
  status: string;
  created_at: string;
  engineer_id: string;
}

interface DisputeEvent {
  id: string;
  event_type: string;
  severity: string;
  description: string;
  details: any;
  created_at: string;
  is_resolved: boolean;
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(142 71% 45%)',
  'hsl(48 96% 53%)',
  'hsl(262 83% 58%)',
  'hsl(0 84% 60%)',
  'hsl(199 89% 48%)',
];

export const AdminRevenueHub = () => {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [disputes, setDisputes] = useState<DisputeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState(false);
  const [reconciliationReport, setReconciliationReport] = useState<any>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [
        { data: paymentsData },
        { data: payoutsData },
        { data: disputeData },
      ] = await Promise.all([
        supabase
          .from('payments')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(500),
        supabase
          .from('engineer_payouts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200),
        supabase
          .from('admin_security_events')
          .select('*')
          .in('event_type', ['stripe_dispute', 'payment_failed'])
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      setPayments((paymentsData as PaymentRow[]) || []);
      setPayouts((payoutsData as PayoutRow[]) || []);
      setDisputes((disputeData as DisputeEvent[]) || []);
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
      toast.error('Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  const runReconciliation = async () => {
    setReconciling(true);
    try {
      const { data, error } = await supabase.functions.invoke('financial-reconciliation');
      if (error) throw error;
      setReconciliationReport(data);
      toast.success('Reconciliation complete');
    } catch (err) {
      console.error('Reconciliation failed:', err);
      toast.error('Reconciliation failed');
    } finally {
      setReconciling(false);
    }
  };

  // --- Derived metrics ---
  const metrics = useMemo(() => {
    const completed = payments.filter(p => p.status === 'completed');
    const totalRevenue = completed.reduce((s, p) => s + (p.amount || 0), 0);
    const pendingPayments = payments.filter(p => p.status === 'pending');
    const refunded = payments.filter(p => p.status === 'refunded');
    const totalRefunds = refunded.reduce((s, p) => s + (p.refund_amount || p.amount || 0), 0);
    const totalPayouts = payouts.filter(p => p.status === 'completed').reduce((s, p) => s + (p.net_amount || 0), 0);
    const platformFees = payouts.filter(p => p.status === 'completed').reduce((s, p) => s + (p.platform_fee || 0), 0);
    const netPlatformRevenue = totalRevenue - totalPayouts - totalRefunds;
    const openDisputes = disputes.filter(d => d.event_type === 'stripe_dispute' && !d.is_resolved).length;
    const failedPayments = disputes.filter(d => d.event_type === 'payment_failed').length;

    // Subscriptions vs one-time
    const subscriptionRevenue = completed.filter(p => p.payment_type === 'subscription').reduce((s, p) => s + (p.amount || 0), 0);
    const oneTimeRevenue = totalRevenue - subscriptionRevenue;

    // Last 7 days vs previous 7 days
    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);
    const fourteenDaysAgo = subDays(now, 14);
    const thisWeek = completed.filter(p => new Date(p.created_at) >= sevenDaysAgo).reduce((s, p) => s + (p.amount || 0), 0);
    const lastWeek = completed.filter(p => {
      const d = new Date(p.created_at);
      return d >= fourteenDaysAgo && d < sevenDaysAgo;
    }).reduce((s, p) => s + (p.amount || 0), 0);
    const weeklyTrend = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : (thisWeek > 0 ? 100 : 0);

    return {
      totalRevenue, totalPayouts, totalRefunds, netPlatformRevenue, platformFees,
      pendingCount: pendingPayments.length, refundedCount: refunded.length,
      openDisputes, failedPayments, subscriptionRevenue, oneTimeRevenue,
      thisWeek, lastWeek, weeklyTrend, totalTransactions: payments.length,
    };
  }, [payments, payouts, disputes]);

  // --- Chart data ---
  const revenueChartData = useMemo(() => {
    const last30 = Array.from({ length: 30 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 29 - i));
      return { date, dateStr: format(date, 'MMM d'), revenue: 0, payouts: 0, refunds: 0 };
    });

    const completed = payments.filter(p => p.status === 'completed');
    completed.forEach(p => {
      const day = startOfDay(new Date(p.created_at));
      const entry = last30.find(d => d.date.getTime() === day.getTime());
      if (entry) entry.revenue += p.amount || 0;
    });

    payouts.filter(p => p.status === 'completed').forEach(p => {
      const day = startOfDay(new Date(p.created_at));
      const entry = last30.find(d => d.date.getTime() === day.getTime());
      if (entry) entry.payouts += p.net_amount || 0;
    });

    payments.filter(p => p.status === 'refunded').forEach(p => {
      const day = startOfDay(new Date(p.created_at));
      const entry = last30.find(d => d.date.getTime() === day.getTime());
      if (entry) entry.refunds += (p.refund_amount || p.amount || 0);
    });

    return last30;
  }, [payments, payouts]);

  const revenueByType = useMemo(() => {
    const typeMap: Record<string, number> = {};
    payments.filter(p => p.status === 'completed').forEach(p => {
      const type = p.package_type || p.payment_type || 'other';
      typeMap[type] = (typeMap[type] || 0) + (p.amount || 0);
    });
    return Object.entries(typeMap)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value);
  }, [payments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<DollarSign className="w-5 h-5" />}
          iconBg="bg-green-500/10"
          iconColor="text-green-500"
          value={`$${metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          label="Total Revenue"
          badge={metrics.weeklyTrend !== 0 ? (
            <span className={`text-xs flex items-center gap-0.5 ${metrics.weeklyTrend > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {metrics.weeklyTrend > 0 ? <TrendingUp className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(metrics.weeklyTrend)}% vs last week
            </span>
          ) : null}
        />
        <StatCard
          icon={<ArrowUpRight className="w-5 h-5" />}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-500"
          value={`$${metrics.totalPayouts.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          label="Engineer Payouts"
        />
        <StatCard
          icon={<Receipt className="w-5 h-5" />}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-500"
          value={`$${metrics.netPlatformRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          label="Net Platform Revenue"
        />
        <StatCard
          icon={<CreditCard className="w-5 h-5" />}
          iconBg="bg-yellow-500/10"
          iconColor="text-yellow-500"
          value={metrics.totalTransactions.toLocaleString()}
          label="Total Transactions"
          badge={metrics.pendingCount > 0 ? (
            <span className="text-xs text-yellow-400">{metrics.pendingCount} pending</span>
          ) : null}
        />
      </div>

      {/* Alert Bar */}
      {(metrics.openDisputes > 0 || metrics.failedPayments > 0 || metrics.refundedCount > 0) && (
        <div className="flex flex-wrap gap-3">
          {metrics.openDisputes > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <Shield className="w-4 h-4" />
              {metrics.openDisputes} open dispute{metrics.openDisputes > 1 ? 's' : ''} — immediate action required
            </div>
          )}
          {metrics.failedPayments > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
              <AlertTriangle className="w-4 h-4" />
              {metrics.failedPayments} recent payment failure{metrics.failedPayments > 1 ? 's' : ''}
            </div>
          )}
          {metrics.refundedCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-muted-foreground text-sm">
              <RefreshCw className="w-4 h-4" />
              ${metrics.totalRefunds.toLocaleString(undefined, { minimumFractionDigits: 2 })} in refunds ({metrics.refundedCount})
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview" className="gap-1.5"><BarChart3 className="w-4 h-4" /> Overview</TabsTrigger>
          <TabsTrigger value="transactions" className="gap-1.5"><CreditCard className="w-4 h-4" /> Transactions</TabsTrigger>
          <TabsTrigger value="payouts" className="gap-1.5"><Users className="w-4 h-4" /> Payouts</TabsTrigger>
          <TabsTrigger value="reconciliation" className="gap-1.5"><Shield className="w-4 h-4" /> Reconciliation</TabsTrigger>
          <TabsTrigger value="stripe" className="gap-1.5"><Zap className="w-4 h-4" /> Stripe</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <Card className="lg:col-span-2 bg-background/50 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Revenue & Payouts (30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueChartData}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="payoutGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(199 89% 48%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(199 89% 48%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="dateStr" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} interval={4} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`]}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(142 71% 45%)" fill="url(#revenueGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="payouts" name="Payouts" stroke="hsl(199 89% 48%)" fill="url(#payoutGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="refunds" name="Refunds" stroke="hsl(0 84% 60%)" fill="none" strokeWidth={1.5} strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue by Type */}
            <Card className="bg-background/50 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Revenue by Type</CardTitle>
              </CardHeader>
              <CardContent>
                {revenueByType.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No data</p>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={revenueByType} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2}>
                          {revenueByType.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-2">
                      {revenueByType.map((item, i) => (
                        <div key={item.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                            <span className="capitalize text-muted-foreground">{item.name}</span>
                          </div>
                          <span className="font-medium text-foreground">${item.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Subscription vs One-time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-background/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <RefreshCw className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">${metrics.subscriptionRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-muted-foreground">Subscription Revenue (MRR)</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-background/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <DollarSign className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">${metrics.oneTimeRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-muted-foreground">One-Time Revenue</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card className="bg-background/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Payments</CardTitle>
              <Button variant="ghost" size="sm" onClick={fetchAllData}>
                <RefreshCw className="w-4 h-4 mr-1" /> Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-left">
                      <th className="pb-2 font-medium text-muted-foreground">Amount</th>
                      <th className="pb-2 font-medium text-muted-foreground">Type</th>
                      <th className="pb-2 font-medium text-muted-foreground">Status</th>
                      <th className="pb-2 font-medium text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">No payments recorded</td></tr>
                    ) : (
                      payments.slice(0, 30).map(payment => (
                        <tr key={payment.id} className="border-b border-border/20">
                          <td className="py-2.5 font-medium">
                            ${(payment.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            {payment.refund_amount ? (
                              <span className="text-xs text-red-400 ml-1">(-${payment.refund_amount})</span>
                            ) : null}
                          </td>
                          <td className="py-2.5 capitalize text-muted-foreground">
                            {payment.package_type || payment.payment_type || 'payment'}
                          </td>
                          <td className="py-2.5">
                            <StatusBadge status={payment.status} />
                          </td>
                          <td className="py-2.5 text-muted-foreground">
                            {format(new Date(payment.created_at), 'MMM d, yyyy')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              icon={<DollarSign className="w-5 h-5" />}
              iconBg="bg-green-500/10"
              iconColor="text-green-500"
              value={`$${payouts.filter(p => p.status === 'completed').reduce((s, p) => s + (p.gross_amount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              label="Gross Payouts"
            />
            <StatCard
              icon={<Receipt className="w-5 h-5" />}
              iconBg="bg-primary/10"
              iconColor="text-primary"
              value={`$${metrics.platformFees.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              label="Platform Fees Collected"
            />
            <StatCard
              icon={<CreditCard className="w-5 h-5" />}
              iconBg="bg-yellow-500/10"
              iconColor="text-yellow-500"
              value={payouts.filter(p => p.status === 'pending').length.toString()}
              label="Pending Payouts"
            />
          </div>

          <Card className="bg-background/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Engineer Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-left">
                      <th className="pb-2 font-medium text-muted-foreground">Gross</th>
                      <th className="pb-2 font-medium text-muted-foreground">Platform Fee</th>
                      <th className="pb-2 font-medium text-muted-foreground">Net</th>
                      <th className="pb-2 font-medium text-muted-foreground">Status</th>
                      <th className="pb-2 font-medium text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No payouts recorded</td></tr>
                    ) : (
                      payouts.slice(0, 25).map(payout => (
                        <tr key={payout.id} className="border-b border-border/20">
                          <td className="py-2.5">${(payout.gross_amount || 0).toFixed(2)}</td>
                          <td className="py-2.5 text-muted-foreground">${(payout.platform_fee || 0).toFixed(2)}</td>
                          <td className="py-2.5 font-medium">${(payout.net_amount || 0).toFixed(2)}</td>
                          <td className="py-2.5"><StatusBadge status={payout.status} /></td>
                          <td className="py-2.5 text-muted-foreground">{format(new Date(payout.created_at), 'MMM d, yyyy')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reconciliation Tab */}
        <TabsContent value="reconciliation" className="space-y-6">
          <Card className="bg-background/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Financial Reconciliation</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Cross-check payments, payouts, and subscriptions for discrepancies
                </p>
              </div>
              <Button onClick={runReconciliation} disabled={reconciling} size="sm">
                {reconciling ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Shield className="w-4 h-4 mr-1" />}
                Run Reconciliation
              </Button>
            </CardHeader>
            <CardContent>
              {reconciliationReport ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <MiniStat label="Total Revenue" value={`$${reconciliationReport.summary.total_revenue.toLocaleString()}`} />
                    <MiniStat label="Total Payouts" value={`$${reconciliationReport.summary.total_payouts.toLocaleString()}`} />
                    <MiniStat label="Platform Earnings" value={`$${reconciliationReport.summary.platform_earnings.toLocaleString()}`} />
                    <MiniStat label="Commission Rate" value={reconciliationReport.summary.effective_commission_rate} />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <MiniStat label="Payments Processed" value={reconciliationReport.summary.total_payments_processed} />
                    <MiniStat label="Active Subscriptions" value={reconciliationReport.summary.active_subscriptions} />
                    <MiniStat label="Discrepancies" value={reconciliationReport.summary.discrepancies_found} highlight={reconciliationReport.summary.discrepancies_found > 0} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Generated at {format(new Date(reconciliationReport.generated_at), 'PPpp')}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  Click "Run Reconciliation" to generate a financial health report.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Disputes & Alerts */}
          {disputes.length > 0 && (
            <Card className="bg-background/50 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  Disputes & Payment Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {disputes.map(event => (
                    <div key={event.id} className="flex items-start justify-between py-2 border-b border-border/20 last:border-0">
                      <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-md mt-0.5 ${
                          event.severity === 'critical' ? 'bg-destructive/10 text-destructive' :
                          event.severity === 'high' ? 'bg-orange-500/10 text-orange-400' :
                          'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          {event.event_type === 'stripe_dispute' ? <Shield className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{event.description}</p>
                          <p className="text-xs text-muted-foreground capitalize">{event.severity} · {event.event_type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <StatusBadge status={event.is_resolved ? 'resolved' : 'open'} />
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(event.created_at), 'MMM d')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Stripe Command Center Tab */}
        <TabsContent value="stripe" className="space-y-6">
          <AdminStripeCommandCenter />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// --- Helper components ---

function StatCard({ icon, iconBg, iconColor, value, label, badge }: {
  icon: React.ReactNode; iconBg: string; iconColor: string;
  value: string; label: string; badge?: React.ReactNode;
}) {
  return (
    <Card className="bg-background/50 backdrop-blur-sm border-border/50">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${iconBg}`}>
          <span className={iconColor}>{icon}</span>
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold text-foreground truncate">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
          {badge}
        </div>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-3 ${highlight ? 'bg-destructive/10 border border-destructive/20' : 'bg-muted/50'}`}>
      <p className={`text-lg font-bold ${highlight ? 'text-destructive' : 'text-foreground'}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: 'bg-green-500/20 text-green-400',
    pending: 'bg-yellow-500/20 text-yellow-400',
    refunded: 'bg-red-500/20 text-red-400',
    open: 'bg-red-500/20 text-red-400',
    resolved: 'bg-green-500/20 text-green-400',
    past_due: 'bg-orange-500/20 text-orange-400',
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${styles[status] || 'bg-muted text-muted-foreground'}`}>
      {status}
    </span>
  );
}
