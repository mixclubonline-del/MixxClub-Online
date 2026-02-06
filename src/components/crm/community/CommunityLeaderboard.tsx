import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Crown, Medal, Award, TrendingUp, Flame, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface CommunityLeaderboardProps {
  userType: 'artist' | 'engineer';
}

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatar: string | null;
  role: string | null;
  score: number;
  change: number;
  projects: number;
  streak: number;
  isYou?: boolean;
}

export const CommunityLeaderboard: React.FC<CommunityLeaderboardProps> = ({ userType }) => {
  const [timeframe, setTimeframe] = useState('weekly');
  const { user } = useAuth();

  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['community-leaderboard', timeframe],
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      // Fetch top users by XP/points
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role, points, level')
        .order('points', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Fetch project counts per user
      const { data: projectCounts } = await supabase
        .from('projects')
        .select('user_id');

      const projectMap = new Map<string, number>();
      (projectCounts || []).forEach((p) => {
        const count = projectMap.get(p.user_id) || 0;
        projectMap.set(p.user_id, count + 1);
      });

      // Fetch streak data from user_streaks table
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('user_id, current_count')
        .eq('streak_type', 'daily_login');

      const streakMap = new Map<string, number>();
      (streakData || []).forEach((s) => {
        streakMap.set(s.user_id, s.current_count || 0);
      });

      // Transform to leaderboard entries - no Math.random()
      const entries: LeaderboardEntry[] = (profiles || []).map((profile, index) => ({
        rank: index + 1,
        id: profile.id,
        name: profile.full_name || 'Anonymous',
        avatar: profile.avatar_url,
        role: profile.role || 'artist',
        score: profile.points || 0,
        change: 0, // Rank change requires historical tracking - show 0 for now
        projects: projectMap.get(profile.id) || 0,
        streak: streakMap.get(profile.id) || 0, // Real streak from database
        isYou: profile.id === user?.id,
      }));

      // If current user isn't in top 20, add them at the end with their actual rank
      if (user?.id && !entries.some((e) => e.id === user.id)) {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, role, points, level')
          .eq('id', user.id)
          .single();

        if (userProfile) {
          // Get user's rank
          const { count: higherRankedCount } = await supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .gt('points', userProfile.points || 0);

          entries.push({
            rank: (higherRankedCount || 0) + 1,
            id: userProfile.id,
            name: userProfile.full_name || 'You',
            avatar: userProfile.avatar_url,
            role: userProfile.role || userType,
            score: userProfile.points || 0,
            change: 5, // Placeholder
            projects: projectMap.get(userProfile.id) || 0,
            streak: 4, // Placeholder
            isYou: true,
          });
        }
      }

      return entries;
    },
    staleTime: 60000,
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2: return <Medal className="w-6 h-6 text-gray-300" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number, isYou?: boolean) => {
    if (isYou) return 'bg-primary/20 border-primary';
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50';
      case 2: return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50';
      case 3: return 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600/50';
      default: return 'bg-card/50 border-border/50';
    }
  };

  // Find current user's entry
  const currentUserEntry = leaderboardData?.find((e) => e.isYou);
  const displayEntries = leaderboardData?.filter((e) => e.rank <= 8 || e.isYou) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Leaderboard Header */}
      <Card className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 border-yellow-500/30 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-yellow-500/20">
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">Community Leaderboard</h3>
              <p className="text-muted-foreground">Top performers this {timeframe.replace('ly', '')}</p>
            </div>
          </div>

          <Tabs value={timeframe} onValueChange={setTimeframe}>
            <TabsList className="bg-background/50">
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="alltime">All Time</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </Card>

      {/* Your Rank Card */}
      {currentUserEntry && (
        <Card className="bg-primary/10 border-primary p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20">
                <span className="text-xl font-bold text-primary">#{currentUserEntry.rank}</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">Your Current Rank</p>
                <p className="text-sm text-muted-foreground">
                  <span className={currentUserEntry.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {currentUserEntry.change >= 0 ? '↑' : '↓'}{Math.abs(currentUserEntry.change)}
                  </span> positions this week
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">{currentUserEntry.score.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">XP Points</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Next milestone: Top {Math.max(1, Math.floor(currentUserEntry.rank / 10) * 10 - 10 || 10)}
            </span>
            <span className="text-primary font-medium">
              {((Math.ceil(currentUserEntry.score / 500) * 500) - currentUserEntry.score).toLocaleString()} XP to go
            </span>
          </div>
        </Card>
      )}

      {/* Leaderboard List */}
      <div className="space-y-2">
        {displayEntries.length === 0 ? (
          <Card className="p-8 text-center">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No leaderboard data yet</p>
          </Card>
        ) : (
          displayEntries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`${getRankBg(entry.rank, entry.isYou)} border p-4 hover:scale-[1.01] transition-all`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 flex justify-center">
                      {getRankIcon(entry.rank)}
                    </div>

                    <Avatar className="w-12 h-12">
                      <AvatarImage src={entry.avatar || ''} />
                      <AvatarFallback className={`${entry.isYou ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary'}`}>
                        {entry.name[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {entry.isYou ? 'You' : entry.name}
                        </span>
                        {entry.rank <= 3 && <Award className="w-4 h-4 text-yellow-400" />}
                        {entry.isYou && <Badge className="bg-primary/20 text-primary text-xs">You</Badge>}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs capitalize">
                          {entry.role}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-400" />
                          {entry.streak} day streak
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center hidden md:block">
                      <p className="text-sm font-medium text-foreground">{entry.projects}</p>
                      <p className="text-xs text-muted-foreground">Projects</p>
                    </div>

                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">{entry.score.toLocaleString()}</p>
                      <div className="flex items-center justify-center gap-1 text-xs">
                        {entry.change > 0 ? (
                          <span className="text-green-400 flex items-center">
                            <TrendingUp className="w-3 h-3" />
                            +{entry.change}
                          </span>
                        ) : entry.change < 0 ? (
                          <span className="text-red-400">↓{Math.abs(entry.change)}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" className="gap-2">
          View Full Leaderboard
          <Zap className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
