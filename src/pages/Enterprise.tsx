import React, { useState } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Users, Lock, Zap, BarChart3, Shield, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { ShowcaseFeature } from '@/components/services/ShowcaseFeature';
import { motion } from 'framer-motion';

// Import enterprise system
import {
  LABEL_ESSENTIALS,
  STUDIO_PROFESSIONAL,
  UNIVERSITY_ENTERPRISE
} from '@/integrations/enterprise';

// Import enterprise images
import enterpriseHero from '@/assets/promo/enterprise-hero.jpg';
import enterpriseTeam from '@/assets/promo/enterprise-team.jpg';
import enterpriseAnalytics from '@/assets/promo/enterprise-analytics.jpg';
import enterpriseContracts from '@/assets/promo/enterprise-contracts.jpg';
import enterpriseWhitelabel from '@/assets/promo/enterprise-whitelabel.jpg';
import enterpriseSecurity from '@/assets/promo/enterprise-security.jpg';

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

  const enterpriseFeatures = [
    {
      image: enterpriseTeam,
      icon: Users,
      title: 'Team Management',
      subtitle: 'Scale Your Operation',
      description: 'Invite team members with role-based access control. Manage your entire roster from one unified dashboard with granular permissions.',
      stats: [
        { label: 'Team Size', value: '∞' },
        { label: 'Roles', value: '10+' },
        { label: 'SSO', value: '✓' }
      ],
      techDetails: ['RBAC', 'SSO/LDAP', 'Audit Logging', 'Bulk Import']
    },
    {
      image: enterpriseAnalytics,
      icon: BarChart3,
      title: 'Advanced Analytics',
      subtitle: 'Data-Driven Decisions',
      description: 'Track metrics, revenue, usage trends, and performance in real-time. AI-powered insights help you optimize operations and grow revenue.',
      stats: [
        { label: 'Reports', value: 'Real-time' },
        { label: 'Exports', value: 'All formats' },
        { label: 'AI Insights', value: '✓' }
      ],
      techDetails: ['Revenue Tracking', 'Usage Analytics', 'AI Insights', 'Custom Reports']
    },
    {
      image: enterpriseContracts,
      icon: Lock,
      title: 'Contract Management',
      subtitle: 'Streamline Agreements',
      description: 'Create, manage, and track service agreements with SLA terms. Digital signatures, automated renewals, and compliance tracking built-in.',
      stats: [
        { label: 'Contracts', value: '∞' },
        { label: 'Templates', value: '20+' },
        { label: 'E-Sign', value: '✓' }
      ],
      techDetails: ['Digital Signatures', 'SLA Tracking', 'Auto-Renewal', 'Compliance']
    },
    {
      image: enterpriseWhitelabel,
      icon: Globe,
      title: 'White-Label Platform',
      subtitle: 'Your Brand, Your Rules',
      description: 'Rebrand Mixxclub entirely with your logo, colors, and custom domain. Present a seamless experience to your artists and clients.',
      stats: [
        { label: 'Custom Domain', value: '✓' },
        { label: 'Full Branding', value: '✓' },
        { label: 'API Access', value: 'Full' }
      ],
      techDetails: ['Custom Domain', 'Brand Kit', 'Email Templates', 'API Integration']
    },
    {
      image: enterpriseSecurity,
      icon: Shield,
      title: 'Enterprise Security',
      subtitle: 'Trust & Compliance',
      description: 'SOC 2 compliant infrastructure with SSO/LDAP integration, audit logging, data isolation, and enterprise-grade security controls.',
      stats: [
        { label: 'SOC 2', value: '✓' },
        { label: 'Encryption', value: 'AES-256' },
        { label: 'Uptime', value: '99.9%' }
      ],
      techDetails: ['SSO/LDAP', 'Audit Logs', 'Data Isolation', 'GDPR Ready']
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
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      <Navigation />
      
      {/* Hero Section with Image */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={enterpriseHero} 
            alt="Enterprise collaboration"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        <div className="container px-6 relative z-10">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              Enterprise Solutions
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6">
              Scale Your Music
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Business
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              White-label platform designed for music labels, studios, and universities.
              Scale your business with powerful tools built for collaboration and growth.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/contact', { state: { subject: 'Enterprise Demo' } })}
                className="bg-primary hover:bg-primary/90"
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
          </motion.div>
        </div>
      </section>

      {/* Enterprise Features - ShowcaseFeature sections */}
      <section className="py-20 px-6">
        <div className="container">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Enterprise Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to run a world-class music operation
            </p>
          </motion.div>

          <div className="space-y-24">
            {enterpriseFeatures.map((feature, idx) => (
              <ShowcaseFeature
                key={feature.title}
                image={feature.image}
                icon={feature.icon}
                title={feature.title}
                subtitle={feature.subtitle}
                description={feature.description}
                stats={feature.stats}
                techDetails={feature.techDetails}
                reversed={idx % 2 !== 0}
                delay={idx * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-muted/30">
        <div className="container">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground">
              Choose the plan that fits your organization. All plans include 14-day free trial.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {enterprisePackages.map((pkg, idx) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card
                  className={`flex flex-col h-full transition-all duration-300 ${selectedTier === pkg.id
                    ? 'border-primary bg-card shadow-lg shadow-primary/20'
                    : 'bg-card border-border hover:border-primary/50'
                  }`}
                >
                  <div className="p-8 flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-primary">{pkg.icon}</div>
                        <h3 className="text-2xl font-bold text-foreground">{pkg.name}</h3>
                      </div>
                      {pkg.badge && (
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          {pkg.badge}
                        </Badge>
                      )}
                    </div>

                    <p className="text-muted-foreground mb-6">{pkg.description}</p>

                    <div className="mb-6">
                      <div className="text-4xl font-bold text-foreground">
                        ${pkg.price}
                        <span className="text-lg text-muted-foreground font-normal">/month</span>
                      </div>
                      <p className="text-muted-foreground text-sm mt-2">Billed annually, cancel anytime</p>
                    </div>

                    <Button
                      onClick={() => {
                        setSelectedTier(pkg.id as 'label' | 'studio' | 'university');
                        handleCtaClick(pkg.id);
                      }}
                      className={`w-full mb-8 ${pkg.id === 'studio'
                        ? 'bg-primary hover:bg-primary/90'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                      }`}
                    >
                      {pkg.cta}
                    </Button>

                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-muted-foreground">Includes:</p>
                      {pkg.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border p-6 bg-muted/30">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Best for:</span> {pkg.highlights.join(', ')}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="mt-12 p-8 bg-card rounded-lg border border-border max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-bold text-foreground mb-4">Need Custom Terms?</h3>
            <p className="text-muted-foreground mb-6">
              Contact our enterprise team for volume discounts, custom contract terms,
              or specialized integrations.
            </p>
            <Button
              onClick={() => navigate('/contact', { state: { subject: 'Custom Enterprise Plan' } })}
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Get Custom Quote
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-6">
        <div className="container max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Feature Comparison
            </h2>
          </motion.div>

          <div className="overflow-x-auto">
            <table className="w-full text-muted-foreground">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 text-foreground font-semibold">Feature</th>
                  <th className="text-center py-4 px-4">Label Essentials</th>
                  <th className="text-center py-4 px-4">Studio Professional</th>
                  <th className="text-center py-4 px-4">University Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-4 px-4 font-semibold">Team Members</td>
                  <td className="text-center">Up to 5</td>
                  <td className="text-center">Up to 15</td>
                  <td className="text-center">Unlimited</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="py-4 px-4 font-semibold">Active Contracts</td>
                  <td className="text-center">10</td>
                  <td className="text-center">Unlimited</td>
                  <td className="text-center">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold">White-Label</td>
                  <td className="text-center">
                    <span className="text-muted-foreground/50">Basic</span>
                  </td>
                  <td className="text-center">
                    <Check className="w-5 h-5 text-primary inline" />
                  </td>
                  <td className="text-center">
                    <Check className="w-5 h-5 text-primary inline" />
                  </td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="py-4 px-4 font-semibold">Custom Pricing</td>
                  <td className="text-center">
                    <span className="text-muted-foreground/50">—</span>
                  </td>
                  <td className="text-center">
                    <Check className="w-5 h-5 text-primary inline" />
                  </td>
                  <td className="text-center">
                    <Check className="w-5 h-5 text-primary inline" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold">API Access</td>
                  <td className="text-center">Limited</td>
                  <td className="text-center">Full</td>
                  <td className="text-center">Full + Custom</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="py-4 px-4 font-semibold">Support</td>
                  <td className="text-center">Email</td>
                  <td className="text-center">Priority + Slack</td>
                  <td className="text-center">24/7 + Phone</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold">SSO/LDAP</td>
                  <td className="text-center">
                    <span className="text-muted-foreground/50">—</span>
                  </td>
                  <td className="text-center">
                    <span className="text-muted-foreground/50">—</span>
                  </td>
                  <td className="text-center">
                    <Check className="w-5 h-5 text-primary inline" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-6">
        <div className="container max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to Scale Your Operation?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join industry leaders who trust Mixxclub Enterprise for their audio production needs.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/contact', { state: { subject: 'Enterprise Inquiry' } })}
              className="bg-primary hover:bg-primary/90"
            >
              Get Started Today
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-muted/30">
        <div className="container px-6 text-center text-sm text-muted-foreground">
          <p>© 2026 Mixxclub Enterprise. Built for the music industry.</p>
        </div>
      </footer>
    </div>
  );
}
