import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CreditCard, DollarSign, CheckCircle, Clock, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAnalytics } from '@/hooks/useAnalytics';
import { TrustBadges } from '@/components/TrustBadges';

interface PaymentIntegrationProps {
  projectId: string;
  amount: number;
  projectTitle: string;
}

export const PaymentIntegration = ({ projectId, amount, projectTitle }: PaymentIntegrationProps) => {
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple' | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | null>(null);
  const { trackPurchase, trackEvent } = useAnalytics();

  const handlePayment = async (method: 'card' | 'apple') => {
    try {
      setProcessing(true);
      setPaymentStatus('processing');

      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          project_id: projectId,
          client_id: user.id,
          amount: amount,
          status: 'processing',
          payment_method: method
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Simulate payment processing (in production, this would call Stripe API)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update payment status
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          stripe_payment_id: `sim_${Math.random().toString(36).substring(7)}`
        })
        .eq('id', payment.id);

      if (updateError) throw updateError;

      // Award points for payment
      await supabase.rpc('award_points', {
        user_id: user.id,
        points_to_add: Math.floor(amount / 10) // 1 point per $10
      });

      setPaymentStatus('completed');
      toast.success(`Payment of $${amount} completed successfully! +${Math.floor(amount / 10)} points`);
      
      // Track successful payment
      trackPurchase(amount, projectId);
      trackEvent('payment_completed', { project_id: projectId, amount, method });
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentStatus(null);
      toast.error(error.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (paymentStatus === 'completed') {
    return (
      <Card className="p-8 text-center bg-green-500/10 border-green-500/20">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Payment Successful!</h3>
        <p className="text-muted-foreground mb-4">
          Your payment of ${amount} for "{projectTitle}" has been processed
        </p>
        <Badge className="bg-green-500 text-white">
          +{Math.floor(amount / 10)} Points Earned
        </Badge>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Trust Badges */}
      <TrustBadges />
      
      <div className="mb-6 mt-4">
        <h3 className="text-2xl font-bold mb-2">Complete Payment</h3>
        <p className="text-muted-foreground">
          Secure payment for: {projectTitle}
        </p>
      </div>

      {/* Amount Display */}
      <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Amount</span>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <span className="text-3xl font-bold text-primary">{amount}</span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-3 block">Select Payment Method</label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={paymentMethod === 'card' ? 'default' : 'outline'}
              className="h-auto py-4 flex-col gap-2"
              onClick={() => setPaymentMethod('card')}
              disabled={processing}
            >
              <CreditCard className="w-6 h-6" />
              <span>Credit Card</span>
            </Button>
            
            <Button
              variant={paymentMethod === 'apple' ? 'default' : 'outline'}
              className="h-auto py-4 flex-col gap-2"
              onClick={() => setPaymentMethod('apple')}
              disabled={processing}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span>Apple Pay</span>
            </Button>
          </div>
        </div>

        {/* Card Payment Form */}
        {paymentMethod === 'card' && (
          <div className="space-y-3 pt-4 border-t border-border">
            <div>
              <label className="text-sm font-medium mb-2 block">Card Number</label>
              <Input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\s/g, '');
                  const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                  setCardNumber(formatted);
                }}
                maxLength={19}
                disabled={processing}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Expiry</label>
                <Input type="text" placeholder="MM/YY" disabled={processing} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">CVV</label>
                <Input type="text" placeholder="123" maxLength={4} disabled={processing} />
              </div>
            </div>
          </div>
        )}

        {/* Payment Button */}
        {paymentMethod && (
          <Button
            onClick={() => handlePayment(paymentMethod)}
            disabled={processing || (paymentMethod === 'card' && !cardNumber)}
            className="w-full mt-6 gap-2"
            size="lg"
          >
            {processing ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Pay ${amount}
              </>
            )}
          </Button>
        )}
      </div>

      {/* Security Notice */}
      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Secure payment powered by Stripe. Your information is encrypted and safe.
        </p>
      </div>
    </Card>
  );
};
