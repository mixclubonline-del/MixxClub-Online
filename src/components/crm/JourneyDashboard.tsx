import { motion } from 'framer-motion';
import { Trophy, Flame, Target, ChevronRight, Sparkles, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { JourneyProgress } from '@/components/gamification/JourneyProgress';
import { useUserJourney } from '@/hooks/useUserJourney';
import { useAuth } from '@/hooks/useAuth';
import { JOURNEYS } from '@/lib/journey-events';

interface JourneyDashboardProps {
  onNavigate?: (path: string) => void;
}

export const JourneyDashboard = ({ onNavigate }: JourneyDashboardProps) => {
  const { user } = useAuth();
  const { journeys, loading } = useUserJourney();

  const activeJourneys = journeys.filter(j => !j.completed_at);
  const completedJourneys = journeys.filter(j => j.completed_at);

  const journeyDefs = Object.values(JOURNEYS);
  
  const totalXpAvailable = journeyDefs.reduce(
    (acc, def) => acc + def.steps.reduce((s, step) => s + step.xp, 0),
    0
  );

  const earnedXp = completedJourneys.reduce((acc, j) => {
    const def = journeyDefs.find(d => d.id === j.journey_type);
    return acc + (def?.steps.reduce((s, step) => s + step.xp, 0) || 0);
  }, 0);

  if (!user) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Sign in to track your journey progress</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-2 bg-muted rounded w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-primary/10 to-card border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Quests</p>
                  <p className="text-2xl font-bold">{activeJourneys.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-amber-500/10 to-card border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{completedJourneys.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-emerald-500/10 to-card border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Quest XP Earned</p>
                  <p className="text-2xl font-bold">{earnedXp}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
              <div className="mt-2">
                <Progress value={(earnedXp / totalXpAvailable) * 100} className="h-1.5" />
                <p className="text-xs text-muted-foreground mt-1">
                  {earnedXp} / {totalXpAvailable} XP available
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Active Journeys */}
      {activeJourneys.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Active Quests
            </h3>
            <Badge variant="secondary">{activeJourneys.length} in progress</Badge>
          </div>
          
          <div className="grid gap-4">
            {activeJourneys.map((journey, index) => (
              <motion.div
                key={journey.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <JourneyProgress 
                  journeyType={journey.journey_type}
                  onStepAction={(stepId) => {
                    console.log('Step action:', stepId);
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Available Journeys */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Available Quests
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {journeyDefs
            .filter((def) => !journeys.find(j => j.journey_type === def.id))
            .map((def, index) => (
              <motion.div
                key={def.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-colors cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium group-hover:text-primary transition-colors">
                          {def.name}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {def.steps.length} step journey
                        </p>
                        <div className="flex items-center gap-2 pt-2">
                          <Badge variant="outline" className="text-xs">
                            {def.steps.length} steps
                          </Badge>
                          <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            +{def.steps.reduce((acc, s) => acc + s.xp, 0)} XP
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
        </div>
      </div>

      {/* Completed Journeys */}
      {completedJourneys.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Completed Quests
            </h3>
            <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
              {completedJourneys.length} complete
            </Badge>
          </div>

          <div className="grid gap-3">
            {completedJourneys.map((journey, index) => {
              const def = journeyDefs.find(d => d.id === journey.journey_type);
              return (
                <motion.div
                  key={journey.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-muted/30 border-muted">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                            <Trophy className="h-5 w-5 text-amber-500" />
                          </div>
                          <div>
                            <h4 className="font-medium">{def?.name || journey.journey_type}</h4>
                            <p className="text-xs text-muted-foreground">
                              Completed {journey.completed_at ? new Date(journey.completed_at).toLocaleDateString() : ''}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-amber-500 border-amber-500/50">
                          Complete
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default JourneyDashboard;
