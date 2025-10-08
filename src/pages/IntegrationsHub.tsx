import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isFeatureEnabled } from "@/config/featureFlags";
import { Plug, CheckCircle, XCircle, Music, Radio, Share2, Cloud, BarChart } from "lucide-react";

const IntegrationsHub = () => {
  const isUnlocked = isFeatureEnabled("INTEGRATIONS_ENABLED");

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                <Plug className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Integrations - Coming Soon</CardTitle>
              <CardDescription className="text-lg">
                Unlock at 1000 community members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Connect your favorite DAWs, streaming platforms, and tools
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const integrationCategories = [
    {
      icon: Music,
      title: "DAWs",
      description: "Pro Tools, Logic Pro, Ableton Live, FL Studio",
      count: 8,
      color: "text-blue-500"
    },
    {
      icon: Radio,
      title: "Streaming Platforms",
      description: "Spotify, Apple Music, YouTube Music, Tidal",
      count: 12,
      color: "text-green-500"
    },
    {
      icon: Share2,
      title: "Social Media",
      description: "Instagram, TikTok, Twitter, Facebook",
      count: 6,
      color: "text-purple-500"
    },
    {
      icon: Cloud,
      title: "Storage & Backup",
      description: "Dropbox, Google Drive, iCloud, OneDrive",
      count: 5,
      color: "text-orange-500"
    },
    {
      icon: BarChart,
      title: "Analytics",
      description: "Chartmetric, Soundcharts, Spotify for Artists",
      count: 4,
      color: "text-pink-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Integrations Hub</h1>
          <p className="text-muted-foreground">
            Connect and sync with your favorite music production tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {integrationCategories.map((category) => (
            <Card key={category.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <category.icon className={`h-8 w-8 ${category.color} mb-2`} />
                  <Badge variant="secondary">{category.count} available</Badge>
                </div>
                <CardTitle>{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  View Integrations
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Database Setup Complete</CardTitle>
            <CardDescription>
              Backend infrastructure is ready for 35+ integrations!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Tables created: integration_providers, user_integrations, integration_sync_logs
              <br />
              Edge functions deployed: integration-connect
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>OAuth2 & API key authentication support</li>
              <li>Automatic token refresh & sync scheduling</li>
              <li>Real-time sync status tracking</li>
              <li>Webhook support for instant updates</li>
              <li>Rate limiting & error handling</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntegrationsHub;
