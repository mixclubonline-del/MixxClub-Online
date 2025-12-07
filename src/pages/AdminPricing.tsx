import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, Package, Music, Radio, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

interface MasteringPackage {
  id: string;
  name: string;
  price: number;
  description: string | null;
  features: Json;
  is_active: boolean;
  turnaround_days: number;
}

interface MixingPackage {
  id: string;
  package_name: string;
  price: number;
  description: string | null;
  features: Json;
  turnaround_days: number;
  is_active: boolean;
}

export default function AdminPricing() {
  const [masteringPackages, setMasteringPackages] = useState<MasteringPackage[]>([]);
  const [mixingPackages, setMixingPackages] = useState<MixingPackage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const [masteringRes, mixingRes] = await Promise.all([
        supabase.from('mastering_packages').select('*').order('price'),
        supabase.from('mixing_packages').select('*').order('price')
      ]);

      if (masteringRes.data) setMasteringPackages(masteringRes.data);
      if (mixingRes.data) setMixingPackages(mixingRes.data);
    } catch (error) {
      toast.error('Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const parseFeatures = (features: Json): string[] => {
    if (Array.isArray(features)) return features as string[];
    return [];
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pricing Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage service packages and pricing tiers
            </p>
          </div>
          <Button onClick={fetchPackages} variant="outline" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mastering Packages</CardTitle>
              <Music className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{masteringPackages.length}</div>
              <p className="text-xs text-muted-foreground">Active tiers</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mixing Packages</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mixingPackages.length}</div>
              <p className="text-xs text-muted-foreground">Active tiers</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="mastering" className="space-y-4">
          <TabsList>
            <TabsTrigger value="mastering">Mastering</TabsTrigger>
            <TabsTrigger value="mixing">Mixing</TabsTrigger>
          </TabsList>

          <TabsContent value="mastering" className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : masteringPackages.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No mastering packages found
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {masteringPackages.map((pkg) => (
                  <Card key={pkg.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{pkg.name}</CardTitle>
                        {pkg.is_active && <Badge>Active</Badge>}
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {formatPrice(pkg.price)}
                      </p>
                      <Badge variant="outline">{pkg.turnaround_days} day turnaround</Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{pkg.description}</p>
                      <ul className="space-y-1">
                        {parseFeatures(pkg.features).map((feature, i) => (
                          <li key={i} className="text-sm flex items-center gap-2">
                            <DollarSign className="w-3 h-3 text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="mixing" className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : mixingPackages.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No mixing packages found
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {mixingPackages.map((pkg) => (
                  <Card key={pkg.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{pkg.package_name}</CardTitle>
                        {pkg.is_active && <Badge>Active</Badge>}
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {formatPrice(pkg.price)}
                      </p>
                      <Badge variant="outline">{pkg.turnaround_days} day turnaround</Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{pkg.description}</p>
                      <ul className="space-y-1">
                        {parseFeatures(pkg.features).map((feature, i) => (
                          <li key={i} className="text-sm flex items-center gap-2">
                            <Package className="w-3 h-3 text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
