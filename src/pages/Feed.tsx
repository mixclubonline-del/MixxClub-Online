import { Helmet } from 'react-helmet-async';
import { Card } from '@/components/ui/card';
import GlobalHeader from '@/components/GlobalHeader';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { GamificationHub } from '@/components/crm/dashboard/GamificationHub';
import { QuickAchievements } from '@/components/gamification/QuickAchievements';
import ActiveBattles from '@/components/arena-hub/ActiveBattles';
import HallOfFame from '@/components/arena-hub/HallOfFame';
import TournamentBracket from '@/components/arena-hub/TournamentBracket';
import YourBattleStats from '@/components/arena-hub/YourBattleStats';
import { EnhancedLeaderboard } from '@/components/gamification/EnhancedLeaderboard';
import { MonthlyAwards } from '@/components/gamification/MonthlyAwards';
import { useLiveActivity } from '@/hooks/useLiveActivity';
import { LiveActivityStream } from '@/components/community/LiveActivityStream';
import { Users, Trophy, Target, Flame } from 'lucide-react';

export default function Feed() {
  const { user } = useAuth();
  const { activities } = useLiveActivity();

  return (
    <>
      <Helmet>
        <title>The Inner Circle — Mixx Club</title>
        <meta 
          name="description" 
          content="Join the Mixx Club Inner Circle - compete, level up, and dominate the leaderboards with the most engaged music creators." 
        />
      </Helmet>

      <main className="min-h-screen bg-gradient-to-b from-background via-[hsl(265_50%_10%)] to-background">
        <GlobalHeader />
        
        <div className="container mx-auto px-4 pt-24 pb-12 space-y-8">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Flame className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-semibold text-primary">Live Now</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--accent-blue))] to-[hsl(var(--primary))] mb-4 animate-pulse">
              The Inner Circle
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Where legends are made. Track your progress, compete in battles, and climb the ranks with Mixx Club's elite community.
            </p>
          </motion.div>

          {/* Live Stats Dashboard */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <Card className="p-4 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">1,247</p>
                  <p className="text-xs text-muted-foreground">Online Now</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-accent-blue/20 to-accent-blue/5 border-accent-blue/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent-blue/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-accent-blue" />
                </div>
                <div>
                  <p className="text-2xl font-bold">42</p>
                  <p className="text-xs text-muted-foreground">Live Battles</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-xs text-muted-foreground">Achievements Today</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-orange-500/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">89</p>
                  <p className="text-xs text-muted-foreground">Active Streaks</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Your Progress Hub */}
          {user && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2">
                <GamificationHub />
              </div>
              <div>
                <QuickAchievements userId={user.id} />
              </div>
            </motion.div>
          )}

          {/* Battle Arena Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid lg:grid-cols-2 gap-6"
          >
            <div className="space-y-6">
              <ActiveBattles />
              {user && <YourBattleStats />}
            </div>
            <div className="space-y-6">
              <TournamentBracket />
              <HallOfFame />
            </div>
          </motion.div>

          {/* Community Pulse */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <LiveActivityStream activities={activities} />
          </motion.div>

          {/* Leaderboards & Rankings */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid lg:grid-cols-2 gap-6"
          >
            <EnhancedLeaderboard />
            <MonthlyAwards />
          </motion.div>
        </div>
      </main>
    </>
  );
}
