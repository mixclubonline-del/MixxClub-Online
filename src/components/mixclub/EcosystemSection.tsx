import XPBar from "@/components/ui/XPBar";

export default function EcosystemSection() {
  return (
    <section className="pt-24 pb-24 bg-gradient-to-b from-[hsl(265_50%_10%)] to-background text-foreground relative">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-12 animate-fade-in">

        {/* ROW 1 */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-10 text-center">
          {/* Artist */}
          <div className="glass-hover rounded-2xl p-6 w-full md:w-64 shadow-glass hover:shadow-glass-lg transition">
            <h3 className="text-lg font-semibold text-primary">🎤 Artist</h3>
            <p className="text-sm text-muted-foreground mt-2">Upload • AI Analyzer • Milestones</p>
            <XPBar value={1245} max={1500} tierLabel="Gold Tier ⭐" />
            <a href="/artist" className="inline-block mt-4 px-5 py-2 rounded-full text-sm font-medium text-foreground bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-blue))] hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)] transition">Enter Artist Zone →</a>
          </div>

          <div className="hidden md:block text-primary text-4xl animate-float">➡</div>

          {/* Hub */}
          <div className="glass-hover rounded-2xl p-6 w-full md:w-64 shadow-glass hover:shadow-glass-lg transition">
            <h3 className="text-lg font-semibold text-[hsl(var(--accent))]">🧠 Mixx Club Hub</h3>
            <p className="text-sm text-muted-foreground mt-2">Central Portal • Live Glow • Data Sync</p>
            <a href="/network" className="inline-block mt-4 px-5 py-2 rounded-full text-sm font-medium text-foreground bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-blue))] hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)] transition">Enter Hub →</a>
          </div>

          <div className="hidden md:block text-primary text-4xl animate-float">➡</div>

          {/* Pulse */}
          <div className="glass-hover rounded-2xl p-6 w-full md:w-64 shadow-glass hover:shadow-glass-lg transition">
            <h3 className="text-lg font-semibold text-[hsl(var(--accent-blue))]">💓 The Pulse</h3>
            <p className="text-sm text-muted-foreground mt-2">Community Feed • Achievements • Rewards</p>
            <a href="/pulse" className="inline-block mt-4 px-5 py-2 rounded-full text-sm font-medium text-foreground bg-gradient-to-r from-[hsl(var(--accent-blue))] to-[hsl(var(--accent-cyan))] hover:shadow-[0_0_20px_hsl(var(--accent-blue)/0.5)] transition">View Pulse →</a>
          </div>

          <div className="hidden md:block text-primary text-4xl animate-float">➡</div>

          {/* Fan */}
          <div className="glass-hover rounded-2xl p-6 w-full md:w-64 shadow-glass hover:shadow-glass-lg transition">
            <h3 className="text-lg font-semibold text-primary">🎧 Fan</h3>
            <p className="text-sm text-muted-foreground mt-2">Vote • Listen • Collect Rewards</p>
            <XPBar value={760} max={1000} tierLabel="Silver Tier 🥈" />
            <a href="/crowd" className="inline-block mt-4 px-5 py-2 rounded-full text-sm font-medium text-foreground bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-blue))] hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)] transition">Enter Fan Zone →</a>
          </div>
        </div>

        {/* ROW 2 */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-10 text-center">
          {/* Engineer */}
          <div className="glass-hover rounded-2xl p-6 w-full md:w-64 shadow-glass hover:shadow-glass-lg transition">
            <h3 className="text-lg font-semibold text-[hsl(var(--accent-cyan))]">🎚️ Engineer</h3>
            <p className="text-sm text-muted-foreground mt-2">Mix • Master • Deliver Projects</p>
            <XPBar value={1980} max={2200} tierLabel="Platinum 💎" />
            <a href="/engineer" className="inline-block mt-4 px-5 py-2 rounded-full text-sm font-medium text-foreground bg-gradient-to-r from-[hsl(var(--accent-blue))] to-[hsl(var(--accent-cyan))] hover:shadow-[0_0_20px_hsl(var(--accent-cyan)/0.5)] transition">Enter Engineer Zone →</a>
          </div>

          <div className="hidden md:block text-primary text-4xl animate-float">➡</div>

          {/* Marketplace */}
          <div className="glass-hover rounded-2xl p-6 w-full md:w-64 shadow-glass hover:shadow-glass-lg transition">
            <h3 className="text-lg font-semibold text-[hsl(var(--accent))]">🛒 Marketplace</h3>
            <p className="text-sm text-muted-foreground mt-2">Plugin Packs • Merch • Credits</p>
            <a href="/marketplace" className="inline-block mt-4 px-5 py-2 rounded-full text-sm font-medium text-foreground bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] hover:shadow-[0_0_20px_hsl(var(--accent)/0.5)] transition">Visit Marketplace →</a>
          </div>
        </div>

      </div>
    </section>
  );
}
