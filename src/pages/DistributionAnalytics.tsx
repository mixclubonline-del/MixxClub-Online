import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isFeatureEnabled } from "@/config/featureFlags";
import { BarChart3, Radio, TrendingUp, Target, Music } from "lucide-react";

const DistributionAnalytics = () => {
  const analyticsEnabled = isFeatureEnabled("DISTRIBUTION_ANALYTICS_ENABLED");
  const pitchingEnabled = isFeatureEnabled("DISTRIBUTION_PLAYLIST_PITCHING_ENABLED");

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Distribution Analytics</h1>
          <p className="text-muted-foreground">
            Track your music performance across streaming platforms
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="streaming" className="gap-2">
              <Radio className="h-4 w-4" />
              Streaming
            </TabsTrigger>
            <TabsTrigger value="playlists" className="gap-2">
              <Music className="h-4 w-4" />
              Playlists
            </TabsTrigger>
            <TabsTrigger value="growth" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Growth
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Streams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Monthly Listeners</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Playlist Placements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Active playlists</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="streaming">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>Streaming data by platform</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-12">
                  No streaming data available yet
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="playlists">
            <Card>
              <CardHeader>
                <CardTitle>Playlist Pitching</CardTitle>
                <CardDescription>Pitch your music to curated playlists</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-12">
                  Create your first playlist pitch campaign
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="growth">
            <Card>
              <CardHeader>
                <CardTitle>Growth Metrics</CardTitle>
                <CardDescription>Track your audience growth over time</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-12">
                  Growth data will appear here
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Database Setup Complete</CardTitle>
            <CardDescription>
              Analytics infrastructure ready for streaming data!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Tables created: streaming_analytics, playlist_pitches, release_performance_metrics
              <br />
              Edge functions deployed: create-playlist-pitch
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Multi-platform streaming analytics (Spotify, Apple Music, YouTube, etc.)</li>
              <li>Geographic and demographic breakdowns</li>
              <li>Playlist pitching campaigns with ROI tracking</li>
              <li>Performance metrics with growth rates</li>
              <li>Chart position tracking and milestone alerts</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DistributionAnalytics;
