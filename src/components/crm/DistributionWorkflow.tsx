import { useState } from "react";
import { useFlowNavigation } from '@/core/fabric/useFlow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Music, 
  Upload, 
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Star
} from "lucide-react";
import { useDistributionPackages, useTrackAffiliateClick, buildAffiliateUrl } from "@/hooks/useDistribution";
import { useAuth } from "@/hooks/useAuth";

interface DistributionWorkflowProps {
  projectId: string;
  projectTitle: string;
  audioFileUrl?: string;
}

export const DistributionWorkflow = ({ 
  projectId, 
  projectTitle, 
  audioFileUrl 
}: DistributionWorkflowProps) => {
  const { navigateTo } = useFlowNavigation();
  const { user } = useAuth();
  const { data: packages, isLoading } = useDistributionPackages();
  const trackClick = useTrackAffiliateClick();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const handleDistributeClick = (pkg: typeof packages extends (infer T)[] ? T : never) => {
    trackClick.mutate({ 
      packageId: pkg.id, 
      partnerName: pkg.partner_name 
    });
    
    const affiliateUrl = buildAffiliateUrl(pkg.partner_affiliate_url, user?.id);
    window.open(affiliateUrl, "_blank");
  };

  if (isLoading) {
    return (
      <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show intro if no package selected
  if (!selectedPackage) {
    return (
      <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-primary to-accent-cyan rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <Badge variant="default" className="text-xs">READY</Badge>
          </div>
          <CardTitle className="text-2xl">Distribute "{projectTitle}"</CardTitle>
          <CardDescription className="text-base">
            Your track is ready! Get it on Spotify, Apple Music, and 150+ streaming platforms worldwide.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold mb-1">1. Choose Partner</p>
                <p className="text-sm text-muted-foreground">DistroKid, TuneCore, or CD Baby</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
              <div className="p-2 bg-accent-cyan/10 rounded-lg">
                <Music className="h-5 w-5 text-accent-cyan" />
              </div>
              <div>
                <p className="font-semibold mb-1">2. Add Details</p>
                <p className="text-sm text-muted-foreground">Metadata, artwork, release date</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
              <div className="p-2 bg-accent-green/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-accent-green" />
              </div>
              <div>
                <p className="font-semibold mb-1">3. Go Live</p>
                <p className="text-sm text-muted-foreground">On all major platforms</p>
              </div>
            </div>
          </div>

          {/* Package cards */}
          {packages && packages.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {packages.map((pkg) => (
                <Card 
                  key={pkg.id} 
                  className={`relative cursor-pointer transition-all hover:border-primary ${
                    pkg.is_featured ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => setSelectedPackage(pkg.id)}
                >
                  {pkg.is_featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground gap-1">
                        <Star className="h-3 w-3" /> Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{pkg.package_name}</CardTitle>
                    <div className="text-2xl font-bold">
                      ${pkg.price}
                      <span className="text-sm font-normal text-muted-foreground">/{pkg.billing_cycle}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">via {pkg.partner_name}</p>
                    <Button 
                      size="sm" 
                      className="w-full gap-2"
                      variant={pkg.is_featured ? "default" : "outline"}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDistributeClick(pkg);
                      }}
                    >
                      Distribute Now
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              size="lg" 
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => navigateTo("/distribution")}
            >
              Compare All Options
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};
