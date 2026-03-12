import { SEOHead } from "@/components/SEOHead";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ExternalLink, Music, Headphones, Globe, Star, Zap, Shield, FileAudio, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useExportedTracks, useMarkAsDistributed, ExportedTrack } from "@/hooks/useExportedTracks";
import { ExportedTrackCard } from "@/components/distribution/ExportedTrackCard";
import { useNavigate } from "react-router-dom";

// Platform logos as text badges for now
const STREAMING_PLATFORMS = [
  { name: "Spotify", color: "bg-[#1DB954]" },
  { name: "Apple Music", color: "bg-[#FA2D48]" },
  { name: "Amazon Music", color: "bg-[#25D1DA]" },
  { name: "YouTube Music", color: "bg-[#FF0000]" },
  { name: "Tidal", color: "bg-[#000000]" },
  { name: "Deezer", color: "bg-[#A238FF]" },
  { name: "Pandora", color: "bg-[#005483]" },
  { name: "TikTok", color: "bg-[#010101]" },
  { name: "Instagram", color: "bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737]" },
  { name: "SoundCloud", color: "bg-[#FF5500]" },
];

interface DistributionPackage {
  id: string;
  package_name: string;
  package_description: string;
  price: number;
  currency: string;
  billing_cycle: string;
  partner_name: string;
  partner_affiliate_url: string;
  features: string[];
  platforms_count: number;
  is_featured: boolean;
  sort_order: number;
}

const DistributionHub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const markAsDistributed = useMarkAsDistributed();
  
  const { data: packages, isLoading: packagesLoading } = useQuery({
    queryKey: ["distribution-packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("distribution_packages")
        .select("*")
        .order("sort_order", { ascending: true });
      
      if (error) throw error;
      return data as DistributionPackage[];
    },
  });
  
  const { data: exportedTracks, isLoading: tracksLoading } = useExportedTracks();
  
  // Filter to undistributed tracks
  const readyToDistribute = exportedTracks?.filter(t => !t.distributed_at) || [];

  const handleDistribute = (affiliateUrl: string, partnerName: string, track?: ExportedTrack) => {
    // Track the click
    // Distribution click tracked
    
    // Mark track as distributed if provided
    if (track) {
      markAsDistributed.mutate({ trackId: track.id, partner: partnerName });
    }
    
    window.open(affiliateUrl, "_blank", "noopener,noreferrer");
  };
  
  const handleTrackDistribute = (track: ExportedTrack) => {
    // Scroll to packages section
    const packagesSection = document.getElementById('distribution-packages');
    packagesSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Ready to Distribute Section (for logged-in users with exports) */}
      {user && readyToDistribute.length > 0 && (
        <section className="py-8 px-4 border-b bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-6"
            >
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <FileAudio className="w-6 h-6 text-primary" />
                  Ready to Distribute
                </h2>
                <p className="text-muted-foreground">
                  {readyToDistribute.length} track{readyToDistribute.length !== 1 ? 's' : ''} exported from your DAW
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate('/hybrid-daw')}>
                Open DAW
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
            
            <div className="space-y-3">
              <AnimatePresence>
                {readyToDistribute.map(track => (
                  <ExportedTrackCard
                    key={track.id}
                    track={track}
                    onDistribute={handleTrackDistribute}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>
      )}
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-4">
              <Globe className="w-3 h-3 mr-1" />
              150+ Streaming Platforms
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Get Your Music Everywhere
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Distribute your tracks to Spotify, Apple Music, and 150+ streaming platforms. 
              Keep 100% of your royalties with our trusted distribution partners.
            </p>
          </motion.div>

          {/* Platform Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2 md:gap-3 mb-12"
          >
            {STREAMING_PLATFORMS.map((platform, index) => (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <Badge 
                  className={`${platform.color} text-white border-0 px-3 py-1.5 text-sm font-medium`}
                >
                  {platform.name}
                </Badge>
              </motion.div>
            ))}
            <Badge variant="outline" className="px-3 py-1.5">
              +140 more
            </Badge>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section id="distribution-packages" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Choose Your Distribution Partner</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We've partnered with the industry's best distributors. Pick the plan that fits your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {packagesLoading ? (
              [...Array(3)].map((_, i) => (
                <Card key={i} className="relative">
                  <CardHeader>
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-10 w-32 mb-4" />
                    <div className="space-y-2">
                      {[...Array(5)].map((_, j) => (
                        <Skeleton key={j} className="h-4 w-full" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              packages?.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                >
                  <Card 
                    className={`relative h-full flex flex-col ${
                      pkg.is_featured 
                        ? "border-primary shadow-lg shadow-primary/20 scale-105" 
                        : ""
                    }`}
                  >
                    {pkg.is_featured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">
                          <Star className="w-3 h-3 mr-1" />
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">{pkg.package_name}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          via {pkg.partner_name}
                        </Badge>
                      </div>
                      <CardDescription>{pkg.package_description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex-grow">
                      <div className="mb-6">
                        <span className="text-4xl font-bold">${pkg.price}</span>
                        <span className="text-muted-foreground">/{pkg.billing_cycle}</span>
                      </div>
                      
                      <ul className="space-y-3">
                        {(pkg.features as string[]).map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    
                    <CardFooter className="pt-4">
                      <Button 
                        className="w-full gap-2"
                        variant={pkg.is_featured ? "default" : "outline"}
                        onClick={() => handleDistribute(pkg.partner_affiliate_url, pkg.partner_name)}
                      >
                        Distribute with {pkg.partner_name}
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Why Distribute Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Distribute Through Mixxclub?</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Seamless Workflow</h3>
              <p className="text-sm text-muted-foreground">
                Mix, master, and distribute—all in one place. No file transfers needed.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Trusted Partners</h3>
              <p className="text-sm text-muted-foreground">
                We only work with established distributors trusted by millions of artists.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Keep 100% Royalties</h3>
              <p className="text-sm text-muted-foreground">
                All our partners let you keep 100% of your streaming royalties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Music className="w-12 h-12 text-primary mx-auto mb-6" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Share Your Music with the World?
          </h2>
          <p className="text-muted-foreground mb-8">
            Choose a distribution partner above and get your tracks on Spotify, Apple Music, 
            and 150+ platforms in as little as 24 hours.
          </p>
          <Button size="lg" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            View Distribution Options
          </Button>
        </div>
      </section>
    </div>
  );
};

export default DistributionHub;
