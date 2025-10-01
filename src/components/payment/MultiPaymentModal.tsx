import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard, Loader2, Smartphone, Wallet } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

declare global {
  interface Window {
    paypal: any;
  }
}

const stripePromise = loadStripe('pk_test_51QVN0XRq9IzNdyTiZdlJCuGBBBN5d7OQBdBnhYQGCTx8MJyOGT9LJPqmSVzgM6GC2KQYjuFxL8m3GFyMUMZ3JX9z00pJqvHH0N');

interface MultiPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  amount: number;
  engineerSplitPercent?: number;
}

export function MultiPaymentModal({
  open,
  onOpenChange,
  projectId,
  amount,
  engineerSplitPercent = 70
}: MultiPaymentModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cardElement, setCardElement] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'apple-google'>('card');
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const paypalButtonRef = useRef<HTMLDivElement>(null);

  const totalAmount = amount;
  const engineerAmount = (amount * engineerSplitPercent) / 100;
  const platformFee = amount - engineerAmount;

  useEffect(() => {
    if (open) {
      initStripe();
      initPayPal();
    }
  }, [open]);

  useEffect(() => {
    if (open && paymentMethod === 'paypal') {
      initPayPal();
    }
  }, [paymentMethod, open]);

  const initStripe = async () => {
    const stripe = await stripePromise;
    if (!stripe) return;

    const elements = stripe.elements();
    const card = elements.create('card', {
      hidePostalCode: true,
      style: {
        base: {
          fontSize: '16px',
          color: 'hsl(var(--foreground))',
          '::placeholder': { color: 'hsl(var(--muted-foreground))' }
        }
      }
    });
    
    const cardElementDiv = document.getElementById('stripe-card-element');
    if (cardElementDiv) {
      card.mount('#stripe-card-element');
      setCardElement(card);
    }

    // Setup Apple Pay / Google Pay
    const pr = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: {
        label: 'MixClub Payment',
        amount: Math.round(totalAmount * 100),
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
      }
    });

    pr.on('paymentmethod', async (e) => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase.functions.invoke('create-payment-intent', {
          body: { projectId, amount: totalAmount }
        });

        if (error) throw error;

        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
          data.client_secret,
          { payment_method: e.paymentMethod.id },
          { handleActions: false }
        );

        if (confirmError) {
          e.complete('fail');
          toast({ title: 'Payment failed', description: confirmError.message, variant: 'destructive' });
        } else {
          e.complete('success');
          if (paymentIntent.status === 'requires_action') {
            const { error } = await stripe.confirmCardPayment(data.client_secret);
            if (error) {
              toast({ title: 'Payment failed', description: error.message, variant: 'destructive' });
            } else {
              toast({ title: 'Success', description: 'Payment completed!' });
              onOpenChange(false);
              window.location.href = `/project/${projectId}`;
            }
          } else {
            toast({ title: 'Success', description: 'Payment completed!' });
            onOpenChange(false);
            window.location.href = `/project/${projectId}`;
          }
        }
      } catch (error) {
        e.complete('fail');
        console.error('Payment error:', error);
        toast({ title: 'Payment failed', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    });
  };

  const initPayPal = () => {
    if (!window.paypal || !paypalButtonRef.current) return;
    
    paypalButtonRef.current.innerHTML = '';
    
    window.paypal.Buttons({
      createOrder: async () => {
        try {
          const { data, error } = await supabase.functions.invoke('create-paypal-order', {
            body: { projectId, amount: totalAmount }
          });
          if (error) throw error;
          return data.orderId;
        } catch (error) {
          console.error('PayPal order creation error:', error);
          toast({ title: 'Error', description: 'Failed to create PayPal order', variant: 'destructive' });
          throw error;
        }
      },
      onApprove: async (data: any) => {
        setLoading(true);
        try {
          const { error } = await supabase.functions.invoke('capture-paypal-order', {
            body: { orderId: data.orderID, projectId }
          });
          if (error) throw error;
          toast({ title: 'Success', description: 'Payment completed!' });
          onOpenChange(false);
          window.location.href = `/project/${projectId}`;
        } catch (error) {
          console.error('PayPal capture error:', error);
          toast({ title: 'Error', description: 'Payment failed', variant: 'destructive' });
        } finally {
          setLoading(false);
        }
      },
      onError: (err: any) => {
        console.error('PayPal error:', err);
        toast({ title: 'Error', description: 'PayPal payment failed', variant: 'destructive' });
      }
    }).render(paypalButtonRef.current);
  };

  const handleStripePayment = async () => {
    if (!cardElement) {
      toast({ title: 'Error', description: 'Payment form not loaded', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe not loaded');

      // Create payment intent via edge function
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: { projectId, amount: totalAmount }
      });

      if (error) throw error;

      const { error: confirmError } = await stripe.confirmCardPayment(data.client_secret, {
        payment_method: { card: cardElement }
      });

      if (confirmError) {
        toast({ title: 'Payment failed', description: confirmError.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Payment completed successfully!' });
        onOpenChange(false);
        window.location.href = `/project/${projectId}`;
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({ 
        title: 'Payment failed', 
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <script src="https://www.paypal.com/sdk/js?client-id=test&currency=USD&enable-funding=venmo" />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-primary">Checkout — Choose Payment</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-secondary/20 p-4 rounded-lg space-y-1">
              <p className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </p>
              <p className="flex justify-between text-sm text-muted-foreground">
                <span>Engineer Share ({engineerSplitPercent}%):</span>
                <span>${engineerAmount.toFixed(2)}</span>
              </p>
              <p className="flex justify-between text-sm text-muted-foreground">
                <span>Platform Fee:</span>
                <span>${platformFee.toFixed(2)}</span>
              </p>
            </div>

            {/* Payment Method Selection */}
            <RadioGroup value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                    <CreditCard className="h-4 w-4" />
                    Credit / Debit Card
                  </Label>
                </div>

                {paymentRequest && (
                  <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="apple-google" id="apple-google" />
                    <Label htmlFor="apple-google" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Smartphone className="h-4 w-4" />
                      Apple Pay / Google Pay
                    </Label>
                  </div>
                )}

                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Wallet className="h-4 w-4" />
                    PayPal / Venmo
                  </Label>
                </div>
              </div>
            </RadioGroup>

            {/* Payment Forms */}
            {paymentMethod === 'card' && (
              <div className="space-y-3">
                <div 
                  id="stripe-card-element" 
                  className="p-3 border rounded-md bg-background"
                />
                <Button 
                  onClick={handleStripePayment} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Pay with Card'
                  )}
                </Button>
              </div>
            )}

            {paymentMethod === 'apple-google' && paymentRequest && (
              <div className="space-y-3">
                <div id="payment-request-button" />
                <Button 
                  onClick={async () => {
                    if (paymentRequest) {
                      paymentRequest.show();
                    }
                  }}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Pay with Digital Wallet'
                  )}
                </Button>
              </div>
            )}

            {paymentMethod === 'paypal' && (
              <div className="space-y-3">
                <div ref={paypalButtonRef} />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
