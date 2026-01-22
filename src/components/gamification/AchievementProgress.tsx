import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { 
  Trophy, 
  Star, 
  Zap,
  Target,
  Music,
  Users,
  Award
} from 'lucide-react';
import { CharacterEmptyState } from '@/components/characters/CharacterEmptyState';

interface Achievement {
  id: string;
  title: string;
  description: string | null;
  achievement_type: string;
  icon: string | null;
  xp_reward: number | null;
  earned_at?: string;
  progress?: number;
  target?: number;
  category?: string;
}

interface AchievementProgressProps {
  userId: string;
}

export const AchievementProgress = ({ userId }: AchievementProgressProps) => {
  const [earnedAchievements, setEarnedAchievements] = useState<Achievement[]>([]);
  const [availableAchievements, setAvailableAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<'all' | 'mixing' | 'mastering' | 'collaboration' | 'community'>('all');
  const [totalXP, setTotalXP] = useState(0);

  useEffect(() => {
    fetchAchievements();
  }, [userId]);

  const fetchAchievements = async () => {
    try {
      // Fetch earned achievements
      const { data: earned, error: earnedError } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId);

      if (earnedError) throw earnedError;

      // Fetch all available achievements
      const { data: definitions, error: defError } = await supabase
        .from('achievement_definitions')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (defError) throw defError;

      // Map earned to definitions format
      const earnedList = (earned || []).map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        achievement_type: a.achievement_type,
        icon: a.icon,
        xp_reward: null,
        earned_at: a.earned_at,
        category: a.achievement_type.split('_')[0]
      }));

      // Find available (not yet earned)
      const earnedTypes = new Set(earnedList.map(a => a.achievement_type));
      const available = (definitions || [])
        .filter(d => !earnedTypes.has(d.achievement_type))
        .map(d => ({
          id: d.id,
          title: d.title,
          description: d.description,
          achievement_type: d.achievement_type,
          icon: d.icon,
          xp_reward: d.xp_reward,
          progress: Math.floor(Math.random() * 80), // Mock progress
          target: 100,
          category: d.category || d.achievement_type.split('_')[0]
        }));

      setEarnedAchievements(earnedList);
      setAvailableAchievements(available);
      setTotalXP(earnedList.length * 100); // Simplified XP calculation
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'mixing': return <Music className="h-4 w-4" />;
      case 'mastering': return <Zap className="h-4 w-4" />;
      case 'collaboration': return <Users className="h-4 w-4" />;
      case 'community': return <Star className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  const filteredAvailable = category === 'all' 
    ? availableAchievements 
    : availableAchievements.filter(a => a.category === category);

  const filteredEarned = category === 'all'
    ? earnedAchievements
    : earnedAchievements.filter(a => a.category === category);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* XP Summary */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total XP Earned</p>
              <p className="text-3xl font-bold">{totalXP.toLocaleString()} XP</p>
              <p className="text-sm text-muted-foreground mt-1">
                {earnedAchievements.length} achievements unlocked
              </p>
            </div>
            <div className="p-4 rounded-full bg-primary/20">
              <Award className="h-8 w-8 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <Tabs value={category} onValueChange={(v) => setCategory(v as typeof category)}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="mixing" className="gap-1">
            <Music className="h-3 w-3" />
            Mixing
          </TabsTrigger>
          <TabsTrigger value="mastering" className="gap-1">
            <Zap className="h-3 w-3" />
            Mastering
          </TabsTrigger>
          <TabsTrigger value="collaboration" className="gap-1">
            <Users className="h-3 w-3" />
            Collab
          </TabsTrigger>
          <TabsTrigger value="community" className="gap-1">
            <Star className="h-3 w-3" />
            Community
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* In Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            In Progress
          </CardTitle>
          <CardDescription>Keep going to unlock these achievements</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAvailable.length === 0 ? (
            <CharacterEmptyState
              type="generic"
              title="All unlocked! 🎉"
              message="You've earned every achievement in this category. Legend status."
              className="py-6"
            />
          ) : (
            <ScrollArea className="h-[250px]">
              <div className="space-y-4">
                {filteredAvailable.slice(0, 5).map((achievement) => (
                  <div
                    key={achievement.id}
                    className="p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-muted">
                          {getCategoryIcon(achievement.category || '')}
                        </div>
                        <div>
                          <p className="font-medium">{achievement.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">+{achievement.xp_reward || 100} XP</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span>{achievement.progress}%</span>
                      </div>
                      <Progress value={achievement.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Earned Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Earned ({filteredEarned.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEarned.length === 0 ? (
            <CharacterEmptyState
              type="generic"
              title="No achievements yet"
              message="Start working on those goals. Your first trophy is waiting."
              className="py-6"
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {filteredEarned.map((achievement) => (
                <div
                  key={achievement.id}
                  className="p-3 rounded-lg border bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border-yellow-500/20 text-center"
                >
                  <div className="p-2 rounded-full bg-yellow-500/20 w-fit mx-auto mb-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                  </div>
                  <p className="font-medium text-sm">{achievement.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {achievement.earned_at 
                      ? new Date(achievement.earned_at).toLocaleDateString()
                      : 'Earned'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
