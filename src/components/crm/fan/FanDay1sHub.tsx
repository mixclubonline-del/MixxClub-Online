/**
 * FanDay1sHub — Your Day 1 artist collection and growth tracker.
 * 
 * Promise: "Back artists when they're still underground. Your early support
 * gets timestamped — proving you were Day 1 before the world caught on."
 * 
 * Uses useDay1Status hook for real artist_day1s data with recognition tiers,
 * milestone tracking, and discovery score.
 */

import { useDay1Status, getTierLabel, getTierIcon, getTierColor } from '@/hooks/useDay1Status';
import { useFanStats } from '@/hooks/useFanStats';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CharacterEmptyState } from '@/components/characters/CharacterEmptyState';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Star, TrendingUp, Users, Trophy, Crown,
  Sparkles, ArrowRight, Heart, Milestone
} from 'lucide-react';

export const FanDay1sHub = () => {
  const navigate = useNavigate();
  const { myDay1Artists, isLoadingMyArtists, stats: day1Stats } = useDay1Status();
  const { stats: fanStats } = useFanStats();

  if (isLoadingMyArtists) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!myDay1Artists || myDay1Artists.length === 0) {
    return (
      <CharacterEmptyState
        type="favorites"
        characterId="nova"
        title="Your Day 1 Collection"
        message="Support artists early and earn your Day 1 badge when they blow up. Go discover underground artists to start building your collection."
        actionLabel="Discover Artists"
        onAction={() => navigate('/fan-hub?tab=feed')}
      />
    );
  }

  // Compute growth data
  const artistsGrowing = myDay1Artists.filter(d => {
    const currentFollowers = d.artist?.follower_count || 0;
    const followedAt = d.artist_follower_count_at_follow;
    return currentFollowers > followedAt;
  });

  const totalGrowthMultiplier = myDay1Artists.reduce((sum, d) => {
    const current = d.artist?.follower_count || 0;
    const atFollow = d.artist_follower_count_at_follow || 1;
    return sum + (current / atFollow);
  }, 0) / (myDay1Artists.length || 1);

  return (
    <div className="space-y-6">
      {/* Discovery Score Banner */}
      <Card variant="glass" className="border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-orange-500/5 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                <Trophy className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <p className="text-3xl font-black text-amber-400">{day1Stats.discoveryScore}</p>
                <p className="text-sm text-muted-foreground">Discovery Score</p>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-xl font-bold">{day1Stats.beforeDay1Count}</p>
                <p className="text-xs text-muted-foreground">Before Day 1</p>
              </div>
              <div>
                <p className="text-xl font-bold">{day1Stats.day1Count}</p>
                <p className="text-xs text-muted-foreground">Day 1</p>
              </div>
              <div>
                <p className="text-xl font-bold">{day1Stats.earlySupporterCount}</p>
                <p className="text-xs text-muted-foreground">Early Supporter</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Star className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-lg font-bold">{day1Stats.totalArtistsSupported}</p>
                <p className="text-xs text-muted-foreground">Day 1 Artists</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-lg font-bold">{artistsGrowing.length}</p>
                <p className="text-xs text-muted-foreground">Growing</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Milestone className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-lg font-bold">{day1Stats.artistsHit1k}</p>
                <p className="text-xs text-muted-foreground">Hit 1K</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-500/20 flex items-center justify-center">
                <Crown className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <p className="text-lg font-bold">{day1Stats.artistsHit10k}</p>
                <p className="text-xs text-muted-foreground">Hit 10K</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Day 1 Artist Grid */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400" />
          Your Day 1 Collection
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myDay1Artists.map((day1, index) => {
            const artist = day1.artist;
            const currentFollowers = artist?.follower_count || 0;
            const followedAt = day1.artist_follower_count_at_follow;
            const growthMultiple = followedAt > 0 ? (currentFollowers / followedAt) : 1;
            const isGrowing = currentFollowers > followedAt;
            const tierIcon = getTierIcon(day1.recognition_tier);
            const tierLabel = getTierLabel(day1.recognition_tier);
            const tierColor = getTierColor(day1.recognition_tier);

            return (
              <motion.div
                key={day1.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Card
                  variant="glass"
                  className="group hover:border-primary/30 transition-all cursor-pointer overflow-hidden"
                  onClick={() => artist && navigate(`/profile/${artist.id}`)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <Avatar className="w-12 h-12 ring-2 ring-border/30">
                        <AvatarImage src={artist?.avatar_url || ''} />
                        <AvatarFallback className="bg-primary/20 text-primary font-bold">
                          {(artist?.full_name || '?')[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        {/* Name + Tier */}
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">
                            {artist?.full_name || 'Unknown Artist'}
                          </h3>
                          <Badge variant="outline" className={`text-xs shrink-0 ${tierColor} border-current/30`}>
                            {tierIcon} {tierLabel}
                          </Badge>
                        </div>

                        {/* OG Proof */}
                        <p className="text-xs text-muted-foreground mb-3">
                          You followed at <span className="font-medium text-foreground">
                            #{day1.artist_follower_count_at_follow + 1}
                          </span> • {new Date(day1.followed_at).toLocaleDateString()}
                        </p>

                        {/* Growth Tracker */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">
                                {followedAt.toLocaleString()} → {currentFollowers.toLocaleString()} followers
                              </span>
                              {isGrowing && (
                                <span className="text-green-400 font-medium">
                                  {growthMultiple.toFixed(1)}x
                                </span>
                              )}
                            </div>
                            <Progress
                              value={Math.min((currentFollowers / Math.max(followedAt * 10, 100)) * 100, 100)}
                              className="h-1.5"
                            />
                          </div>
                        </div>

                        {/* Milestones */}
                        <div className="flex gap-2 mt-2">
                          {day1.artist_milestone_1k && (
                            <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                              🎉 Hit 1K
                            </Badge>
                          )}
                          {day1.artist_milestone_10k && (
                            <Badge className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30">
                              🚀 Hit 10K
                            </Badge>
                          )}
                          {day1.artist_milestone_verified && (
                            <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                              ✓ Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Growth Summary */}
      {artistsGrowing.length > 0 && (
        <Card variant="glass" className="border-green-500/20 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-400">
                  {artistsGrowing.length} of your Day 1 artists are growing
                </p>
                <p className="text-xs text-muted-foreground">
                  Average growth: {totalGrowthMultiplier.toFixed(1)}x since you followed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA to discover more */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => navigate('/fan-hub?tab=feed')}
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Discover More Artists
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};