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
import { useQuery } from '@tanstack/react-query';
import { AddOnSelector } from '@/components/pricing/AddOnSelector';
import { useAddonServices, calculateAddonPrice } from '@/hooks/useAddonServices';

const planIcons: Record<string, typeof Zap> = {
  starter: Zap,
  pro: Crown,
  studio: Crown,
};

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const type = searchParams.get('type') || 'subscription';
  const tier = searchParams.get('tier');
  const packageId = searchParams.get('packageId');
  const billingInterval = searchParams.get('billing') as 'monthly' | 'yearly' || 'monthly';

  const isSubscription = type === 'subscription';
  const isMixing = type === 'mixing';
  const isMastering = type === 'mastering';

  // Fetch subscription plan from database
  const { data: subscriptionPlan, isLoading: loadingPlan } = useQuery({
    queryKey: ['subscription-plan', tier],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('plan_name', tier)
        .single();
      if (error) throw error;
      return {
        ...data,
        features: Array.isArray(data.features) ? data.features : JSON.parse(data.features as string || '[]'),
      };
    },
    enabled: isSubscription && !!tier,
  });

  // Fetch mixing package from database
  const { data: mixingPackage, isLoading: loadingMixing } = useQuery({
    queryKey: ['mixing-package', packageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mixing_packages')
        .select('*')
        .eq('id', packageId)
        .single();
      if (error) throw error;
      return {
        ...data,
        features: Array.isArray(data.features) ? data.features : JSON.parse(data.features as string || '[]'),
      };
    },
    enabled: isMixing && !!packageId,
  });

  // Fetch mastering package from database
  const { data: masteringPackage, isLoading: loadingMastering } = useQuery({
    queryKey: ['mastering-package', packageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mastering_packages')
        .select('*')
        .eq('id', packageId)
        .single();
      if (error) throw error;
      return {
        ...data,
        features: Array.isArray(data.features) ? data.features : JSON.parse(data.features as string || '[]'),
      };
    },
    enabled: isMastering && !!packageId,
  });

  // Fetch applicable add-ons
  const { data: addons } = useAddonServices(isMixing ? 'mixing' : isMastering ? 'mastering' : undefined);

  const isLoading = loadingPlan || loadingMixing || loadingMastering;
  
  const basePrice = isSubscription 
    ? (billingInterval === 'yearly' && subscriptionPlan?.price_yearly 
        ? Math.round(subscriptionPlan.price_yearly / 12) 
        : subscriptionPlan?.price_monthly || 0)
    : (mixingPackage?.price || masteringPackage?.price || 0);

  // Calculate add-on total
  const addonsTotal = selectedAddons.reduce((total, addonId) => {
    const addon = addons?.find(a => a.id === addonId);
    if (addon) {
      return total + calculateAddonPrice(addon, basePrice);
    }
    return total;
  }, 0);

  const totalPrice = basePrice + addonsTotal;

  const packageName = isMixing ? mixingPackage?.package_name : masteringPackage?.name;
  const packageFeatures = isMixing ? mixingPackage?.features : masteringPackage?.features;
  
  const displayName = isSubscription 
    ? `${subscriptionPlan?.display_name || tier} Plan`
    : `${packageName || 'Package'} - ${isMixing ? 'Mixing' : 'Mastering'}`;

  useEffect(() => {
    if (!authLoading && !user) {
      toast.info('Please sign in to continue checkout');
      navigate(`/auth?mode=signin&redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    }
  }, [user, authLoading, navigate]);

  const handleToggleAddon = (addonId: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please sign in to continue');
      return;
    }

    setIsProcessing(true);

    try {
      // Get referral code from localStorage if present
      const referralCode = localStorage.getItem('mixx_referral_code');

      let endpoint: string;
      let body: Record<string, unknown>;

      if (isSubscription) {
        endpoint = 'create-subscription-checkout';
        body = { 
          planId: subscriptionPlan?.id, 
          billingInterval,
          referralCode,
        };
      } else if (isMixing) {
        endpoint = 'create-mixing-checkout';
        body = { 
          packageId,
          referralCode,
        };
      } else if (isMastering) {
        endpoint = 'create-mastering-checkout';
        body = { 
          packageId,
          referralCode,
        };
      } else {
        endpoint = 'create-payment-checkout';
        body = { 
          packageType: type, 
          packageId: packageId,
          addonIds: selectedAddons,
          referralCode,
        };
      }

      const { data, error } = await supabase.functions.invoke(endpoint, { body });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else if (data?.redirect) {
        navigate(data.redirect);
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to start checkout');
      setIsProcessing(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-accent/5">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!tier && !packageId) {
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

  const Icon = tier ? (planIcons[tier] || Sparkles) : Sparkles;

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
          <div className="md:col-span-3 space-y-6">
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
                      {isSubscription ? `${billingInterval === 'yearly' ? 'Yearly' : 'Monthly'} subscription` : 'One-time payment'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${basePrice}</div>
                    {isSubscription && (
                      <div className="text-sm text-muted-foreground">/month</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Features */}
              {(subscriptionPlan?.features || packageFeatures) && (
                <div className="mb-6">
                  <h3 className="font-medium mb-3">What's included:</h3>
                  <div className="grid gap-2">
                    {(subscriptionPlan?.features || packageFeatures || []).map((feature: string) => (
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
                  <span>${basePrice}</span>
                </div>
                
                {selectedAddons.length > 0 && (
                  <>
                    {selectedAddons.map(addonId => {
                      const addon = addons?.find(a => a.id === addonId);
                      if (!addon) return null;
                      const addonPrice = calculateAddonPrice(addon, basePrice);
                      return (
                        <div key={addonId} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{addon.service_name}</span>
                          <span>+${addonPrice.toFixed(0)}</span>
                        </div>
                      );
                    })}
                  </>
                )}
                
                {isSubscription && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>7-day free trial</span>
                    <span>-${totalPrice}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Due today</span>
                  <span>{isSubscription ? '$0.00' : `$${totalPrice.toFixed(0)}`}</span>
                </div>
                
                {isSubscription && (
                  <p className="text-xs text-muted-foreground">
                    After your 7-day trial, you'll be charged ${basePrice}/month. Cancel anytime.
                  </p>
                )}
              </div>
            </Card>

            {/* Add-ons Section */}
            {!isSubscription && addons && addons.length > 0 && (
              <Card className="p-6">
                <AddOnSelector
                  addons={addons}
                  basePrice={basePrice}
                  selectedAddons={selectedAddons}
                  onToggleAddon={handleToggleAddon}
                />
              </Card>
            )}
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
                    {isSubscription ? 'Start Free Trial' : `Pay $${totalPrice.toFixed(0)}`}
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
