import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIntegrationProviders, useUserIntegrations, useStreamingConnections, useConnectIntegration, useDisconnectIntegration } from "@/hooks/useIntegrations";
import { isFeatureEnabled } from "@/config/featureFlags";
import { Lock, Plug, CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Integrations = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("all");

  const { data: providers, isLoading: providersLoading } = useIntegrationProviders(
    selectedTab !== "all" ? selectedTab : undefined
  );
  const { data: userIntegrations, isLoading: integrationsLoading } = useUserIntegrations();
  const { data: streamingConnections, isLoading: streamingLoading } = useStreamingConnections();
  
  const connectMutation = useConnectIntegration();
  const disconnectMutation = useDisconnectIntegration();

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
                Connect your DAW plugins, streaming platforms, and unlock advanced AI audio intelligence.
                Join our growing community to unlock this feature!
              </p>
              <Button onClick={() => navigate("/")}>
                Return Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getIntegrationStatus = (providerId: string) => {
    return userIntegrations?.find(int => int.provider_id === providerId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Integrations</h1>
          <p className="text-muted-foreground">
            Connect your favorite tools and platforms to enhance your workflow
          </p>
        </div>

        {/* Streaming Analytics Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Streaming Analytics</h2>
          {streamingLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : streamingConnections && streamingConnections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {streamingConnections.map((connection) => (
                <Card key={connection.id}>
                  <CardHeader>
                    <CardTitle className="capitalize">
                      {connection.platform_name.replace('_', ' ')}
                    </CardTitle>
                    <CardDescription>
                      {connection.verified && (
                        <Badge variant="secondary" className="mb-2">Verified</Badge>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Streams:</span>
                        <span className="font-medium">{connection.total_streams.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Listeners:</span>
                        <span className="font-medium">{connection.total_listeners.toLocaleString()}</span>
                      </div>
                      {connection.artist_profile_url && (
                        <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                          <a href={connection.artist_profile_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Profile
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center p-8">
              <p className="text-muted-foreground">No streaming platforms connected yet</p>
            </Card>
          )}
        </div>

        {/* Available Integrations */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Available Integrations</h2>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="daw_plugin">DAW Plugins</TabsTrigger>
              <TabsTrigger value="streaming">Streaming</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="ai_service">AI Services</TabsTrigger>
            </TabsList>
          </Tabs>

          {providersLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : providers && providers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => {
                const integration = getIntegrationStatus(provider.id);
                const isConnected = integration?.connection_status === 'active';
                
                return (
                  <Card key={provider.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2 mb-2">
                            {provider.logo_url ? (
                              <img
                                src={provider.logo_url}
                                alt={provider.provider_name}
                                className="h-6 w-6 object-contain"
                              />
                            ) : (
                              <Plug className="h-5 w-5" />
                            )}
                            {provider.provider_name}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {provider.provider_description}
                          </CardDescription>
                        </div>
                        {provider.is_premium && (
                          <Badge variant="secondary">Premium</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isConnected ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-green-500">Connected</span>
                            </>
                          ) : integration ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                              <span className="text-sm text-yellow-500 capitalize">
                                {integration.connection_status}
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Not connected</span>
                            </>
                          )}
                        </div>
                        
                        {isConnected ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => disconnectMutation.mutate(integration.id)}
                            disabled={disconnectMutation.isPending}
                          >
                            Disconnect
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => connectMutation.mutate({ providerId: provider.id })}
                            disabled={connectMutation.isPending || !!integration}
                          >
                            Connect
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
              <h3 className="text-xl font-semibold mb-2">No integrations found</h3>
              <p className="text-muted-foreground">
                Check back soon for new integration options
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Integrations;
