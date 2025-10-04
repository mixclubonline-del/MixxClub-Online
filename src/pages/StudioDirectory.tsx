import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, MapPin, Star, DollarSign, Lock, Sparkles, Search } from "lucide-react";
import { useStudioPartnerships } from "@/hooks/useStudioPartnerships";
import { Skeleton } from "@/components/ui/skeleton";
import { isFeatureEnabled } from "@/config/featureFlags";

const StudioDirectory = () => {
  const navigate = useNavigate();
  const [cityFilter, setCityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [maxRate, setMaxRate] = useState<number | undefined>();

  const { data: studios, isLoading } = useStudioPartnerships({
    city: cityFilter,
    type: typeFilter || undefined,
    maxRate,
  });

  const featureUnlocked = isFeatureEnabled('REMOTE_COLLABORATION_ENABLED');

  if (!featureUnlocked) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Lock className="w-8 h-8 text-muted-foreground" />
                </div>
              </div>
              <CardTitle className="text-3xl">Studio Partnership Directory</CardTitle>
              <CardDescription>
                This feature unlocks when the community reaches 100 members!
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Access premium recording studios, book hybrid sessions, and work with
                world-class facilities when we reach 100 members.
              </p>
              <Button onClick={() => navigate("/auth?signup=true")} size="lg">
                <Sparkles className="w-4 h-4 mr-2" />
                Join MixClub
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
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-2">
            <Building2 className="w-3 h-3 mr-1" />
            Tier 1 Unlocked
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Partner Studio Directory</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Book professional studio time at our partner facilities worldwide
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by city..."
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Studio Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="recording">Recording</SelectItem>
                    <SelectItem value="mixing">Mixing</SelectItem>
                    <SelectItem value="mastering">Mastering</SelectItem>
                    <SelectItem value="multi">Multi-Purpose</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Hourly Rate</label>
                <Input
                  type="number"
                  placeholder="Enter max rate..."
                  value={maxRate || ""}
                  onChange={(e) => setMaxRate(e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Studios Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : studios && studios.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No studios found with these filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {studios?.map((studio) => (
              <Card key={studio.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-xl">{studio.studio_name}</CardTitle>
                    <Badge variant="secondary" className="capitalize">
                      {studio.studio_type}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {studio.location_city}, {studio.location_state} {studio.location_country}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center text-muted-foreground">
                        <Star className="w-4 h-4 mr-2 text-yellow-500 fill-yellow-500" />
                        Rating
                      </span>
                      <span className="font-medium">
                        {studio.rating_average.toFixed(1)} ({studio.total_reviews} reviews)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center text-muted-foreground">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Hourly Rate
                      </span>
                      <span className="font-medium text-primary">
                        ${studio.hourly_rate}/hr
                      </span>
                    </div>
                    {studio.day_rate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-muted-foreground">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Day Rate
                        </span>
                        <span className="font-medium text-primary">
                          ${studio.day_rate}/day
                        </span>
                      </div>
                    )}
                  </div>

                  {studio.equipment_list && studio.equipment_list.length > 0 && (
                    <div className="text-sm">
                      <p className="text-muted-foreground mb-2">Featured Equipment:</p>
                      <div className="flex flex-wrap gap-1">
                        {studio.equipment_list.slice(0, 3).map((equipment, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {equipment}
                          </Badge>
                        ))}
                        {studio.equipment_list.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{studio.equipment_list.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <Button className="w-full" onClick={() => navigate(`/studio/${studio.id}`)}>
                    View Details & Book
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudioDirectory;
