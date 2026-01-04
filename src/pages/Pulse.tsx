import { Helmet } from 'react-helmet-async';
import Navigation from '@/components/Navigation';
import LiveActivityStream from '@/components/pulse-hub/LiveActivityStream';
import TrendingContent from '@/components/pulse-hub/TrendingContent';
import CommunityStats from '@/components/pulse-hub/CommunityStats';
import RecentAchievements from '@/components/pulse-hub/RecentAchievements';
import EventCalendar from '@/components/pulse-hub/EventCalendar';
import { RecentAchievementsFeed } from '@/components/community/RecentAchievementsFeed';
import { OnlineNowCounter } from '@/components/community/OnlineNowCounter';
import { usePrime } from '@/contexts/PrimeContext';
import PrimeGlow from '@/components/prime/PrimeGlow';

export default function Pulse() {
  const { systemMode } = usePrime();
  
  return (
    <>
      <Helmet>
        <title>The Pulse — MixClub Online</title>
        <meta 
          name="description" 
          content="Community feed showcasing achievements, trending tracks, and rewards. Stay connected to the MixClub heartbeat." 
        />
      </Helmet>

      <div className="min-h-screen bg-[#0a0a1a]">
        <Navigation />
        
        <main className="max-w-7xl mx-auto px-6 py-16">
          <PrimeGlow intensity={0.7}>
            <div className="text-center mb-12">
              <div className="text-6xl mb-4">💓</div>
              <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-accent-cyan">
                The Pulse
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                The heartbeat of MixClub. Trending music, achievements, and community.
              </p>
              <div className="flex items-center justify-center gap-4 mt-4">
                <OnlineNowCounter />
                <div className="text-sm font-mono text-accent-cyan">
                  PRIME STATUS: {systemMode.toUpperCase()}
                </div>
              </div>
            </div>
          </PrimeGlow>

          <div className="space-y-8 mb-12">
            <CommunityStats />

            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <LiveActivityStream />
              </div>
              <div className="space-y-6">
                <RecentAchievementsFeed />
                <TrendingContent />
                <EventCalendar />
              </div>
            </div>

            <RecentAchievements />
          </div>

          <div className="text-center">
            <a 
              href="/network" 
              className="inline-block px-8 py-4 rounded-full bg-gradient-to-r from-accent-blue to-accent-cyan text-foreground hover:shadow-[0_0_30px_hsl(var(--accent-blue)/0.5)] transition-all font-medium"
            >
              ← Back to Hub
            </a>
          </div>
        </main>
      </div>
    </>
  );
}
