import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Lock, Zap, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionManagement } from '@/hooks/useSubscriptionManagement';
import { SEOHead } from '@/components/SEOHead';

interface FeatureComparison {
    feature: string;
    free: string | boolean;
    starter: string | boolean;
    pro: string | boolean;
    studio: string | boolean;
}

const featureComparisons: FeatureComparison[] = [
    {
        feature: 'Community Access',
        free: true,
        starter: true,
        pro: true,
        studio: true,
    },
    {
        feature: 'Mix Battles',
        free: true,
        starter: true,
        pro: true,
        studio: true,
    },
    {
        feature: 'Portfolio Building',
        free: true,
        starter: true,
        pro: true,
        studio: true,
    },
    {
        feature: 'Track Processing/Month',
        free: '5',
        starter: '25',
        pro: '100',
        studio: 'Unlimited',
    },
    {
        feature: 'Masters/Month',
        free: '1',
        starter: '5',
        pro: '20',
        studio: 'Unlimited',
    },
    {
        feature: 'Storage',
        free: '1 GB',
        starter: '10 GB',
        pro: '100 GB',
        studio: '1000 GB',
    },
    {
        feature: 'Collaborators',
        free: false,
        starter: '3',
        pro: '10',
        studio: '50',
    },
    {
        feature: 'Basic Analytics',
        free: false,
        starter: true,
        pro: true,
        studio: true,
    },
    {
        feature: 'Engineer Consultation',
        free: false,
        starter: false,
        pro: '2/month',
        studio: 'Unlimited',
    },
    {
        feature: 'Priority Support',
        free: false,
        starter: false,
        pro: true,
        studio: '24/7',
    },
    {
        feature: 'API Access',
        free: false,
        starter: false,
        pro: false,
        studio: true,
    },
    {
        feature: 'White-label',
        free: false,
        starter: false,
        pro: false,
        studio: true,
    },
];

const upgradeBenefits = [
    {
        icon: TrendingUp,
        title: 'Unlimited Processing',
        description: 'Remove monthly limits and process as many tracks as you need',
    },
    {
        icon: Zap,
        title: 'Priority Support',
        description: 'Get help faster with dedicated support team',
    },
    {
        icon: CheckCircle2,
        title: 'Advanced Features',
        description: 'Access exclusive tools and early beta features',
    },
];

export default function FreemiumOverview() {
    const navigate = useNavigate();
    const { currentSubscription, currentPlan } = useSubscriptionManagement();
    const [selectedTier, setSelectedTier] = useState<'all' | 'free' | 'starter' | 'pro' | 'studio'>('all');

    const handleUpgrade = (tier: string) => {
        if (tier === 'free') {
            navigate('/auth?mode=signup');
        } else {
            navigate(`/checkout?type=subscription&tier=${tier}`);
        }
    };

    return (
        <>
            <SEOHead
                title="Freemium Creator Plans | Mixxclub"
                description="Start free and upgrade anytime! Unlimited mixing & mastering with Mixxclub's flexible creator plans. 7-day free trial on paid plans."
                keywords="free plan, creator plans, mixing, mastering, unlimited audio processing"
            />

            <div className="min-h-screen bg-gradient-to-b from-background to-accent/5">
                {/* Header */}
                <div className="container max-w-6xl mx-auto px-4 py-16">
                    <div className="text-center mb-12">
                        <h1 className="text-5xl font-bold mb-4">Start Free. Upgrade Anytime.</h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
                            No credit card required. All paid plans include a 7-day free trial.
                        </p>

                        {currentSubscription && currentSubscription.tier !== 'free' && (
                            <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-700 px-4 py-2 rounded-full mb-4">
                                <CheckCircle2 className="w-5 h-5" />
                                <span>You're currently on the <strong>{currentPlan?.name}</strong> plan</span>
                            </div>
                        )}
                    </div>

                    {/* Why Upgrade */}
                    <div className="grid md:grid-cols-3 gap-6 mb-16">
                        {upgradeBenefits.map((benefit, i) => {
                            const Icon = benefit.icon;
                            return (
                                <Card key={i} className="p-6 text-center">
                                    <Icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                                    <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                                    <p className="text-muted-foreground">{benefit.description}</p>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Comparison Table */}
                    <Card className="p-8 mb-12 overflow-x-auto">
                        <h2 className="text-2xl font-bold mb-6">Feature Comparison</h2>

                        {/* Filter Tabs */}
                        <div className="flex gap-2 mb-6 pb-6 border-b border-border overflow-x-auto">
                            <Button
                                variant={selectedTier === 'all' ? 'default' : 'outline'}
                                onClick={() => setSelectedTier('all')}
                                className="whitespace-nowrap"
                            >
                                All Plans
                            </Button>
                            {['free', 'starter', 'pro', 'studio'].map((tier) => (
                                <Button
                                    key={tier}
                                    variant={selectedTier === tier ? 'default' : 'outline'}
                                    onClick={() => setSelectedTier(tier as any)}
                                    className="whitespace-nowrap capitalize"
                                >
                                    {tier}
                                </Button>
                            ))}
                        </div>

                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 font-semibold">Feature</th>
                                    {(selectedTier === 'all' || selectedTier === 'free') && (
                                        <th className="text-center py-3 px-4 font-semibold">Free</th>
                                    )}
                                    {(selectedTier === 'all' || selectedTier === 'starter') && (
                                        <th className="text-center py-3 px-4 font-semibold">
                                            Starter
                                            <div className="text-xs font-normal text-muted-foreground">$9/mo</div>
                                        </th>
                                    )}
                                    {(selectedTier === 'all' || selectedTier === 'pro') && (
                                        <th className="text-center py-3 px-4 font-semibold">
                                            Pro
                                            <div className="text-xs font-normal text-primary">$29/mo</div>
                                        </th>
                                    )}
                                    {(selectedTier === 'all' || selectedTier === 'studio') && (
                                        <th className="text-center py-3 px-4 font-semibold">
                                            Studio
                                            <div className="text-xs font-normal text-muted-foreground">$99/mo</div>
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {featureComparisons.map((row, i) => (
                                    <tr key={i} className="border-b border-border hover:bg-accent/50">
                                        <td className="py-4 px-4 font-medium">{row.feature}</td>
                                        {(selectedTier === 'all' || selectedTier === 'free') && (
                                            <td className="text-center py-4 px-4">
                                                {typeof row.free === 'boolean' ? (
                                                    row.free ? (
                                                        <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                                                    ) : (
                                                        <Lock className="w-5 h-5 text-muted-foreground mx-auto" />
                                                    )
                                                ) : (
                                                    <span>{row.free}</span>
                                                )}
                                            </td>
                                        )}
                                        {(selectedTier === 'all' || selectedTier === 'starter') && (
                                            <td className="text-center py-4 px-4">
                                                {typeof row.starter === 'boolean' ? (
                                                    row.starter ? (
                                                        <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                                                    ) : (
                                                        <Lock className="w-5 h-5 text-muted-foreground mx-auto" />
                                                    )
                                                ) : (
                                                    <span>{row.starter}</span>
                                                )}
                                            </td>
                                        )}
                                        {(selectedTier === 'all' || selectedTier === 'pro') && (
                                            <td className="text-center py-4 px-4 bg-primary/5">
                                                {typeof row.pro === 'boolean' ? (
                                                    row.pro ? (
                                                        <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                                                    ) : (
                                                        <Lock className="w-5 h-5 text-muted-foreground mx-auto" />
                                                    )
                                                ) : (
                                                    <span className="font-semibold">{row.pro}</span>
                                                )}
                                            </td>
                                        )}
                                        {(selectedTier === 'all' || selectedTier === 'studio') && (
                                            <td className="text-center py-4 px-4">
                                                {typeof row.studio === 'boolean' ? (
                                                    row.studio ? (
                                                        <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                                                    ) : (
                                                        <Lock className="w-5 h-5 text-muted-foreground mx-auto" />
                                                    )
                                                ) : (
                                                    <span>{row.studio}</span>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>

                    {/* CTA Section */}
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                            Join thousands of artists and engineers collaborating on Mixxclub. Start free today!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                size="lg"
                                onClick={() => handleUpgrade('free')}
                                variant="outline"
                            >
                                Start Free (Forever Free)
                            </Button>
                            <Button
                                size="lg"
                                onClick={() => handleUpgrade('starter')}
                            >
                                Try Starter (7 Days Free)
                            </Button>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="mt-16 max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            <Card className="p-6">
                                <h3 className="font-bold mb-2">Do I need a credit card for free tier?</h3>
                                <p className="text-muted-foreground">
                                    No! Start completely free with no credit card required. Upgrade anytime.
                                </p>
                            </Card>
                            <Card className="p-6">
                                <h3 className="font-bold mb-2">Can I downgrade later?</h3>
                                <p className="text-muted-foreground">
                                    Absolutely. Downgrade anytime at the end of your billing cycle. No penalties.
                                </p>
                            </Card>
                            <Card className="p-6">
                                <h3 className="font-bold mb-2">What happens when I hit my monthly limit?</h3>
                                <p className="text-muted-foreground">
                                    You'll see a notification and can upgrade immediately or wait until next month. Your data is always safe.
                                </p>
                            </Card>
                            <Card className="p-6">
                                <h3 className="font-bold mb-2">Do you offer annual billing?</h3>
                                <p className="text-muted-foreground">
                                    Yes! Save 20% with annual billing. Contact sales for enterprise plans.
                                </p>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
