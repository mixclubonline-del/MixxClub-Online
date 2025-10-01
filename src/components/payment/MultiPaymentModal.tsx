import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard, Loader2 } from 'lucide-react';

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

  const totalAmount = amount;
  const engineerAmount = (amount * engineerSplitPercent) / 100;
  const platformFee = amount - engineerAmount;

  useEffect(() => {
    if (open) {
      initStripe();
    }
  }, [open]);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">Checkout — Choose Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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

          {/* Card Payment */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Card / Apple Pay / Google Pay
            </h4>
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

          {/* PayPal/Venmo Placeholder */}
          <div className="space-y-3">
            <h4 className="font-semibold">PayPal / Venmo</h4>
            <div className="p-4 border rounded-md bg-muted/50 text-center text-sm text-muted-foreground">
              PayPal integration coming soon
            </div>
          </div>

          {/* Cash App Pay Placeholder */}
          <div className="space-y-3">
            <h4 className="font-semibold">Cash App Pay</h4>
            <div className="p-4 border rounded-md bg-muted/50 text-center text-sm text-muted-foreground">
              Cash App Pay integration coming soon
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
