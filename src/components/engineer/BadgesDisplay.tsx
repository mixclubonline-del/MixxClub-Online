import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Zap, CheckCircle, Trophy, Star, Target } from 'lucide-react';

interface Badge {
  id: string;
  badge_type: string;
  badge_name: string;
  badge_description: string | null;
  earned_at: string;
}

interface BadgesDisplayProps {
  badges: Badge[];
  currentStreak: number;
  longestStreak: number;
}

export function BadgesDisplay({ badges, currentStreak, longestStreak }: BadgesDisplayProps) {
  const getIconForBadge = (badgeType: string) => {
    switch (badgeType) {
      case 'projects_100':
        return Trophy;
      case 'speed_demon':
        return Zap;
      case 'perfect_month':
        return CheckCircle;
      case 'top_rated':
        return Star;
      case 'accuracy_master':
        return Target;
      default:
        return Award;
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Achievements & Streaks</CardTitle>
        <CardDescription>Your milestones and performance badges</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Streak Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Current Streak</span>
            </div>
            <div className="text-3xl font-bold">{currentStreak}</div>
            <p className="text-xs text-muted-foreground">days</p>
          </div>

          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Longest Streak</span>
            </div>
            <div className="text-3xl font-bold">{longestStreak}</div>
            <p className="text-xs text-muted-foreground">days</p>
          </div>
        </div>

        {/* Badges */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Earned Badges</h4>
          {badges.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No badges earned yet</p>
              <p className="text-sm mt-1">Complete projects to earn your first badge!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {badges.map((badge) => {
                const Icon = getIconForBadge(badge.badge_type);
                return (
                  <div
                    key={badge.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-primary/10 border border-primary/30"
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/20">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{badge.badge_name}</div>
                      {badge.badge_description && (
                        <div className="text-sm text-muted-foreground">
                          {badge.badge_description}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        Earned {new Date(badge.earned_at).toLocaleDateString()}
                      </div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
