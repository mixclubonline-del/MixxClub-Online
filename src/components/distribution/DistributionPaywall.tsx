import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Music, TrendingUp, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DistributionPackage {
  id: string;
  package_name: string;
  package_description: string;
  price: number;
  currency: string;
  billing_cycle: string;
  releases_per_year: number;
  stores_included: string[];
  features: string[];
  is_active: boolean;
  display_order: number;
}

export function DistributionPaywall() {
  const [packages, setPackages] = useState<DistributionPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from("distribution_packages")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      
      const formattedPackages = (data || []).map(pkg => ({
        ...pkg,
        stores_included: (Array.isArray(pkg.stores_included) ? pkg.stores_included : []) as string[],
        features: (Array.isArray(pkg.features) ? pkg.features : []) as string[]
      }));
      
      setPackages(formattedPackages as DistributionPackage[]);
    } catch (error: any) {
      toast({
        title: "Error loading packages",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageId: string) => {
    try {
      setPurchasing(packageId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to purchase a package",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        "create-distribution-checkout",
        { body: { packageId } }
      );

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setPurchasing(null);
    }
  };

  const getPackageIcon = (index: number) => {
    return [Music, TrendingUp, Zap][index] || Music;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Distribution Packages</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get your music on all major streaming platforms. Keep 100% of your royalties.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {packages.map((pkg, index) => {
            const Icon = getPackageIcon(index);
            const isPopular = pkg.package_name === "Pro";

            return (
              <Card 
                key={pkg.id}
                className={`relative ${isPopular ? 'border-primary shadow-lg scale-105' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">Most Popular</Badge>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{pkg.package_name}</CardTitle>
                  <CardDescription>{pkg.package_description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${pkg.price}</span>
                    <span className="text-muted-foreground">/{pkg.billing_cycle}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">
                      {pkg.releases_per_year === -1 
                        ? "Unlimited Releases" 
                        : `${pkg.releases_per_year} Releases per Year`
                      }
                    </p>
                  </div>

                  <div className="space-y-2">
                    {pkg.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={purchasing === pkg.id}
                    variant={isPopular ? "default" : "outline"}
                  >
                    {purchasing === pkg.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Get Started"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-muted/50">
          <CardContent className="py-8">
            <h3 className="text-2xl font-bold mb-4 text-center">Why Choose Our Distribution?</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-2">💰</div>
                <h4 className="font-semibold mb-2">Keep 100% of Royalties</h4>
                <p className="text-sm text-muted-foreground">No hidden fees or commission. All earnings go directly to you.</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">⚡</div>
                <h4 className="font-semibold mb-2">Fast Distribution</h4>
                <p className="text-sm text-muted-foreground">Your music live on all platforms within 24-48 hours.</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <h4 className="font-semibold mb-2">Advanced Analytics</h4>
                <p className="text-sm text-muted-foreground">Track your performance across all platforms in real-time.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
