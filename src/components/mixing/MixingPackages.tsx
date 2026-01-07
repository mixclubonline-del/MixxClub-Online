import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  Check, 
  Zap, 
  Clock, 
  Music,
  Star,
  Loader2
} from 'lucide-react';

interface MixingPackage {
  id: string;
  package_name: string;
  description: string | null;
  price: number;
  track_limit: number;
  turnaround_days: number;
  features: string[];
  is_active: boolean;
  is_featured?: boolean;
}

interface MixingPaywallProps {
  onPurchaseComplete?: () => void;
}

export const MixingPackages: React.FC<MixingPaywallProps> = ({ onPurchaseComplete }) => {
  const { user } = useAuth();
  const [packages, setPackages] = useState<MixingPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('mixing_packages')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;

      // Parse features from JSON if stored as string
      const parsedPackages = (data || []).map(pkg => ({
        ...pkg,
        features: Array.isArray(pkg.features) 
          ? pkg.features 
          : typeof pkg.features === 'string' 
            ? JSON.parse(pkg.features) 
            : []
      }));

      setPackages(parsedPackages);
    } catch (error) {
      console.error('Error fetching mixing packages:', error);
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageId: string) => {
    if (!user) {
      toast.error('Please sign in to purchase');
      return;
    }

    setPurchasing(packageId);
    try {
      // Create checkout session via edge function
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          packageId,
          packageType: 'mixing',
          userId: user.id,
          successUrl: `${window.location.origin}/dashboard?purchase=success`,
          cancelUrl: `${window.location.origin}/mixing?purchase=cancelled`
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.success('Package purchased successfully!');
        onPurchaseComplete?.();
      }
    } catch (error) {
      console.error('Error purchasing package:', error);
      toast.error('Failed to process purchase');
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No mixing packages available at the moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Professional Mixing Services</h2>
        <p className="text-muted-foreground mt-2">
          Choose the perfect package for your project
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card 
            key={pkg.id}
            className={`relative overflow-hidden transition-all hover:shadow-lg ${
              pkg.is_featured ? 'border-primary ring-1 ring-primary' : ''
            }`}
          >
            {pkg.is_featured && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-primary text-primary-foreground gap-1">
                  <Star className="h-3 w-3" />
                  Popular
                </Badge>
              </div>
            )}

            <CardHeader>
              <CardTitle className="text-xl">{pkg.package_name}</CardTitle>
              <CardDescription>{pkg.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Price */}
              <div>
                <span className="text-4xl font-bold">${pkg.price}</span>
                <span className="text-muted-foreground">/package</span>
              </div>

              {/* Key Stats */}
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Music className="h-4 w-4 text-primary" />
                  <span>
                    {pkg.track_limit === -1 ? 'Unlimited' : pkg.track_limit} tracks
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{pkg.turnaround_days} day delivery</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Button 
                className="w-full gap-2"
                variant={pkg.is_featured ? 'default' : 'outline'}
                onClick={() => handlePurchase(pkg.id)}
                disabled={purchasing === pkg.id}
              >
                {purchasing === pkg.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Get Started
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Comparison Note */}
      <div className="text-center text-sm text-muted-foreground">
        <p>All packages include revision rounds and direct communication with your engineer.</p>
        <p className="mt-1">Need a custom solution? <a href="/contact" className="text-primary hover:underline">Contact us</a></p>
      </div>
    </div>
  );
};
