import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Download, ExternalLink, Lock, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { isFeatureEnabled } from "@/config/featureFlags";

const MyCertifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: certifications, isLoading } = useQuery({
    queryKey: ["my-certifications", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("certifications")
        .select("*")
        .eq("user_id", user.id)
        .order("issued_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const featureUnlocked = isFeatureEnabled('EDUCATION_HUB_ENABLED');

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
              <CardTitle className="text-3xl">Certifications</CardTitle>
              <CardDescription>
                This feature unlocks when the community reaches 250 members!
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Earn industry-recognized certifications and showcase your skills
                when we reach 250 members.
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

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-2">
            <Award className="w-3 h-3 mr-1" />
            Tier 2 Unlocked
          </Badge>
          <h1 className="text-4xl font-bold mb-4">My Certifications</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your earned credentials and professional achievements
          </p>
        </div>

        {/* Certifications List */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2].map((i) => (
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
        ) : certifications && certifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Certifications Yet</h3>
              <p className="text-muted-foreground mb-4">
                Complete courses to earn your first certification
              </p>
              <Button onClick={() => navigate("/education")}>
                Browse Courses
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {certifications?.map((cert) => (
              <Card key={cert.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Award className="w-12 h-12 text-primary" />
                    {cert.is_verified && (
                      <Badge variant="default">Verified</Badge>
                    )}
                  </div>
                  <CardTitle>{cert.certification_name}</CardTitle>
                  <CardDescription className="capitalize">
                    {cert.certification_type.replace('_', ' ')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cert.description && (
                    <p className="text-sm text-muted-foreground">
                      {cert.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Issued</span>
                      <span className="font-medium">
                        {new Date(cert.issued_at).toLocaleDateString()}
                      </span>
                    </div>
                    {cert.expires_at && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expires</span>
                        <span className="font-medium">
                          {new Date(cert.expires_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {cert.verification_code && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Code</span>
                        <span className="font-mono text-xs">{cert.verification_code}</span>
                      </div>
                    )}
                  </div>

                  {cert.skills_verified && cert.skills_verified.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Skills Verified:</p>
                      <div className="flex flex-wrap gap-1">
                        {cert.skills_verified.map((skill: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {cert.certificate_url && (
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="flex-1">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCertifications;
