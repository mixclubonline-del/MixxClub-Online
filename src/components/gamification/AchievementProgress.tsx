import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Star, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AchievementProgressItem {
  id: string;
  achievement_type: string;
  current_progress: number;
  target_progress: number;
  started_at: string;
  completed_at: string | null;
}

export const AchievementProgress = ({ userId }: { userId: string }) => {
  const [progress, setProgress] = useState<AchievementProgressItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, [userId]);

  const fetchProgress = async () => {
    const { data, error } = await supabase
      .from('achievement_progress')
      .select('*')
      .eq('user_id', userId)
      .order('current_progress', { ascending: false });

    if (!error && data) {
      setProgress(data);
    }
    setLoading(false);
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'projects_completed': return <Trophy className="h-5 w-5" />;
      case 'perfect_ratings': return <Star className="h-5 w-5" />;
      case 'streak_days': return <TrendingUp className="h-5 w-5" />;
      case 'earnings_milestone': return <Target className="h-5 w-5" />;
      default: return <Trophy className="h-5 w-5" />;
    }
  };

  const getAchievementTitle = (type: string) => {
    switch (type) {
      case 'projects_completed': return 'Projects Master';
      case 'perfect_ratings': return 'Perfect Ratings';
      case 'streak_days': return 'Activity Streak';
      case 'earnings_milestone': return 'Earnings Milestone';
      default: return type.replace(/_/g, ' ');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading achievements...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Target className="h-5 w-5" />
        Achievement Progress
      </h3>
      
      <div className="grid gap-4">
        {progress.map((item) => {
          const percentage = Math.min((item.current_progress / item.target_progress) * 100, 100);
          const isCompleted = item.completed_at !== null;

          return (
            <Card key={item.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isCompleted ? 'bg-primary/20' : 'bg-muted'}`}>
                    {getAchievementIcon(item.achievement_type)}
                  </div>
                  <div>
                    <h4 className="font-semibold">{getAchievementTitle(item.achievement_type)}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.current_progress} / {item.target_progress}
                    </p>
                  </div>
                </div>
                {isCompleted && (
                  <Badge variant="default" className="bg-primary">
                    Completed!
                  </Badge>
                )}
              </div>
              
              <Progress value={percentage} className="h-2" />
              
              <p className="text-xs text-muted-foreground mt-2">
                {isCompleted 
                  ? `Completed on ${new Date(item.completed_at!).toLocaleDateString()}`
                  : `${Math.round(percentage)}% complete`
                }
              </p>
            </Card>
          );
        })}

        {progress.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Complete projects to unlock achievements!</p>
          </Card>
        )}
      </div>
    </div>
  );
};
