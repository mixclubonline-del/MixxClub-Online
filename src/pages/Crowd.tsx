import { Helmet } from 'react-helmet-async';
import GlobalHeader from '@/components/GlobalHeader';
import AIActivityFeed from '@/components/dashboard/AIActivityFeed';
import { usePrime } from '@/contexts/PrimeContext';
import PrimeGlow from '@/components/prime/PrimeGlow';

export default function Crowd() {
  const { accentColor, systemMode } = usePrime();
  
  return (
    <>
      <Helmet>
        <title>The Crowd — MixClub Online</title>
        <meta 
          name="description" 
          content="Fan zone for music lovers. Vote on tracks, discover new artists, and earn rewards for your engagement." 
        />
      </Helmet>

      <div className="min-h-screen bg-[#0a0a1a]">
        <GlobalHeader />
        
        <main className="max-w-7xl mx-auto px-6 py-16">
          <PrimeGlow intensity={0.6}>
            <div className="text-center mb-12">
              <div className="text-6xl mb-4">🎧</div>
            <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-blue">
              The Crowd
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Fan zone where your voice matters. Vote on tracks, discover new music, and earn rewards for participation.
            </p>
            <div className="text-sm font-mono text-accent-cyan mt-4">
              PRIME STATUS: {systemMode.toUpperCase()}
            </div>
          </div>
          </PrimeGlow>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
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

          <div className="text-center space-x-4">
            <a 
              href="/premieres" 
              className="inline-block px-8 py-4 rounded-full bg-gradient-to-r from-accent to-accent-blue text-foreground hover:shadow-[0_0_30px_hsl(var(--accent)/0.5)] transition-all font-medium"
            >
              🎵 Track Premieres
            </a>
            <a 
              href="/network" 
              className="inline-block px-8 py-4 rounded-full bg-card/30 border border-white/10 text-foreground hover:bg-card/50 transition-all font-medium"
            >
              ← Back to Hub
            </a>
          </div>
        </main>
      </div>
    </>
  );
}
