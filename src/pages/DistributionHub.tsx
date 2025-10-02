import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Edit
} from "lucide-react";
import { DISTRIBUTORS, useUserReleases, useGenerateReferralLink, useCreateRelease } from "@/hooks/useDistribution";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";

const DistributionHub = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("distributors");
  const [showAddReleaseDialog, setShowAddReleaseDialog] = useState(false);
  const [newRelease, setNewRelease] = useState({
    distributor_id: "",
    release_title: "",
    artist_name: "",
    release_type: "single",
    release_date: "",
  });

  const { data: releases = [], isLoading: loadingReleases } = useUserReleases();
  const createRelease = useCreateRelease();

  const handleConnectDistributor = async (distributor: typeof DISTRIBUTORS[0]) => {
    if (!user) {
      toast.error("Please sign in to connect with distributors");
      navigate("/auth");
      return;
    }

    const { generateLink } = useGenerateReferralLink(distributor);
    const referralLink = await generateLink();
    
    // Open in new tab
    window.open(referralLink, '_blank');
    
    toast.success(`Opening ${distributor.name}... Your referral is being tracked!`);
  };

  const handleCreateRelease = async () => {
    if (!newRelease.distributor_id || !newRelease.release_title || !newRelease.artist_name) {
      toast.error("Please fill in all required fields");
      return;
    }

    const distributor = DISTRIBUTORS.find(d => d.id === newRelease.distributor_id);
    if (!distributor) return;

    await createRelease.mutateAsync({
      distributor_id: newRelease.distributor_id,
      distributor_name: distributor.name,
      release_title: newRelease.release_title,
      artist_name: newRelease.artist_name,
      release_type: newRelease.release_type,
      release_date: newRelease.release_date || undefined,
    });

    setShowAddReleaseDialog(false);
    setNewRelease({
      distributor_id: "",
      release_title: "",
      artist_name: "",
      release_type: "single",
      release_date: "",
    });
  };

  const totalStreams = releases.reduce((sum, release) => {
    const stats = release.streaming_stats as any;
    return sum + (stats?.total_streams || 0);
  }, 0);

  const totalEarnings = releases.reduce((sum, release) => {
    const earnings = release.earnings_data as any;
    return sum + (earnings?.total_earnings || 0);
  }, 0);

  const activePlatforms = new Set(
    releases.flatMap(release => (release.platforms as string[]) || [])
  ).size;

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
                  <p className="text-2xl font-bold">{releases.length}</p>
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
                  <p className="text-2xl font-bold">{totalStreams.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold">${totalEarnings.toFixed(2)}</p>
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
                  <p className="text-2xl font-bold">{activePlatforms}</p>
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
                <Button onClick={() => setShowAddReleaseDialog(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Release
                </Button>
              </CardHeader>
              <CardContent>
                {releases.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No releases yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Track your releases by adding them manually or connecting with a distributor
                    </p>
                    <Button onClick={() => setShowAddReleaseDialog(true)}>
                      Add Your First Release
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {releases.map((release) => (
                      <Card key={release.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                              {release.artwork_url ? (
                                <img 
                                  src={release.artwork_url} 
                                  alt={release.release_title}
                                  className="w-20 h-20 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <Music className="h-8 w-8 text-primary" />
                                </div>
                              )}
                              <div>
                                <h4 className="font-semibold text-lg">{release.release_title}</h4>
                                <p className="text-sm text-muted-foreground">{release.artist_name}</p>
                                <div className="flex gap-2 mt-2">
                                  <Badge variant="outline">{release.release_type}</Badge>
                                  <Badge variant={release.status === 'live' ? 'default' : 'secondary'}>
                                    {release.status}
                                  </Badge>
                                  <Badge variant="outline">{release.distributor_name}</Badge>
                                </div>
                                {release.release_date && (
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Released: {format(new Date(release.release_date), 'MMM d, yyyy')}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {release.spotify_url && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(release.spotify_url!, '_blank')}
                                >
                                  Spotify
                                </Button>
                              )}
                              {release.apple_music_url && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(release.apple_music_url!, '_blank')}
                                >
                                  Apple Music
                                </Button>
                              )}
                            </div>
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

        {/* Add Release Dialog */}
        <Dialog open={showAddReleaseDialog} onOpenChange={setShowAddReleaseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Track New Release</DialogTitle>
              <DialogDescription>
                Add a release you've distributed through any platform
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="distributor">Distributor</Label>
                <Select 
                  value={newRelease.distributor_id} 
                  onValueChange={(value) => setNewRelease({...newRelease, distributor_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select distributor" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISTRIBUTORS.map((dist) => (
                      <SelectItem key={dist.id} value={dist.id}>
                        {dist.logo} {dist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title">Release Title</Label>
                <Input
                  id="title"
                  value={newRelease.release_title}
                  onChange={(e) => setNewRelease({...newRelease, release_title: e.target.value})}
                  placeholder="My Awesome Track"
                />
              </div>
              <div>
                <Label htmlFor="artist">Artist Name</Label>
                <Input
                  id="artist"
                  value={newRelease.artist_name}
                  onChange={(e) => setNewRelease({...newRelease, artist_name: e.target.value})}
                  placeholder="Your Artist Name"
                />
              </div>
              <div>
                <Label htmlFor="type">Release Type</Label>
                <Select 
                  value={newRelease.release_type} 
                  onValueChange={(value) => setNewRelease({...newRelease, release_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="ep">EP</SelectItem>
                    <SelectItem value="album">Album</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Release Date (Optional)</Label>
                <Input
                  id="date"
                  type="date"
                  value={newRelease.release_date}
                  onChange={(e) => setNewRelease({...newRelease, release_date: e.target.value})}
                />
              </div>
              <Button 
                onClick={handleCreateRelease} 
                className="w-full"
                disabled={createRelease.isPending}
              >
                {createRelease.isPending ? 'Adding...' : 'Add Release'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DistributionHub;
