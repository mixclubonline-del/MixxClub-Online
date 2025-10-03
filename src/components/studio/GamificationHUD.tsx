import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Award, 
  Flame,
  CheckCircle2,
  Sparkles,
  TrendingUp
} from 'lucide-react';

interface GamificationHUDProps {
  sessionId: string;
}

const GamificationHUD = ({ sessionId }: GamificationHUDProps) => {
  const [goals, setGoals] = useState([
    { id: 1, label: 'Complete first mix', completed: true },
    { id: 2, label: 'Add 3 effects', completed: true },
    { id: 3, label: 'Export final version', completed: false }
  ]);

  const [sessionXP, setSessionXP] = useState(450);
  const [achievements, setAchievements] = useState([
    { icon: '🎵', label: 'First Mix' },
    { icon: '⚡', label: 'Speed Demon' }
  ]);
  const [streak, setStreak] = useState(7);

  const completedGoals = goals.filter(g => g.completed).length;
  const totalGoals = goals.length;
  const progressPercentage = (completedGoals / totalGoals) * 100;

  return (
    <div className="fixed top-20 right-6 w-80 z-40 space-y-3 animate-slide-in-right">
      {/* Session Goals */}
      <Card className="p-4 bg-card/95 backdrop-blur-md border-primary/20 shadow-glow-sm">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold flex items-center gap-2 text-sm">
            <Target className="w-4 h-4 text-primary" />
            Session Goals
          </h4>
          <Badge variant="secondary" className="text-xs">
            {completedGoals}/{totalGoals}
          </Badge>
        </div>

        <Progress value={progressPercentage} className="h-2 mb-3" />

        <div className="space-y-2">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className={`flex items-center gap-2 text-sm transition-all ${
                goal.completed ? 'text-muted-foreground line-through' : ''
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                goal.completed ? 'bg-green-500 border-green-500' : 'border-muted'
              }`}>
                {goal.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              <span className="text-xs">{goal.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Session XP & Achievements */}
      <Card className="p-4 bg-card/95 backdrop-blur-md border-accent-cyan/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="font-semibold text-sm">Session Rewards</span>
          </div>
          <Badge className="bg-gradient-to-r from-primary to-accent-cyan text-white text-xs">
            +{sessionXP} XP
          </Badge>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className="px-3 py-1.5 bg-muted/50 rounded-lg text-xs font-medium flex items-center gap-1.5 bloom-hover"
            >
              <span>{achievement.icon}</span>
              <span>{achievement.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Streak Tracker */}
      <Card className="p-4 bg-card/95 backdrop-blur-md border-orange-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
            <div>
              <div className="text-sm font-semibold">{streak} Day Streak</div>
              <div className="text-xs text-muted-foreground">Keep it going!</div>
            </div>
          </div>
          <div className="text-3xl">🔥</div>
        </div>
      </Card>
    </div>
  );
};

export default GamificationHUD;
