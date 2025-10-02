import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIntegrationProviders, useUserIntegrations, useStreamingConnections } from "@/hooks/useIntegrations";
import { isFeatureEnabled } from "@/config/featureFlags";
import { Lock, Plug, Check, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Integrations = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string>("all");

  const { data: providers, isLoading: providersLoading } = useIntegrationProviders(
    selectedType !== "all" ? selectedType : undefined
  );
  const { data: userIntegrations } = useUserIntegrations();
  const { data: streamingConnections } = useStreamingConnections();

  const isUnlocked = isFeatureEnabled("INTEGRATIONS_ENABLED");

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Pro Integrations - Coming Soon</CardTitle>
              <CardDescription className="text-lg">
                This feature unlocks at 1000 community members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Connect with DAW plugins, streaming platforms, and advanced AI services.
              </p>
              <Button onClick={() => navigate("/")}>Return Home</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const connectedIds = new Set(userIntegrations?.map((int: any) => int.provider_id) || []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">Integrations</h1>
        <p className="text-muted-foreground mb-8">Connect your favorite tools</p>

        {streamingConnections && streamingConnections.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Streaming Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {streamingConnections.map((conn) => (
                <Card key={conn.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{conn.platform_name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Streams</span>
                        <span className="font-semibold">{conn.total_streams.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold mb-4">Available Integrations</h2>
        <Tabs value={selectedType} onValueChange={setSelectedType} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="daw_plugin">DAW Plugins</TabsTrigger>
            <TabsTrigger value="streaming">Streaming</TabsTrigger>
            <TabsTrigger value="ai_service">AI Services</TabsTrigger>
          </TabsList>
        </Tabs>

        {providersLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-12 w-12 mb-4" />
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : providers && providers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {providers.map((provider) => {
              const isConnected = connectedIds.has(provider.id);
              return (
                <Card key={provider.id} className={isConnected ? "border-primary" : ""}>
                  <CardHeader>
                    <div className="flex justify-between">
                      <CardTitle>{provider.provider_name}</CardTitle>
                      {isConnected && <Badge><Check className="h-3 w-3 mr-1" />Connected</Badge>}
                    </div>
                    <CardDescription>{provider.provider_description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button className="flex-1">{isConnected ? "Manage" : "Connect"}</Button>
                      {provider.documentation_url && (
                        <Button variant="outline" size="icon" asChild>
                          <a href={provider.documentation_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center p-12">
            <Plug className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold">No integrations found</h3>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Integrations;
