import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { TrustBadges } from '@/components/TrustBadges';

const mixingPackages = [
  {
    name: 'Basic Mix',
    price: 150,
    description: 'Perfect for getting started',
    features: [
      'Up to 5 tracks',
      '3 revision rounds',
      '5-7 day turnaround',
      'Basic EQ & compression',
      'Stereo mix delivery',
    ],
    notIncluded: ['Stems delivery', 'Priority support', 'Mastering included'],
  },
  {
    name: 'Professional Mix',
    price: 300,
    description: 'Most popular choice',
    popular: true,
    features: [
      'Up to 15 tracks',
      '5 revision rounds',
      '3-5 day turnaround',
      'Advanced processing',
      'Stereo + stems delivery',
      'Priority support',
    ],
    notIncluded: ['Mastering included'],
  },
  {
    name: 'Premium Mix',
    price: 500,
    description: 'Professional studio quality',
    features: [
      'Unlimited tracks',
      'Unlimited revisions',
      '24-48 hour turnaround',
      'Full advanced processing',
      'All formats delivery',
      'Priority support',
      'Free mastering included',
    ],
    notIncluded: [],
  },
];

const masteringPackages = [
  {
    name: 'Single Track',
    price: 75,
    description: 'One song mastered to perfection',
    features: [
      '1 track mastered',
      '2 revision rounds',
      '3-5 day turnaround',
      'Streaming optimization',
      'Multiple formats',
    ],
    notIncluded: ['Stems mastering', 'Priority delivery'],
  },
  {
    name: 'EP Package',
    price: 250,
    description: 'Best value for projects',
    popular: true,
    features: [
      'Up to 5 tracks',
      '3 revision rounds',
      '2-3 day turnaround',
      'Streaming + CD optimization',
      'All formats included',
      'Priority support',
    ],
    notIncluded: [],
  },
  {
    name: 'Album Package',
    price: 450,
    description: 'Complete album treatment',
    features: [
      'Up to 15 tracks',
      'Unlimited revisions',
      '24-48 hour turnaround',
      'Full optimization',
      'Stems mastering available',
      'Priority support',
      'Free mixing consultation',
    ],
    notIncluded: [],
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const [serviceType, setServiceType] = useState<'mixing' | 'mastering'>('mixing');

  const packages = serviceType === 'mixing' ? mixingPackages : masteringPackages;

  const handleSelectPackage = (packageName: string, price: number) => {
    navigate(`/checkout?type=${serviceType}&package=${packageName}&price=${price}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/5">
      {/* Hero Section */}
      <div className="container max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional audio services at competitive rates. No hidden fees, no surprises.
          </p>
        </div>

        {/* Service Type Selector */}
        <Tabs value={serviceType} onValueChange={(v) => setServiceType(v as 'mixing' | 'mastering')} className="mb-12">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="mixing">Mixing Services</TabsTrigger>
            <TabsTrigger value="mastering">Mastering Services</TabsTrigger>
          </TabsList>

          <TabsContent value="mixing" className="mt-8">
            <div className="grid md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <Card
                  key={pkg.name}
                  className={`p-6 relative ${
                    pkg.popular ? 'border-2 border-primary shadow-xl' : ''
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                    <p className="text-muted-foreground mb-4">{pkg.description}</p>
                    <div className="mb-4">
                      <span className="text-4xl font-bold">${pkg.price}</span>
                      <span className="text-muted-foreground">/project</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {pkg.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                    {pkg.notIncluded.map((feature) => (
                      <div key={feature} className="flex items-start gap-2 opacity-50">
                        <X className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleSelectPackage(pkg.name, pkg.price)}
                    className="w-full"
                    variant={pkg.popular ? 'default' : 'outline'}
                  >
                    Get Started
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mastering" className="mt-8">
            <div className="grid md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <Card
                  key={pkg.name}
                  className={`p-6 relative ${
                    pkg.popular ? 'border-2 border-primary shadow-xl' : ''
                  }`}
                >
                  {pkg.popular && (
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
                  </div>

                  <div className="space-y-3 mb-6">
                    {pkg.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                    {pkg.notIncluded.map((feature) => (
                      <div key={feature} className="flex items-start gap-2 opacity-50">
                        <X className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleSelectPackage(pkg.name, pkg.price)}
                    className="w-full"
                    variant={pkg.popular ? 'default' : 'outline'}
                  >
                    Get Started
                  </Button>
                </Card>
              ))}
            </div>
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
  );
}
