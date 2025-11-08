import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Users, Lock, Zap, BarChart3, Shield, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

// Import enterprise system
import {
    LABEL_ESSENTIALS,
    STUDIO_PROFESSIONAL,
    UNIVERSITY_ENTERPRISE,
    ENTERPRISE_SYSTEM
} from '@/integrations/enterprise';

export default function Enterprise() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [selectedTier, setSelectedTier] = useState<'label' | 'studio' | 'university' | null>(null);

    const enterprisePackages = [
        {
            id: 'label',
            name: 'Label Essentials',
            price: 299,
            priceLabel: '$299/month',
            description: 'Perfect for independent labels and creators',
            icon: <Globe className="w-8 h-8" />,
            features: [
                'Up to 5 team members',
                'Basic analytics dashboard',
                'Contract management (10 active contracts)',
                'Standard email support',
                'Monthly reporting',
                'Custom branding (basic)',
                'API access (limited)',
                'Community forums access'
            ],
            highlights: [
                'Cost-effective',
                'Easy onboarding',
                'Quick setup'
            ],
            cta: 'Start Free Trial',
            badge: 'Most Popular'
        },
        {
            id: 'studio',
            name: 'Studio Professional',
            price: 499,
            priceLabel: '$499/month',
            description: 'For professional studios and growing labels',
            icon: <Zap className="w-8 h-8" />,
            features: [
                'Up to 15 team members',
                'Advanced analytics & reporting',
                'Unlimited contract management',
                'Priority email & Slack support',
                'Custom pricing negotiations',
                'Full white-label branding',
                'Full API access',
                'Dedicated account manager'
            ],
            highlights: [
                'Professional features',
                'Scalable',
                'Advanced controls'
            ],
            cta: 'Schedule Demo',
            badge: 'Best Value'
        },
        {
            id: 'university',
            name: 'University Enterprise',
            price: 799,
            priceLabel: '$799/month',
            description: 'Enterprise solution for universities, networks & studios',
            icon: <Shield className="w-8 h-8" />,
            features: [
                'Unlimited team members',
                'Advanced analytics & AI insights',
                'SLA service agreements',
                '24/7 dedicated support + phone',
                'Custom pricing & billing',
                'Full white-label platform',
                'Custom integrations',
                'Dedicated engineering team'
            ],
            highlights: [
                'Enterprise grade',
                'Full customization',
                'Premium support'
            ],
            cta: 'Request Proposal',
            badge: 'Enterprise'
        }
    ];

    const keyFeatures = [
        {
            icon: <Users className="w-6 h-6" />,
            title: 'Team Management',
            description: 'Invite team members with role-based access control and permissions'
        },
        {
            icon: <BarChart3 className="w-6 h-6" />,
            title: 'Advanced Analytics',
            description: 'Track metrics, revenue, usage trends, and performance in real-time'
        },
        {
            icon: <Lock className="w-6 h-6" />,
            title: 'Contract Management',
            description: 'Create, manage, and track service agreements with SLA terms'
        },
        {
            icon: <Globe className="w-6 h-6" />,
            title: 'White-Label Platform',
            description: 'Rebrand MixClub entirely with your logo and custom domain'
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: 'Custom Pricing',
            description: 'Negotiate custom pricing and billing arrangements per account'
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: 'Enterprise Security',
            description: 'SSO/LDAP, audit logging, data isolation, and compliance support'
        }
    ];

    const handleCtaClick = (tier: string) => {
        if (!user) {
            navigate('/auth', { state: { returnTo: '/enterprise' } });
        } else {
            navigate('/checkout', { state: { plan: tier, type: 'enterprise' } });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <div className="pt-32 pb-16 px-6 text-center">
                <h1 className="text-5xl font-bold text-white mb-6">
                    Enterprise Solutions for Music Industry
                </h1>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
                    White-label platform designed for music labels, studios, and universities.
                    Scale your business with powerful tools built for collaboration and growth.
                </p>
                <div className="flex justify-center gap-4">
                    <Button
                        size="lg"
                        onClick={() => navigate('/contact', { state: { subject: 'Enterprise Demo' } })}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Schedule Demo
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        View Pricing
                    </Button>
                </div>
            </div>

            {/* Key Features */}
            <div className="py-16 px-6 bg-slate-800/50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">
                        Enterprise Features
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {keyFeatures.map((feature, idx) => (
                            <Card key={idx} className="bg-slate-700 border-slate-600 p-6">
                                <div className="text-blue-400 mb-4">{feature.icon}</div>
                                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                                <p className="text-slate-300">{feature.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Pricing Section */}
            <div id="pricing" className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-white text-center mb-4">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-slate-300 text-center mb-12">
                        Choose the plan that fits your organization. All plans include 14-day free trial.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {enterprisePackages.map((pkg) => (
                            <Card
                                key={pkg.id}
                                className={`flex flex-col h-full transition-all duration-300 ${selectedTier === pkg.id
                                        ? 'border-blue-500 bg-slate-700 shadow-lg shadow-blue-500/20'
                                        : 'bg-slate-700 border-slate-600 hover:border-blue-400'
                                    }`}
                            >
                                <div className="p-8 flex-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {pkg.icon}
                                            <h3 className="text-2xl font-bold text-white">{pkg.name}</h3>
                                        </div>
                                        {pkg.badge && (
                                            <Badge className="bg-blue-600">{pkg.badge}</Badge>
                                        )}
                                    </div>

                                    <p className="text-slate-300 mb-6">{pkg.description}</p>

                                    <div className="mb-6">
                                        <div className="text-4xl font-bold text-white">
                                            ${pkg.price}
                                            <span className="text-lg text-slate-400 font-normal">/month</span>
                                        </div>
                                        <p className="text-slate-400 text-sm mt-2">Billed annually, cancel anytime</p>
                                    </div>

                                    <Button
                                        onClick={() => {
                                            setSelectedTier(pkg.id as 'label' | 'studio' | 'university');
                                            handleCtaClick(pkg.id);
                                        }}
                                        className={`w-full mb-8 ${pkg.id === 'studio'
                                                ? 'bg-blue-600 hover:bg-blue-700'
                                                : 'bg-slate-600 hover:bg-slate-500'
                                            }`}
                                    >
                                        {pkg.cta}
                                    </Button>

                                    <div className="space-y-3">
                                        <p className="text-sm font-semibold text-slate-300">Includes:</p>
                                        {pkg.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-start gap-3">
                                                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                                <span className="text-slate-300">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t border-slate-600 p-6 bg-slate-800/50">
                                    <p className="text-sm text-slate-400">
                                        <span className="font-semibold text-slate-300">Best for:</span> {pkg.highlights.join(', ')}
                                    </p>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-12 p-8 bg-slate-700 rounded-lg border border-slate-600">
                        <h3 className="text-xl font-bold text-white mb-4">Need Custom Terms?</h3>
                        <p className="text-slate-300 mb-6">
                            Contact our enterprise team for volume discounts, custom contract terms,
                            or specialized integrations.
                        </p>
                        <Button
                            onClick={() => navigate('/contact', { state: { subject: 'Custom Enterprise Plan' } })}
                            variant="outline"
                            className="text-blue-400 border-blue-400 hover:bg-blue-600"
                        >
                            Get Custom Quote
                        </Button>
                    </div>
                </div>
            </div>

            {/* Comparison Table */}
            <div className="py-16 px-6 bg-slate-800/50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">
                        Feature Comparison
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full text-slate-300">
                            <thead>
                                <tr className="border-b border-slate-600">
                                    <th className="text-left py-4 px-4 text-white font-semibold">Feature</th>
                                    <th className="text-center py-4 px-4">Label Essentials</th>
                                    <th className="text-center py-4 px-4">Studio Professional</th>
                                    <th className="text-center py-4 px-4">University Enterprise</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-600">
                                <tr>
                                    <td className="py-4 px-4 font-semibold">Team Members</td>
                                    <td className="text-center">Up to 5</td>
                                    <td className="text-center">Up to 15</td>
                                    <td className="text-center">Unlimited</td>
                                </tr>
                                <tr className="bg-slate-700/30">
                                    <td className="py-4 px-4 font-semibold">Active Contracts</td>
                                    <td className="text-center">10</td>
                                    <td className="text-center">Unlimited</td>
                                    <td className="text-center">Unlimited</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 font-semibold">White-Label</td>
                                    <td className="text-center">
                                        <span className="text-slate-500">Basic</span>
                                    </td>
                                    <td className="text-center">
                                        <Check className="w-5 h-5 text-green-400 inline" />
                                    </td>
                                    <td className="text-center">
                                        <Check className="w-5 h-5 text-green-400 inline" />
                                    </td>
                                </tr>
                                <tr className="bg-slate-700/30">
                                    <td className="py-4 px-4 font-semibold">Custom Pricing</td>
                                    <td className="text-center">
                                        <span className="text-slate-500">—</span>
                                    </td>
                                    <td className="text-center">
                                        <Check className="w-5 h-5 text-green-400 inline" />
                                    </td>
                                    <td className="text-center">
                                        <Check className="w-5 h-5 text-green-400 inline" />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 font-semibold">API Access</td>
                                    <td className="text-center">Limited</td>
                                    <td className="text-center">Full</td>
                                    <td className="text-center">Full + Custom</td>
                                </tr>
                                <tr className="bg-slate-700/30">
                                    <td className="py-4 px-4 font-semibold">Support</td>
                                    <td className="text-center">Email</td>
                                    <td className="text-center">Priority + Slack</td>
                                    <td className="text-center">24/7 + Phone</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 font-semibold">SSO/LDAP</td>
                                    <td className="text-center">
                                        <span className="text-slate-500">—</span>
                                    </td>
                                    <td className="text-center">
                                        <span className="text-slate-500">—</span>
                                    </td>
                                    <td className="text-center">
                                        <Check className="w-5 h-5 text-green-400 inline" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Integration Section */}
            <div className="py-16 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">
                        Built-In MixClub Systems
                    </h2>
                    <p className="text-slate-300 text-center mb-8 max-w-2xl mx-auto">
                        Your enterprise account includes access to all MixClub systems,
                        integrated and ready to use:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            '✓ Subscription Management',
                            '✓ Referral & Partner Programs',
                            '✓ Marketplace Integration',
                            '✓ AI Matching Engine',
                            '✓ Professional Services',
                            '✓ Premium Courses',
                            '✓ Analytics Dashboard',
                            '✓ User Community'
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-4 bg-slate-700 rounded-lg">
                                <span className="text-green-400">{item.split(' ')[0]}</span>
                                <span className="text-slate-200">{item.substring(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-16 px-6 bg-gradient-to-r from-blue-600 to-blue-800">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">
                        Ready to Scale Your Music Business?
                    </h2>
                    <p className="text-blue-100 mb-8 text-lg">
                        Get started with a free 14-day trial. No credit card required.
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <Button
                            size="lg"
                            onClick={() => handleCtaClick('label')}
                            className="bg-white text-blue-600 hover:bg-slate-100"
                        >
                            Start Free Trial
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={() => navigate('/contact', { state: { subject: 'Enterprise Demo' } })}
                            className="border-white text-white hover:bg-blue-700"
                        >
                            Schedule Demo
                        </Button>
                    </div>
                    <p className="text-blue-100 text-sm mt-6">
                        Join labels, studios, and universities worldwide using MixClub Enterprise
                    </p>
                </div>
            </div>
        </div>
    );
}
