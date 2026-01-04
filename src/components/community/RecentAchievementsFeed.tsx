import { useState, useEffect } from 'react';
import { Trophy, Star, Zap, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';

interface Achievement {
  id: string;
  user: string;
  badge: string;
  icon: 'trophy' | 'star' | 'zap' | 'award';
  time: string;
}

const ICONS = {
  trophy: Trophy,
  star: Star,
  zap: Zap,
  award: Award,
};

const COLORS = {
  trophy: 'text-yellow-500',
  star: 'text-purple-500',
  zap: 'text-accent-cyan',
  award: 'text-primary',
};

export const RecentAchievementsFeed = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: '1', user: 'DJ Nova', badge: 'First Collab', icon: 'star', time: '2m ago' },
    { id: '2', user: 'BeatKing', badge: '10 Sessions', icon: 'trophy', time: '5m ago' },
    { id: '3', user: 'SoundWave', badge: 'Mixer Pro', icon: 'zap', time: '8m ago' },
  ]);

  useEffect(() => {
    const users = ['MC Flow', 'Lyric Master', 'Bass Drop', 'Vinyl Queen', 'HitMaker'];
    const badges = ['First Mix', 'Trendsetter', 'Community Star', 'Gold Engineer', 'Fan Favorite'];
    const icons: Achievement['icon'][] = ['trophy', 'star', 'zap', 'award'];

    const interval = setInterval(() => {
      const newAchievement: Achievement = {
        id: Date.now().toString(),
        user: users[Math.floor(Math.random() * users.length)],
        badge: badges[Math.floor(Math.random() * badges.length)],
        icon: icons[Math.floor(Math.random() * icons.length)],
        time: 'just now',
      };

      setAchievements(prev => [newAchievement, ...prev].slice(0, 5));
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-4 bg-card/50 backdrop-blur border-white/5">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-4 h-4 text-yellow-500" />
        <h3 className="text-sm font-semibold">Recent Achievements</h3>
        <span className="relative flex h-2 w-2 ml-auto">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500" />
        </span>
      </div>
      
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {achievements.map((achievement) => {
            const Icon = ICONS[achievement.icon];
            const colorClass = COLORS[achievement.icon];
            
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2 text-xs p-2 rounded-lg bg-muted/30"
              >
                <Icon className={`w-3.5 h-3.5 ${colorClass} flex-shrink-0`} />
                <span className="font-medium truncate">{achievement.user}</span>
                <span className="text-muted-foreground">earned</span>
                <span className="text-primary truncate">{achievement.badge}</span>
                <span className="text-muted-foreground ml-auto flex-shrink-0">{achievement.time}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Card>
  );
};
