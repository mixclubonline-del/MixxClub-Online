import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Star, 
  Target, 
  Zap,
  Crown,
  Award,
  Gamepad2,
  Music,
  Users,
  Clock,
  TrendingUp,
  Gift,
  Medal
} from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  reward?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  reward: string;
  timeLeft?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface DAWGamificationProps {
  achievements: Achievement[];
}

const DAWGamification: React.FC<DAWGamificationProps> = ({
  achievements
}) => {
  const [activeTab, setActiveTab] = useState('achievements');

  // Mock data for challenges and stats
  const challenges: Challenge[] = [
    {
      id: 'daily-record',
      title: 'Daily Creator',
      description: 'Record audio for 3 consecutive days',
      progress: 1,
      maxProgress: 3,
      reward: '50 XP + Badge',
      timeLeft: '18h 32m',
      difficulty: 'easy'
    },
    {
      id: 'collab-master',
      title: 'Collaboration Expert',
      description: 'Complete 5 collaborative sessions',
      progress: 2,
      maxProgress: 5,
      reward: '100 XP + Special Title',
      difficulty: 'medium'
    },
    {
      id: 'effect-wizard',
      title: 'Effect Wizard',
      description: 'Use 10 different AI effects in one session',
      progress: 6,
      maxProgress: 10,
      reward: '200 XP + Exclusive Effect',
      difficulty: 'hard'
    }
  ];

  const stats = {
    level: 7,
    xp: 1250,
    nextLevelXP: 1500,
    totalSessions: 23,
    totalTracks: 47,
    collaborations: 8,
    effectsUsed: 34
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-500';
      case 'rare': return 'text-blue-500';
      case 'epic': return 'text-purple-500';
      case 'legendary': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-600';
      case 'medium': return 'bg-yellow-500/20 text-yellow-600';
      case 'hard': return 'bg-red-500/20 text-red-600';
      default: return 'bg-gray-500/20 text-gray-600';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with Level */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-primary" />
            Creator Goals
          </h4>
          <Badge variant="secondary" className="bg-primary/10 text-primary gap-1">
            <Crown className="w-3 h-3" />
            Level {stats.level}
          </Badge>
        </div>

        {/* XP Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Experience</span>
            <span className="font-mono">{stats.xp}/{stats.nextLevelXP} XP</span>
          </div>
          <Progress 
            value={(stats.xp / stats.nextLevelXP) * 100} 
            className="h-2"
          />
          <div className="text-xs text-muted-foreground text-center">
            {stats.nextLevelXP - stats.xp} XP to next level
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="grid w-full grid-cols-3 mx-2 mt-2">
          <TabsTrigger value="achievements" className="text-xs">
            <Trophy className="w-3 h-3 mr-1" />
            Goals
          </TabsTrigger>
          <TabsTrigger value="challenges" className="text-xs">
            <Target className="w-3 h-3 mr-1" />
            Daily
          </TabsTrigger>
          <TabsTrigger value="stats" className="text-xs">
            <TrendingUp className="w-3 h-3 mr-1" />
            Stats
          </TabsTrigger>
        </TabsList>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="flex-1 overflow-y-auto p-2 space-y-2">
          {achievements.map((achievement) => (
            <Card 
              key={achievement.id} 
              className={`p-3 transition-all duration-200 ${
                achievement.unlocked 
                  ? 'bg-primary/5 border-primary/20' 
                  : 'opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  achievement.unlocked 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {achievement.unlocked ? (
                    <Trophy className="w-4 h-4" />
                  ) : (
                    <Award className="w-4 h-4" />
                  )}
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium">{achievement.title}</h5>
                    {achievement.unlocked && (
                      <Badge variant="secondary" className="bg-green-500/20 text-green-600 text-xs">
                        Unlocked
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    {achievement.description}
                  </p>
                  
                  {achievement.progress !== undefined && achievement.maxProgress && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-mono">
                          {achievement.progress}/{achievement.maxProgress}
                        </span>
                      </div>
                      <Progress 
                        value={(achievement.progress / achievement.maxProgress) * 100} 
                        className="h-1"
                      />
                    </div>
                  )}
                  
                  {achievement.reward && (
                    <div className="flex items-center gap-1 text-xs">
                      <Gift className="w-3 h-3 text-yellow-500" />
                      <span className="text-muted-foreground">Reward:</span>
                      <span className="text-yellow-600">{achievement.reward}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="flex-1 overflow-y-auto p-2 space-y-2">
          {challenges.map((challenge) => (
            <Card key={challenge.id} className="p-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-medium">{challenge.title}</h5>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getDifficultyColor(challenge.difficulty)}`}
                  >
                    {challenge.difficulty}
                  </Badge>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  {challenge.description}
                </p>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-mono">
                      {challenge.progress}/{challenge.maxProgress}
                    </span>
                  </div>
                  <Progress 
                    value={(challenge.progress / challenge.maxProgress) * 100} 
                    className="h-2"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className="text-yellow-600">{challenge.reward}</span>
                  </div>
                  
                  {challenge.timeLeft && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {challenge.timeLeft}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
          
          <Card className="p-3 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <div className="text-center space-y-2">
              <Zap className="w-6 h-6 mx-auto text-primary" />
              <h5 className="text-sm font-medium">Daily Bonus Available!</h5>
              <p className="text-xs text-muted-foreground">
                Complete any challenge today for double XP
              </p>
              <Button size="sm" className="gap-1">
                <Gift className="w-3 h-3" />
                Claim Bonus
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="flex-1 overflow-y-auto p-2 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Card className="p-3 text-center">
              <Music className="w-4 h-4 mx-auto mb-1 text-primary" />
              <div className="text-lg font-bold">{stats.totalTracks}</div>
              <div className="text-xs text-muted-foreground">Tracks Created</div>
            </Card>
            
            <Card className="p-3 text-center">
              <Users className="w-4 h-4 mx-auto mb-1 text-green-500" />
              <div className="text-lg font-bold">{stats.collaborations}</div>
              <div className="text-xs text-muted-foreground">Collaborations</div>
            </Card>
            
            <Card className="p-3 text-center">
              <Zap className="w-4 h-4 mx-auto mb-1 text-blue-500" />
              <div className="text-lg font-bold">{stats.effectsUsed}</div>
              <div className="text-xs text-muted-foreground">Effects Used</div>
            </Card>
            
            <Card className="p-3 text-center">
              <Clock className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
              <div className="text-lg font-bold">{stats.totalSessions}</div>
              <div className="text-xs text-muted-foreground">Sessions</div>
            </Card>
          </div>

          {/* Recent Achievements */}
          <Card className="p-3">
            <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Medal className="w-4 h-4 text-primary" />
              Recent Unlocks
            </h5>
            
            <div className="space-y-2">
              {achievements.filter(a => a.unlocked).slice(0, 3).map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-2 text-xs">
                  <Trophy className="w-3 h-3 text-yellow-500" />
                  <span>{achievement.title}</span>
                </div>
              ))}
              
              {achievements.filter(a => a.unlocked).length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-2">
                  Start creating to unlock achievements!
                </div>
              )}
            </div>
          </Card>

          {/* Weekly Goals */}
          <Card className="p-3">
            <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Weekly Goals
            </h5>
            
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>Create 5 tracks</span>
                  <span className="font-mono">3/5</span>
                </div>
                <Progress value={60} className="h-1" />
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>Collaborate with 2 users</span>
                  <span className="font-mono">1/2</span>
                </div>
                <Progress value={50} className="h-1" />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DAWGamification;