import { motion } from 'framer-motion';
import { Check, Circle, Lock, ChevronRight, Trophy, Star, Zap, Music, Users, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUserJourney, type JourneyStep } from '@/hooks/useUserJourney';
import { JOURNEYS } from '@/lib/journey-events';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  star: Star,
  zap: Zap,
  music: Music,
  users: Users,
  award: Award,
  trophy: Trophy,
  check: Check,
};

interface JourneyProgressProps {
  journeyType: string;
  onStepAction?: (stepId: string) => void;
  compact?: boolean;
}

export const JourneyProgress = ({ journeyType, onStepAction, compact = false }: JourneyProgressProps) => {
  const { currentJourney, loading, getJourneySteps, getProgress, startUserJourney } = useUserJourney(journeyType);

  const journeyDefs = Object.values(JOURNEYS);
  const definition = journeyDefs.find(j => j.id === journeyType);
  
  if (!definition) return null;

  const handleStart = async () => {
    await startUserJourney(journeyType);
  };

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-2 bg-muted rounded w-full" />
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Journey not started
  if (!currentJourney) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 via-card to-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            {definition.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">{definition.description}</p>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="secondary">{definition.steps.length} Steps</Badge>
            <Badge variant="outline" className="text-primary border-primary/50">
              +{definition.steps.reduce((acc, s) => acc + s.xpReward, 0)} XP
            </Badge>
          </div>
          <Button onClick={handleStart} className="w-full">
            Start Quest
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  const steps = getJourneySteps(currentJourney);
  const progress = getProgress(currentJourney);
  const isCompleted = currentJourney.completed_at !== null;

  if (compact) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{definition.name}</span>
            <Badge variant={isCompleted ? 'default' : 'secondary'} className="text-xs">
              {isCompleted ? 'Complete!' : `${progress}%`}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "bg-card/50 backdrop-blur border-border/50",
      isCompleted && "border-primary/50 bg-gradient-to-br from-primary/5 to-card"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className={cn("h-5 w-5", isCompleted ? "text-primary" : "text-muted-foreground")} />
            {definition.name}
          </CardTitle>
          {isCompleted && (
            <Badge className="bg-primary text-primary-foreground">
              <Check className="mr-1 h-3 w-3" /> Complete
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{definition.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-2">
          {steps.map((step, index) => (
            <StepItem 
              key={step.id} 
              step={step} 
              index={index}
              isLast={index === steps.length - 1}
              onAction={onStepAction}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface StepItemProps {
  step: JourneyStep;
  index: number;
  isLast: boolean;
  onAction?: (stepId: string) => void;
}

const StepItem = ({ step, index, isLast, onAction }: StepItemProps) => {
  const Icon = iconMap[step.icon] || Circle;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg transition-colors",
        step.isCurrent && "bg-primary/10 border border-primary/30",
        step.isCompleted && "bg-muted/30",
        !step.isCompleted && !step.isCurrent && "opacity-50"
      )}
    >
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        step.isCompleted && "bg-primary text-primary-foreground",
        step.isCurrent && "bg-primary/20 text-primary border-2 border-primary",
        !step.isCompleted && !step.isCurrent && "bg-muted text-muted-foreground"
      )}>
        {step.isCompleted ? (
          <Check className="h-4 w-4" />
        ) : step.isCurrent ? (
          <Icon className="h-4 w-4" />
        ) : (
          <Lock className="h-3 w-3" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className={cn(
            "font-medium text-sm",
            step.isCompleted && "line-through text-muted-foreground"
          )}>
            {step.title}
          </h4>
          {step.isCurrent && onAction && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 text-xs"
              onClick={() => onAction(step.id)}
            >
              Go <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
      </div>

      {!isLast && (
        <div className="absolute left-[1.35rem] top-[2.75rem] w-0.5 h-4 bg-border" />
      )}
    </motion.div>
  );
};

export default JourneyProgress;
