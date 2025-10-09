import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLabelPartnerships, useLabelServices } from "@/hooks/useLabelServices";
import { isFeatureEnabled } from "@/config/featureFlags";
import { Lock, Building2, Sparkles, Award, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const LabelServices = () => {
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState<string>("all");

  const { data: labels, isLoading: labelsLoading } = useLabelPartnerships({
    tier: selectedTier !== "all" ? selectedTier : undefined,
  });

  const isUnlocked = isFeatureEnabled("LABEL_SERVICES_ENABLED");

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
              <CardTitle className="text-2xl">Label Services - Coming Soon</CardTitle>
              <CardDescription className="text-lg">
                This feature unlocks at 500 community members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Connect with top record labels for distribution, marketing, A&R, and more.
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Label Services</h1>
          <p className="text-muted-foreground">
            Partner with industry-leading labels for distribution, marketing, and career growth
          </p>
        </div>

        {/* Featured Labels Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Featured Partners</h2>
          </div>

          {labelsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-24 w-24 rounded-lg mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {labels
                ?.filter((label) => label.featured)
                .slice(0, 3)
                .map((label) => (
                  <Card key={label.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      {label.logo_url ? (
                        <img
                          src={label.logo_url}
                          alt={label.label_name}
                          className="h-24 w-24 object-contain rounded-lg mb-4"
                        />
                      ) : (
                        <div className="h-24 w-24 bg-muted rounded-lg flex items-center justify-center mb-4">
                          <Building2 className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <CardTitle>{label.label_name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {label.label_description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{label.partnership_tier}</Badge>
                          <Badge variant="outline">
                            {label.total_artists} Artists
                          </Badge>
                        </div>
                        {label.genres_specialized && label.genres_specialized.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {label.genres_specialized.slice(0, 3).map((genre) => (
                              <Badge key={genre} variant="outline" className="text-xs">
                                {genre}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <Button className="w-full" onClick={() => navigate(`/label-services/${label.id}`)}>
                          View Services
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>

        {/* All Labels Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">All Label Partners</h2>

          <Tabs value={selectedTier} onValueChange={setSelectedTier} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All Tiers</TabsTrigger>
              <TabsTrigger value="standard">Standard</TabsTrigger>
              <TabsTrigger value="premium">Premium</TabsTrigger>
              <TabsTrigger value="elite">Elite</TabsTrigger>
            </TabsList>
          </Tabs>

          {labelsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : labels && labels.length > 0 ? (
            <div className="space-y-4">
              {labels.map((label) => (
                <Card key={label.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {label.logo_url ? (
                        <img
                          src={label.logo_url}
                          alt={label.label_name}
                          className="h-16 w-16 object-contain rounded-lg"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="text-xl font-semibold mb-1">{label.label_name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {label.label_description}
                            </p>
                          </div>
                          <Badge variant="secondary">{label.partnership_tier}</Badge>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {label.years_established && (
                            <Badge variant="outline">
                              Est. {label.years_established}
                            </Badge>
                          )}
                          <Badge variant="outline">
                            {label.total_artists} Artists
                          </Badge>
                          {label.genres_specialized?.slice(0, 3).map((genre) => (
                            <Badge key={genre} variant="outline" className="text-xs">
                              {genre}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={() => navigate(`/label-services/${label.id}`)}>
                            View Services
                          </Button>
                          {label.website_url && (
                            <Button variant="outline" size="icon" asChild>
                              <a href={label.website_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center p-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No labels found</h3>
              <p className="text-muted-foreground">
                Check back soon for new label partnerships
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabelServices;
