import { useGamification, getDemoAchievements, Achievement } from '@/hooks/useGamification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, Star, Zap, Flame, Upload, Users, 
  Music, Award, Crown, Target 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AchievementsGridProps {
  className?: string;
  limit?: number;
}

const getAchievementIcon = (type: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'first_upload': <Upload className="h-5 w-5" />,
    'first_collab': <Users className="h-5 w-5" />,
    'streak': <Flame className="h-5 w-5" />,
    'streak_7': <Flame className="h-5 w-5" />,
    'project': <Trophy className="h-5 w-5" />,
    'rating': <Star className="h-5 w-5" />,
    'speed': <Zap className="h-5 w-5" />,
    'earner': <Crown className="h-5 w-5" />,
    'music': <Music className="h-5 w-5" />,
    'milestone': <Target className="h-5 w-5" />
  };
  
  return iconMap[type] || <Award className="h-5 w-5" />;
};

const getTypeColor = (type: string) => {
  if (type.includes('streak')) return 'from-orange-500 to-red-500';
  if (type.includes('collab') || type.includes('social')) return 'from-blue-500 to-cyan-500';
  if (type.includes('upload')) return 'from-green-500 to-emerald-500';
  if (type.includes('earner')) return 'from-yellow-500 to-amber-500';
  return 'from-purple-500 to-pink-500';
};

export const AchievementsGrid = ({ className, limit }: AchievementsGridProps) => {
  const { achievements, hasUser, isLoading } = useGamification();
  const displayAchievements = hasUser ? achievements : getDemoAchievements();
  
  const displayList = limit 
    ? displayAchievements.slice(0, limit) 
    : displayAchievements;

  if (isLoading) {
    return (
      <div className={cn("grid grid-cols-2 md:grid-cols-3 gap-4", className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-muted rounded-lg h-32" />
        ))}
      </div>
    );
  }

  if (displayList.length === 0) {
    return (
      <Card className={cn("text-center py-12", className)}>
        <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
        <h4 className="font-semibold mb-2">No Achievements Yet</h4>
        <p className="text-sm text-muted-foreground">
          Start collaborating to unlock achievements!
        </p>
      </Card>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", className)}>
      {displayList.map((achievement) => (
        <Card 
          key={achievement.id}
          className="group hover:scale-105 transition-transform overflow-hidden"
        >
          <div className={cn(
            "h-2 bg-gradient-to-r",
            getTypeColor(achievement.achievement_type)
          )} />
          
          <CardContent className="p-4 text-center">
            <div className={cn(
              "w-12 h-12 mx-auto mb-3 rounded-full",
              "bg-gradient-to-br flex items-center justify-center text-white",
              getTypeColor(achievement.achievement_type)
            )}>
              {getAchievementIcon(achievement.achievement_type)}
            </div>
            
            <h4 className="font-bold text-sm mb-1 truncate">
              {achievement.title}
            </h4>
            
            {achievement.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {achievement.description}
              </p>
            )}
            
            {achievement.badge_name && (
              <Badge variant="secondary" className="text-xs">
                {achievement.badge_name}
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
