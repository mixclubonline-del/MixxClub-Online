import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Disc3, 
  DollarSign, 
  TrendingUp, 
  Crown,
  Star,
  Zap,
  Heart,
  Flame,
  Gem,
  Lock,
  CheckCircle,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Unlockable } from '@/hooks/useUnlockables';

const iconMap: Record<string, LucideIcon> = {
  'upload': Upload,
  'disc-3': Disc3,
  'dollar-sign': DollarSign,
  'trending-up': TrendingUp,
  'crown': Crown,
  'star': Star,
  'zap': Zap,
  'heart': Heart,
  'flame': Flame,
  'gem': Gem,
};

interface PersonalUnlocksWidgetProps {
  unlockables: Unlockable[];
  title: string;
  description?: string;
  isLoading?: boolean;
  compact?: boolean;
}

export const PersonalUnlocksWidget = ({
  unlockables,
  title,
  description,
  isLoading,
  compact = false,
}: PersonalUnlocksWidgetProps) => {
  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!unlockables || unlockables.length === 0) {
    return null;
  }

  const unlockedCount = unlockables.filter(u => u.is_unlocked).length;
  const nextUnlock = unlockables.find(u => !u.is_unlocked);

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            {unlockedCount}/{unlockables.length} Unlocked
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("space-y-3", compact && "space-y-2")}>
          {unlockables.map((unlockable, index) => {
            const IconComponent = iconMap[unlockable.icon_name] || Star;
            const isUnlocked = unlockable.is_unlocked;
            const isNext = !isUnlocked && unlockable.id === nextUnlock?.id;
            
            return (
              <motion.div
                key={unlockable.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative p-3 rounded-lg border transition-all",
                  isUnlocked 
                    ? "bg-primary/10 border-primary/30" 
                    : isNext 
                      ? "bg-accent/5 border-accent/30 ring-1 ring-accent/20"
                      : "bg-muted/30 border-transparent opacity-60"
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                    isUnlocked 
                      ? "bg-primary/20 text-primary" 
                      : isNext
                        ? "bg-accent/20 text-accent"
                        : "bg-muted text-muted-foreground"
                  )}>
                    {isUnlocked ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <IconComponent className="w-5 h-5" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-medium text-sm truncate",
                        isUnlocked ? "text-primary" : "text-foreground"
                      )}>
                        {unlockable.name}
                      </span>
                      {isUnlocked && (
                        <Badge className="bg-primary/20 text-primary text-[10px] px-1.5 py-0">
                          Unlocked
                        </Badge>
                      )}
                      {isNext && (
                        <Badge variant="outline" className="text-accent border-accent/50 text-[10px] px-1.5 py-0">
                          Next
                        </Badge>
                      )}
                    </div>
                    
                    {!compact && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {unlockable.reward_description}
                      </p>
                    )}

                    {/* Progress bar for non-unlocked items */}
                    {!isUnlocked && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                          <span>{unlockable.current_value} / {unlockable.target_value}</span>
                          <span>{unlockable.progress_percentage}%</span>
                        </div>
                        <Progress 
                          value={unlockable.progress_percentage} 
                          className="h-1.5"
                        />
                      </div>
                    )}
                  </div>

                  {/* Tier badge */}
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    isUnlocked 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {unlockable.tier}
                  </div>
                </div>

                {/* AI Reasoning tooltip on hover */}
                {!compact && unlockable.ai_reasoning && isNext && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 pt-2 border-t border-border/50"
                  >
                    <p className="text-[11px] text-muted-foreground italic">
                      "{unlockable.ai_reasoning}"
                    </p>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
