import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Trophy, Star, Zap, Music, CheckCircle, Crown, Gem, 
  Flame, Award, Target, Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Achievement {
  id: string;
  achievement_type: string;
  title: string;
  description: string | null;
  icon: string | null;
  badge_name: string | null;
  badge_type: string | null;
  earned_at: string;
}

const iconMap: Record<string, React.ReactNode> = {
  'star': <Star className="w-5 h-5" />,
  'zap': <Zap className="w-5 h-5" />,
  'music': <Music className="w-5 h-5" />,
  'check-circle': <CheckCircle className="w-5 h-5" />,
  'crown': <Crown className="w-5 h-5" />,
  'gem': <Gem className="w-5 h-5" />,
  'flame': <Flame className="w-5 h-5" />,
  'award': <Award className="w-5 h-5" />,
  'target': <Target className="w-5 h-5" />,
  'trophy': <Trophy className="w-5 h-5" />,
};

const badgeTypeStyles: Record<string, string> = {
  'milestone': 'from-blue-500 to-cyan-500',
  'legendary': 'from-yellow-400 via-orange-500 to-red-500',
  'rare': 'from-purple-500 to-pink-500',
  'common': 'from-gray-400 to-gray-600',
};

export const QuickAchievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recentUnlock, setRecentUnlock] = useState<Achievement | null>(null);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchAchievements = async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching achievements:', error);
      } else {
        setAchievements(data || []);
      }
      setIsLoading(false);
    };

    fetchAchievements();

    // Subscribe to new achievements for real-time celebration
    const channel = supabase
      .channel('achievements-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'achievements',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newAchievement = payload.new as Achievement;
          setRecentUnlock(newAchievement);
          setAchievements(prev => [newAchievement, ...prev.slice(0, 9)]);
          
          // Clear celebration after 5 seconds
          setTimeout(() => setRecentUnlock(null), 5000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (!user) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="p-6 text-center text-muted-foreground">
          Sign in to track your achievements
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse flex flex-col items-center gap-2">
            <Trophy className="w-8 h-8 text-muted-foreground" />
            <span className="text-muted-foreground">Loading achievements...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Achievement Unlock Celebration */}
      <AnimatePresence>
        {recentUnlock && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
          >
            <Card className="bg-gradient-to-r from-yellow-500/90 via-orange-500/90 to-red-500/90 text-white border-0 shadow-2xl">
              <CardContent className="p-6 flex items-center gap-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                >
                  <Sparkles className="w-10 h-10" />
                </motion.div>
                <div>
                  <p className="text-sm font-medium opacity-90">Achievement Unlocked!</p>
                  <p className="text-xl font-bold">{recentUnlock.title}</p>
                  {recentUnlock.description && (
                    <p className="text-sm opacity-80">{recentUnlock.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievements List */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Recent Achievements
            {achievements.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {achievements.length} earned
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {achievements.length === 0 ? (
            <div className="text-center py-6">
              <Target className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No achievements yet</p>
              <p className="text-sm text-muted-foreground">
                Complete actions to earn badges!
              </p>
            </div>
          ) : (
            <div className="grid gap-2">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className={`p-2 rounded-full bg-gradient-to-br ${
                    badgeTypeStyles[achievement.badge_type || 'common']
                  } text-white`}>
                    {iconMap[achievement.icon || 'trophy'] || <Trophy className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{achievement.title}</p>
                    {achievement.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {achievement.description}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(achievement.earned_at).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
