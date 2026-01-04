import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "./FollowButton";
import { 
  MapPin, 
  Link as LinkIcon, 
  MessageCircle, 
  BadgeCheck,
  Circle,
  Sparkles
} from "lucide-react";
import { PublicProfile } from "@/hooks/usePublicProfile";
import { cn } from "@/lib/utils";

interface ProfileHeroProps {
  profile: PublicProfile;
  isOwnProfile?: boolean;
  onMessage?: () => void;
  onHire?: () => void;
}

export function ProfileHero({ 
  profile, 
  isOwnProfile = false,
  onMessage,
  onHire 
}: ProfileHeroProps) {
  const initials = profile.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

  const isOnline = profile.last_active_at && 
    new Date(profile.last_active_at).getTime() > Date.now() - 5 * 60 * 1000;

  const socialLinks = Object.entries(profile.social_links || {});

  return (
    <div className="relative">
      {/* Cover Image */}
      <div 
        className="h-48 md:h-64 lg:h-80 w-full bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 relative overflow-hidden"
        style={profile.cover_image_url ? {
          backgroundImage: `url(${profile.cover_image_url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        } : undefined}
      >
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Live indicator */}
        {profile.status_emoji === "🔴" && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-destructive text-destructive-foreground px-3 py-1.5 rounded-full animate-pulse">
            <Circle className="h-2 w-2 fill-current" />
            <span className="text-sm font-medium">LIVE</span>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="max-w-4xl mx-auto px-4 -mt-20 md:-mt-24 relative z-10">
        <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <Avatar className="h-28 w-28 md:h-36 md:w-36 border-4 border-background shadow-2xl">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || ""} />
                <AvatarFallback className="text-3xl bg-primary/20">{initials}</AvatarFallback>
              </Avatar>
              
              {/* Online indicator */}
              {isOnline && (
                <div className="absolute bottom-2 right-2 h-5 w-5 bg-green-500 rounded-full border-2 border-background" />
              )}
              
              {/* Status emoji */}
              {profile.status_emoji && (
                <div className="absolute -bottom-1 -right-1 text-2xl bg-background rounded-full p-1 shadow-lg">
                  {profile.status_emoji}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold truncate">
                  {profile.full_name || profile.username || "Anonymous"}
                </h1>
                
                {profile.is_verified && (
                  <BadgeCheck className="h-6 w-6 text-primary flex-shrink-0" />
                )}
                
                {profile.is_available_for_collab && (
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    Open to Collab
                  </Badge>
                )}
              </div>

              {profile.username && (
                <p className="text-muted-foreground mb-2">@{profile.username}</p>
              )}

              {profile.tagline && (
                <p className="text-lg text-foreground/80 mb-3">{profile.tagline}</p>
              )}

              {/* Status text */}
              {profile.status_text && (
                <p className="text-sm text-muted-foreground italic mb-3">
                  "{profile.status_text}"
                </p>
              )}

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </span>
                )}
                {profile.website_url && (
                  <a 
                    href={profile.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <LinkIcon className="h-4 w-4" />
                    {new URL(profile.website_url).hostname}
                  </a>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-6 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{profile.follower_count.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{profile.following_count.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Following</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">Level {profile.level}</p>
                  <p className="text-xs text-muted-foreground">{profile.total_xp.toLocaleString()} XP</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {!isOwnProfile && (
                  <>
                    <FollowButton userId={profile.id} size="lg" />
                    <Button variant="outline" size="lg" onClick={onMessage}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    {profile.is_available_for_collab && (
                      <Button variant="secondary" size="lg" onClick={onHire}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Hire Me
                      </Button>
                    )}
                  </>
                )}
                {isOwnProfile && (
                  <Button variant="outline" size="lg">
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mt-6 pt-6 border-t border-border/50">
              <p className="text-foreground/80 whitespace-pre-wrap">{profile.bio}</p>
            </div>
          )}

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {socialLinks.map(([platform, url]) => (
                <a
                  key={platform}
                  href={url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-secondary/50 hover:bg-secondary rounded-full text-sm capitalize transition-colors"
                >
                  {platform}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
