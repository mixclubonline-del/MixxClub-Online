import { useGamification, getDemoProgress } from '@/hooks/useGamification';
import { Progress } from '@/components/ui/progress';
import { Zap, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserLevelBadgeProps {
  className?: string;
  showProgress?: boolean;
  compact?: boolean;
}

export const UserLevelBadge = ({ 
  className, 
  showProgress = true,
  compact = false 
}: UserLevelBadgeProps) => {
  const { progress, hasUser, isLoading } = useGamification();
  
  // Use demo data if not authenticated
  const displayProgress = hasUser ? progress : getDemoProgress();

  if (isLoading) {
    return (
      <div className={cn("animate-pulse bg-muted rounded-lg h-10 w-24", className)} />
    );
  }

  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full",
        "bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30",
        className
      )}>
        <Star className="h-4 w-4 text-primary" />
        <span className="text-sm font-bold">Lv.{displayProgress.level}</span>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg",
      "bg-gradient-to-r from-primary/10 via-background to-background",
      "border border-primary/20",
      className
    )}>
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="text-lg font-bold text-primary-foreground">
            {displayProgress.level}
          </span>
        </div>
        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
          <Zap className="h-4 w-4 text-yellow-500" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold truncate">
            {displayProgress.title}
          </span>
          <span className="text-xs text-muted-foreground">
            {displayProgress.points.toLocaleString()} XP
          </span>
        </div>
        
        {showProgress && (
          <div className="space-y-1">
            <Progress 
              value={displayProgress.progressPercent} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              {displayProgress.pointsToNextLevel.toLocaleString()} XP to Level {displayProgress.level + 1}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
