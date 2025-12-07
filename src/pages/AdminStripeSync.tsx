import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, RefreshCw, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Payment {
  id: string;
  stripe_payment_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  project_id: string | null;
  user_id: string;
}

interface Subscription {
  id: string;
  status: string;
  end_date: string;
  user_id: string;
  subscription_tier: string;
  price_paid: number;
}

export default function AdminStripeSync() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [paymentsRes, subscriptionsRes] = await Promise.all([
        supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('user_subscriptions').select('*').order('created_at', { ascending: false }).limit(50)
      ]);

      if (paymentsRes.data) setPayments(paymentsRes.data);
      if (subscriptionsRes.data) setSubscriptions(subscriptionsRes.data);
    } catch (error) {
      toast.error('Failed to fetch Stripe data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'succeeded':
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
      case 'canceled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
      case 'trialing':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'succeeded':
      case 'active':
        return 'default';
      case 'failed':
      case 'canceled':
        return 'destructive';
      case 'pending':
      case 'trialing':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const totalRevenue = payments
    .filter(p => p.status === 'succeeded')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Stripe Sync</h1>
            <p className="text-muted-foreground mt-2">
              Monitor payment processing and subscription status
            </p>
          </div>
          <Button onClick={fetchData} variant="outline" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Sync Now
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payments.length}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(totalRevenue / 100).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Successful payments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeSubscriptions}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscriptions.length}</div>
              <p className="text-xs text-muted-foreground">All records</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : payments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No payments found</p>
              ) : (
                <div className="space-y-3">
                  {payments.slice(0, 10).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(payment.status)}
                        <div>
                          <code className="text-xs bg-muted px-2 py-0.5 rounded">
                            {payment.stripe_payment_id?.substring(0, 20) || 'N/A'}...
                          </code>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(payment.created_at), 'MMM d, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(payment.status)}>{payment.status}</Badge>
                        <span className="font-medium">
                          ${(payment.amount / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : subscriptions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No subscriptions found</p>
              ) : (
                <div className="space-y-3">
                  {subscriptions.slice(0, 10).map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(sub.status)}
                        <div>
                          <p className="font-medium">{sub.subscription_tier || 'Subscription'}</p>
                          <p className="text-xs text-muted-foreground">
                            ${sub.price_paid?.toFixed(2) || '0.00'}/period
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={getStatusColor(sub.status)}>{sub.status}</Badge>
                        {sub.end_date && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Ends: {format(new Date(sub.end_date), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
