import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface Package {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  track_limit: number;
  popular?: boolean;
}

interface PackageRecommendationProps {
  recommendedPackage: Package;
  allPackages: Package[];
  salesMessage: string;
  onPurchaseStart?: () => void;
}

export const PackageRecommendation = ({ 
  recommendedPackage, 
  allPackages,
  salesMessage,
  onPurchaseStart 
}: PackageRecommendationProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePurchase = async (packageId: string) => {
    setLoading(true);
    if (onPurchaseStart) onPurchaseStart();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Redirect to auth with chatbot page as return URL
        window.location.href = '/auth?redirect=' + encodeURIComponent(window.location.pathname);
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-mastering-checkout', {
        body: { packageId }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase failed",
        description: "Unable to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      {/* Sales Message */}
      <div className="p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg border border-primary/20">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary mt-0.5 animate-pulse" />
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">Ready for Full Professional Mastering?</p>
            <p className="text-xs text-muted-foreground">{salesMessage}</p>
          </div>
        </div>
      </div>

      {/* Recommended Package - Highlighted */}
      <Card className="border-2 border-primary/50 bg-gradient-to-br from-primary/5 to-background relative overflow-hidden">
        <div className="absolute top-2 right-2">
          <Badge className="bg-primary text-primary-foreground">
            <TrendingUp className="w-3 h-3 mr-1" />
            Recommended
          </Badge>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-2xl font-bold mb-1">{recommendedPackage.name}</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">${recommendedPackage.price}</span>
              <span className="text-muted-foreground">
                {recommendedPackage.track_limit === -1 
                  ? 'unlimited tracks'
                  : `${recommendedPackage.track_limit} tracks`}
              </span>
            </div>
          </div>

          <ul className="space-y-2 mb-6">
            {recommendedPackage.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Button 
            onClick={() => handlePurchase(recommendedPackage.id)}
            disabled={loading}
            className="w-full relative overflow-hidden group"
            size="lg"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary animate-shimmer" />
            <Zap className="w-4 h-4 mr-2 relative z-10" />
            <span className="relative z-10">Get Started Now</span>
          </Button>
          
          <p className="text-xs text-center text-muted-foreground mt-3">
            ⚡ 500+ artists mastered today • 30-day money-back guarantee
          </p>
        </div>
      </Card>

      {/* Other Packages - Compact View */}
      {allPackages.filter(p => p.id !== recommendedPackage.id).length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Or choose another package:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allPackages
              .filter(p => p.id !== recommendedPackage.id)
              .map(pkg => (
                <Card key={pkg.id} className="p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{pkg.name}</h4>
                      <p className="text-lg font-bold">${pkg.price}</p>
                    </div>
                    {pkg.popular && (
                      <Badge variant="secondary" className="text-xs">Popular</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {pkg.track_limit === -1 ? 'Unlimited tracks' : `${pkg.track_limit} tracks`}
                  </p>
                  <Button 
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Choose {pkg.name}
                  </Button>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Trust Signals */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-2">
        <div className="flex items-center gap-1">
          <Check className="w-3 h-3 text-primary" />
          <span>Instant Access</span>
        </div>
        <div className="flex items-center gap-1">
          <Check className="w-3 h-3 text-primary" />
          <span>Grammy-Level Quality</span>
        </div>
        <div className="flex items-center gap-1">
          <Check className="w-3 h-3 text-primary" />
          <span>24/7 Support</span>
        </div>
      </div>
    </div>
  );
};
