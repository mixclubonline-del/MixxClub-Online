import { useGamification, getDemoProgress } from '@/hooks/useGamification';
import { Progress } from '@/components/ui/progress';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface XPProgressBarProps {
  className?: string;
  showLabel?: boolean;
}

export const XPProgressBar = ({ className, showLabel = true }: XPProgressBarProps) => {
  const { progress, hasUser, isLoading } = useGamification();
  const displayProgress = hasUser ? progress : getDemoProgress();

  if (isLoading) {
    return (
      <div className={cn("animate-pulse bg-muted rounded h-4 w-full", className)} />
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium">Level {displayProgress.level}</span>
            <span className="text-muted-foreground">• {displayProgress.title}</span>
          </div>
          <span className="text-muted-foreground">
            {displayProgress.points.toLocaleString()} / {((displayProgress.level) * 1000).toLocaleString()} XP
          </span>
        </div>
      )}
      
      <div className="relative">
        <Progress 
          value={displayProgress.progressPercent} 
          className="h-3 bg-muted"
        />
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"
          style={{ 
            width: `${displayProgress.progressPercent}%`,
            borderRadius: 'inherit'
          }}
        />
      </div>
      
      <p className="text-xs text-muted-foreground text-right">
        {displayProgress.pointsToNextLevel.toLocaleString()} XP until next level
      </p>
    </div>
  );
};
