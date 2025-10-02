import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Music, 
  Upload, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  CheckCircle2,
  ExternalLink,
  Sparkles
} from "lucide-react";

const DISTRIBUTORS = [
  {
    id: "distrokid",
    name: "DistroKid",
    description: "Unlimited uploads for a yearly fee",
    logo: "🎵",
    features: ["Unlimited releases", "Keep 100% royalties", "Fast distribution"],
    price: "$22.99/year",
    popular: true
  },
  {
    id: "tunecore",
    name: "TuneCore",
    description: "Pay per release model",
    logo: "🎹",
    features: ["Keep 100% royalties", "YouTube monetization", "Social media"],
    price: "$14.99/single",
    popular: false
  },
  {
    id: "cdbaby",
    name: "CD Baby",
    description: "One-time fee per release",
    logo: "💿",
    features: ["85% royalties", "Physical distribution", "Sync licensing"],
    price: "$9.95/single",
    popular: false
  },
  {
    id: "amuse",
    name: "Amuse",
    description: "Free distribution with premium options",
    logo: "🎸",
    features: ["Free tier", "Fast splits", "Record label opportunities"],
    price: "Free",
    popular: true
  }
];

const DistributionHub = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("distributors");

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
                  <p className="text-2xl font-bold">0</p>
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
                  <p className="text-2xl font-bold">0</p>
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
                  <p className="text-2xl font-bold">$0</p>
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
                  <p className="text-2xl font-bold">0</p>
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
                      <Button size="lg" className="gap-2">
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
              <CardHeader>
                <CardTitle>Your Releases</CardTitle>
                <CardDescription>Track and manage your music releases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No releases yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Once you've completed mixing and mastering, you can distribute your tracks here
                  </p>
                  <Button onClick={() => navigate("/artist-crm")}>
                    Go to Projects
                  </Button>
                </div>
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
