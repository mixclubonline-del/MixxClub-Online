import { useState } from 'react';
import { motion } from 'framer-motion';
import { PublicFooter } from '@/components/layouts/PublicFooter';
import Navigation from '@/components/Navigation';
import { Check, Zap, Crown, Loader2, Coins, Globe, FileCheck, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useNavigate, Link } from 'react-router-dom';
import { TrustBadges } from '@/components/TrustBadges';
import { SEOHead } from '@/components/SEOHead';
import { generateProductSchema } from '@/lib/seo-schema';
import { ScarcityIndicator } from '@/components/pricing/ScarcityIndicator';
import { useSubscriptionPlans, getYearlyDiscountPercent } from '@/hooks/useSubscriptionPlans';
import { useMixingPackages } from '@/hooks/useMixingPackages';
import { useMasteringPackages } from '@/hooks/useMasteringPackages';
import { useAddonServices } from '@/hooks/useAddonServices';
import { useDistributionPackages } from '@/hooks/useDistribution';
import { GlassPanel } from '@/components/crm/design/GlassPanel';
import heroPricing from '@/assets/hero-pricing.jpg';

const planIcons: Record<string, typeof Zap> = {
  free: Check,
  starter: Zap,
  pro: Crown,
  studio: Crown,
};

export default function Pricing() {
  const navigate = useNavigate();
  const [serviceType, setServiceType] = useState<'mixing' | 'mastering' | 'subscriptions' | 'distribution' | 'beats'>('subscriptions');
  const [yearlyBilling, setYearlyBilling] = useState(false);

  const { data: subscriptionPlans, isLoading: loadingPlans } = useSubscriptionPlans();
  const { data: mixingPackages, isLoading: loadingMixing } = useMixingPackages();
  const { data: masteringPackages, isLoading: loadingMastering } = useMasteringPackages();
  const { data: distributionPackages, isLoading: loadingDistribution } = useDistributionPackages();
  const { data: addons } = useAddonServices(serviceType === 'subscriptions' ? undefined : (serviceType === 'distribution' || serviceType === 'beats' ? undefined : serviceType));

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Pricing - Mixing, Mastering, Distribution & Beat Licensing"
        description="Transparent pricing for mixing, mastering, distribution, and beat licensing. Creator plans, per-project rates, and MixxCoinz rewards on every purchase."
        keywords="mixing prices, mastering cost, audio engineering rates, music distribution pricing, beat licensing, MixxCoinz, mixing packages, mastering packages"
        schema={generateProductSchema({
          name: "Professional Mix Package",
          description: "Most popular mixing package with advanced processing and priority support",
          price: 249,
          currency: "USD",
        })}
      />

      <div className="min-h-screen bg-background relative overflow-hidden">
        <Navigation />

        {/* Hero background */}
        <div className="absolute top-0 left-0 right-0 h-[500px] z-0 pointer-events-none">
          <img src={heroPricing} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>

        {/* Ambient glow orbs */}
        <div className="absolute top-48 -left-32 w-96 h-96 rounded-full bg-primary/15 blur-[120px] pointer-events-none" />
        <div className="absolute top-96 -right-32 w-96 h-96 rounded-full bg-secondary/15 blur-[120px] pointer-events-none" />

        <div className="relative z-10 container max-w-6xl mx-auto px-4 py-16">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional audio services at competitive rates. No hidden fees, no surprises.
            </p>
          </motion.div>

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
                <div className="flex items-center justify-center gap-3">
                  <Label htmlFor="billing-toggle" className={!yearlyBilling ? 'font-semibold' : 'text-muted-foreground'}>Monthly</Label>
                  <Switch id="billing-toggle" checked={yearlyBilling} onCheckedChange={setYearlyBilling} />
                  <Label htmlFor="billing-toggle" className={yearlyBilling ? 'font-semibold' : 'text-muted-foreground'}>
                    Yearly <span className="text-green-500 ml-1">Save 20%</span>
                  </Label>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-6">
                {subscriptionPlans?.map((plan, i) => {
                  const Icon = planIcons[plan.plan_name] || Zap;
                  const isHighlighted = plan.plan_name === 'pro';
                  const displayPrice = yearlyBilling && plan.price_yearly ? Math.round(plan.price_yearly / 12) : plan.price_monthly;
                  const yearlyDiscount = getYearlyDiscountPercent(plan);

                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.6 }}
                    >
                      <GlassPanel
                        hoverable
                        glow={isHighlighted}
                        accent={isHighlighted ? 'rgba(168,85,247,0.4)' : undefined}
                        className={`relative flex flex-col h-full ${isHighlighted ? 'md:scale-105 ring-2 ring-primary/50' : ''}`}
                      >
                        {isHighlighted && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold z-20">
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
                          {plan.plan_name === 'free' ? 'Get Started Free' : plan.plan_name === 'studio' ? 'Contact Sales' : 'Start Free Trial'}
                        </Button>
                      </GlassPanel>
                    </motion.div>
                  );
                })}
              </div>

              <motion.div
                className="mt-12"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <GlassPanel accent="rgba(168,85,247,0.15)">
                  <h3 className="font-bold mb-2">💡 Not sure which plan is right for you?</h3>
                  <p className="text-muted-foreground">
                    Start with Free and upgrade anytime. All paid plans include a 7-day free trial with no credit card required.
                  </p>
                </GlassPanel>
              </motion.div>
            </TabsContent>

            {/* MIXING TAB */}
            <TabsContent value="mixing" className="mt-8">
              <div className="grid md:grid-cols-3 gap-6">
                {mixingPackages?.map((pkg, i) => (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                  >
                    <GlassPanel
                      hoverable
                      glow={pkg.is_featured}
                      accent={pkg.is_featured ? 'rgba(168,85,247,0.4)' : undefined}
                      className={`relative h-full flex flex-col ${pkg.is_featured ? 'ring-2 ring-primary/50' : ''}`}
                    >
                      {pkg.is_featured && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium z-20">
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

                      <div className="space-y-3 mb-6 flex-1">
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
                    </GlassPanel>
                  </motion.div>
                ))}
              </div>

              {addons && addons.length > 0 && (
                <motion.div className="mt-8" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                  <GlassPanel accent="rgba(168,85,247,0.15)">
                    <h3 className="font-bold mb-3">✨ Popular Add-Ons</h3>
                    <div className="flex flex-wrap gap-3">
                      {addons.slice(0, 4).map((addon) => (
                        <span key={addon.id} className="text-sm bg-background/40 px-3 py-1.5 rounded-full border border-border/50">
                          {addon.service_name} — <span className="text-primary font-medium">
                            {addon.is_percentage ? `+${addon.percentage_value}%` : `+$${addon.price}`}
                          </span>
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">Add-ons available during checkout</p>
                  </GlassPanel>
                </motion.div>
              )}
            </TabsContent>

            {/* MASTERING TAB */}
            <TabsContent value="mastering" className="mt-8">
              <div className="grid md:grid-cols-3 gap-6">
                {masteringPackages?.map((pkg, i) => (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                  >
                    <GlassPanel
                      hoverable
                      glow={pkg.is_featured}
                      accent={pkg.is_featured ? 'rgba(168,85,247,0.4)' : undefined}
                      className={`relative h-full flex flex-col ${pkg.is_featured ? 'ring-2 ring-primary/50' : ''}`}
                    >
                      {pkg.is_featured && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium z-20">
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

                      <div className="space-y-3 mb-6 flex-1">
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
                    </GlassPanel>
                  </motion.div>
                ))}
              </div>

              {addons && addons.length > 0 && (
                <motion.div className="mt-8" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                  <GlassPanel accent="rgba(168,85,247,0.15)">
                    <h3 className="font-bold mb-3">✨ Popular Add-Ons</h3>
                    <div className="flex flex-wrap gap-3">
                      {addons.slice(0, 4).map((addon) => (
                        <span key={addon.id} className="text-sm bg-background/40 px-3 py-1.5 rounded-full border border-border/50">
                          {addon.service_name} — <span className="text-primary font-medium">
                            {addon.is_percentage ? `+${addon.percentage_value}%` : `+$${addon.price}`}
                          </span>
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">Add-ons available during checkout</p>
                  </GlassPanel>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-12">
            <TrustBadges />
          </div>

          {/* FAQ Section */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "What's included in revisions?", a: "Revisions include adjustments to EQ, compression, effects, and overall balance based on your feedback." },
                { q: "Can I upgrade my package later?", a: "Yes! You can upgrade at any time and only pay the difference." },
                { q: "What formats do you deliver?", a: "We deliver WAV (24-bit/44.1kHz or higher), MP3 (320kbps), and any other format you need." },
              ].map((faq, i) => (
                <motion.div
                  key={faq.q}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                >
                  <GlassPanel hoverable>
                    <h3 className="font-semibold mb-2">{faq.q}</h3>
                    <p className="text-muted-foreground">{faq.a}</p>
                  </GlassPanel>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <PublicFooter />
        </div>
      </div>
    </>
  );
}
