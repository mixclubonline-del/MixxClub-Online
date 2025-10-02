import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard, Loader2, Smartphone, Wallet, Bitcoin } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import jsPDF from 'jspdf';
import { TrustBadges } from '@/components/TrustBadges';
import { RefundPolicy } from '@/components/RefundPolicy';

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
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'apple-google' | 'crypto'>('card');
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const paypalButtonRef = useRef<HTMLDivElement>(null);

  const totalAmount = amount;
  const engineerAmount = (amount * engineerSplitPercent) / 100;
  const platformFee = amount - engineerAmount;

  useEffect(() => {
    if (open) {
      initStripe();
      
      // Load PayPal SDK script
      const script = document.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js?client-id=test&currency=USD&enable-funding=venmo';
      script.async = true;
      script.onload = () => setPaypalLoaded(true);
      script.onerror = () => {
        console.error('Failed to load PayPal SDK');
        toast({ title: 'Error', description: 'Failed to load PayPal', variant: 'destructive' });
      };
      
      // Only add script if it doesn't exist
      if (!document.querySelector('script[src*="paypal.com/sdk"]')) {
        document.body.appendChild(script);
      } else if (window.paypal) {
        setPaypalLoaded(true);
      }
    }
  }, [open]);

  useEffect(() => {
    if (open && paymentMethod === 'paypal' && paypalLoaded) {
      initPayPal();
    }
  }, [paymentMethod, open, paypalLoaded]);

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
              generatePDFReceipt(paymentIntent.id, 'Apple Pay / Google Pay');
              await sendReceiptEmail(paymentIntent.id, 'Apple Pay / Google Pay');
              toast({ title: 'Success', description: 'Payment completed! Receipt downloaded and emailed.' });
              onOpenChange(false);
              window.location.href = `/project/${projectId}`;
            }
          } else {
            generatePDFReceipt(paymentIntent.id, 'Apple Pay / Google Pay');
            await sendReceiptEmail(paymentIntent.id, 'Apple Pay / Google Pay');
            toast({ title: 'Success', description: 'Payment completed! Receipt downloaded and emailed.' });
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
    if (!window.paypal?.Buttons || !paypalButtonRef.current) {
      console.warn('PayPal SDK not ready or button ref not available');
      return;
    }
    
    // Clear any existing buttons
    paypalButtonRef.current.innerHTML = '';
    
    try {
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
            const { data: captureData, error } = await supabase.functions.invoke('capture-paypal-order', {
              body: { orderId: data.orderID, projectId }
            });
            if (error) throw error;
            
            generatePDFReceipt(data.orderID, 'PayPal / Venmo');
            await sendReceiptEmail(data.orderID, 'PayPal / Venmo');
            
            toast({ title: 'Success', description: 'Payment completed! Receipt downloaded and emailed.' });
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
    } catch (error) {
      console.error('Failed to initialize PayPal buttons:', error);
      toast({ title: 'Error', description: 'Failed to initialize PayPal', variant: 'destructive' });
    }
  };

  const generatePDFReceipt = (transactionId: string, paymentMethodName: string) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(91, 60, 255);
    doc.text('MixClub Payment Receipt', 20, 20);
    
    // Details
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Project ID: ${projectId}`, 20, 40);
    doc.text(`Payment Method: ${paymentMethodName}`, 20, 50);
    doc.text(`Transaction ID: ${transactionId}`, 20, 60);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 70);
    
    // Payment breakdown
    doc.setFontSize(14);
    doc.text('Payment Breakdown', 20, 90);
    doc.setFontSize(12);
    doc.text(`Total Amount: $${totalAmount.toFixed(2)}`, 20, 105);
    doc.text(`Engineer Share (${engineerSplitPercent}%): $${engineerAmount.toFixed(2)}`, 20, 115);
    doc.text(`Platform Fee: $${platformFee.toFixed(2)}`, 20, 125);
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text('Thank you for using MixClub!', 20, 150);
    doc.text('For support, contact: support@mixclubonline.com', 20, 160);
    
    // Save PDF
    doc.save(`MixClub_Receipt_${projectId}.pdf`);
  };

  const sendReceiptEmail = async (transactionId: string, paymentMethodName: string) => {
    try {
      await supabase.functions.invoke('send-payment-receipt', {
        body: {
          projectId,
          paymentDetails: {
            amount: totalAmount,
            engineerShare: engineerAmount,
            platformFee,
            paymentMethod: paymentMethodName,
            transactionId,
          }
        }
      });
    } catch (error) {
      console.error('Failed to send receipt email:', error);
      // Don't throw - email is nice-to-have
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

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(data.client_secret, {
        payment_method: { card: cardElement }
      });

      if (confirmError) {
        toast({ title: 'Payment failed', description: confirmError.message, variant: 'destructive' });
      } else {
        // Generate PDF receipt
        generatePDFReceipt(paymentIntent.id, 'Credit Card');
        
        // Send email receipt
        await sendReceiptEmail(paymentIntent.id, 'Credit Card');
        
        toast({ title: 'Success', description: 'Payment completed! Receipt downloaded and emailed.' });
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

  const handleCryptoPayment = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('create-crypto-checkout', {
        body: { projectId, amount: totalAmount }
      });

      if (error) throw error;

      // Redirect to Coinbase Commerce hosted checkout
      window.location.href = data.hosted_url;
    } catch (error) {
      console.error('Crypto payment error:', error);
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
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">Checkout — Choose Payment</DialogTitle>
        </DialogHeader>

          <div className="space-y-6">
            {/* Trust Badges */}
            <TrustBadges />
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

                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="crypto" id="crypto" />
                  <Label htmlFor="crypto" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Bitcoin className="h-4 w-4" />
                    Cryptocurrency (BTC, ETH, USDC)
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
                {paypalLoaded ? (
                  <div ref={paypalButtonRef} className="min-h-[150px]" />
                ) : (
                  <div className="flex items-center justify-center min-h-[150px] border rounded-lg bg-muted/20">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
            )}

            {paymentMethod === 'crypto' && (
              <div className="space-y-3">
                <div className="p-4 border rounded-lg bg-muted/20">
                  <p className="text-sm text-muted-foreground mb-2">Supported cryptocurrencies:</p>
                  <div className="flex gap-2 mb-4">
                    <Badge variant="secondary">Bitcoin (BTC)</Badge>
                    <Badge variant="secondary">Ethereum (ETH)</Badge>
                    <Badge variant="secondary">USDC</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You'll be redirected to Coinbase Commerce to complete your payment securely.
                  </p>
                </div>
                <Button 
                  onClick={handleCryptoPayment} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redirecting...
                    </>
                  ) : (
                    <>
                      <Bitcoin className="mr-2 h-4 w-4" />
                      Pay with Crypto
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Refund Policy */}
            <RefundPolicy />
        </div>
      </DialogContent>
    </Dialog>
  );
}
