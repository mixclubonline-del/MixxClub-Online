import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, Music, Headphones, Trophy, Lock, Unlock, Sparkles, 
  TrendingUp, Crown, Zap, Star, Rocket, CheckCircle, Briefcase,
  Shield, Target, Gem, Play, Award
} from 'lucide-react';
import { useUnlockables, Unlockable } from '@/hooks/useUnlockables';

const iconMap: Record<string, any> = {
  users: Users,
  award: Award,
  'trending-up': TrendingUp,
  zap: Zap,
  crown: Crown,
  play: Play,
  music: Music,
  star: Star,
  rocket: Rocket,
  trophy: Trophy,
  'check-circle': CheckCircle,
  briefcase: Briefcase,
  shield: Shield,
  target: Target,
  gem: Gem,
};

function UnlockableCard({ unlockable }: { unlockable: Unlockable }) {
  const Icon = iconMap[unlockable.icon_name] || Trophy;
  const isNearUnlock = unlockable.progress_percentage >= 80 && !unlockable.is_unlocked;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative ${isNearUnlock ? 'animate-pulse' : ''}`}
    >
      <Card className={`h-full transition-all duration-300 ${
        unlockable.is_unlocked 
          ? 'border-primary/50 bg-primary/5' 
          : 'border-border/50 hover:border-primary/30'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className={`p-3 rounded-xl ${
              unlockable.is_unlocked 
                ? 'bg-primary/20 text-primary' 
                : 'bg-muted text-muted-foreground'
            }`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Tier {unlockable.tier}
              </Badge>
              {unlockable.is_unlocked ? (
                <Unlock className="h-4 w-4 text-primary" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
          <CardTitle className="text-lg mt-3">{unlockable.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{unlockable.description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {unlockable.current_value} / {unlockable.target_value}
              </span>
            </div>
            <Progress 
              value={unlockable.progress_percentage} 
              className={`h-2 ${unlockable.is_unlocked ? 'bg-primary/20' : ''}`}
            />
            <p className="text-xs text-right text-muted-foreground">
              {unlockable.is_unlocked ? 'Unlocked!' : `${unlockable.progress_percentage}% complete`}
            </p>
          </div>

          {/* Reward */}
          {unlockable.reward_description && (
            <div className={`p-3 rounded-lg ${
              unlockable.is_unlocked ? 'bg-primary/10' : 'bg-muted/50'
            }`}>
              <div className="flex items-center gap-2 text-sm font-medium mb-1">
                <Sparkles className="h-4 w-4 text-primary" />
                Reward
              </div>
              <p className="text-sm text-muted-foreground">
                {unlockable.reward_description}
              </p>
            </div>
          )}

          {/* AI Reasoning */}
          {unlockable.ai_reasoning && unlockable.created_by === 'prime_ai' && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground italic">
                "{unlockable.ai_reasoning}"
              </p>
              <p className="text-xs text-primary mt-1">— Prime AI</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function UnlockablesGrid({ unlockables, title, description, icon: Icon }: {
  unlockables: Unlockable[];
  title: string;
  description: string;
  icon: any;
}) {
  const unlockedCount = unlockables.filter(u => u.is_unlocked).length;
  const nextUnlock = unlockables.find(u => !u.is_unlocked);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Badge variant="secondary">
          {unlockedCount} / {unlockables.length} Unlocked
        </Badge>
      </div>

      {/* Next Unlock Teaser */}
      {nextUnlock && (
        <Card className="border-dashed border-primary/30 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Next Unlock: {nextUnlock.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {nextUnlock.target_value - nextUnlock.current_value} more to go!
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {nextUnlock.progress_percentage}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {unlockables.map((unlockable) => (
          <UnlockableCard key={unlockable.id} unlockable={unlockable} />
        ))}
      </div>
    </div>
  );
}

export default function UnlockablesHub() {
  const { data, isLoading } = useUnlockables();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading unlockables...</p>
        </div>
      </div>
    );
  }

  const totalUnlocked = [
    ...(data?.community || []),
    ...(data?.artist || []),
    ...(data?.engineer || []),
  ].filter(u => u.is_unlocked).length;

  const totalUnlockables = (data?.community?.length || 0) + 
    (data?.artist?.length || 0) + 
    (data?.engineer?.length || 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative py-16 px-4 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Community-Powered Features</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold"
          >
            Unlockables Hub
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Features unlock as our community grows. Every user, session, and project
            brings us closer to unlocking the next level.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-8 pt-4"
          >
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{data?.platformStats?.userCount || 0}</p>
              <p className="text-sm text-muted-foreground">Community Members</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{totalUnlocked}</p>
              <p className="text-sm text-muted-foreground">Features Unlocked</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{totalUnlockables - totalUnlocked}</p>
              <p className="text-sm text-muted-foreground">Coming Soon</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="community" className="space-y-8">
          <TabsList className="grid grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="community" className="gap-2">
              <Users className="h-4 w-4" />
              Community
            </TabsTrigger>
            <TabsTrigger value="artist" className="gap-2">
              <Music className="h-4 w-4" />
              Artist
            </TabsTrigger>
            <TabsTrigger value="engineer" className="gap-2">
              <Headphones className="h-4 w-4" />
              Engineer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="community">
            <UnlockablesGrid
              unlockables={data?.community || []}
              title="Community Unlockables"
              description="Features that unlock for everyone as the community grows"
              icon={Users}
            />
          </TabsContent>

          <TabsContent value="artist">
            <UnlockablesGrid
              unlockables={data?.artist || []}
              title="Artist Journey"
              description="Personal milestones on your path as an artist"
              icon={Music}
            />
          </TabsContent>

          <TabsContent value="engineer">
            <UnlockablesGrid
              unlockables={data?.engineer || []}
              title="Engineer Path"
              description="Professional achievements for audio engineers"
              icon={Headphones}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
