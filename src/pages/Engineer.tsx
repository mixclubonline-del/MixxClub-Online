import { Helmet } from 'react-helmet-async';
import GlobalHeader from '@/components/GlobalHeader';
import { usePrime } from '@/contexts/PrimeContext';
import PrimeGlow from '@/components/prime/PrimeGlow';
import TopEngineersLeaderboard from '@/components/engineer-hub/TopEngineersLeaderboard';
import AvailableProjects from '@/components/engineer-hub/AvailableProjects';
import RecentDeliveries from '@/components/engineer-hub/RecentDeliveries';
import EngineerSpotlight from '@/components/engineer-hub/EngineerSpotlight';
import EarningsSnapshot from '@/components/engineer-hub/EarningsSnapshot';

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

          <div className="space-y-8 mb-12">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Your Earnings</h2>
              <EarningsSnapshot />
            </section>

            <div className="grid md:grid-cols-2 gap-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Top Engineers</h2>
                <TopEngineersLeaderboard />
              </section>
              <section>
                <h2 className="text-2xl font-semibold mb-4">Engineer Spotlight</h2>
                <EngineerSpotlight />
              </section>
            </div>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Available Projects</h2>
              <AvailableProjects />
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Recent Deliveries</h2>
              <RecentDeliveries />
            </section>
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
