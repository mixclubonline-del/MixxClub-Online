import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Music, 
  Upload, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Plus,
  Link as LinkIcon
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { 
  DISTRIBUTORS, 
  useDistributionAnalytics, 
  useMusicReleases, 
  useTrackReferral,
  buildDistributorLink 
} from "@/hooks/useDistribution";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const DistributionHub = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("distributors");
  const { data: analytics } = useDistributionAnalytics();
  const { data: releases = [] } = useMusicReleases();
  const trackReferral = useTrackReferral();

  const handleConnectDistributor = async (distributor: typeof DISTRIBUTORS[0]) => {
    if (!user) {
      toast.error("Please sign in to connect a distributor");
      navigate("/auth");
      return;
    }

    try {
      // Track the referral
      await trackReferral.mutateAsync({
        distributorId: distributor.id,
        distributorName: distributor.name,
      });

      // Get user profile for pre-filling
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      // Build distributor link with tracking
      const distributorLink = buildDistributorLink(distributor, { 
        full_name: profile?.full_name,
        email: user.email 
      });

      // Open in new tab
      window.open(distributorLink, "_blank");
      
      toast.success(`Opening ${distributor.name}...`, {
        description: "We've pre-filled your information. Come back here to track your releases!",
      });
    } catch (error) {
      console.error("Error tracking referral:", error);
      toast.error("Failed to track referral");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-primary to-accent-cyan rounded-xl">
              <Music className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black">Distribution Hub</h1>
              <p className="text-muted-foreground">Release your music to the world</p>
            </div>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Releases</p>
                  <p className="text-2xl font-bold">{analytics?.totalReleases || 0}</p>
                </div>
                <Upload className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-accent-cyan/10 to-transparent border-accent-cyan/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Streams</p>
                  <p className="text-2xl font-bold">{analytics?.totalStreams.toLocaleString() || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-accent-cyan opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-accent-green/10 to-transparent border-accent-green/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Earnings</p>
                  <p className="text-2xl font-bold">${analytics?.totalEarnings.toFixed(2) || '0.00'}</p>
                </div>
                <DollarSign className="h-8 w-8 text-accent-green opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-accent-purple/10 to-transparent border-accent-purple/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Platforms</p>
                  <p className="text-2xl font-bold">{analytics?.platforms || 0}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-accent-purple opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="distributors">Distributors</TabsTrigger>
            <TabsTrigger value="releases">My Releases</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Distributors Tab */}
          <TabsContent value="distributors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Choose Your Distribution Partner
                </CardTitle>
                <CardDescription>
                  Connect with a music distributor to release your tracks to Spotify, Apple Music, and 150+ streaming platforms worldwide
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {DISTRIBUTORS.map((distributor) => (
                <Card key={distributor.id} className={distributor.popular ? "border-primary shadow-lg shadow-primary/10" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{distributor.logo}</div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {distributor.name}
                            {distributor.popular && (
                              <Badge variant="default" className="text-xs">Popular</Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">{distributor.description}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {distributor.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-accent-green" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 border-t flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Starting at</p>
                        <p className="text-xl font-bold text-primary">{distributor.price}</p>
                      </div>
                      <Button 
                        size="lg" 
                        className="gap-2"
                        onClick={() => handleConnectDistributor(distributor)}
                      >
                        Connect
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Releases Tab */}
          <TabsContent value="releases" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Your Releases</CardTitle>
                  <CardDescription>Track and manage your music releases</CardDescription>
                </div>
                <Button onClick={() => navigate("/artist-crm")} variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Release
                </Button>
              </CardHeader>
              <CardContent>
                {releases.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No releases yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Connect with a distributor above, then track your releases here
                    </p>
                    <Button onClick={() => setSelectedTab("distributors")}>
                      Browse Distributors
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {releases.map((release: any) => (
                      <Card key={release.id} className="border-2">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Music className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-semibold">{release.release_title}</h3>
                                <Badge variant={release.status === 'live' ? 'default' : 'secondary'}>
                                  {release.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{release.artist_name}</p>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1">
                                  <LinkIcon className="h-3 w-3" />
                                  {release.distributor_name}
                                </span>
                                {release.release_date && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(release.release_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            {(release.spotify_url || release.apple_music_url) && (
                              <div className="flex gap-2">
                                {release.spotify_url && (
                                  <Button size="sm" variant="outline" onClick={() => window.open(release.spotify_url, '_blank')}>
                                    Spotify
                                  </Button>
                                )}
                                {release.apple_music_url && (
                                  <Button size="sm" variant="outline" onClick={() => window.open(release.apple_music_url, '_blank')}>
                                    Apple Music
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>Track your music's performance across all platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Analytics coming soon</h3>
                  <p className="text-muted-foreground">
                    Connect a distributor to start tracking your streams, earnings, and audience growth
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DistributionHub;
