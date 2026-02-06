import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, Target, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

const TYPE_CONFIG = {
  event: { icon: Zap, color: 'text-orange-400', glow: 'rgba(249,115,22,0.12)' },
  community: { icon: Target, color: 'text-cyan-400', glow: 'rgba(34,211,238,0.12)' },
  limited: { icon: Sparkles, color: 'text-purple-400', glow: 'rgba(192,132,252,0.12)' },
};

export function BonusMissionsCard({ missions = MOCK_BONUS_MISSIONS }: BonusMissionsCardProps) {
  const activeMissions = missions.filter(m => {
    if (!m.expiresAt) return true;
    return m.expiresAt > new Date();
  });

  if (activeMissions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
    >
      <div
        className="relative rounded-xl border border-orange-500/20 p-5 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(245,158,11,0.05) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-orange-500/8 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-5">
            <div
              className="p-2 rounded-xl"
              style={{ background: 'rgba(249,115,22,0.15)' }}
            >
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
              const config = TYPE_CONFIG[mission.type] || TYPE_CONFIG.event;
              const progress = (mission.current / mission.target) * 100;
              const isComplete = mission.current >= mission.target;

              return (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-lg border border-white/[0.06] p-3"
                  style={{ background: config.glow }}
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
        </div>
      </div>
    </motion.div>
  );
}
