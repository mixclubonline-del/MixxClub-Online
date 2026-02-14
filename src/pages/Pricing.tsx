import { useState } from 'react';
import { PublicFooter } from '@/components/layouts/PublicFooter';
import { Check, X, Zap, Crown, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { TrustBadges } from '@/components/TrustBadges';
import { SEOHead } from '@/components/SEOHead';
import { generateProductSchema } from '@/lib/seo-schema';
import { ScarcityIndicator } from '@/components/pricing/ScarcityIndicator';
import { useSubscriptionPlans, getYearlyDiscountPercent } from '@/hooks/useSubscriptionPlans';
import { useMixingPackages } from '@/hooks/useMixingPackages';
import { useMasteringPackages } from '@/hooks/useMasteringPackages';
import { useAddonServices } from '@/hooks/useAddonServices';

const planIcons: Record<string, typeof Zap> = {
  free: Check,
  starter: Zap,
  pro: Crown,
  studio: Crown,
};

export default function Pricing() {
  const navigate = useNavigate();
  const [serviceType, setServiceType] = useState<'mixing' | 'mastering' | 'subscriptions'>('subscriptions');
  const [yearlyBilling, setYearlyBilling] = useState(false);

  // Fetch data from database
  const { data: subscriptionPlans, isLoading: loadingPlans } = useSubscriptionPlans();
  const { data: mixingPackages, isLoading: loadingMixing } = useMixingPackages();
  const { data: masteringPackages, isLoading: loadingMastering } = useMasteringPackages();
  const { data: addons } = useAddonServices(serviceType === 'subscriptions' ? undefined : serviceType);

  const isLoading = loadingPlans || loadingMixing || loadingMastering;

  const handleSelectPackage = (packageId: string, packageType: 'mixing' | 'mastering') => {
    navigate(`/checkout?type=${packageType}&packageId=${packageId}`);
  };

  const handleSubscriptionClick = (planName: string) => {
    if (planName === 'free') {
      navigate('/auth?mode=signup');
    } else if (planName === 'studio') {
      navigate('/contact?subject=studio-pricing');
    } else {
      navigate(`/checkout?type=subscription&tier=${planName}&billing=${yearlyBilling ? 'yearly' : 'monthly'}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-accent/5">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Pricing - Professional Mixing & Mastering Packages"
        description="Transparent pricing for professional audio mixing and mastering services. Choose from multiple tiers starting at $99 for mixing and $29 for mastering."
        keywords="mixing prices, mastering cost, audio engineering rates, mixing packages, mastering packages, professional mixing pricing"
        schema={generateProductSchema({
          name: "Professional Mix Package",
          description: "Most popular mixing package with advanced processing and priority support",
          price: 249,
          currency: "USD"
        })}
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-accent/5">
        {/* Hero Section */}
        <div className="container max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional audio services at competitive rates. No hidden fees, no surprises.
            </p>
          </div>

          {/* Scarcity Indicator */}
          <ScarcityIndicator />

          {/* Service Type Selector */}
          <Tabs value={serviceType} onValueChange={(v) => setServiceType(v as typeof serviceType)} className="mb-12">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="subscriptions">Creator Plans</TabsTrigger>
              <TabsTrigger value="mixing">Mixing Services</TabsTrigger>
              <TabsTrigger value="mastering">Mastering Services</TabsTrigger>
            </TabsList>

            {/* SUBSCRIPTIONS TAB */}
            <TabsContent value="subscriptions" className="mt-8">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold mb-2">Choose Your Creator Plan</h2>
                <p className="text-lg text-muted-foreground mb-6">Unlock unlimited mixing & mastering with exclusive features</p>
                
                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-3">
                  <Label htmlFor="billing-toggle" className={!yearlyBilling ? 'font-semibold' : 'text-muted-foreground'}>
                    Monthly
                  </Label>
                  <Switch
                    id="billing-toggle"
                    checked={yearlyBilling}
                    onCheckedChange={setYearlyBilling}
                  />
                  <Label htmlFor="billing-toggle" className={yearlyBilling ? 'font-semibold' : 'text-muted-foreground'}>
                    Yearly <span className="text-green-500 ml-1">Save 20%</span>
                  </Label>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-6">
                {subscriptionPlans?.map((plan) => {
                  const Icon = planIcons[plan.plan_name] || Zap;
                  const isHighlighted = plan.plan_name === 'pro';
                  const displayPrice = yearlyBilling && plan.price_yearly 
                    ? Math.round(plan.price_yearly / 12) 
                    : plan.price_monthly;
                  const yearlyDiscount = getYearlyDiscountPercent(plan);

                  return (
                    <Card
                      key={plan.id}
                      className={`p-6 relative flex flex-col ${isHighlighted
                        ? 'border-2 border-primary shadow-2xl md:scale-105'
                        : 'border border-border'
                      }`}
                    >
                      {isHighlighted && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold">
                          MOST POPULAR
                        </div>
                      )}

                      <div className="flex items-center gap-2 mb-4">
                        <Icon className="w-5 h-5 text-primary" />
                        <h3 className="text-2xl font-bold">{plan.display_name}</h3>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

                      <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold">${displayPrice}</span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                        {yearlyBilling && yearlyDiscount > 0 && (
                          <p className="text-sm text-green-500 mt-1">
                            Save ${plan.price_monthly * 12 - (plan.price_yearly || 0)}/year
                          </p>
                        )}
                      </div>

                      <div className="space-y-3 mb-6 flex-1">
                        {plan.features.map((feature) => (
                          <div key={feature} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <Button
                        onClick={() => handleSubscriptionClick(plan.plan_name)}
                        className="w-full"
                        variant={isHighlighted ? 'default' : 'outline'}
                      >
                        {plan.plan_name === 'free' ? 'Get Started Free' : 
                         plan.plan_name === 'studio' ? 'Contact Sales' : 'Start Free Trial'}
                      </Button>
                    </Card>
                  );
                })}
              </div>

              <div className="mt-12 p-6 bg-accent/50 rounded-lg border border-border">
                <h3 className="font-bold mb-2">💡 Not sure which plan is right for you?</h3>
                <p className="text-muted-foreground">
                  Start with Free and upgrade anytime. All paid plans include a 7-day free trial with no credit card required.
                </p>
              </div>
            </TabsContent>

            {/* MIXING TAB */}
            <TabsContent value="mixing" className="mt-8">
              <div className="grid md:grid-cols-3 gap-6">
                {mixingPackages?.map((pkg) => (
                  <Card
                    key={pkg.id}
                    className={`p-6 relative ${pkg.is_featured ? 'border-2 border-primary shadow-xl' : ''}`}
                  >
                    {pkg.is_featured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold mb-2">{pkg.package_name}</h3>
                      <p className="text-muted-foreground mb-4">{pkg.description}</p>
                      <div className="mb-4">
                        <span className="text-4xl font-bold">${pkg.price}</span>
                        <span className="text-muted-foreground">/project</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Up to {pkg.track_limit} tracks • {pkg.turnaround_days} day turnaround
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      {pkg.features.map((feature: string) => (
                        <div key={feature} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => handleSelectPackage(pkg.id, 'mixing')}
                      className="w-full"
                      variant={pkg.is_featured ? 'default' : 'outline'}
                    >
                      Get Started
                    </Button>
                  </Card>
                ))}
              </div>

              {/* Add-ons Preview */}
              {addons && addons.length > 0 && (
                <div className="mt-8 p-6 bg-accent/30 rounded-lg border border-border">
                  <h3 className="font-bold mb-3">✨ Popular Add-Ons</h3>
                  <div className="flex flex-wrap gap-3">
                    {addons.slice(0, 4).map((addon) => (
                      <span key={addon.id} className="text-sm bg-background px-3 py-1.5 rounded-full border">
                        {addon.service_name} — <span className="text-primary font-medium">
                          {addon.is_percentage ? `+${addon.percentage_value}%` : `+$${addon.price}`}
                        </span>
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    Add-ons available during checkout
                  </p>
                </div>
              )}
            </TabsContent>

            {/* MASTERING TAB */}
            <TabsContent value="mastering" className="mt-8">
              <div className="grid md:grid-cols-3 gap-6">
                {masteringPackages?.map((pkg) => (
                  <Card
                    key={pkg.id}
                    className={`p-6 relative ${pkg.is_featured ? 'border-2 border-primary shadow-xl' : ''}`}
                  >
                    {pkg.is_featured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                        Best Value
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                      <p className="text-muted-foreground mb-4">{pkg.description}</p>
                      <div className="mb-4">
                        <span className="text-4xl font-bold">${pkg.price}</span>
                        <span className="text-muted-foreground">/package</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {pkg.track_limit === 999 ? 'Unlimited' : `Up to ${pkg.track_limit}`} tracks • {pkg.turnaround_days} day turnaround
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      {pkg.features.map((feature: string) => (
                        <div key={feature} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => handleSelectPackage(pkg.id, 'mastering')}
                      className="w-full"
                      variant={pkg.is_featured ? 'default' : 'outline'}
                    >
                      Get Started
                    </Button>
                  </Card>
                ))}
              </div>

              {/* Add-ons Preview */}
              {addons && addons.length > 0 && (
                <div className="mt-8 p-6 bg-accent/30 rounded-lg border border-border">
                  <h3 className="font-bold mb-3">✨ Popular Add-Ons</h3>
                  <div className="flex flex-wrap gap-3">
                    {addons.slice(0, 4).map((addon) => (
                      <span key={addon.id} className="text-sm bg-background px-3 py-1.5 rounded-full border">
                        {addon.service_name} — <span className="text-primary font-medium">
                          {addon.is_percentage ? `+${addon.percentage_value}%` : `+$${addon.price}`}
                        </span>
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    Add-ons available during checkout
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Trust Badges */}
          <div className="mt-12">
            <TrustBadges />
          </div>

          {/* FAQ Section */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <Card className="p-6">
                <h3 className="font-semibold mb-2">What's included in revisions?</h3>
                <p className="text-muted-foreground">
                  Revisions include adjustments to EQ, compression, effects, and overall balance based on your feedback.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold mb-2">Can I upgrade my package later?</h3>
                <p className="text-muted-foreground">
                  Yes! You can upgrade at any time and only pay the difference.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold mb-2">What formats do you deliver?</h3>
                <p className="text-muted-foreground">
                  We deliver WAV (24-bit/44.1kHz or higher), MP3 (320kbps), and any other format you need.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <PublicFooter />
    </>
  );
}
