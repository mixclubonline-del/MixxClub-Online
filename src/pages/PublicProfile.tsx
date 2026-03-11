import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { useAuth } from "@/hooks/useAuth";
import { useStartConversation } from "@/hooks/useStartConversation";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileActivityFeed } from "@/components/profile/ProfileActivityFeed";
import { ProfileBadges } from "@/components/profile/ProfileBadges";
import { ProfileMusicSection } from "@/components/profile/ProfileMusicSection";
import { ProfileNetworkSection } from "@/components/profile/ProfileNetworkSection";
import { HireModal } from "@/components/profile/HireModal";
import { SimilarUsersSection } from "@/components/social/SimilarUsersSection";
import { MediaShowcase } from "@/components/profile/showcase";
import type { FeaturedMediaItem, PortfolioItem } from "@/components/profile/showcase";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Music,
  BarChart3,
  Users,
  ArrowLeft,
  Loader2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startConversation } = useStartConversation();
  const [showHireModal, setShowHireModal] = useState(false);

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

  const handleMessage = async () => {
    if (!user) {
      toast.error("Please sign in to send messages");
      navigate("/auth");
      return;
    }

    if (!profile?.id) return;

    // Determine user role to navigate to correct CRM
    const userRole = user?.user_metadata?.role === 'engineer' ? 'engineer' : 'artist';
    await startConversation(profile.id, userRole);
  };

  const handleHire = () => {
    if (!user) {
      toast.error("Please sign in to hire");
      navigate("/auth");
      return;
    }
    setShowHireModal(true);
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
        <title>{profile.full_name || profile.username || "Profile"} | Mixxclub</title>
        <meta
          name="description"
          content={profile.tagline || profile.bio || `Check out ${profile.full_name || profile.username}'s profile on Mixxclub`}
        />
        <meta property="og:title" content={`${profile.full_name || profile.username} | Mixxclub`} />
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

        {/* Role-Specific Profile Banner */}
        {profile.role === 'engineer' && (
          <div className="max-w-4xl mx-auto px-4 mt-4">
            <Link to={`/engineer/${profile.id}`} className="glass-mid rounded-xl p-4 flex items-center justify-between hover:shadow-[0_4px_24px_hsl(var(--primary)/0.12)] hover:-translate-y-0.5 transition-all group block">
              <div>
                <p className="text-sm font-semibold">View Full Studio Profile</p>
                <p className="text-xs text-muted-foreground">See equipment, samples, reviews, and book a session</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </div>
        )}
        {profile.role === 'artist' && (
          <div className="max-w-4xl mx-auto px-4 mt-4">
            <Link to={`/artist/${profile.id}`} className="glass-mid rounded-xl p-4 flex items-center justify-between hover:shadow-[0_4px_24px_hsl(270_70%_50%/0.12)] hover:-translate-y-0.5 transition-all group block">
              <div>
                <p className="text-sm font-semibold">View Artist Showcase</p>
                <p className="text-xs text-muted-foreground">Explore discography, projects, and propose a collaboration</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-[hsl(270_70%_60%)] transition-colors" />
            </Link>
          </div>
        )}
        {profile.role === 'producer' && (
          <div className="max-w-4xl mx-auto px-4 mt-4">
            <Link to={`/producer/${profile.id}`} className="glass-mid rounded-xl p-4 flex items-center justify-between hover:shadow-[0_4px_24px_hsl(38_90%_50%/0.12)] hover:-translate-y-0.5 transition-all group block">
              <div>
                <p className="text-sm font-semibold">View Beat Catalog</p>
                <p className="text-xs text-muted-foreground">Browse beats, listen to previews, and request custom beats</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-[hsl(38_90%_55%)] transition-colors" />
            </Link>
          </div>
        )}

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 mt-8">
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="activity" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="showcase" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Showcase
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

            <TabsContent value="showcase">
              <MediaShowcase
                featuredMedia={(((profile as unknown as Record<string, unknown>).featured_media as FeaturedMediaItem[]) || [])}
                accent={((profile as unknown as Record<string, unknown>).profile_config as Record<string, unknown>)?.colors ? (((profile as unknown as Record<string, unknown>).profile_config as Record<string, Record<string, string>>)?.colors?.primary) : undefined}
              />
            </TabsContent>

            <TabsContent value="music">
              <ProfileMusicSection
                userId={profile.id}
                pinnedTrackId={profile.pinned_track_id}
              />
            </TabsContent>

            <TabsContent value="network" className="space-y-6">
              <ProfileNetworkSection
                userId={profile.id}
                followerCount={profile.follower_count || 0}
                followingCount={profile.following_count || 0}
              />
              <SimilarUsersSection
                userId={profile.id}
                userRole={profile.role}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Hire Modal */}
      <HireModal
        open={showHireModal}
        onOpenChange={setShowHireModal}
        profile={{
          id: profile.id,
          full_name: profile.full_name,
          username: profile.username,
          role: profile.role,
        }}
      />
    </>
  );
}
