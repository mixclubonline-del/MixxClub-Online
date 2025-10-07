import { Helmet } from 'react-helmet-async';
import GlobalHeader from '@/components/GlobalHeader';
import AIActivityFeed from '@/components/dashboard/AIActivityFeed';
import { usePrime } from '@/contexts/PrimeContext';
import PrimeGlow from '@/components/prime/PrimeGlow';

export default function AIStudio() {
  const { accentColor, systemMode } = usePrime();
  
  return (
    <>
      <Helmet>
        <title>AI Studio — MixClub Online</title>
        <meta 
          name="description" 
          content="Access cutting-edge AI tools for music production. Automated mixing, mastering presets, and intelligent suggestions." 
        />
      </Helmet>

      <div className="min-h-screen bg-[#0a0a1a]">
        <GlobalHeader />
        
        <main className="max-w-7xl mx-auto px-6 py-16">
          <PrimeGlow intensity={1.0}>
            <div className="text-center mb-12">
              <div className="text-6xl mb-4">🤖</div>
            <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">
              AI Studio
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Next-generation AI tools for music production. Intelligent automation that understands your creative vision.
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
                <li>🧠 AI mix suggestions</li>
                <li>🎨 Automated mastering</li>
                <li>🎵 Genre detection & tagging</li>
                <li>📈 Frequency analysis</li>
                <li>🔧 Smart plugin presets</li>
              </ul>
            </div>

            <div className="p-8 rounded-xl bg-card/30 backdrop-blur-sm border border-white/5">
              <h2 className="text-2xl font-semibold mb-4">Real-time AI Processing</h2>
              <AIActivityFeed />
            </div>
          </div>

          <div className="text-center">
            <a 
              href="/network" 
              className="inline-block px-8 py-4 rounded-full bg-gradient-to-r from-accent to-primary text-foreground hover:shadow-[0_0_30px_hsl(var(--accent)/0.5)] transition-all font-medium"
            >
              ← Back to Hub
            </a>
          </div>
        </main>
      </div>
    </>
  );
}
