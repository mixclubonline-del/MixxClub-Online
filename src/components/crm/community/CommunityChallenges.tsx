import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Clock, Users, Zap, Gift, Target, Flame, Star, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const challenges: Challenge[] = [
    {
      id: '1',
      title: 'Daily Streaker',
      description: 'Log in for 7 consecutive days',
      type: 'daily',
      progress: 5,
      target: 7,
      reward: 'Streak Badge',
      rewardXP: 100,
      endsIn: '2 days',
      icon: <Flame className="w-5 h-5 text-orange-400" />,
    },
    {
      id: '2',
      title: 'Collaboration King',
      description: 'Complete 5 projects this week',
      type: 'weekly',
      progress: 3,
      target: 5,
      reward: 'Gold Crown',
      rewardXP: 500,
      endsIn: '4 days',
      icon: <Trophy className="w-5 h-5 text-yellow-400" />,
    },
    {
      id: '3',
      title: 'Community Builder',
      description: 'Help the community reach 10,000 total projects',
      type: 'community',
      progress: 8547,
      target: 10000,
      reward: 'Exclusive Avatar Frame',
      rewardXP: 1000,
      participants: 2341,
      endsIn: 'Ongoing',
      icon: <Users className="w-5 h-5 text-blue-400" />,
    },
    {
      id: '4',
      title: 'Feedback Champion',
      description: 'Leave 10 helpful reviews',
      type: 'weekly',
      progress: 7,
      target: 10,
      reward: 'Review Expert Badge',
      rewardXP: 250,
      endsIn: '3 days',
      icon: <Star className="w-5 h-5 text-purple-400" />,
    },
    {
      id: '5',
      title: 'New Year Launch',
      description: 'Complete your first project in 2026',
      type: 'special',
      progress: 0,
      target: 1,
      reward: '2026 Pioneer Badge + 500 XP',
      rewardXP: 500,
      endsIn: '30 days',
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

  if (compact) {
    return (
      <Card className="bg-card/50 border-border/50 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Active Challenges
          </h3>
          <Badge variant="outline" className="text-xs">{challenges.length} Active</Badge>
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
              </div>
              <Progress value={(challenge.progress / challenge.target) * 100} className="h-1.5 mb-1" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{challenge.progress}/{challenge.target}</span>
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
      {/* Challenge Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">5</p>
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
              <p className="text-2xl font-bold text-foreground">12</p>
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
              <p className="text-2xl font-bold text-foreground">2,850</p>
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
            <Card className="bg-card/50 border-border/50 p-5 hover:border-primary/50 transition-all h-full">
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
                  {challenge.type}
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
                  <Progress value={(challenge.progress / challenge.target) * 100} className="h-2" />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{challenge.endsIn}</span>
                    {challenge.participants && (
                      <>
                        <span>•</span>
                        <Users className="w-4 h-4" />
                        <span>{challenge.participants.toLocaleString()} joined</span>
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
