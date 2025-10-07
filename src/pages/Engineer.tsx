import { Helmet } from 'react-helmet-async';
import GlobalHeader from '@/components/GlobalHeader';
import AIActivityFeed from '@/components/dashboard/AIActivityFeed';
import { usePrime } from '@/contexts/PrimeContext';
import PrimeGlow from '@/components/prime/PrimeGlow';

export default function Engineer() {
  const { accentColor, systemMode } = usePrime();
  
  return (
    <>
      <Helmet>
        <title>Engineer Zone — MixClub Online</title>
        <meta 
          name="description" 
          content="Professional mixing and mastering tools. Deliver projects, build reputation, and earn through the MixClub network." 
        />
      </Helmet>

      <div className="min-h-screen bg-[#0a0a1a]">
        <GlobalHeader />
        
        <main className="max-w-7xl mx-auto px-6 py-16">
          <PrimeGlow intensity={0.8}>
            <div className="text-center mb-12">
              <div className="text-6xl mb-4">🎚️</div>
            <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-accent-cyan">
              Engineer Zone
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional mixing and mastering workspace. Connect with artists, deliver quality work, and build your reputation.
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
                <li>🎛️ Advanced mixing console</li>
                <li>🤖 AI mastering assistance</li>
                <li>📦 Project delivery system</li>
                <li>⭐ Reputation & review system</li>
                <li>💰 Earnings dashboard</li>
              </ul>
            </div>

            <div className="p-8 rounded-xl bg-card/30 backdrop-blur-sm border border-white/5">
              <h2 className="text-2xl font-semibold mb-4">AI Activity</h2>
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
