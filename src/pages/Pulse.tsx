import { Helmet } from 'react-helmet-async';
import GlobalHeader from '@/components/GlobalHeader';
import AIActivityFeed from '@/components/dashboard/AIActivityFeed';

export default function Pulse() {
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
        <GlobalHeader />
        
        <main className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <div className="text-6xl mb-4">💓</div>
            <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-accent-cyan">
              The Pulse
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The heartbeat of MixClub. See what's trending, celebrate achievements, and discover new music.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-8 rounded-xl bg-card/30 backdrop-blur-sm border border-white/5">
              <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li>📱 Real-time community feed</li>
                <li>🏆 Achievement showcases</li>
                <li>🎵 Trending tracks</li>
                <li>💬 Social interactions</li>
                <li>🎁 Daily rewards</li>
              </ul>
            </div>

            <div className="p-8 rounded-xl bg-card/30 backdrop-blur-sm border border-white/5">
              <h2 className="text-2xl font-semibold mb-4">Live Activity</h2>
              <AIActivityFeed />
            </div>
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
