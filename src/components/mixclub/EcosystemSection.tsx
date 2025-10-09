import DashboardCard from "@/components/dashboard/DashboardCard";
import { useRealtimeAILog } from "@/components/dashboard/AIActivityFeed";

export default function EcosystemSection() {
  const artistLog = useRealtimeAILog();
  const engineerLog = useRealtimeAILog();
  const pulseLog = useRealtimeAILog();
  const fanLog = useRealtimeAILog();
  const aiStudioLog = useRealtimeAILog();

  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-accent-blue">
            The Ecosystem
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A unified dashboard where creativity meets technology. Every zone is powered by AI, interconnected in real-time.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            icon="🎤"
            title="Artist Zone"
            description="Upload tracks, get AI analysis, track milestones"
            route="/artist"
            aiLog={artistLog}
            xpValue={1245}
            xpMax={1500}
            tierLabel="Gold Tier ⭐"
            gradient="hsl(var(--primary)), hsl(var(--accent-blue))"
            delay={0.1}
          />

          <DashboardCard
            icon="🎚️"
            title="Engineer Zone"
            description="Mix, master, and deliver pro-level projects"
            route="/engineer"
            aiLog={engineerLog}
            xpValue={1980}
            xpMax={2200}
            tierLabel="Platinum 💎"
            gradient="hsl(var(--accent-blue)), hsl(var(--accent-cyan))"
            delay={0.2}
          />

          <DashboardCard
            icon="🤖"
            title="Studio"
            description="Access intelligent tools and automation"
            route="/artist-crm?tab=studio"
            aiLog={aiStudioLog}
            gradient="hsl(var(--accent)), hsl(var(--primary))"
            delay={0.3}
          />

          <DashboardCard
            icon="💓"
            title="The Pulse"
            description="Community feed, achievements, rewards"
            route="/pulse"
            aiLog={pulseLog}
            gradient="hsl(var(--accent-blue)), hsl(var(--accent-cyan))"
            delay={0.4}
          />

          <DashboardCard
            icon="⚔️"
            title="Mixx Arena"
            description="Compete in mix battles and earn rewards"
            route="/arena"
            aiLog="Battle matching in progress..."
            gradient="hsl(var(--primary)), hsl(var(--destructive))"
            delay={0.5}
          />

          <DashboardCard
            icon="🎧"
            title="The Crowd"
            description="Vote, listen, and collect rewards as a fan"
            route="/crowd"
            aiLog={fanLog}
            xpValue={760}
            xpMax={1000}
            tierLabel="Silver Tier 🥈"
            gradient="hsl(var(--accent)), hsl(var(--accent-blue))"
            delay={0.6}
          />
        </div>
      </div>
    </section>
  );
}
