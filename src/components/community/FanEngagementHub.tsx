import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Trophy, Flame, Star, TrendingUp, Users, Zap, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { MyDay1Artists } from '@/components/day1/MyDay1Artists';
import { useFanStats, calculateTier, getStreakMultiplier, isStreakActive } from '@/hooks/useFanStats';
import { useDay1Status } from '@/hooks/useDay1Status';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TIER_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  newcomer: { label: 'Newcomer', color: 'bg-muted text-muted-foreground', icon: <Star className="h-3 w-3" /> },
  supporter: { label: 'Supporter', color: 'bg-blue-500/20 text-blue-400', icon: <Heart className="h-3 w-3" /> },
  advocate: { label: 'Advocate', color: 'bg-purple-500/20 text-purple-400', icon: <Zap className="h-3 w-3" /> },
  champion: { label: 'Champion', color: 'bg-amber-500/20 text-amber-400', icon: <Trophy className="h-3 w-3" /> },
  legend: { label: 'Legend', color: 'bg-primary/20 text-primary', icon: <Crown className="h-3 w-3" /> },
};

export const FanEngagementHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('day1');
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { stats, isLoading: statsLoading, currentTier } = useFanStats();
  const { myDay1Artists, isLoadingMyArtists, stats: day1Stats } = useDay1Status();

  const tierInfo = TIER_CONFIG[currentTier || 'newcomer'] || TIER_CONFIG.newcomer;
  const streakActive = stats ? isStreakActive(stats.last_activity_at) : false;
  const streakMultiplier = stats ? getStreakMultiplier(stats.engagement_streak) : 1;

  return (
    <div className="space-y-6">
      {/* Fan Stats Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <Card variant="glass">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              {tierInfo.icon}
              <Badge className={cn('text-xs', tierInfo.color)}>{tierInfo.label}</Badge>
            </div>
            <p className="text-2xl font-bold">{stats?.mixxcoinz_earned ?? 0}</p>
            <p className="text-xs text-muted-foreground">MixxCoinz</p>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-4 text-center">
            <Flame className={cn('h-5 w-5 mx-auto mb-1', streakActive ? 'text-orange-400' : 'text-muted-foreground')} />
            <p className="text-2xl font-bold">{stats?.engagement_streak ?? 0}</p>
            <p className="text-xs text-muted-foreground">
              Day Streak {streakMultiplier > 1 && <span className="text-primary">({streakMultiplier}x)</span>}
            </p>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto mb-1 text-blue-400" />
            <p className="text-2xl font-bold">{stats?.artists_supported ?? 0}</p>
            <p className="text-xs text-muted-foreground">Artists Supported</p>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-4 text-center">
            <Trophy className="h-5 w-5 mx-auto mb-1 text-amber-400" />
            <p className="text-2xl font-bold">{stats?.day1_badges ?? 0}</p>
            <p className="text-xs text-muted-foreground">Day 1 Badges</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="day1" className="flex items-center gap-1.5">
            <Heart className="h-4 w-4" /> Day 1 Showcase
          </TabsTrigger>
          <TabsTrigger value="milestones" className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4" /> Milestones
          </TabsTrigger>
          <TabsTrigger value="streaks" className="flex items-center gap-1.5">
            <Flame className="h-4 w-4" /> Streaks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="day1" className="mt-4">
          <MyDay1Artists limit={12} />
        </TabsContent>

        <TabsContent value="milestones" className="mt-4">
          <MilestonesTimeline />
        </TabsContent>

        <TabsContent value="streaks" className="mt-4">
          <StreakRewards
            streak={stats?.engagement_streak ?? 0}
            longestStreak={stats?.longest_streak ?? 0}
            multiplier={streakMultiplier}
            isActive={streakActive}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

function MilestonesTimeline() {
  const { myDay1Artists, isLoadingMyArtists } = useDay1Status();

  if (isLoadingMyArtists) {
    return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>;
  }

  const milestoneArtists = (myDay1Artists || []).filter(
    (a: any) => a.artist_milestone_1k || a.artist_milestone_10k || a.artist_milestone_verified
  );

  if (milestoneArtists.length === 0) {
    return (
      <Card variant="glass">
        <CardContent className="p-8 text-center">
          <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
          <h3 className="font-medium text-muted-foreground">No Milestones Yet</h3>
          <p className="text-sm text-muted-foreground/70 mt-1">
            When your Day 1 artists hit growth milestones, they'll appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {milestoneArtists.map((artist: any, i: number) => (
        <motion.div
          key={artist.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Card variant="glass">
            <CardContent className="p-4 flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={artist.profiles?.avatar_url} />
                <AvatarFallback>{(artist.profiles?.full_name || '?')[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{artist.profiles?.full_name || 'Artist'}</p>
                <p className="text-xs text-muted-foreground">
                  You were follower #{artist.artist_follower_count_at_follow + 1}
                </p>
              </div>
              <div className="flex gap-1.5">
                {artist.artist_milestone_1k && <Badge variant="secondary" className="text-xs">1K 🎉</Badge>}
                {artist.artist_milestone_10k && <Badge variant="secondary" className="text-xs">10K 🚀</Badge>}
                {artist.artist_milestone_verified && <Badge variant="secondary" className="text-xs">Verified ✓</Badge>}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

interface StreakRewardsProps {
  streak: number;
  longestStreak: number;
  multiplier: number;
  isActive: boolean;
}

function StreakRewards({ streak, longestStreak, multiplier, isActive }: StreakRewardsProps) {
  const milestones = [
    { days: 7, label: '7-Day Streak', reward: '1.5x XP Multiplier', icon: '🔥' },
    { days: 14, label: '14-Day Streak', reward: '2x XP Multiplier', icon: '⚡' },
    { days: 30, label: '30-Day Streak', reward: '3x XP Multiplier', icon: '👑' },
    { days: 60, label: '60-Day Streak', reward: 'Legendary Badge', icon: '💎' },
    { days: 100, label: '100-Day Streak', reward: 'Century Club', icon: '🏆' },
  ];

  return (
    <div className="space-y-4">
      <Card variant="glass">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Flame className={cn('h-5 w-5', isActive ? 'text-orange-400' : 'text-muted-foreground')} />
                {streak}-Day Streak
              </h3>
              <p className="text-sm text-muted-foreground">
                {isActive ? `Active — ${multiplier}x XP multiplier` : 'Inactive — engage today to restart!'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Longest</p>
              <p className="text-lg font-bold">{longestStreak} days</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {milestones.map((m) => {
          const reached = streak >= m.days;
          const progress = Math.min(100, (streak / m.days) * 100);
          return (
            <Card key={m.days} variant="glass" className={cn(reached && 'border-primary/30')}>
              <CardContent className="p-3 flex items-center gap-3">
                <span className="text-xl">{m.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className={cn('text-sm font-medium', reached ? 'text-primary' : 'text-foreground')}>
                      {m.label}
                    </p>
                    <span className="text-xs text-muted-foreground">{m.reward}</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>
                {reached && <Badge className="bg-primary/20 text-primary text-xs">Reached</Badge>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
