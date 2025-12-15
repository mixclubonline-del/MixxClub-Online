import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Wallet, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format } from 'date-fns';
import { DataTablePagination } from '@/components/ui/data-table-pagination';

export default function AdminFinancial() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch payments
  const { data: paymentsData, isLoading: loadingPayments } = useQuery({
    queryKey: ['admin-financial-payments', currentPage, pageSize],
    queryFn: async () => {
      const from = (currentPage - 1) * pageSize;
      const { data, error, count } = await supabase
        .from('payments')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, from + pageSize - 1);
      if (error) throw error;
      return { payments: data || [], total: count || 0 };
    },
    enabled: activeTab === 'payments',
  });

  // Fetch payout requests
  const { data: payoutsData, isLoading: loadingPayouts } = useQuery({
    queryKey: ['admin-financial-payouts', currentPage, pageSize],
    queryFn: async () => {
      const from = (currentPage - 1) * pageSize;
      const { data, error, count } = await supabase
        .from('payout_requests')
        .select('*', { count: 'exact' })
        .order('requested_at', { ascending: false })
        .range(from, from + pageSize - 1);
      if (error) throw error;
      return { payouts: data || [], total: count || 0 };
    },
    enabled: activeTab === 'payouts',
  });

  // Fetch engineer earnings
  const { data: earningsData, isLoading: loadingEarnings } = useQuery({
    queryKey: ['admin-financial-earnings', currentPage, pageSize],
    queryFn: async () => {
      const from = (currentPage - 1) * pageSize;
      const { data, error, count } = await supabase
        .from('engineer_earnings')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, from + pageSize - 1);
      if (error) throw error;
      return { earnings: data || [], total: count || 0 };
    },
    enabled: activeTab === 'earnings',
  });

  // Financial stats
  const { data: stats } = useQuery({
    queryKey: ['admin-financial-stats'],
    queryFn: async () => {
      const [paymentsRes, payoutsRes, earningsRes, subscriptionsRes] = await Promise.all([
        supabase.from('payments').select('amount, status'),
        supabase.from('payout_requests').select('amount, status'),
        supabase.from('engineer_earnings').select('amount'),
        supabase.from('user_subscriptions').select('price_paid, status'),
      ]);

      const completedPayments = paymentsRes.data?.filter(p => p.status === 'completed') || [];
      const pendingPayouts = payoutsRes.data?.filter(p => p.status === 'pending') || [];
      const activeSubscriptions = subscriptionsRes.data?.filter(s => s.status === 'active') || [];

      return {
        totalRevenue: completedPayments.reduce((sum, p) => sum + Number(p.amount), 0),
        pendingPayouts: pendingPayouts.reduce((sum, p) => sum + Number(p.amount), 0),
        totalEarnings: earningsRes.data?.reduce((sum, e) => sum + Number(e.amount), 0) || 0,
        subscriptionRevenue: activeSubscriptions.reduce((sum, s) => sum + Number(s.price_paid || 0), 0),
        paymentCount: paymentsRes.data?.length || 0,
        pendingPayoutCount: pendingPayouts.length,
        activeSubscriptionCount: activeSubscriptions.length,
      };
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-500/10 text-green-500">Completed</Badge>;
      case 'pending': return <Badge className="bg-yellow-500/10 text-yellow-500">Pending</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      case 'processing': return <Badge className="bg-blue-500/10 text-blue-500">Processing</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'payments': return { total: paymentsData?.total || 0, loading: loadingPayments };
      case 'payouts': return { total: payoutsData?.total || 0, loading: loadingPayouts };
      case 'earnings': return { total: earningsData?.total || 0, loading: loadingEarnings };
      default: return { total: 0, loading: false };
    }
  };

  const currentData = getCurrentData();
  const totalPages = Math.ceil(currentData.total / pageSize);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Financial Management</h1>
            <p className="text-muted-foreground">
              Monitor revenue, payments, and payouts
            </p>
          </div>
        </div>

        {/* Financial Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.totalRevenue?.toFixed(2) || '0.00'}</div>
              <div className="flex items-center text-xs text-green-500 mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                {stats?.paymentCount || 0} payments
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
              <Wallet className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.pendingPayouts?.toFixed(2) || '0.00'}</div>
              <div className="flex items-center text-xs text-yellow-500 mt-1">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                {stats?.pendingPayoutCount || 0} pending
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Engineer Earnings</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.totalEarnings?.toFixed(2) || '0.00'}</div>
              <p className="text-xs text-muted-foreground mt-1">Total distributed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Subscription Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.subscriptionRevenue?.toFixed(2) || '0.00'}</div>
              <div className="flex items-center text-xs text-blue-500 mt-1">
                {stats?.activeSubscriptionCount || 0} active
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Records</CardTitle>
            <CardDescription>View payments, payouts, and earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }}>
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="payouts">Payouts</TabsTrigger>
                <TabsTrigger value="earnings">Earnings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 pt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Revenue Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Direct Payments</span>
                        <span className="font-medium">${stats?.totalRevenue?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Subscriptions</span>
                        <span className="font-medium">${stats?.subscriptionRevenue?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between items-center font-bold">
                        <span>Total</span>
                        <span className="text-green-500">
                          ${((stats?.totalRevenue || 0) + (stats?.subscriptionRevenue || 0)).toFixed(2)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Payout Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Pending</span>
                        <span className="font-medium text-yellow-500">${stats?.pendingPayouts?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Distributed</span>
                        <span className="font-medium text-green-500">${stats?.totalEarnings?.toFixed(2) || '0.00'}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="payments" className="space-y-3 pt-4">
                {currentData.loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : paymentsData?.payments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No payments found</div>
                ) : (
                  paymentsData?.payments.map((payment) => (
                    <div key={payment.id} className="flex items-center gap-4 p-4 rounded-lg border">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">${Number(payment.amount).toFixed(2)} {payment.currency}</span>
                          {getStatusBadge(payment.status || 'pending')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          User: {payment.user_id.slice(0, 8)}... • {format(new Date(payment.created_at), 'MMM d, yyyy HH:mm')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="payouts" className="space-y-3 pt-4">
                {currentData.loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : payoutsData?.payouts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No payout requests found</div>
                ) : (
                  payoutsData?.payouts.map((payout) => (
                    <div key={payout.id} className="flex items-center gap-4 p-4 rounded-lg border">
                      <Wallet className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">${Number(payout.amount).toFixed(2)} {payout.currency}</span>
                          {getStatusBadge(payout.status || 'pending')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {payout.payment_method || 'Not specified'} • {format(new Date(payout.requested_at), 'MMM d, yyyy HH:mm')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="earnings" className="space-y-3 pt-4">
                {currentData.loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : earningsData?.earnings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No earnings found</div>
                ) : (
                  earningsData?.earnings.map((earning) => (
                    <div key={earning.id} className="flex items-center gap-4 p-4 rounded-lg border">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">${Number(earning.amount).toFixed(2)} {earning.currency}</span>
                          {getStatusBadge(earning.status || 'pending')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Engineer: {earning.engineer_id.slice(0, 8)}... • {format(new Date(earning.created_at), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>

            {activeTab !== 'overview' && (
              <DataTablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={currentData.total}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
