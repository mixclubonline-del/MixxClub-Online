import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, Target, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MixxCoin } from '@/components/economy/MixxCoin';

interface BonusMission {
  id: string;
  title: string;
  description: string;
  reward: number;
  type: 'event' | 'community' | 'limited';
  target: number;
  current: number;
  expiresAt: Date | null;
}

// Mock bonus missions - in production these would come from the database
const MOCK_BONUS_MISSIONS: BonusMission[] = [
  {
    id: 'daily-premiere',
    title: 'Vote in Today\'s Premiere',
    description: 'Cast your vote for the latest track',
    reward: 25,
    type: 'event',
    target: 1,
    current: 0,
    expiresAt: new Date(new Date().setHours(23, 59, 59, 999)),
  },
  {
    id: 'community-goal',
    title: 'Community Goal: 10K Votes',
    description: 'Help the community reach 10,000 votes this week',
    reward: 100,
    type: 'community',
    target: 10000,
    current: 7823,
    expiresAt: null,
  },
];

function TimeRemaining({ expiresAt }: { expiresAt: Date }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <span className="flex items-center gap-1 text-xs text-orange-400">
      <Clock className="h-3 w-3" />
      {timeLeft}
    </span>
  );
}

interface BonusMissionsCardProps {
  missions?: BonusMission[];
}

export function BonusMissionsCard({ missions = MOCK_BONUS_MISSIONS }: BonusMissionsCardProps) {
  const activeMissions = missions.filter(m => {
    if (!m.expiresAt) return true;
    return m.expiresAt > new Date();
  });

  if (activeMissions.length === 0) return null;

  const getTypeConfig = (type: BonusMission['type']) => {
    switch (type) {
      case 'event':
        return { icon: Zap, color: 'text-orange-400', bgColor: 'bg-orange-500/20' };
      case 'community':
        return { icon: Target, color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' };
      case 'limited':
        return { icon: Sparkles, color: 'text-purple-400', bgColor: 'bg-purple-500/20' };
      default:
        return { icon: Zap, color: 'text-orange-400', bgColor: 'bg-orange-500/20' };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/20">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-orange-500/20">
            <Zap className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <h3 className="font-semibold">Bonus Missions</h3>
            <p className="text-xs text-muted-foreground">
              Limited-time opportunities
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {activeMissions.map((mission, i) => {
            const config = getTypeConfig(mission.type);
            const progress = (mission.current / mission.target) * 100;
            const isComplete = mission.current >= mission.target;

            return (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-3 rounded-lg ${config.bgColor} border border-${config.color.replace('text-', '')}/20`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <config.icon className={`h-4 w-4 ${config.color}`} />
                    <span className="text-sm font-medium">{mission.title}</span>
                  </div>
                  {mission.expiresAt && <TimeRemaining expiresAt={mission.expiresAt} />}
                </div>

                <p className="text-xs text-muted-foreground mb-2">
                  {mission.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-3">
                    <Progress value={progress} className="h-1.5" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {mission.current.toLocaleString()} / {mission.target.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <MixxCoin type="earned" size="sm" />
                    <span className={`text-sm font-bold ${config.color}`}>
                      +{mission.reward}
                    </span>
                  </div>
                </div>

                {isComplete && (
                  <Button size="sm" className="w-full mt-2" variant="secondary">
                    Claim Reward
                  </Button>
                )}
              </motion.div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}
