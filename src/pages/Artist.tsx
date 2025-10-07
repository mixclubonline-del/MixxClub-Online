import { Helmet } from 'react-helmet-async';
import GlobalHeader from '@/components/GlobalHeader';
import HubDashboard from '@/components/dashboard/HubDashboard';
import AIActivityFeed from '@/components/dashboard/AIActivityFeed';

export default function Artist() {
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
          <div className="text-center mb-12">
            <div className="text-6xl mb-4">🎤</div>
            <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-blue">
              Artist Zone
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your creative command center. Upload tracks, get instant AI feedback, and level up through artist milestones.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-8 rounded-xl bg-card/30 backdrop-blur-sm border border-white/5">
              <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li>✨ Drag-and-drop track uploads</li>
                <li>🤖 AI-powered frequency analysis</li>
                <li>📊 Real-time mix feedback</li>
                <li>🎯 Artist milestone tracking</li>
                <li>💎 XP rewards & tier progression</li>
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
