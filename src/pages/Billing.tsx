/**
 * Billing — Unified billing hub: subscription, payment history, payout history.
 */

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  CreditCard, Receipt, Wallet, Crown, ArrowUpRight,
  CheckCircle2, Clock, XCircle, AlertCircle, Download,
} from 'lucide-react';
import { useSubscriptionManagement } from '@/hooks/useSubscriptionManagement';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { format } from 'date-fns';

const PAGE_SIZE = 20;

interface PaymentRow {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_type: string;
  package_type: string | null;
  created_at: string;
  completed_at: string | null;
  stripe_payment_intent_id: string | null;
}

interface PayoutRow {
  id: string;
  gross_amount: number;
  platform_fee: number;
  net_amount: number;
  status: string;
  created_at: string;
  processed_at: string | null;
  stripe_transfer_id: string | null;
}

const statusBadge = (status: string) => {
  switch (status) {
    case 'completed':
    case 'paid':
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>;
    case 'pending':
    case 'processing':
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    case 'refunded':
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Refunded</Badge>;
    case 'failed':
    case 'retry_pending':
      return <Badge className="bg-destructive/20 text-destructive border-destructive/30"><AlertCircle className="w-3 h-3 mr-1" />{status === 'retry_pending' ? 'Retrying' : 'Failed'}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function Billing() {
  const { currentSubscription, loading: subLoading, openCustomerPortal } = useSubscriptionManagement();
  const { user, userRole } = useAuth();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('subscription');

  // Payment history
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentPage, setPaymentPage] = useState(0);
  const [hasMorePayments, setHasMorePayments] = useState(true);

  // Payout history (engineers)
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [payoutPage, setPayoutPage] = useState(0);
  const [hasMorePayouts, setHasMorePayouts] = useState(true);

  const isEngineer = userRole === 'engineer';

  const loadPayments = useCallback(async (page: number) => {
    if (!user) return;
    setPaymentsLoading(true);
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from('payments')
      .select('id, amount, currency, status, payment_type, package_type, created_at, completed_at, stripe_payment_intent_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!error && data) {
      setPayments(prev => page === 0 ? data : [...prev, ...data]);
      setHasMorePayments(data.length === PAGE_SIZE);
    }
    setPaymentsLoading(false);
  }, [user]);

  const loadPayouts = useCallback(async (page: number) => {
    if (!user) return;
    setPayoutsLoading(true);
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from('engineer_payouts')
      .select('id, gross_amount, platform_fee, net_amount, status, created_at, processed_at, stripe_transfer_id')
      .eq('engineer_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!error && data) {
      setPayouts(prev => page === 0 ? data : [...prev, ...data]);
      setHasMorePayouts(data.length === PAGE_SIZE);
    }
    setPayoutsLoading(false);
  }, [user]);

  useEffect(() => {
    if (activeTab === 'payments') loadPayments(0);
    if (activeTab === 'payouts' && isEngineer) loadPayouts(0);
  }, [activeTab, loadPayments, loadPayouts, isEngineer]);

  const tierLabel = currentSubscription?.tier
    ? currentSubscription.tier.charAt(0).toUpperCase() + currentSubscription.tier.slice(1)
    : 'Free';

  const tabOptions = [
    { value: 'subscription', label: 'Subscription', icon: Crown },
    { value: 'payments', label: 'Payments', icon: Receipt },
    ...(isEngineer ? [{ value: 'payouts', label: 'Payouts', icon: Wallet }] : []),
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription, view payment history, and track payouts.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {isMobile ? (
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select tab" />
            </SelectTrigger>
            <SelectContent>
              {tabOptions.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <TabsList>
            {tabOptions.map(t => (
              <TabsTrigger key={t.value} value={t.value} className="gap-2">
                <t.icon className="w-4 h-4" />
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        )}

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-4">
          {subLoading ? (
            <Card><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-primary" />
                      {tierLabel} Plan
                    </CardTitle>
                    <CardDescription>
                      {currentSubscription?.subscribed
                        ? `Active until ${currentSubscription.subscriptionEnd ? format(new Date(currentSubscription.subscriptionEnd), 'MMM d, yyyy') : 'renewal'}`
                        : 'You are on the free tier.'}
                    </CardDescription>
                  </div>
                  {currentSubscription?.subscribed ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">Free</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-3">
                {currentSubscription?.subscribed ? (
                  <Button onClick={openCustomerPortal} className="gap-2">
                    <CreditCard className="w-4 h-4" />
                    Manage Subscription
                    <ArrowUpRight className="w-3 h-3" />
                  </Button>
                ) : (
                  <Button asChild className="gap-2">
                    <a href="/pricing">
                      <Crown className="w-4 h-4" />
                      Upgrade Plan
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>All charges associated with your account.</CardDescription>
            </CardHeader>
            <CardContent>
              {paymentsLoading && payments.length === 0 ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Receipt className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>No payments yet.</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map(p => (
                        <TableRow key={p.id}>
                          <TableCell className="text-sm">
                            {format(new Date(p.created_at), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="text-sm capitalize">
                            {p.package_type || p.payment_type || '—'}
                          </TableCell>
                          <TableCell className="font-medium">
                            ${p.amount.toFixed(2)} {p.currency}
                          </TableCell>
                          <TableCell>{statusBadge(p.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {hasMorePayments && (
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      disabled={paymentsLoading}
                      onClick={() => {
                        const next = paymentPage + 1;
                        setPaymentPage(next);
                        loadPayments(next);
                      }}
                    >
                      {paymentsLoading ? 'Loading…' : 'Load More'}
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payout History Tab (engineers) */}
        {isEngineer && (
          <TabsContent value="payouts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payout History</CardTitle>
                <CardDescription>Transfers to your connected bank account.</CardDescription>
              </CardHeader>
              <CardContent>
                {payoutsLoading && payouts.length === 0 ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : payouts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Wallet className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p>No payouts yet.</p>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Gross</TableHead>
                          <TableHead>Fee</TableHead>
                          <TableHead>Net</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payouts.map(p => (
                          <TableRow key={p.id}>
                            <TableCell className="text-sm">
                              {format(new Date(p.created_at), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell>${p.gross_amount.toFixed(2)}</TableCell>
                            <TableCell className="text-muted-foreground">
                              -${p.platform_fee.toFixed(2)}
                            </TableCell>
                            <TableCell className="font-medium">
                              ${p.net_amount.toFixed(2)}
                            </TableCell>
                            <TableCell>{statusBadge(p.status)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {hasMorePayouts && (
                      <Button
                        variant="outline"
                        className="w-full mt-4"
                        disabled={payoutsLoading}
                        onClick={() => {
                          const next = payoutPage + 1;
                          setPayoutPage(next);
                          loadPayouts(next);
                        }}
                      >
                        {payoutsLoading ? 'Loading…' : 'Load More'}
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
