import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { useAuth } from "@/hooks/useAuth";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileActivityFeed } from "@/components/profile/ProfileActivityFeed";
import { ProfileBadges } from "@/components/profile/ProfileBadges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Music, 
  BarChart3, 
  Users, 
  ArrowLeft,
  Loader2 
} from "lucide-react";
import { toast } from "sonner";

export default function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { 
    profile, 
    isLoadingProfile, 
    activities, 
    isLoadingActivities,
    logProfileView,
    error 
  } = usePublicProfile(username);

  const isOwnProfile = user?.id === profile?.id;

  // Log profile view on mount
  useEffect(() => {
    if (profile?.id && !isOwnProfile) {
      logProfileView(profile.id);
    }
  }, [profile?.id, isOwnProfile, logProfileView]);

  const handleMessage = () => {
    if (!user) {
      toast.error("Please sign in to send messages");
      return;
    }
    // TODO: Navigate to messages with this user
    toast.info("Messaging coming soon!");
  };

  const handleHire = () => {
    if (!user) {
      toast.error("Please sign in to hire");
      return;
    }
    // TODO: Open hire/collab flow
    toast.info("Hiring flow coming soon!");
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Profile Not Found</h1>
        <p className="text-muted-foreground">
          The user @{username} doesn't exist or hasn't set up their profile yet.
        </p>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{profile.full_name || profile.username || "Profile"} | MixClub</title>
        <meta 
          name="description" 
          content={profile.tagline || profile.bio || `Check out ${profile.full_name || profile.username}'s profile on MixClub`} 
        />
        <meta property="og:title" content={`${profile.full_name || profile.username} | MixClub`} />
        <meta property="og:description" content={profile.tagline || profile.bio || ""} />
        {profile.avatar_url && <meta property="og:image" content={profile.avatar_url} />}
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        {/* Back button */}
        <div className="absolute top-4 left-4 z-20">
          <Button 
            variant="ghost" 
            size="icon"
            className="bg-background/50 backdrop-blur-sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Hero Section */}
        <ProfileHero 
          profile={profile} 
          isOwnProfile={isOwnProfile}
          onMessage={handleMessage}
          onHire={handleHire}
        />

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 mt-8">
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="activity" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="music" className="gap-2">
                <Music className="h-4 w-4" />
                Music
              </TabsTrigger>
              <TabsTrigger value="network" className="gap-2">
                <Users className="h-4 w-4" />
                Network
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="space-y-6">
              <ProfileActivityFeed 
                activities={activities || []} 
                isLoading={isLoadingActivities} 
              />
              <ProfileBadges userId={profile.id} />
            </TabsContent>

            <TabsContent value="music">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Music & Releases
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-8">
                    Music section coming soon...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="network">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Collaborators & Network
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-8">
                    Network section coming soon...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
