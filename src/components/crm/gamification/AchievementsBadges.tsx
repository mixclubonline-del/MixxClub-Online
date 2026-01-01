/**
 * AchievementsBadges - Visual badge display with hip-hop themed achievements
 * Shows earned badges with animations and unlock progress
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Music, 
  Flame, 
  Star, 
  Crown, 
  Mic, 
  Headphones,
  Disc3,
  Award,
  Zap,
  Heart,
  Users,
  DollarSign,
  Lock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  badge_type: string;
  earned_at?: string;
  isEarned: boolean;
}

const ACHIEVEMENT_ICONS: Record<string, React.ReactNode> = {
  'music': <Music className="w-6 h-6" />,
  'fire': <Flame className="w-6 h-6" />,
  'star': <Star className="w-6 h-6" />,
  'crown': <Crown className="w-6 h-6" />,
  'mic': <Mic className="w-6 h-6" />,
  'headphones': <Headphones className="w-6 h-6" />,
  'disc': <Disc3 className="w-6 h-6" />,
  'award': <Award className="w-6 h-6" />,
  'zap': <Zap className="w-6 h-6" />,
  'heart': <Heart className="w-6 h-6" />,
  'users': <Users className="w-6 h-6" />,
  'dollar': <DollarSign className="w-6 h-6" />,
  'trophy': <Trophy className="w-6 h-6" />
};

const BADGE_COLORS: Record<string, string> = {
  'bronze': 'from-amber-600 to-amber-800',
  'silver': 'from-slate-400 to-slate-600',
  'gold': 'from-yellow-400 to-yellow-600',
  'platinum': 'from-cyan-300 to-cyan-500',
  'diamond': 'from-purple-400 to-pink-500'
};

// Hip-hop themed achievement definitions
const ALL_ACHIEVEMENTS: Omit<Achievement, 'isEarned' | 'earned_at'>[] = [
  // First Steps
  { id: 'first_beat_drop', title: 'First Beat Drop', description: 'Upload your first track', icon: 'music', badge_type: 'bronze' },
  { id: 'studio_session', title: 'Studio Session', description: 'Complete your first project', icon: 'headphones', badge_type: 'bronze' },
  { id: 'on_the_mic', title: 'On The Mic', description: 'Send your first message', icon: 'mic', badge_type: 'bronze' },
  
  // Consistency
  { id: 'week_warrior', title: 'Week Warrior', description: '7 day login streak', icon: 'fire', badge_type: 'silver' },
  { id: 'hot_16', title: 'Hot 16', description: 'Complete 16 projects', icon: 'zap', badge_type: 'gold' },
  { id: 'month_of_grind', title: 'Month of Grind', description: '30 day login streak', icon: 'flame', badge_type: 'platinum' },
  
  // Collaboration
  { id: 'collab_king', title: 'Collab King', description: 'Work with 10 different creators', icon: 'users', badge_type: 'gold' },
  { id: 'five_star_review', title: 'Five Star Review', description: 'Get your first 5-star rating', icon: 'star', badge_type: 'silver' },
  { id: 'repeat_client', title: 'Repeat Client', description: 'Work with same creator 3 times', icon: 'heart', badge_type: 'gold' },
  
  // Revenue
  { id: 'first_bag', title: 'First Bag', description: 'Earn your first dollar', icon: 'dollar', badge_type: 'bronze' },
  { id: 'thousand_club', title: 'Thousand Club', description: 'Earn $1,000 total', icon: 'dollar', badge_type: 'gold' },
  { id: 'platinum_status', title: 'Platinum Status', description: 'Earn $10,000 total', icon: 'crown', badge_type: 'platinum' },
  
  // Excellence
  { id: 'perfectionist', title: 'Perfectionist', description: '100% completion rate (10+ projects)', icon: 'award', badge_type: 'diamond' },
  { id: 'legend', title: 'Legend', description: 'Unlock all other achievements', icon: 'trophy', badge_type: 'diamond' }
];

export const AchievementsBadges = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<Achievement | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');

  useEffect(() => {
    if (user) {
      fetchAchievements();
    }
  }, [user]);

  const fetchAchievements = async () => {
    try {
      const { data: earned } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user?.id);

      const earnedIds = new Set(earned?.map(a => a.achievement_type) || []);

      const allAchievements = ALL_ACHIEVEMENTS.map(a => ({
        ...a,
        isEarned: earnedIds.has(a.id),
        earned_at: earned?.find(e => e.achievement_type === a.id)?.earned_at
      }));

      setAchievements(allAchievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = achievements.filter(a => {
    if (filter === 'earned') return a.isEarned;
    if (filter === 'locked') return !a.isEarned;
    return true;
  });

  const earnedCount = achievements.filter(a => a.isEarned).length;
  const progressPercent = (earnedCount / achievements.length) * 100;

  if (loading) {
    return (
      <Card className="p-6">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Achievements
            <Badge variant="secondary">{earnedCount}/{achievements.length}</Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'earned' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('earned')}
            >
              Earned
            </Button>
            <Button
              variant={filter === 'locked' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('locked')}
            >
              Locked
            </Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Collection Progress</span>
            <span className="font-bold">{progressPercent.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredAchievements.map((achievement, idx) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedBadge(achievement)}
              className={cn(
                "relative p-4 rounded-xl cursor-pointer transition-all duration-300",
                achievement.isEarned
                  ? `bg-gradient-to-br ${BADGE_COLORS[achievement.badge_type]} hover:scale-105 shadow-lg`
                  : "bg-muted/50 hover:bg-muted"
              )}
            >
              {/* Lock overlay for unearned */}
              {!achievement.isEarned && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-xl backdrop-blur-sm">
                  <Lock className="w-6 h-6 text-muted-foreground" />
                </div>
              )}

              <div className={cn(
                "flex flex-col items-center text-center",
                !achievement.isEarned && "opacity-50"
              )}>
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mb-2",
                  achievement.isEarned 
                    ? "bg-white/20 text-white" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {ACHIEVEMENT_ICONS[achievement.icon] || <Trophy className="w-6 h-6" />}
                </div>
                <p className={cn(
                  "font-bold text-sm",
                  achievement.isEarned ? "text-white" : "text-foreground"
                )}>
                  {achievement.title}
                </p>
                {achievement.isEarned && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1"
                  >
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Star className="w-3 h-3 text-white fill-white" />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm"
            >
              <Card className={cn(
                "overflow-hidden",
                selectedBadge.isEarned && `bg-gradient-to-br ${BADGE_COLORS[selectedBadge.badge_type]}`
              )}>
                <div className="p-6 text-center">
                  <motion.div
                    animate={{ rotate: selectedBadge.isEarned ? [0, 10, -10, 0] : 0 }}
                    transition={{ repeat: selectedBadge.isEarned ? Infinity : 0, duration: 2 }}
                    className={cn(
                      "w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4",
                      selectedBadge.isEarned ? "bg-white/20" : "bg-muted"
                    )}
                  >
                    {!selectedBadge.isEarned && <Lock className="w-8 h-8 text-muted-foreground absolute" />}
                    <div className={cn(!selectedBadge.isEarned && "opacity-30")}>
                      {ACHIEVEMENT_ICONS[selectedBadge.icon] || <Trophy className="w-10 h-10" />}
                    </div>
                  </motion.div>

                  <h3 className={cn(
                    "text-xl font-bold",
                    selectedBadge.isEarned ? "text-white" : "text-foreground"
                  )}>
                    {selectedBadge.title}
                  </h3>
                  
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "mt-2",
                      selectedBadge.isEarned && "bg-white/20 text-white"
                    )}
                  >
                    {selectedBadge.badge_type.toUpperCase()}
                  </Badge>

                  <p className={cn(
                    "mt-4",
                    selectedBadge.isEarned ? "text-white/80" : "text-muted-foreground"
                  )}>
                    {selectedBadge.description}
                  </p>

                  {selectedBadge.isEarned && selectedBadge.earned_at && (
                    <p className="text-white/60 text-sm mt-4">
                      Earned {new Date(selectedBadge.earned_at).toLocaleDateString()}
                    </p>
                  )}

                  <Button
                    variant={selectedBadge.isEarned ? "secondary" : "default"}
                    className="mt-6"
                    onClick={() => setSelectedBadge(null)}
                  >
                    {selectedBadge.isEarned ? 'Nice!' : 'Keep Grinding'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
