import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MasteringPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  track_limit: number;
}

interface MasteringPaywallProps {
  onAccessGranted?: () => void;
}

export const MasteringPackages = ({ onAccessGranted }: MasteringPaywallProps) => {
  const [packages, setPackages] = useState<MasteringPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('mastering_packages')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      
      const formattedPackages = (data || []).map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description || '',
        price: pkg.price,
        currency: pkg.currency,
        features: Array.isArray(pkg.features) ? pkg.features.filter((f): f is string => typeof f === 'string') : [],
        track_limit: pkg.track_limit
      }));
      
      setPackages(formattedPackages);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error('Failed to load mastering packages');
    }
  };

  const handlePurchase = async (packageId: string) => {
    try {
      setLoading(true);
      setSelectedPackage(packageId);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Redirect to auth with current page as return URL
        window.location.href = `/auth?redirect=${encodeURIComponent(window.location.pathname)}`;
        return;
      }

      // Call Stripe function to create checkout session
      const { data, error } = await supabase.functions.invoke('create-payment-checkout', {
        body: { packageId, packageType: 'mastering' }
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Failed to start checkout process');
    } finally {
      setLoading(false);
      setSelectedPackage(null);
    }
  };

  const getPackageIcon = (index: number) => {
    const icons = [<Sparkles className="w-5 h-5" />, <Zap className="w-5 h-5" />, <Crown className="w-5 h-5" />, <Crown className="w-5 h-5 text-yellow-500" />];
    return icons[index] || <Sparkles className="w-5 h-5" />;
  };

  const getPackageColor = (index: number) => {
    const colors = ['border-primary/50 hover:border-primary', 'border-blue-500/50 hover:border-blue-500', 'border-purple-500/50 hover:border-purple-500', 'border-yellow-500/50 hover:border-yellow-500'];
    return colors[index] || 'border-primary/50 hover:border-primary';
  };

  return (
    <div className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container px-6">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Crown className="w-4 h-4 mr-2" />
            Premium Access Required
          </Badge>
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Choose Your Mastering Package
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock professional AI mastering with Grammy-quality results. 
            Choose the package that fits your creative needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {packages.map((pkg, index) => (
            <Card 
              key={pkg.id} 
              className={`relative transition-all duration-300 hover:shadow-xl ${getPackageColor(index)} ${
                index === 2 ? 'scale-105 border-2' : ''
              }`}
            >
              {index === 2 && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                  {getPackageIcon(index)}
                </div>
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <CardDescription className="min-h-[3rem]">{pkg.description}</CardDescription>
                <div className="py-4">
                  <span className="text-3xl font-bold">${pkg.price}</span>
                  <span className="text-muted-foreground">/{pkg.track_limit === -1 ? 'unlimited' : `${pkg.track_limit} track${pkg.track_limit > 1 ? 's' : ''}`}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {pkg.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className="w-full gap-2" 
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={loading && selectedPackage === pkg.id}
                  variant={index === 2 ? 'default' : 'outline'}
                >
                  {loading && selectedPackage === pkg.id ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Get Started
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            All packages include secure payment processing via Stripe, instant access, 
            and our satisfaction guarantee. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
};