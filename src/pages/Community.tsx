import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import GlobalHeader from '@/components/GlobalHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePrime } from '@/contexts/PrimeContext';
import PrimeGlow from '@/components/prime/PrimeGlow';

// The Feed components
import CommunityStats from '@/components/pulse-hub/CommunityStats';
import LiveActivityStream from '@/components/pulse-hub/LiveActivityStream';
import TrendingContent from '@/components/pulse-hub/TrendingContent';
import RecentAchievements from '@/components/pulse-hub/RecentAchievements';

// The Arena components
import ActiveBattles from '@/components/arena-hub/ActiveBattles';
import TournamentBracket from '@/components/arena-hub/TournamentBracket';
import BattleSchedule from '@/components/arena-hub/BattleSchedule';
import HallOfFame from '@/components/arena-hub/HallOfFame';

// The Crowd components
import AIActivityFeed from '@/components/dashboard/AIActivityFeed';

export default function Community() {
  const { systemMode } = usePrime();
  const [activeTab, setActiveTab] = useState('feed');

  return (
    <>
      <Helmet>
        <title>Community Hub — MixClub Online</title>
        <meta 
          name="description" 
          content="Connect with artists, engineers, and producers. Join battles, view leaderboards, and engage with the music community." 
        />
      </Helmet>

      <div className="min-h-screen bg-[#0a0a1a]">
        <GlobalHeader />
        
        <main className="max-w-7xl mx-auto px-6 py-16">
          <PrimeGlow intensity={0.6}>
            <div className="text-center mb-12">
              <div className="text-6xl mb-4">🌐</div>
              <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-blue">
                Community Hub
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Connect, compete, and collaborate with the global music community
              </p>
              <div className="text-sm font-mono text-accent-cyan mt-4">
                PRIME STATUS: {systemMode.toUpperCase()}
              </div>
            </div>
          </PrimeGlow>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 bg-card/30 backdrop-blur-sm border border-white/5 p-1">
              <TabsTrigger 
                value="feed"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent-blue/20 data-[state=active]:to-accent-blue/10 data-[state=active]:border-accent-blue/50"
              >
                🌊 The Feed
              </TabsTrigger>
              <TabsTrigger 
                value="arena"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent/20 data-[state=active]:to-accent/10 data-[state=active]:border-accent/50"
              >
                ⚔️ The Arena
              </TabsTrigger>
              <TabsTrigger 
                value="crowd"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent-cyan/20 data-[state=active]:to-accent-cyan/10 data-[state=active]:border-accent-cyan/50"
              >
                🎧 The Crowd
              </TabsTrigger>
              <TabsTrigger 
                value="leaderboard"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500/20 data-[state=active]:to-yellow-500/10 data-[state=active]:border-yellow-500/50"
              >
                🏆 Leaderboard
              </TabsTrigger>
            </TabsList>

            {/* THE FEED TAB */}
            <TabsContent value="feed" className="space-y-8">
              <CommunityStats />
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <LiveActivityStream />
                  <RecentAchievements />
                </div>
                <div>
                  <TrendingContent />
                </div>
              </div>
            </TabsContent>

            {/* THE ARENA TAB */}
            <TabsContent value="arena" className="space-y-8">
              <ActiveBattles />
              
              <div className="grid lg:grid-cols-2 gap-8">
                <TournamentBracket />
                <BattleSchedule />
              </div>

              <HallOfFame />
            </TabsContent>

            {/* THE CROWD TAB */}
            <TabsContent value="crowd" className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-8 rounded-xl bg-card/30 backdrop-blur-sm border border-white/5">
                  <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
                  <ul className="space-y-3 text-muted-foreground">
                    <li>🗳️ Vote on new tracks</li>
                    <li>🎵 Curated playlists</li>
                    <li>🔍 Discover emerging artists</li>
                    <li>💎 Earn listener rewards</li>
                    <li>🎁 Exclusive fan perks</li>
                  </ul>
                </div>

                <div className="p-8 rounded-xl bg-card/30 backdrop-blur-sm border border-white/5">
                  <h2 className="text-2xl font-semibold mb-4">Fan Activity</h2>
                  <AIActivityFeed />
                </div>
              </div>
            </TabsContent>

            {/* LEADERBOARD TAB */}
            <TabsContent value="leaderboard" className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-8 rounded-xl bg-card/30 backdrop-blur-sm border border-white/5">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <span className="text-3xl">🎨</span>
                    Top Artists
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Rankings based on project quality, collaborations, and community engagement
                  </p>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((rank) => (
                      <div 
                        key={rank}
                        className="flex items-center gap-4 p-4 rounded-lg bg-background/50 border border-white/5 hover:border-accent/30 transition-all"
                      >
                        <div className={`text-2xl font-bold ${rank <= 3 ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                          #{rank}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Artist Name</div>
                          <div className="text-sm text-muted-foreground">{1000 - rank * 100} points</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-8 rounded-xl bg-card/30 backdrop-blur-sm border border-white/5">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <span className="text-3xl">🔧</span>
                    Top Engineers
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Rankings based on project completion, ratings, and earnings
                  </p>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((rank) => (
                      <div 
                        key={rank}
                        className="flex items-center gap-4 p-4 rounded-lg bg-background/50 border border-white/5 hover:border-accent/30 transition-all"
                      >
                        <div className={`text-2xl font-bold ${rank <= 3 ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                          #{rank}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Engineer Name</div>
                          <div className="text-sm text-muted-foreground">{1000 - rank * 100} points</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="text-center mt-12">
            <a 
              href="/" 
              className="inline-block px-8 py-4 rounded-full bg-gradient-to-r from-accent to-accent-blue text-foreground hover:shadow-[0_0_30px_hsl(var(--accent)/0.5)] transition-all font-medium"
            >
              ← Back to Home
            </a>
          </div>
        </main>
      </div>
    </>
  );
}
