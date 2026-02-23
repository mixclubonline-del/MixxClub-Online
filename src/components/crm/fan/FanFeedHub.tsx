/**
 * FanFeedHub — Personalized artist discovery feed.
 * 
 * Promise: "AI curates a personalized feed of underground, emerging,
 * and rising artists based on your listening DNA."
 * 
 * Queries real profiles table for artists, ranks by follower count
 * (lower = more underground), and integrates Day 1 status.
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFanStats } from '@/hooks/useFanStats';
import { useDay1Status, usePotentialDay1 } from '@/hooks/useDay1Status';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Compass, TrendingUp, Sparkles, Star, Users,
  Music, ArrowRight, Heart, Flame, Clock, Zap
} from 'lucide-react';
import { CharacterEmptyState } from '@/components/characters/CharacterEmptyState';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface DiscoverArtist {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  genre: string | null;
  follower_count: number | null;
  role: string | null;
  created_at: string;
}

function ArtistDiscoveryCard({ artist, index }: { artist: DiscoverArtist; index: number }) {
  const navigate = useNavigate();
  const { potentialRank, potentialTier, isDay1Opportunity, followerCount } = usePotentialDay1(artist.id);

  const followerLabel = (followerCount || 0) < 10 ? 'Underground'
    : (followerCount || 0) < 100 ? 'Emerging'
      : (followerCount || 0) < 1000 ? 'Rising'
        : 'Established';

  const tierColor = followerLabel === 'Underground' ? 'text-amber-400 border-amber-400/30'
    : followerLabel === 'Emerging' ? 'text-purple-400 border-purple-400/30'
      : followerLabel === 'Rising' ? 'text-blue-400 border-blue-400/30'
        : 'text-green-400 border-green-400/30';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card variant="glass" className="group hover:border-primary/30 transition-all duration-300 cursor-pointer overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            {/* Avatar with Day 1 indicator */}
            <div className="relative shrink-0">
              <Avatar className="w-14 h-14 ring-2 ring-border/30 group-hover:ring-primary/40 transition-all">
                <AvatarImage src={artist.avatar_url || ''} alt={artist.full_name || ''} />
                <AvatarFallback className="bg-primary/20 text-primary text-lg font-bold">
                  {(artist.full_name || '?')[0]}
                </AvatarFallback>
              </Avatar>
              {isDay1Opportunity && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-xs">
                  ⭐
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground truncate">
                  {artist.full_name || artist.username || 'Unknown Artist'}
                </h3>
                <Badge variant="outline" className={`text-xs shrink-0 ${tierColor}`}>
                  {followerLabel}
                </Badge>
              </div>

              {artist.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{artist.bio}</p>
              )}

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {artist.genre && (
                  <span className="flex items-center gap-1">
                    <Music className="w-3 h-3" />
                    {artist.genre}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {(followerCount || 0).toLocaleString()} followers
                </span>
                {isDay1Opportunity && (
                  <span className="flex items-center gap-1 text-amber-400 font-medium">
                    <Star className="w-3 h-3" />
                    You'd be #{potentialRank}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 shrink-0">
              {isDay1Opportunity ? (
                <Button
                  size="sm"
                  className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30"
                  variant="outline"
                  onClick={() => navigate(`/profile/${artist.id}`)}
                >
                  <Star className="w-3 h-3 mr-1" />
                  Day 1
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => navigate(`/profile/${artist.id}`)}
                >
                  <Heart className="w-3 h-3 mr-1" />
                  Follow
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i} variant="glass">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <Skeleton className="w-14 h-14 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export const FanFeedHub = () => {
  const { user } = useAuth();
  const { stats, currentTier } = useFanStats();
  const [feedTab, setFeedTab] = useState('underground');

  // Fetch artists for discovery — real data from profiles table
  const { data: discoverArtists, isLoading } = useQuery({
    queryKey: ['fan-discover-artists', feedTab],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, bio, genre, follower_count, role, created_at')
        .eq('role', 'artist')
        .order('created_at', { ascending: false });

      // Filter by discovery tier
      if (feedTab === 'underground') {
        query = query.lt('follower_count', 10).limit(20);
      } else if (feedTab === 'emerging') {
        query = query.gte('follower_count', 10).lt('follower_count', 100).limit(20);
      } else if (feedTab === 'rising') {
        query = query.gte('follower_count', 100).lt('follower_count', 1000)
          .order('follower_count', { ascending: false }).limit(20);
      } else {
        // 'new' — artists who joined in the last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('created_at', weekAgo.toISOString()).limit(20);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching discover artists:', error);
        return [];
      }
      return (data || []) as DiscoverArtist[];
    },
    enabled: !!user?.id,
    staleTime: 60000,
  });

  // Taste profile from fan stats
  const tasteStats = [
    { label: 'Artists Supported', value: stats?.artists_supported || 0, icon: Heart, color: 'text-pink-400' },
    { label: 'Day 1 Badges', value: stats?.day1_badges || 0, icon: Star, color: 'text-amber-400' },
    { label: 'Discovery Streak', value: stats?.engagement_streak || 0, icon: Flame, color: 'text-orange-400' },
    { label: 'Fan Tier', value: currentTier, icon: Zap, color: 'text-purple-400' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Taste Profile Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <FeedSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Taste DNA Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tasteStats.map((stat) => (
          <Card key={stat.label} variant="glass" className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg bg-card/50 flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-lg font-bold capitalize">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Discovery Feed */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Compass className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Discover Artists</h2>
        </div>

        <Tabs value={feedTab} onValueChange={setFeedTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="underground" className="text-xs gap-1">
              <Star className="w-3 h-3" />
              Underground
            </TabsTrigger>
            <TabsTrigger value="emerging" className="text-xs gap-1">
              <Sparkles className="w-3 h-3" />
              Emerging
            </TabsTrigger>
            <TabsTrigger value="rising" className="text-xs gap-1">
              <TrendingUp className="w-3 h-3" />
              Rising
            </TabsTrigger>
            <TabsTrigger value="new" className="text-xs gap-1">
              <Clock className="w-3 h-3" />
              New Today
            </TabsTrigger>
          </TabsList>

          {['underground', 'emerging', 'rising', 'new'].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-3">
              {!discoverArtists || discoverArtists.length === 0 ? (
                <CharacterEmptyState
                  type="feed"
                  characterId="nova"
                  title={tab === 'new' ? 'No New Artists Today' : `No ${tab.charAt(0).toUpperCase() + tab.slice(1)} Artists Found`}
                  message={tab === 'underground'
                    ? "Check back soon — new underground artists join daily"
                    : `We're always finding new ${tab} talent for you`}
                  actionLabel="Refresh"
                  onAction={() => { }}
                />
              ) : (
                discoverArtists.map((artist, index) => (
                  <ArtistDiscoveryCard key={artist.id} artist={artist} index={index} />
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Discovery Tip */}
      <Card variant="glass" className="border-amber-500/20 bg-amber-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-400 mb-1">Day 1 Tip</p>
              <p className="text-xs text-muted-foreground">
                Artists with ⭐ are Day&nbsp;1 opportunities. Follow them now and your support gets
                timestamped — proving you were there before the world caught on.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};