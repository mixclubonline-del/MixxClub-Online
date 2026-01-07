import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  Wallet, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ArrowUpRight,
  CreditCard,
  Building
} from 'lucide-react';
import { format } from 'date-fns';

interface PayoutRequest {
  id: string;
  amount: number;
  status: string;
  payment_method: string;
  requested_at: string;
  processed_at: string | null;
}

interface PayoutManagementProps {
  engineerId: string;
  availableBalance: number;
}

const MINIMUM_PAYOUT = 50;

export function PayoutManagement({ engineerId, availableBalance }: PayoutManagementProps) {
  const { user } = useAuth();
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');

  useEffect(() => {
    fetchPayoutRequests();
  }, [engineerId]);

  const fetchPayoutRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('payout_requests')
        .select('*')
        .eq('user_id', engineerId)
        .order('requested_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPayoutRequests(data || []);
    } catch (error) {
      console.error('Error fetching payout requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestPayout = async () => {
    const amount = parseFloat(payoutAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount < MINIMUM_PAYOUT) {
      toast.error(`Minimum payout amount is $${MINIMUM_PAYOUT}`);
      return;
    }

    if (amount > availableBalance) {
      toast.error('Amount exceeds available balance');
      return;
    }

    setRequesting(true);
    try {
      const { error } = await supabase
        .from('payout_requests')
        .insert({
          user_id: engineerId,
          amount,
          payment_method: paymentMethod,
          status: 'pending',
          requested_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Payout request submitted!');
      setIsRequestOpen(false);
      setPayoutAmount('');
      fetchPayoutRequests();
    } catch (error) {
      console.error('Error requesting payout:', error);
      toast.error('Failed to submit payout request');
    } finally {
      setRequesting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Processing</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return <Building className="h-4 w-4" />;
      case 'paypal':
        return <CreditCard className="h-4 w-4" />;
      case 'stripe':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Wallet className="h-4 w-4" />;
    }
  };

  const pendingAmount = payoutRequests
    .filter(r => r.status === 'pending' || r.status === 'processing')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-bold text-green-500">
                  ${availableBalance.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-500/10">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Payouts</p>
                <p className="text-2xl font-bold text-yellow-500">
                  ${pendingAmount.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-yellow-500/10">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Minimum Payout</p>
                <p className="text-2xl font-bold">${MINIMUM_PAYOUT}</p>
              </div>
              <div className="p-3 rounded-full bg-muted">
                <Wallet className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request Payout Button */}
      <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
        <DialogTrigger asChild>
          <Button 
            className="w-full gap-2" 
            size="lg"
            disabled={availableBalance < MINIMUM_PAYOUT}
          >
            <ArrowUpRight className="h-5 w-5" />
            Request Payout
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Payout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                placeholder={`Min $${MINIMUM_PAYOUT}`}
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                max={availableBalance}
                min={MINIMUM_PAYOUT}
              />
              <p className="text-xs text-muted-foreground">
                Available: ${availableBalance.toFixed(2)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Bank Transfer
                    </div>
                  </SelectItem>
                  <SelectItem value="paypal">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      PayPal
                    </div>
                  </SelectItem>
                  <SelectItem value="stripe">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Stripe
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={requestPayout} 
              className="w-full"
              disabled={requesting}
            >
              {requesting ? 'Processing...' : 'Submit Request'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>Your recent payout requests</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : payoutRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No payout requests yet</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {payoutRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-muted">
                        {getPaymentMethodIcon(request.payment_method)}
                      </div>
                      <div>
                        <p className="font-medium">${request.amount.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(request.requested_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(request.status)}
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
