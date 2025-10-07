import { Helmet } from 'react-helmet-async';
import GlobalHeader from '@/components/GlobalHeader';
import AIActivityFeed from '@/components/dashboard/AIActivityFeed';

export default function Arena() {
  return (
    <>
      <Helmet>
        <title>Mixx Arena — MixClub Online</title>
        <meta 
          name="description" 
          content="Compete in mix battles, vote on submissions, and climb the leaderboards. Prove your skills in the Arena." 
        />
      </Helmet>

      <div className="min-h-screen bg-[#0a0a1a]">
        <GlobalHeader />
        
        <main className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <div className="text-6xl mb-4">⚔️</div>
            <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-destructive">
              Mixx Arena
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Battle arena for mix competitions. Compete, vote, and earn rewards based on your mixing skills.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-8 rounded-xl bg-card/30 backdrop-blur-sm border border-white/5">
              <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li>⚔️ Weekly mix battles</li>
                <li>🗳️ Community voting system</li>
                <li>🏆 Leaderboards & rankings</li>
                <li>💰 Prize pools & rewards</li>
                <li>🎖️ Battle badges & titles</li>
              </ul>
            </div>

            <div className="p-8 rounded-xl bg-card/30 backdrop-blur-sm border border-white/5">
              <h2 className="text-2xl font-semibold mb-4">Battle Matching</h2>
              <AIActivityFeed />
            </div>
          </div>

          <div className="text-center">
            <a 
              href="/network" 
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
