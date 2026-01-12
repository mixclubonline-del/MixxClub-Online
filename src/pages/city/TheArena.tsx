import { motion } from 'framer-motion';
import { 
  Users, Trophy, Flame, Target, Swords,
  Crown, Medal, Star, ArrowRight, Zap
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DistrictPortal } from '@/components/ui/DistrictPortal';
import { cn } from '@/lib/utils';

const liveBattles = [
  { 
    title: 'Beat Battle Royale', 
    participants: 24, 
    prize: '$500', 
    endsIn: '2h 34m',
    type: 'Producer'
  },
  { 
    title: 'Mix Masters Challenge', 
    participants: 16, 
    prize: '$300', 
    endsIn: '5h 12m',
    type: 'Engineer'
  },
  { 
    title: 'Freestyle Friday', 
    participants: 32, 
    prize: '$250', 
    endsIn: '8h 45m',
    type: 'Artist'
  },
];

const leaderboard = [
  { rank: 1, name: 'BeatMaster_X', points: 12450, avatar: '🎹' },
  { rank: 2, name: 'MixQueen', points: 11200, avatar: '🎚️' },
  { rank: 3, name: 'FlowState', points: 10890, avatar: '🎤' },
  { rank: 4, name: 'SynthLord', points: 9750, avatar: '🎛️' },
  { rank: 5, name: 'RhymeWriter', points: 8920, avatar: '✍️' },
];

const challenges = [
  { title: 'Upload 5 tracks', progress: 3, total: 5, xp: 500 },
  { title: 'Win a battle', progress: 0, total: 1, xp: 1000 },
  { title: 'Get 100 plays', progress: 67, total: 100, xp: 250 },
];

export default function TheArena() {
  return (
    <DistrictPortal districtId="arena">
      <div className="p-6 md:p-8 pb-24">
        {/* Arena Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="p-6 bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                  <Swords className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">The Arena</h2>
                  <p className="text-sm text-muted-foreground">
                    {liveBattles.length} live battles • 72 active participants
                  </p>
                </div>
              </div>
              <Button className="gap-2 bg-gradient-to-r from-red-500 to-pink-500">
                <Flame className="w-4 h-4" />
                Enter Battle
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Live Battles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Live Battles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {liveBattles.map((battle, index) => (
              <motion.div
                key={battle.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + index * 0.05 }}
              >
                <Card className="p-4 bg-card/50 backdrop-blur border-border/50 hover:border-red-500/30 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="outline" className="border-red-500/50 text-red-400">
                      {battle.type}
                    </Badge>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Live
                    </Badge>
                  </div>
                  <h4 className="font-semibold mb-2">{battle.title}</h4>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {battle.participants}
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-yellow-400" />
                      {battle.prize}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Ends in {battle.endsIn}
                    </span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-4 bg-card/50 backdrop-blur border-border/50">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-400" />
                Leaderboard
              </h3>
              <div className="space-y-3">
                {leaderboard.map((user, index) => (
                  <div key={user.name} className="flex items-center gap-3">
                    <span className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                      user.rank === 1 && "bg-yellow-500/20 text-yellow-400",
                      user.rank === 2 && "bg-gray-400/20 text-gray-400",
                      user.rank === 3 && "bg-orange-500/20 text-orange-400",
                      user.rank > 3 && "bg-muted text-muted-foreground"
                    )}>
                      {user.rank}
                    </span>
                    <span className="text-xl">{user.avatar}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.points.toLocaleString()} pts</p>
                    </div>
                    {user.rank <= 3 && (
                      <Medal className={cn(
                        "w-4 h-4",
                        user.rank === 1 && "text-yellow-400",
                        user.rank === 2 && "text-gray-400",
                        user.rank === 3 && "text-orange-400"
                      )} />
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Daily Challenges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-4 bg-card/50 backdrop-blur border-border/50">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Daily Challenges
              </h3>
              <div className="space-y-4">
                {challenges.map((challenge, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{challenge.title}</p>
                      <Badge variant="outline" className="text-xs">
                        <Star className="w-3 h-3 mr-1 text-yellow-400" />
                        {challenge.xp} XP
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all"
                          style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {challenge.progress}/{challenge.total}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </DistrictPortal>
  );
}
