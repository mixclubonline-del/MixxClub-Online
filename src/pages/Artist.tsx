import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlobalHeader from '@/components/GlobalHeader';
import { usePrime } from '@/contexts/PrimeContext';
import PrimeGlow from '@/components/prime/PrimeGlow';
import FeaturedArtists from '@/components/artist-hub/FeaturedArtists';
import LiveArtistFeed from '@/components/artist-hub/LiveArtistFeed';
import TrendingTracks from '@/components/artist-hub/TrendingTracks';
import OpenOpportunities from '@/components/artist-hub/OpenOpportunities';
import ArtistStats from '@/components/artist-hub/ArtistStats';
import { HubBreadcrumb } from '@/components/ui/hub-breadcrumb';
import { HubRecommendations } from '@/components/ui/hub-recommendations';
import { Button } from '@/components/ui/button';
import { Upload, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { trackEvent } from '@/lib/analytics';

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
          <HubBreadcrumb items={[{ label: 'Artist Zone' }]} />
          
          {/* Epic Hero Section */}
          <PrimeGlow intensity={1}>
            <Card className="mb-16 bg-gradient-to-br from-primary/20 via-accent-magenta/20 to-primary/20 border-primary/30 shadow-[0_0_80px_rgba(139,92,246,0.3)] overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDEzOSw5MiwyNDYsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
              <div className="relative z-10 p-12 text-center">
                <motion.div 
                  className="text-8xl mb-6"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  🎤
                </motion.div>
                <h1 className="text-7xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent-magenta to-primary bg-[length:200%_auto] animate-gradient">
                  YOUR MUSIC.<br />YOUR LEGACY.
                </h1>
                <p className="text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
                  Upload tracks, collaborate with top engineers, and build your empire in the music industry.
                </p>
                <div className="flex gap-4 justify-center mb-8">
                  <Button 
                    size="lg" 
                    className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-accent-magenta hover:scale-110 transition-transform shadow-[0_0_30px_rgba(139,92,246,0.5)]"
                    onClick={() => trackEvent('artist_upload_cta', 'engagement', 'hero')}
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Track
                  </Button>
                  <Link to="/artist-crm">
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="text-lg px-8 py-6 border-primary/50 hover:bg-primary/10"
                      onClick={() => trackEvent('artist_studio_cta', 'engagement', 'hero')}
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Enter Studio
                    </Button>
                  </Link>
                </div>
                <div className="inline-flex items-center space-x-8 text-sm font-mono">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">142</div>
                    <div className="text-muted-foreground">Artists earned $50K+ last month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent-magenta">98%</div>
                    <div className="text-muted-foreground">Success rate</div>
                  </div>
                </div>
                <div className="text-sm font-mono text-accent-cyan mt-6">
                  PRIME STATUS: {systemMode.toUpperCase()}
                </div>
              </div>
            </Card>
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

          <HubRecommendations excludeHref="/artist" />

          <div className="text-center mt-12">
            <a 
              href="/" 
              className="inline-block px-8 py-4 rounded-full bg-gradient-to-r from-primary to-accent-magenta text-foreground hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)] transition-all font-medium"
            >
              ← Back to Hub
            </a>
          </div>
        </main>
      </div>
    </>
  );
}
