import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';

interface PayoutManagementProps {
  engineerId: string;
  availableBalance: number;
}

interface PayoutRequest {
  id: string;
  amount: number;
  status: string;
  requested_at: string;
  processed_at: string | null;
}

export function PayoutManagement({ engineerId, availableBalance }: PayoutManagementProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<PayoutRequest[]>([]);
  const { toast } = useToast();

  const fetchPayoutRequests = async () => {
    const { data, error } = await supabase
      .from('payout_requests')
      .select('*')
      .eq('engineer_id', engineerId)
      .order('requested_at', { ascending: false })
      .limit(5);

    if (!error && data) {
      setRequests(data);
    }
  };

  useState(() => {
    fetchPayoutRequests();
  });

  const handleRequestPayout = async () => {
    if (!amount || Number(amount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid payout amount',
        variant: 'destructive',
      });
      return;
    }

    if (Number(amount) > availableBalance) {
      toast({
        title: 'Insufficient Balance',
        description: `You can only request up to $${availableBalance.toFixed(2)}`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('payout_requests')
        .insert({
          engineer_id: engineerId,
          amount: Number(amount),
          payment_method: 'stripe',
        });

      if (error) throw error;

      toast({
        title: 'Payout Requested',
        description: `Your payout request for $${amount} has been submitted`,
      });

      setAmount('');
      fetchPayoutRequests();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to request payout',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Payout Management
        </CardTitle>
        <CardDescription>
          Request payouts from your available balance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
          <div className="text-sm text-muted-foreground mb-1">Available Balance</div>
          <div className="text-2xl font-bold">${availableBalance.toFixed(2)}</div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Payout Amount</Label>
            <div className="flex gap-2">
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                max={availableBalance}
                step="0.01"
              />
              <Button onClick={handleRequestPayout} disabled={loading}>
                {loading ? 'Processing...' : 'Request Payout'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Payouts are processed within 2-3 business days
            </p>
          </div>
        </div>

        {requests.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Recent Requests</h4>
            <div className="space-y-2">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <div className="font-medium">${request.amount.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(request.requested_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant={request.status === 'completed' ? 'default' : 'secondary'}>
                    {request.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
