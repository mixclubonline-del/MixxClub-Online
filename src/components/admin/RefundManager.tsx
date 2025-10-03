import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DollarSign, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

export function RefundManager() {
  const queryClient = useQueryClient();
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [showRefundDialog, setShowRefundDialog] = useState(false);

  const { data: payments, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          project:projects(title, client:profiles!projects_client_id_fkey(full_name))
        `)
        .in('status', ['completed', 'pending'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    }
  });

  const refundMutation = useMutation({
    mutationFn: async ({ paymentId, amount, reason }: any) => {
      const { data, error } = await supabase.functions.invoke('process-refund', {
        body: { paymentId, amount, reason }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Refund processed successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      setShowRefundDialog(false);
      setSelectedPayment(null);
      setRefundAmount('');
      setRefundReason('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to process refund');
    }
  });

  const handleRefundClick = (payment: any) => {
    setSelectedPayment(payment);
    setRefundAmount(payment.amount.toString());
    setShowRefundDialog(true);
  };

  const handleProcessRefund = () => {
    if (!selectedPayment) return;

    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0 || amount > selectedPayment.amount) {
      toast.error('Invalid refund amount');
      return;
    }

    if (!refundReason.trim()) {
      toast.error('Please provide a reason for the refund');
      return;
    }

    refundMutation.mutate({
      paymentId: selectedPayment.id,
      amount,
      reason: refundReason
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: <Badge className="bg-green-500/10 text-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>,
      pending: <Badge className="bg-yellow-500/10 text-yellow-500"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>,
      refunded: <Badge className="bg-red-500/10 text-red-500"><XCircle className="w-3 h-3 mr-1" />Refunded</Badge>,
    };
    return variants[status] || <Badge variant="outline">{status}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading payments...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Payment Refund Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Mobile: Card view, Desktop: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Payment ID</th>
                    <th className="text-left p-3 font-medium">Project</th>
                    <th className="text-left p-3 font-medium">Client</th>
                    <th className="text-left p-3 font-medium">Amount</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments?.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-mono text-sm">{payment.id.substring(0, 8)}</td>
                      <td className="p-3">{payment.project?.title || 'N/A'}</td>
                      <td className="p-3">{payment.project?.client?.full_name || 'N/A'}</td>
                      <td className="p-3 font-semibold">{formatCurrency(payment.amount)}</td>
                      <td className="p-3">{getStatusBadge(payment.status)}</td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right">
                        {payment.status === 'completed' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRefundClick(payment)}
                          >
                            Refund
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile view */}
            <div className="md:hidden space-y-3">
              {payments?.map((payment) => (
                <Card key={payment.id} className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{payment.project?.title || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">
                          {payment.project?.client?.full_name || 'N/A'}
                        </p>
                      </div>
                      {getStatusBadge(payment.status)}
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-lg font-bold">{formatCurrency(payment.amount)}</span>
                      {payment.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRefundClick(payment)}
                        >
                          Refund
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              ))}
            </div>

            {payments?.length === 0 && (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No payments found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Process a refund for payment {selectedPayment?.id.substring(0, 8)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Project</Label>
              <p className="text-sm text-muted-foreground">{selectedPayment?.project?.title}</p>
            </div>

            <div>
              <Label>Original Amount</Label>
              <p className="text-lg font-bold">{formatCurrency(selectedPayment?.amount || 0)}</p>
            </div>

            <div>
              <Label htmlFor="refundAmount">Refund Amount</Label>
              <Input
                id="refundAmount"
                type="number"
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="refundReason">Reason for Refund</Label>
              <Textarea
                id="refundReason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Enter reason for refund..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefundDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleProcessRefund}
              disabled={refundMutation.isPending}
            >
              {refundMutation.isPending ? 'Processing...' : 'Process Refund'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
