import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Check, 
  CreditCard, 
  Loader2, 
  Lock, 
  Music, 
  Sparkles,
  Zap,
  Crown
} from 'lucide-react';

const subscriptionDetails: Record<string, { 
  name: string; 
  price: number; 
  period: string; 
  features: string[];
  icon: typeof Zap;
}> = {
  starter: {
    name: 'Starter',
    price: 9,
    period: 'month',
    icon: Zap,
    features: [
      '25 track processes/month',
      '5 masters/month',
      '10 GB storage',
      '3 collaborators',
      'Basic analytics',
    ],
  },
  pro: {
    name: 'Pro',
    price: 29,
    period: 'month',
    icon: Crown,
    features: [
      '100 track processes/month',
      '20 masters/month',
      '100 GB storage',
      '10 collaborators',
      'Advanced analytics',
      '2 engineer consultations/month',
      'Priority support',
    ],
  },
  studio: {
    name: 'Studio',
    price: 99,
    period: 'month',
    icon: Crown,
    features: [
      'Unlimited tracks/masters',
      '1000 GB storage',
      '50 collaborators',
      'Dedicated engineer',
      'Custom integrations',
      'API access',
      '24/7 priority support',
    ],
  },
};

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const type = searchParams.get('type') || 'subscription';
  const tier = searchParams.get('tier');
  const packageName = searchParams.get('package');
  const priceParam = searchParams.get('price');

  const isSubscription = type === 'subscription';
  const subscriptionInfo = tier ? subscriptionDetails[tier] : null;
  
  const displayPrice = isSubscription 
    ? subscriptionInfo?.price || 0
    : parseInt(priceParam || '0', 10);
  
  const displayName = isSubscription 
    ? `${subscriptionInfo?.name} Plan`
    : `${packageName} - ${type === 'mixing' ? 'Mixing' : 'Mastering'}`;

  useEffect(() => {
    if (!authLoading && !user) {
      toast.info('Please sign in to continue checkout');
      navigate(`/auth?mode=signin&redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    }
  }, [user, authLoading, navigate]);

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please sign in to continue');
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-payment-checkout', {
        body: {
          packageType: type,
          packageId: tier || packageName,
          successUrl: `${window.location.origin}/order-success/{CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/payment-canceled`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to start checkout');
      setIsProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-accent/5">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!tier && !packageName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-accent/5">
        <Card className="p-8 max-w-md text-center">
          <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">No Package Selected</h1>
          <p className="text-muted-foreground mb-6">
            Please select a package from our pricing page to continue.
          </p>
          <Button asChild>
            <Link to="/pricing">View Pricing</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const Icon = subscriptionInfo?.icon || Sparkles;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/5 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Back Link */}
        <Link 
          to="/pricing" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pricing
        </Link>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Order Summary */}
          <div className="md:col-span-3">
            <Card className="p-6">
              <h1 className="text-2xl font-bold mb-6">Checkout</h1>
              
              {/* Selected Plan/Package */}
              <div className="bg-accent/50 rounded-lg p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">{displayName}</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      {isSubscription ? 'Monthly subscription' : 'One-time payment'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${displayPrice}</div>
                    {isSubscription && (
                      <div className="text-sm text-muted-foreground">/month</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Features */}
              {subscriptionInfo && (
                <div className="mb-6">
                  <h3 className="font-medium mb-3">What's included:</h3>
                  <div className="grid gap-2">
                    {subscriptionInfo.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator className="my-6" />

              {/* Order Total */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${displayPrice}</span>
                </div>
                {isSubscription && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>7-day free trial</span>
                    <span>-${displayPrice}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Due today</span>
                  <span>{isSubscription ? '$0.00' : `$${displayPrice}`}</span>
                </div>
                {isSubscription && (
                  <p className="text-xs text-muted-foreground">
                    After your 7-day trial, you'll be charged ${displayPrice}/month. Cancel anytime.
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Payment Section */}
          <div className="md:col-span-2">
            <Card className="p-6 sticky top-8">
              <div className="flex items-center gap-2 mb-6">
                <Lock className="w-4 h-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Secure Checkout</span>
              </div>

              <Button 
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full h-12 text-base"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    {isSubscription ? 'Start Free Trial' : `Pay $${displayPrice}`}
                  </>
                )}
              </Button>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Powered by Stripe for secure payments</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Cancel anytime with no questions asked</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>30-day money back guarantee</span>
                </div>
              </div>

              <Separator className="my-6" />

              <p className="text-xs text-center text-muted-foreground">
                By continuing, you agree to our{' '}
                <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
