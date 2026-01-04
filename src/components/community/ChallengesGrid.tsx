import { motion } from 'framer-motion';
import { Target, Clock, Zap, Users, Trophy, Star, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCommunityUnlockables } from '@/hooks/useUnlockables';

// Sample challenges data (would come from database in production)
const SAMPLE_CHALLENGES = [
  {
    id: '1',
    title: 'First Collaboration',
    description: 'Complete your first collaboration session',
    xp_reward: 500,
    type: 'onboarding',
    difficulty: 'easy',
    participants: 234,
    progress: 0,
    deadline: null
  },
  {
    id: '2',
    title: 'Mix Master',
    description: 'Complete 5 mixing sessions this week',
    xp_reward: 1500,
    type: 'weekly',
    difficulty: 'medium',
    participants: 89,
    progress: 40,
    deadline: '3 days'
  },
  {
    id: '3',
    title: 'Battle Champion',
    description: 'Win 3 consecutive battles in the Arena',
    xp_reward: 3000,
    type: 'achievement',
    difficulty: 'hard',
    participants: 45,
    progress: 66,
    deadline: null
  },
  {
    id: '4',
    title: 'Community Builder',
    description: 'Invite 3 friends to join MixClub',
    xp_reward: 2000,
    type: 'social',
    difficulty: 'medium',
    participants: 156,
    progress: 33,
    deadline: null
  }
];

const DIFFICULTY_COLORS = {
  easy: 'text-green-500 bg-green-500/10 border-green-500/30',
  medium: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
  hard: 'text-red-500 bg-red-500/10 border-red-500/30'
};

export const ChallengesGrid = () => {
  const { data: unlockables, platformStats } = useCommunityUnlockables();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="w-8 h-8 text-accent-blue" />
          <h2 className="text-2xl font-bold">Challenges & Unlockables</h2>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          View All
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Active Challenges */}
      <div className="grid md:grid-cols-2 gap-4">
        {SAMPLE_CHALLENGES.map((challenge, i) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative overflow-hidden rounded-xl bg-card/30 border border-white/5 p-5 hover:border-primary/30 transition-all group"
          >
            {/* Deadline Badge */}
            {challenge.deadline && (
              <Badge className="absolute top-3 right-3 bg-orange-500/20 text-orange-400 border-orange-500/30 gap-1">
                <Clock className="w-3 h-3" />
                {challenge.deadline}
              </Badge>
            )}

            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent-blue/20 flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-primary" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{challenge.title}</h3>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${DIFFICULTY_COLORS[challenge.difficulty as keyof typeof DIFFICULTY_COLORS]}`}
                  >
                    {challenge.difficulty}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {challenge.description}
                </p>

                {/* Progress */}
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-primary font-medium">{challenge.progress}%</span>
                  </div>
                  <Progress value={challenge.progress} className="h-2" />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-500" />
                      +{challenge.xp_reward.toLocaleString()} XP
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {challenge.participants} joined
                    </span>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 text-xs gap-1">
                    {challenge.progress > 0 ? 'Continue' : 'Start'}
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Community Unlockables */}
      {unlockables && unlockables.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Community Progress
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockables.slice(0, 3).map((unlockable, i) => (
              <motion.div
                key={unlockable.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`relative p-4 rounded-xl border ${
                  unlockable.is_unlocked 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-card/30 border-white/5'
                }`}
              >
                {unlockable.is_unlocked && (
                  <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-green-500" />
                )}

                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    unlockable.is_unlocked 
                      ? 'bg-green-500/20' 
                      : 'bg-primary/20'
                  }`}>
                    <Star className={`w-5 h-5 ${
                      unlockable.is_unlocked ? 'text-green-500' : 'text-primary'
                    }`} />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{unlockable.name}</div>
                    <div className="text-xs text-muted-foreground">Tier {unlockable.tier}</div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {unlockable.description}
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>{unlockable.current_value} / {unlockable.target_value}</span>
                    <span className="text-primary">{unlockable.progress_percentage}%</span>
                  </div>
                  <Progress value={unlockable.progress_percentage} className="h-1.5" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengesGrid;
