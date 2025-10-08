import { Helmet } from 'react-helmet-async';
import { Suspense, lazy } from 'react';
import GlobalHeader from '@/components/GlobalHeader';
import ActiveBattles from '@/components/arena-hub/ActiveBattles';
import TournamentBracket from '@/components/arena-hub/TournamentBracket';
import HallOfFame from '@/components/arena-hub/HallOfFame';
import BattleSchedule from '@/components/arena-hub/BattleSchedule';
import YourBattleStats from '@/components/arena-hub/YourBattleStats';
import { usePrime } from '@/contexts/PrimeContext';
import PrimeGlow from '@/components/prime/PrimeGlow';
import { HubBreadcrumb } from '@/components/ui/hub-breadcrumb';
import { HubRecommendations } from '@/components/ui/hub-recommendations';
import { SplineBackground } from '@/components/3d/spline/SplineBackground';

const BattleArenaScene = lazy(() => import('@/components/3d/r3f/BattleArenaScene').then(m => ({ default: m.BattleArenaScene })));

export default function Arena() {
  const { systemMode } = usePrime();
  
  return (
    <>
      <Helmet>
        <title>Mixx Arena — MixClub Online</title>
        <meta 
          name="description" 
          content="Compete in mix battles, vote on submissions, and climb the leaderboards. Prove your skills in the Arena." 
        />
      </Helmet>

      <div className="min-h-screen bg-[#0a0a1a] relative overflow-hidden">
        <SplineBackground 
          scene="https://prod.spline.design/Xqw7yqfqzKP01SoH/scene.splinecode"
          className="opacity-20"
        />
        <GlobalHeader />
        
        <main className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          <HubBreadcrumb items={[{ label: 'Arena' }]} />
          
          {/* 3D Battle Arena */}
          <div className="mb-12 h-[400px] rounded-xl overflow-hidden border border-primary/30 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
            <Suspense fallback={<div className="w-full h-full bg-card animate-pulse flex items-center justify-center"><span className="text-4xl">⚔️</span></div>}>
              <BattleArenaScene className="w-full h-full" />
            </Suspense>
          </div>
          
          <PrimeGlow intensity={0.9}>
            <div className="text-center mb-12">
              <div className="text-6xl mb-4">⚔️</div>
              <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-destructive">
                Mixx Arena
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Battle arena for mix competitions. Compete, vote, and earn rewards.
              </p>
              <div className="text-sm font-mono text-accent-cyan mt-4">
                PRIME STATUS: {systemMode.toUpperCase()}
              </div>
            </div>
          </PrimeGlow>

          <div className="space-y-8 mb-12">
            <ActiveBattles />

            <div className="grid md:grid-cols-2 gap-6">
              <TournamentBracket />
              <BattleSchedule />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <HallOfFame />
              </div>
              <YourBattleStats />
            </div>
          </div>

          <HubRecommendations excludeHref="/arena" />

          <div className="text-center mt-12">
            <a 
              href="/" 
              className="inline-block px-8 py-4 rounded-full bg-gradient-to-r from-primary to-destructive text-foreground hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)] transition-all font-medium"
            >
              ← Back to Hub
            </a>
          </div>
        </main>
      </div>
    </>
  );
}
