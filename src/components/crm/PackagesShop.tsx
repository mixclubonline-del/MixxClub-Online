import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, Sparkles, Music2, Zap } from 'lucide-react';

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  track_limit: number;
  features: string[];
  is_active: boolean;
}

export function PackagesShop() {
  const [mixingPackages, setMixingPackages] = useState<Package[]>([]);
  const [masteringPackages, setMasteringPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      // Fetch mixing packages
      const { data: mixingData, error: mixingError } = await supabase
        .from('mixing_packages')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (mixingError) throw mixingError;
      const processedMixingData = (mixingData || []).map(pkg => ({
        ...pkg,
        features: Array.isArray(pkg.features) ? pkg.features : []
      }));
      setMixingPackages(processedMixingData as Package[]);

      // Fetch mastering packages
      const { data: masteringData, error: masteringError } = await supabase
        .from('mastering_packages')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (masteringError) throw masteringError;
      const processedMasteringData = (masteringData || []).map(pkg => ({
        ...pkg,
        features: Array.isArray(pkg.features) ? pkg.features : []
      }));
      setMasteringPackages(processedMasteringData as Package[]);
    } catch (error: any) {
      console.error('Error fetching packages:', error);
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageId: string, type: 'mixing' | 'mastering') => {
    setPurchasingId(packageId);
    
    try {
      // Call Supabase edge function to create checkout session
      const { data, error } = await supabase.functions.invoke(
        type === 'mixing' ? 'create-mixing-checkout' : 'create-mastering-checkout',
        {
          body: { packageId }
        }
      );

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast.error('Failed to start checkout process');
    } finally {
      setPurchasingId(null);
    }
  };

  const PackageCard = ({ pkg, type }: { pkg: Package; type: 'mixing' | 'mastering' }) => (
    <Card className="border-2 hover:border-primary/50 transition-all">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant={pkg.track_limit === -1 ? 'default' : 'secondary'}>
            {pkg.track_limit === -1 ? 'Unlimited' : `${pkg.track_limit} Tracks`}
          </Badge>
          {type === 'mixing' ? (
            <Music2 className="w-5 h-5 text-primary" />
          ) : (
            <Sparkles className="w-5 h-5 text-primary" />
          )}
        </div>
        <CardTitle className="text-2xl">{pkg.name}</CardTitle>
        <CardDescription>{pkg.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">${pkg.price}</span>
          <span className="text-muted-foreground">/{pkg.currency}</span>
        </div>

        <ul className="space-y-3">
          {Array.isArray(pkg.features) && pkg.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          className="w-full"
          onClick={() => handlePurchase(pkg.id, type)}
          disabled={purchasingId === pkg.id}
        >
          {purchasingId === pkg.id ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Get Started
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Studio Packages</h2>
        <p className="text-muted-foreground">
          Choose the perfect package for your music production needs
        </p>
      </div>

      <Tabs defaultValue="mixing" className="space-y-6">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2">
          <TabsTrigger value="mixing" className="gap-2">
            <Music2 className="w-4 h-4" />
            Mixing Packages
          </TabsTrigger>
          <TabsTrigger value="mastering" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Mastering Packages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mixing" className="space-y-4">
          {mixingPackages.length === 0 ? (
            <Card className="p-12 text-center">
              <Music2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No mixing packages available</h3>
              <p className="text-muted-foreground">Check back soon for new packages</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mixingPackages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} type="mixing" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mastering" className="space-y-4">
          {masteringPackages.length === 0 ? (
            <Card className="p-12 text-center">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No mastering packages available</h3>
              <p className="text-muted-foreground">Check back soon for new packages</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {masteringPackages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} type="mastering" />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
