import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Star, Zap, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

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

// Map badge types to icons
const mapBadgeToIcon = (badgeType: string | null): Achievement['icon'] => {
  if (!badgeType) return 'award';
  const type = badgeType.toLowerCase();
  if (type.includes('milestone') || type.includes('project')) return 'trophy';
  if (type.includes('streak') || type.includes('speed')) return 'zap';
  if (type.includes('star') || type.includes('rating')) return 'star';
  return 'award';
};

export const RecentAchievementsFeed = () => {
  const { data: achievements, isLoading } = useQuery({
    queryKey: ['recent-achievements-feed'],
    queryFn: async (): Promise<Achievement[]> => {
      // Fetch recent achievements
      const { data: achievementsData, error } = await supabase
        .from('achievements')
        .select('id, badge_name, badge_type, earned_at, user_id')
        .order('earned_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Fetch profiles for user names
      const userIds = [...new Set((achievementsData || []).map((a) => a.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, username')
        .in('id', userIds);

      const profileMap = new Map(
        (profiles || []).map((p) => [p.id, p.username || p.full_name || 'Someone'])
      );

      return (achievementsData || []).map((a) => ({
        id: a.id,
        user: profileMap.get(a.user_id) || 'Someone',
        badge: a.badge_name || 'Achievement',
        icon: mapBadgeToIcon(a.badge_type),
        time: formatDistanceToNow(new Date(a.earned_at), { addSuffix: false }),
      }));
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // Fallback demo data if no real achievements
  const displayAchievements = achievements && achievements.length > 0 
    ? achievements 
    : [
        { id: '1', user: 'DJ Nova', badge: 'First Collab', icon: 'star' as const, time: '2m ago' },
        { id: '2', user: 'BeatKing', badge: '10 Sessions', icon: 'trophy' as const, time: '5m ago' },
        { id: '3', user: 'SoundWave', badge: 'Mixer Pro', icon: 'zap' as const, time: '8m ago' },
      ];

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
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-muted/30 animate-pulse">
              <div className="w-3.5 h-3.5 bg-muted rounded" />
              <div className="h-3 w-20 bg-muted rounded" />
              <div className="h-3 w-16 bg-muted rounded" />
            </div>
          ))
        ) : (
          <AnimatePresence mode="popLayout">
            {displayAchievements.map((achievement) => {
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
        )}
      </div>
    </Card>
  );
};
