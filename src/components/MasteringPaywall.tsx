import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Lock, Music, Sparkles, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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
  onPurchaseComplete: () => void;
}

export const MasteringPaywall = ({ onPurchaseComplete }: MasteringPaywallProps) => {
  const [packages, setPackages] = useState<MasteringPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('mastering_packages')
        .select('*')
        .eq('is_active', true)
        .order('price');

      if (error) throw error;
      
      const formattedData = (data || []).map(pkg => ({
        ...pkg,
        features: Array.isArray(pkg.features) ? pkg.features as string[] : 
                 typeof pkg.features === 'string' ? JSON.parse(pkg.features) : []
      }));
      
      setPackages(formattedData);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error('Failed to load mastering packages');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageId: string) => {
    if (!user) {
      toast.error('Please sign in to purchase a mastering package');
      return;
    }

    setPurchasing(packageId);
    
    try {
      // Create subscription in database
      const { error } = await supabase
        .from('user_mastering_subscriptions')
        .insert({
          user_id: user.id,
          package_id: packageId,
          status: 'active'
        });

      if (error) throw error;

      toast.success('Mastering package activated! You now have access to AI mastering.');
      onPurchaseComplete();
    } catch (error) {
      console.error('Error purchasing package:', error);
      toast.error('Failed to activate mastering package. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  const getPopularBadge = (name: string) => {
    return name === 'Pro' ? <Badge className="mb-2">Most Popular</Badge> : null;
  };

  const getTrackLimitText = (limit: number) => {
    return limit === -1 ? 'Unlimited tracks' : `${limit} track${limit > 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container px-6">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Lock className="w-6 h-6 text-primary" />
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Premium Feature
            </Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Unlock AI Mastering
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get Grammy-quality masters instantly with our AI engine. Choose the perfect package for your needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {packages.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`relative transition-all hover:shadow-lg ${
                pkg.name === 'Pro' ? 'ring-2 ring-primary shadow-lg scale-105' : ''
              }`}
            >
              <CardHeader className="text-center">
                {getPopularBadge(pkg.name)}
                <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">
                    ${pkg.price}
                    <span className="text-lg font-normal text-muted-foreground">/{pkg.currency}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{pkg.description}</p>
                  <Badge variant="outline" className="text-xs">
                    {getTrackLimitText(pkg.track_limit)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full gap-2" 
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={purchasing === pkg.id}
                  variant={pkg.name === 'Pro' ? 'default' : 'outline'}
                >
                  {purchasing === pkg.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Get Started
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-4xl mx-auto mt-16">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Music className="w-6 h-6 text-primary" />
                <Sparkles className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Why Choose Our AI Mastering?</h3>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div>
                  <h4 className="font-semibold mb-2">Grammy-Winning Quality</h4>
                  <p className="text-sm text-muted-foreground">
                    Neural networks trained on thousands of reference tracks from top albums
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Platform Optimized</h4>
                  <p className="text-sm text-muted-foreground">
                    Perfect loudness and dynamics for Spotify, Apple Music, YouTube, and more
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Instant Results</h4>
                  <p className="text-sm text-muted-foreground">
                    Professional mastering in seconds, not hours. Compare before & after instantly
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};