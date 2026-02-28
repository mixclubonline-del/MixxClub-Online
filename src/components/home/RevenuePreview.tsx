import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Zap, Music, Users, BookOpen, Share2, Briefcase, Headphones, Radio, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useCommunityStats } from "@/hooks/useCommunityStats";

const revenueStreams = [
  { name: "Mixing", icon: Headphones, amount: 1250, color: "text-primary" },
  { name: "Mastering", icon: Zap, amount: 890, color: "text-secondary" },
  { name: "Projects", icon: Briefcase, amount: 2100, color: "text-accent" },
  { name: "Partnerships", icon: Users, amount: 450, color: "text-green-400" },
  { name: "Referrals", icon: Share2, amount: 320, color: "text-yellow-400" },
  { name: "Subscriptions", icon: TrendingUp, amount: 560, color: "text-blue-400" },
  { name: "Marketplace", icon: Music, amount: 780, color: "text-pink-400" },
  { name: "Courses", icon: BookOpen, amount: 340, color: "text-orange-400" },
  { name: "Royalties", icon: DollarSign, amount: 620, color: "text-purple-400" },
  { name: "Sync", icon: Radio, amount: 180, color: "text-cyan-400" },
];

const pipelineStages = [
  { name: "Lead", count: 12, color: "bg-blue-500" },
  { name: "Contact", count: 8, color: "bg-yellow-500" },
  { name: "Proposal", count: 5, color: "bg-orange-500" },
  { name: "Won", count: 3, color: "bg-green-500" },
];

export function RevenuePreview() {
  const { data: stats } = useCommunityStats();
  const [displayedAmounts, setDisplayedAmounts] = useState<number[]>(revenueStreams.map(() => 0));
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [isLive, setIsLive] = useState(false);

  // Use real platform earnings if available, otherwise demo total
  const platformTotal = stats?.totalEarnings || 0;
  const demoTotal = revenueStreams.reduce((sum, stream) => sum + stream.amount, 0);
  const finalTotal = platformTotal > 0 ? platformTotal : demoTotal;

  // Animate counters
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    // Scale demo amounts proportionally if using real data
    const scaleFactor = platformTotal > 0 ? platformTotal / demoTotal : 1;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      setDisplayedAmounts(
        revenueStreams.map((stream) => Math.round(stream.amount * scaleFactor * easeProgress))
      );
      setTotalRevenue(Math.round(finalTotal * easeProgress));

      if (currentStep >= steps) {
        clearInterval(interval);
        setIsLive(platformTotal > 0);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [platformTotal, finalTotal, demoTotal]);

  return (
    <section className="py-20 relative overflow-hidden bg-muted/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.05),transparent_70%)]" />
      
      <div className="container px-6 relative z-10">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <DollarSign className="w-3 h-3 mr-1" />
            10 Revenue Streams
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            This is How You{" "}
            <span className="bg-gradient-to-r from-green-400 to-primary bg-clip-text text-transparent">
              Get Paid
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Engineers earned <span className="text-primary font-bold">${totalRevenue.toLocaleString()}</span> this month across 10 revenue streams.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Revenue Streams Grid */}
          <div className="lg:col-span-2">
            <Card className="p-6 glass-mid border-border/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Revenue Streams</h3>
                <Badge className={`${isLive ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-muted text-muted-foreground border-border'}`}>
                  {isLive && <Activity className="w-3 h-3 mr-1 animate-pulse" />}
                  {isLive ? 'Live from Platform' : 'Demo Data'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {revenueStreams.map((stream, index) => (
                  <motion.div
                    key={stream.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group"
                  >
                    <div className={`${stream.color} mb-2 group-hover:scale-110 transition-transform`}>
                      <stream.icon className="w-5 h-5" />
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">{stream.name}</div>
                    <div className="text-lg font-bold">
                      ${displayedAmounts[index].toLocaleString()}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-6 pt-6 border-t border-border/50 flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Total Monthly Revenue</div>
                  <motion.div
                    className="text-3xl font-bold bg-gradient-to-r from-green-400 to-primary bg-clip-text text-transparent"
                    key={totalRevenue}
                  >
                    ${totalRevenue.toLocaleString()}
                  </motion.div>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-lg px-4 py-2">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  +23% vs last month
                </Badge>
              </div>
            </Card>
          </div>

          {/* Deal Pipeline */}
          <div>
            <Card className="p-6 glass-mid border-border/50 h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Deal Pipeline</h3>
                <Badge variant="outline">Live</Badge>
              </div>

              <div className="space-y-4">
                {pipelineStages.map((stage, index) => (
                  <motion.div
                    key={stage.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                    <div className="flex-1 text-sm">{stage.name}</div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted/50 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${stage.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${(stage.count / 12) * 100}%` }}
                          transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                        />
                      </div>
                      <span className="text-sm font-medium w-6">{stage.count}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pipeline value */}
              <div className="mt-6 pt-4 border-t border-border/50">
                <div className="text-sm text-muted-foreground mb-1">Pipeline Value</div>
                <div className="text-2xl font-bold">$12,450</div>
                <div className="text-xs text-muted-foreground">28 active deals</div>
              </div>

              {/* Before/After */}
              <div className="mt-6 pt-4 border-t border-border/50">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-red-500/10">
                    <div className="text-xs text-muted-foreground mb-1">Before Mixxclub</div>
                    <div className="text-lg font-bold text-red-400">$0/mo</div>
                  </div>
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <div className="text-xs text-muted-foreground mb-1">With Mixxclub</div>
                    <div className="text-lg font-bold text-green-400">$4,200/mo</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <p className="text-center mt-8 text-lg text-muted-foreground">
          Your skills deserve to be{" "}
          <span className="text-green-400 font-semibold">paid.</span>
        </p>
      </div>
    </section>
  );
}
