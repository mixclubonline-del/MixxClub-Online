import { Helmet } from 'react-helmet-async';
import GlobalHeader from '@/components/GlobalHeader';
import { usePrime } from '@/contexts/PrimeContext';
import PrimeGlow from '@/components/prime/PrimeGlow';
import FeaturedArtists from '@/components/artist-hub/FeaturedArtists';
import LiveArtistFeed from '@/components/artist-hub/LiveArtistFeed';
import TrendingTracks from '@/components/artist-hub/TrendingTracks';
import OpenOpportunities from '@/components/artist-hub/OpenOpportunities';
import ArtistStats from '@/components/artist-hub/ArtistStats';

export default function Artist() {
  const { accentColor, systemMode } = usePrime();
  
  return (
    <>
      <Helmet>
        <title>Artist Zone — MixClub Online</title>
        <meta 
          name="description" 
          content="Upload your tracks, receive AI-powered analysis, and track your progress through artist milestones." 
        />
      </Helmet>

      <div className="min-h-screen bg-[#0a0a1a]">
        <GlobalHeader />
        
        <main className="max-w-7xl mx-auto px-6 py-16">
          <PrimeGlow intensity={0.8}>
            <div className="text-center mb-12">
              <div className="text-6xl mb-4">🎤</div>
            <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-blue">
              Artist Zone
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your creative command center. Upload tracks, get instant AI feedback, and level up through artist milestones.
            </p>
            <div className="text-sm font-mono text-accent-cyan mt-4">
              PRIME STATUS: {systemMode.toUpperCase()}
            </div>
          </div>
          </PrimeGlow>

          <div className="space-y-8 mb-12">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Featured Artists</h2>
              <FeaturedArtists />
            </section>

            <div className="grid md:grid-cols-2 gap-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Live Activity</h2>
                <LiveArtistFeed />
              </section>
              <section>
                <h2 className="text-2xl font-semibold mb-4">Open Opportunities</h2>
                <OpenOpportunities />
              </section>
            </div>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Trending Tracks</h2>
              <TrendingTracks />
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Platform Stats</h2>
              <ArtistStats />
            </section>
          </div>

          <div className="text-center">
            <a 
              href="/network" 
              className="inline-block px-8 py-4 rounded-full bg-gradient-to-r from-primary to-accent-blue text-foreground hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)] transition-all font-medium"
            >
              ← Back to Hub
            </a>
          </div>
        </main>
      </div>
    </>
  );
}
