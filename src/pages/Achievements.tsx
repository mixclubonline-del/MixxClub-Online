import { SEOHead } from '@/components/SEOHead';
import Navigation from '@/components/Navigation';
import { PublicFooter } from '@/components/layouts/PublicFooter';
import { UserLevelBadge } from '@/components/gamification/UserLevelBadge';
import { XPProgressBar } from '@/components/gamification/XPProgressBar';
import { AchievementsGrid } from '@/components/gamification/AchievementsGrid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Flame, Target, Zap } from 'lucide-react';

const Achievements = () => {
  return (
    <>
      <SEOHead
        title="Achievements"
        description="Track your progress and unlock achievements on Mixxclub"
        keywords="achievements, gamification, XP, music progress"
      />
      <Navigation />

      <main className="container mx-auto px-4 py-8 pt-24 min-h-screen">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Your Journey
            </h1>
            <p className="text-muted-foreground">
              Track your progress and unlock achievements as you grow
            </p>
          </div>

          {/* Level Badge */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6">
              <UserLevelBadge />
            </div>
            <CardContent className="pt-4">
              <XPProgressBar />
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="text-center p-4">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Achievements</p>
            </Card>
            <Card className="text-center p-4">
              <Flame className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <p className="text-2xl font-bold">7</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </Card>
            <Card className="text-center p-4">
              <Target className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">5</p>
              <p className="text-sm text-muted-foreground">Projects</p>
            </Card>
            <Card className="text-center p-4">
              <Zap className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold">2,750</p>
              <p className="text-sm text-muted-foreground">Total XP</p>
            </Card>
          </div>

          {/* Achievements Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="locked">Locked</TabsTrigger>
              <TabsTrigger value="rare">Rare</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              <AchievementsGrid />
            </TabsContent>
            
            <TabsContent value="recent" className="mt-6">
              <AchievementsGrid limit={4} />
            </TabsContent>
            
            <TabsContent value="locked" className="mt-6">
              <Card className="text-center py-12">
                <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                <h4 className="font-semibold mb-2">Keep Going!</h4>
                <p className="text-sm text-muted-foreground">
                  Complete more collaborations to unlock new achievements
                </p>
              </Card>
            </TabsContent>
            
            <TabsContent value="rare" className="mt-6">
              <Card className="text-center py-12">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-500/30" />
                <h4 className="font-semibold mb-2">Rare Achievements</h4>
                <p className="text-sm text-muted-foreground">
                  Only the most dedicated creators unlock these
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <PublicFooter />
    </>
  );
};

export default Achievements;
