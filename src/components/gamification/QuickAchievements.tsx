import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Achievement {
  id: string;
  achievement_type: string;
  current_progress: number;
  target_progress: number;
  completed_at: string | null;
}

interface QuickAchievementsProps {
  userId: string;
}

export const QuickAchievements = ({ userId }: QuickAchievementsProps) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, [userId]);

  const fetchAchievements = async () => {
    const { data, error } = await supabase
      .from('achievement_progress')
      .select('*')
      .eq('user_id', userId)
      .is('completed_at', null)
      .order('current_progress', { ascending: false })
      .limit(3);

    if (!error && data) {
      setAchievements(data);
    }
    setLoading(false);
  };

  const getTitle = (type: string) => {
    const titles: Record<string, string> = {
      projects_completed: 'Projects Master',
      perfect_ratings: 'Perfect Ratings',
      streak_days: 'Activity Streak',
      earnings_milestone: 'Earnings Goal',
    };
    return titles[type] || type.replace(/_/g, ' ');
  };

  if (loading || achievements.length === 0) return null;

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Quick Achievements</h3>
        </div>
        <Button variant="ghost" size="sm" className="gap-1">
          View All
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {achievements.map((achievement) => {
          const percentage = Math.min(
            (achievement.current_progress / achievement.target_progress) * 100,
            100
          );

          return (
            <div key={achievement.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {getTitle(achievement.achievement_type)}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {achievement.current_progress}/{achievement.target_progress}
                </Badge>
              </div>
              <Progress value={percentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {Math.round(percentage)}% complete
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
