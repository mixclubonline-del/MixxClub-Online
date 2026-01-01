import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Crown, Medal, Award, TrendingUp, Flame, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface CommunityLeaderboardProps {
  userType: 'artist' | 'engineer';
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  role: 'artist' | 'engineer';
  score: number;
  change: number;
  projects: number;
  streak: number;
  isYou?: boolean;
}

export const CommunityLeaderboard: React.FC<CommunityLeaderboardProps> = ({ userType }) => {
  const [timeframe, setTimeframe] = useState('weekly');

  const leaderboardData: LeaderboardEntry[] = [
    { rank: 1, name: 'ProProducer', avatar: '', role: 'engineer', score: 12450, change: 2, projects: 45, streak: 21 },
    { rank: 2, name: 'SonicWave', avatar: '', role: 'engineer', score: 11890, change: -1, projects: 38, streak: 14 },
    { rank: 3, name: 'BeatMaster', avatar: '', role: 'artist', score: 10234, change: 1, projects: 29, streak: 8 },
    { rank: 4, name: 'MixMaster', avatar: '', role: 'engineer', score: 9876, change: 0, projects: 34, streak: 12 },
    { rank: 5, name: 'TrapKing', avatar: '', role: 'artist', score: 8765, change: 3, projects: 22, streak: 5 },
    { rank: 6, name: 'VocalQueen', avatar: '', role: 'artist', score: 7654, change: -2, projects: 18, streak: 9 },
    { rank: 7, name: 'StudioPro', avatar: '', role: 'engineer', score: 6543, change: 1, projects: 27, streak: 7 },
    { rank: 8, name: 'RhymeFlow', avatar: '', role: 'artist', score: 5432, change: -1, projects: 15, streak: 3 },
    { rank: 24, name: 'You', avatar: '', role: userType, score: 2156, change: 5, projects: 8, streak: 4, isYou: true },
  ];

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
      <Card className="bg-primary/10 border-primary p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20">
              <span className="text-xl font-bold text-primary">#24</span>
            </div>
            <div>
              <p className="font-semibold text-foreground">Your Current Rank</p>
              <p className="text-sm text-muted-foreground">
                <span className="text-green-400">↑5</span> positions this week
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">2,156</p>
            <p className="text-sm text-muted-foreground">XP Points</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Next milestone: Top 20</span>
          <span className="text-primary font-medium">344 XP to go</span>
        </div>
      </Card>

      {/* Leaderboard List */}
      <div className="space-y-2">
        {leaderboardData.map((entry, index) => (
          <motion.div
            key={entry.rank}
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
                    <AvatarImage src={entry.avatar} />
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
        ))}
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
