import { motion } from 'framer-motion';
import { Award, Star, Zap, Trophy, Target, Flame, Crown, Medal, Music, Headphones } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

const BADGE_ICONS: Record<string, any> = {
  star: Star,
  zap: Zap,
  trophy: Trophy,
  target: Target,
  flame: Flame,
  crown: Crown,
  medal: Medal,
  music: Music,
  headphones: Headphones,
  award: Award
};

const BADGE_COLORS: Record<string, string> = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500'
};

interface Achievement {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  badge_type: string | null;
  earned_at: string;
  user_id: string;
}

export const AchievementShowcase = () => {
  const { data: achievements, isLoading } = useQuery({
    queryKey: ['recent-achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('id, title, description, icon, badge_type, earned_at, user_id')
        .order('earned_at', { ascending: false })
        .limit(8);
      if (error) throw error;
      return data as Achievement[];
    }
  });

  const getIcon = (iconName: string | null) => {
    const Icon = BADGE_ICONS[iconName?.toLowerCase() || 'award'] || Award;
    return Icon;
  };

  const getRarity = (badgeType: string | null) => {
    return BADGE_COLORS[badgeType?.toLowerCase() || 'common'] || BADGE_COLORS.common;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Award className="w-8 h-8 text-yellow-500" />
        <h2 className="text-2xl font-bold">Recent Achievements</h2>
      </div>

      {/* Achievement Grid */}
      <div className="grid gap-4">
        {achievements?.map((achievement, i) => {
          const Icon = getIcon(achievement.icon);
          const gradientClass = getRarity(achievement.badge_type);

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="relative overflow-hidden rounded-xl bg-card/30 border border-white/5 p-4 hover:border-primary/30 transition-all group"
            >
              {/* Background Glow */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-0 group-hover:opacity-10 transition-opacity`}
              />

              <div className="relative flex items-start gap-4">
                {/* Badge Icon */}
                <motion.div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center flex-shrink-0 shadow-lg`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{achievement.title}</div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {achievement.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {formatDistanceToNow(new Date(achievement.earned_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {/* Rarity Badge */}
                <Badge 
                  variant="outline" 
                  className="flex-shrink-0 text-xs"
                >
                  {achievement.badge_type || 'Common'}
                </Badge>
              </div>

              {/* Shine Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            </motion.div>
          );
        })}
      </div>

      {(!achievements || achievements.length === 0) && (
        <div className="text-center py-12 text-muted-foreground">
          <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No achievements yet</p>
          <p className="text-sm mt-1">Be the first to earn a badge!</p>
        </div>
      )}
    </div>
  );
};

export default AchievementShowcase;
