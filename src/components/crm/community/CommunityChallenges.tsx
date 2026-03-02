/**
 * CommunityChallenges — Dynamic challenges driven by real Supabase data.
 * 
 * Computes challenge progress from projects, achievements, and profile data.
 * Replaces hardcoded challenge state with live metrics.
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Clock, Users, Zap, Gift, Target, Flame, Star, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface CommunityChallengesProps {
  compact?: boolean;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'community' | 'special';
  progress: number;
  target: number;
  reward: string;
  rewardXP: number;
  endsIn: string;
  participants?: number;
  icon: React.ReactNode;
}

export const CommunityChallenges: React.FC<CommunityChallengesProps> = ({ compact = false }) => {
  const { user } = useAuth();

  // Fetch real data for challenges
  const { data: challengeData, isLoading } = useQuery({
    queryKey: ['community-challenges', user?.id],
    queryFn: async () => {
      // 1. User's projects
      const { data: userProjects } = await supabase
        .from('projects')
        .select('id, status, created_at')
        .or(`client_id.eq.${user?.id},engineer_id.eq.${user?.id}`);

      // 2. User's achievements
      const { data: achievements } = await supabase
        .from('achievements')
        .select('id, name, earned_at')
        .eq('user_id', user?.id || '');

      // 3. Platform-wide project count (community challenge)
      const { count: totalPlatformProjects } = await supabase
        .from('projects')
        .select('id', { count: 'exact', head: true });

      // 4. Platform-wide user count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });

      // 5. User's engagement streak from fan_stats (if exists)
      const { data: fanStats } = await supabase
        .from('fan_stats')
        .select('engagement_streak, longest_streak')
        .eq('user_id', user?.id || '')
        .maybeSingle();

      // Compute challenge data
      const projects = userProjects || [];
      const completedProjects = projects.filter(p => p.status === 'completed').length;
      const activeProjects = projects.filter(p => p.status === 'in_progress').length;
      const achievementCount = achievements?.length || 0;

      // This week's projects
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const thisWeekProjects = projects.filter(p =>
        new Date(p.created_at) >= weekAgo
      ).length;

      const streak = fanStats?.engagement_streak || 0;

      return {
        completedProjects,
        activeProjects,
        achievementCount,
        thisWeekProjects,
        totalPlatformProjects: totalPlatformProjects || 0,
        totalUsers: totalUsers || 0,
        streak,
      };
    },
    enabled: !!user?.id,
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {compact ? (
          <Skeleton className="h-48 rounded-xl" />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
            </div>
          </>
        )}
      </div>
    );
  }

  const d = challengeData || {
    completedProjects: 0, activeProjects: 0, achievementCount: 0,
    thisWeekProjects: 0, totalPlatformProjects: 0, totalUsers: 0, streak: 0,
  };

  // Build challenges from real data
  const challenges: Challenge[] = [
    {
      id: 'streak',
      title: 'Daily Streaker',
      description: 'Maintain a 7-day engagement streak',
      type: 'daily',
      progress: Math.min(d.streak, 7),
      target: 7,
      reward: 'Streak Badge',
      rewardXP: 100,
      endsIn: `${7 - Math.min(d.streak, 7)} days left`,
      icon: <Flame className="w-5 h-5 text-orange-400" />,
    },
    {
      id: 'weekly-projects',
      title: 'Collaboration King',
      description: 'Work on 5 projects this week',
      type: 'weekly',
      progress: Math.min(d.thisWeekProjects, 5),
      target: 5,
      reward: 'Gold Crown',
      rewardXP: 500,
      endsIn: 'Resets weekly',
      icon: <Trophy className="w-5 h-5 text-yellow-400" />,
    },
    {
      id: 'community-projects',
      title: 'Community Builder',
      description: 'Help the community reach 10,000 total projects',
      type: 'community',
      progress: d.totalPlatformProjects,
      target: 10000,
      reward: 'Exclusive Avatar Frame',
      rewardXP: 1000,
      participants: d.totalUsers,
      endsIn: 'Ongoing',
      icon: <Users className="w-5 h-5 text-blue-400" />,
    },
    {
      id: 'badge-collector',
      title: 'Badge Collector',
      description: 'Earn 10 achievement badges',
      type: 'weekly',
      progress: Math.min(d.achievementCount, 10),
      target: 10,
      reward: 'Collector Trophy',
      rewardXP: 250,
      endsIn: 'Ongoing',
      icon: <Star className="w-5 h-5 text-purple-400" />,
    },
    {
      id: 'first-complete',
      title: 'Project Master',
      description: 'Complete 5 projects on MixxClub',
      type: 'special',
      progress: Math.min(d.completedProjects, 5),
      target: 5,
      reward: 'Pioneer Badge + 500 XP',
      rewardXP: 500,
      endsIn: 'No deadline',
      icon: <Zap className="w-5 h-5 text-cyan-400" />,
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-orange-500/20 text-orange-400';
      case 'weekly': return 'bg-blue-500/20 text-blue-400';
      case 'community': return 'bg-green-500/20 text-green-400';
      case 'special': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const displayChallenges = compact ? challenges.slice(0, 3) : challenges;
  const completedChallenges = challenges.filter(c => c.progress >= c.target).length;

  if (compact) {
    return (
      <Card className="bg-card/50 border-border/50 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Active Challenges
          </h3>
          <Badge variant="outline" className="text-xs">
            {completedChallenges}/{challenges.length} Done
          </Badge>
        </div>

        <div className="space-y-3">
          {displayChallenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 bg-background/50 rounded-lg border border-border/30"
            >
              <div className="flex items-center gap-2 mb-2">
                {challenge.icon}
                <span className="font-medium text-sm text-foreground truncate">{challenge.title}</span>
                {challenge.progress >= challenge.target && (
                  <Badge className="bg-green-500/20 text-green-400 text-[10px]">✓</Badge>
                )}
              </div>
              <Progress value={(challenge.progress / challenge.target) * 100} className="h-1.5 mb-1" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{challenge.progress.toLocaleString()}/{challenge.target.toLocaleString()}</span>
                <span className="text-primary">+{challenge.rewardXP} XP</span>
              </div>
            </motion.div>
          ))}
        </div>

        <Button variant="ghost" className="w-full mt-3 text-sm gap-1">
          View All Challenges
          <ArrowRight className="w-3 h-3" />
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Challenge Stats — computed from real data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{d.streak}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </div>
        </Card>

        <Card className="bg-card/50 border-border/50 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Trophy className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedChallenges}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </Card>

        <Card className="bg-card/50 border-border/50 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Gift className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {challenges.reduce((s, c) => s + (c.progress >= c.target ? c.rewardXP : 0), 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">XP Earned</p>
            </div>
          </div>
        </Card>

        <Card className="bg-card/50 border-border/50 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{challenges.length}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Challenge Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {challenges.map((challenge, index) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`bg-card/50 border-border/50 p-5 hover:border-primary/50 transition-all h-full ${challenge.progress >= challenge.target ? 'border-green-500/30 bg-green-500/5' : ''
              }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-background/50">
                    {challenge.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{challenge.title}</h4>
                    <p className="text-sm text-muted-foreground">{challenge.description}</p>
                  </div>
                </div>
                <Badge className={getTypeColor(challenge.type)} variant="secondary">
                  {challenge.progress >= challenge.target ? '✓ Done' : challenge.type}
                </Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">
                      {challenge.progress.toLocaleString()}/{challenge.target.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={Math.min((challenge.progress / challenge.target) * 100, 100)} className="h-2" />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{challenge.endsIn}</span>
                    {challenge.participants && (
                      <>
                        <span>•</span>
                        <Users className="w-4 h-4" />
                        <span>{challenge.participants.toLocaleString()} members</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground">{challenge.reward}</span>
                  </div>
                  <Badge className="bg-primary/20 text-primary">
                    +{challenge.rewardXP} XP
                  </Badge>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
