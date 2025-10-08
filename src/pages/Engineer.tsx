import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import GlobalHeader from '@/components/GlobalHeader';
import { usePrime } from '@/contexts/PrimeContext';
import PrimeGlow from '@/components/prime/PrimeGlow';
import TopEngineersLeaderboard from '@/components/engineer-hub/TopEngineersLeaderboard';
import AvailableProjects from '@/components/engineer-hub/AvailableProjects';
import RecentDeliveries from '@/components/engineer-hub/RecentDeliveries';
import EngineerSpotlight from '@/components/engineer-hub/EngineerSpotlight';
import EarningsSnapshot from '@/components/engineer-hub/EarningsSnapshot';
import { HubBreadcrumb } from '@/components/ui/hub-breadcrumb';
import { HubRecommendations } from '@/components/ui/hub-recommendations';
import { Button } from '@/components/ui/button';
import { Briefcase, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { trackEvent } from '@/lib/analytics';

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
          <HubBreadcrumb items={[{ label: 'Engineer Zone' }]} />
          
          {/* Epic Hero Section */}
          <PrimeGlow intensity={1}>
            <Card className="mb-16 bg-gradient-to-br from-accent-blue/20 via-accent-cyan/20 to-accent-blue/20 border-accent-blue/30 shadow-[0_0_80px_rgba(6,182,212,0.3)] overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZXEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHJlY3QgeD0iMCIgeT0iMzAiIHdpZHRoPSI0IiBoZWlnaHQ9IjEwIiBmaWxsPSJyZ2JhKDYsMTgyLDIxMiwwLjEpIi8+PHJlY3QgeD0iOCIgeT0iMjAiIHdpZHRoPSI0IiBoZWlnaHQ9IjIwIiBmaWxsPSJyZ2JhKDYsMTgyLDIxMiwwLjEpIi8+PHJlY3QgeD0iMTYiIHk9IjEwIiB3aWR0aD0iNCIgaGVpZ2h0PSIzMCIgZmlsbD0icmdiYSg2LDE4MiwyMTIsMC4xKSIvPjxyZWN0IHg9IjI0IiB5PSI1IiB3aWR0aD0iNCIgaGVpZ2h0PSIzNSIgZmlsbD0icmdiYSg2LDE4MiwyMTIsMC4xKSIvPjxyZWN0IHg9IjMyIiB5PSIxNSIgd2lkdGg9IjQiIGhlaWdodD0iMjUiIGZpbGw9InJnYmEoNiwxODIsMjEyLDAuMSkiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZXEpIi8+PC9zdmc+')] opacity-30"></div>
              <div className="relative z-10 p-12 text-center">
                <motion.div 
                  className="text-8xl mb-6"
                  animate={{ 
                    rotateY: [0, 180, 360]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  🎚️
                </motion.div>
                <h1 className="text-7xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-accent-blue via-accent-cyan to-accent-blue bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]">
                  MIX. MASTER.<br />EARN.
                </h1>
                <p className="text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
                  Professional workspace to deliver world-class projects, build your reputation, and grow your revenue.
                </p>
                <div className="flex gap-4 justify-center mb-8">
                  <Button 
                    size="lg" 
                    className="text-lg px-8 py-6 bg-gradient-to-r from-accent-blue to-accent-cyan hover:scale-110 transition-transform shadow-[0_0_30px_rgba(6,182,212,0.5)]"
                    onClick={() => trackEvent('engineer_browse_cta', 'engagement', 'hero')}
                  >
                    <Briefcase className="w-5 h-5 mr-2" />
                    Browse Projects
                  </Button>
                  <Link to="/engineer-crm">
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="text-lg px-8 py-6 border-accent-cyan/50 hover:bg-accent-cyan/10"
                      onClick={() => trackEvent('engineer_studio_cta', 'engagement', 'hero')}
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Enter Studio
                    </Button>
                  </Link>
                </div>
                <div className="inline-flex items-center space-x-8 text-sm font-mono">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent-cyan">$8.5K</div>
                    <div className="text-muted-foreground">Top engineer earned this week</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent-blue">2,847</div>
                    <div className="text-muted-foreground">Active projects</div>
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

          <HubRecommendations excludeHref="/engineer" />

          <div className="text-center mt-12">
            <a 
              href="/" 
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
