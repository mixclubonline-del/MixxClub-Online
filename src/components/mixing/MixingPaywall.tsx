import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Music, Mic, Headphones, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface MixingPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  track_limit: number;
}

interface MixingPaywallProps {
  onPurchaseComplete?: () => void;
}

export const MixingPaywall: React.FC<MixingPaywallProps> = ({ onPurchaseComplete }) => {
  const [packages, setPackages] = useState<MixingPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('mixing_packages')
        .select('*')
        .eq('is_active', true)
        .order('price');

      if (error) throw error;

      const formattedPackages = data.map(pkg => ({
        ...pkg,
        features: Array.isArray(pkg.features) ? pkg.features : 
                 typeof pkg.features === 'string' ? JSON.parse(pkg.features) : []
      }));

      setPackages(formattedPackages);
    } catch (error) {
      console.error('Error fetching mixing packages:', error);
      toast.error('Failed to load mixing packages');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageId: string) => {
    if (!user) {
      toast.error('Please sign in to purchase a mixing package');
      return;
    }

    try {
      setPurchasing(packageId);

      const { data, error } = await supabase.functions.invoke('create-mixing-checkout', {
        body: { packageId },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to create checkout session');
    } finally {
      setPurchasing(null);
    }
  };

  const getPopularBadge = (name: string) => {
    if (name.toLowerCase().includes('package')) {
      return <Badge className="absolute -top-2 -right-2 bg-accent text-accent-foreground">Popular</Badge>;
    }
    return null;
  };

  const getTrackLimitText = (trackLimit: number) => {
    if (trackLimit === -1) return 'Unlimited tracks';
    if (trackLimit === 1) return '1 track';
    return `${trackLimit} tracks`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Headphones className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Professional Mixing Services
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Transform your tracks with our professional mixing services. Choose the package that fits your needs.
        </p>
      </div>

      {/* Packages Grid */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {packages.map((pkg) => (
          <Card 
            key={pkg.id} 
            className={`relative transition-all duration-300 hover:shadow-lg ${
              pkg.name.toLowerCase().includes('package') ? 'border-primary shadow-md scale-105' : ''
            }`}
          >
            {getPopularBadge(pkg.name)}
            <CardHeader className="text-center pb-2">
              <div className="flex items-center justify-center mb-2">
                {pkg.name.toLowerCase().includes('basic') ? (
                  <Mic className="h-8 w-8 text-primary" />
                ) : pkg.name.toLowerCase().includes('package') ? (
                  <Music className="h-8 w-8 text-primary" />
                ) : (
                  <Star className="h-8 w-8 text-primary" />
                )}
              </div>
              <CardTitle className="text-2xl">{pkg.name}</CardTitle>
              <CardDescription>{pkg.description}</CardDescription>
              <div className="text-3xl font-bold text-primary mt-2">
                ${pkg.price}
                <span className="text-sm text-muted-foreground font-normal"> {pkg.currency}</span>
              </div>
              <p className="text-sm text-muted-foreground">{getTrackLimitText(pkg.track_limit)}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handlePurchase(pkg.id)}
                disabled={purchasing === pkg.id}
                className="w-full"
                variant={pkg.name.toLowerCase().includes('package') ? 'default' : 'outline'}
              >
                {purchasing === pkg.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Get Started'
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Info */}
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4 text-center">Why Choose Our Mixing Services?</h3>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <Music className="h-8 w-8 text-primary mx-auto mb-2" />
              <h4 className="font-semibold mb-2">Professional Quality</h4>
              <p className="text-sm text-muted-foreground">
                Industry-standard mixing techniques and premium plugin suites for professional results.
              </p>
            </div>
            <div>
              <Headphones className="h-8 w-8 text-primary mx-auto mb-2" />
              <h4 className="font-semibold mb-2">Genre Expertise</h4>
              <p className="text-sm text-muted-foreground">
                Specialized mixing approaches tailored to your specific genre and artistic vision.
              </p>
            </div>
            <div>
              <Mic className="h-8 w-8 text-primary mx-auto mb-2" />
              <h4 className="font-semibold mb-2">Fast Turnaround</h4>
              <p className="text-sm text-muted-foreground">
                Quick delivery times without compromising on quality. Priority support included.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};