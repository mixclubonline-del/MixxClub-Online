import { Lock, Unlock, Sparkles, Music2, GraduationCap, ShoppingBag, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCommunityMilestones } from "@/hooks/useCommunityMilestones";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FEATURE_FLAGS } from "@/config/featureFlags";

const tierConfig = [
  {
    tier: "base",
    title: "Available Now",
    subtitle: "Start Creating Today",
    icon: Sparkles,
    color: "primary",
    features: [
      { name: "Pro Mixing & Mastering", route: "/mixing" },
      { name: "AI-Powered Matching", route: "/artist-crm" },
      { name: "Real-Time Collaboration", route: "/artist-studio" },
      { name: "Project Management", route: "/artist-crm" },
    ],
  },
  {
    tier: 1,
    title: "Mix Battles Arena",
    subtitle: "Compete & Win Prizes",
    icon: Music2,
    color: "accent-blue",
    milestoneKey: "MIX_BATTLES_ENABLED",
    features: [
      { name: "Weekly Mix Competitions", route: "/mix-battles" },
      { name: "Tournament Brackets", route: "/mix-battles" },
      { name: "Cash Prizes & Recognition", route: "/mix-battles" },
      { name: "Community Voting", route: "/leaderboard" },
    ],
  },
  {
    tier: 2,
    title: "Knowledge Center",
    subtitle: "Learn & Advance",
    icon: GraduationCap,
    color: "success",
    milestoneKey: "EDUCATION_HUB_ENABLED",
    features: [
      { name: "Video Courses & Tutorials", route: "/education" },
      { name: "Certification Programs", route: "/my-certifications" },
      { name: "Voice Commands & Live AI", route: "/artist-studio" },
      { name: "Advanced Collaboration", route: "/artist-studio" },
    ],
  },
  {
    tier: 3,
    title: "Community Marketplace",
    subtitle: "Buy, Sell, Trade",
    icon: ShoppingBag,
    color: "warning",
    milestoneKey: "MARKETPLACE_ENABLED",
    features: [
      { name: "Sample Libraries", route: "/marketplace" },
      { name: "Preset Store", route: "/marketplace" },
      { name: "Label Services", route: "/label-services" },
      { name: "Revenue Sharing", route: "/marketplace" },
    ],
  },
  {
    tier: 4,
    title: "Pro Integrations",
    subtitle: "Connect Everything",
    icon: Zap,
    color: "accent-cyan",
    milestoneKey: "INTEGRATIONS_ENABLED",
    features: [
      { name: "DAW Plugin Integration", route: "/integrations" },
      { name: "Streaming Analytics", route: "/integrations" },
      { name: "AI Audio Intelligence", route: "/ai-audio-intelligence" },
      { name: "API Access", route: "/integrations" },
    ],
  },
];

export const TierShowcase = () => {
  const { data: milestones } = useCommunityMilestones();
  const navigate = useNavigate();

  const getTierStatus = (tier: typeof tierConfig[0]) => {
    if (tier.tier === "base") return { unlocked: true, progress: 100 };
    
    const milestone = milestones?.find(m => m.feature_key === tier.milestoneKey);
    return {
      unlocked: milestone?.is_unlocked || false,
      progress: milestone?.progress_percentage || 0,
      targetUsers: milestone?.target_value || 0,
    };
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-black mb-4">
          <span className="bg-gradient-to-r from-primary via-accent-blue to-accent-cyan bg-clip-text text-transparent">
            Your Journey Starts Here
          </span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Every feature unlocked by the community, for the community
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tierConfig.map((tier, index) => {
          const status = getTierStatus(tier);
          const Icon = tier.icon;
          const isLocked = !status.unlocked;

          return (
            <motion.div
              key={tier.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`
                relative overflow-hidden h-full
                ${isLocked ? 'opacity-75' : ''}
                border-2 transition-all duration-300 hover:scale-105
                ${tier.color === 'primary' ? 'border-primary/50 hover:border-primary' : ''}
                ${tier.color === 'accent-blue' ? 'border-accent-blue/50 hover:border-accent-blue' : ''}
                ${tier.color === 'success' ? 'border-success/50 hover:border-success' : ''}
                ${tier.color === 'warning' ? 'border-warning/50 hover:border-warning' : ''}
                ${tier.color === 'accent-cyan' ? 'border-accent-cyan/50 hover:border-accent-cyan' : ''}
                glass-studio
              `}>
                {/* Header */}
                <div className="p-6 pb-4 border-b border-border/50">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`
                      w-14 h-14 rounded-2xl flex items-center justify-center
                      ${tier.color === 'primary' ? 'bg-primary/20' : ''}
                      ${tier.color === 'accent-blue' ? 'bg-accent-blue/20' : ''}
                      ${tier.color === 'success' ? 'bg-success/20' : ''}
                      ${tier.color === 'warning' ? 'bg-warning/20' : ''}
                      ${tier.color === 'accent-cyan' ? 'bg-accent-cyan/20' : ''}
                    `}>
                      <Icon className={`w-7 h-7 ${isLocked ? 'text-muted-foreground' : `text-${tier.color}`}`} />
                    </div>
                    
                    <Badge variant={isLocked ? "secondary" : "default"} className="gap-1">
                      {isLocked ? (
                        <>
                          <Lock className="w-3 h-3" />
                          Locked
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3 h-3" />
                          Available
                        </>
                      )}
                    </Badge>
                  </div>

                  <h3 className="text-2xl font-bold mb-1">{tier.title}</h3>
                  <p className="text-sm text-muted-foreground">{tier.subtitle}</p>

                  {isLocked && status.targetUsers && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span>Progress</span>
                        <span>{Math.round(status.progress)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            tier.color === 'accent-blue' ? 'bg-accent-blue' :
                            tier.color === 'success' ? 'bg-success' :
                            tier.color === 'warning' ? 'bg-warning' :
                            'bg-accent-cyan'
                          }`}
                          style={{ width: `${status.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Unlocks at {status.targetUsers} members
                      </p>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="p-6 space-y-3">
                  {tier.features.map((feature) => (
                    <div
                      key={feature.name}
                      className="flex items-center gap-3 text-sm"
                    >
                      <div className={`
                        w-1.5 h-1.5 rounded-full
                        ${isLocked ? 'bg-muted-foreground' : 'bg-primary'}
                      `} />
                      <span className={isLocked ? 'text-muted-foreground' : 'text-foreground'}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="p-6 pt-0">
                  {!isLocked ? (
                    <Button
                      onClick={() => navigate(tier.features[0].route)}
                      className="w-full"
                      size="lg"
                    >
                      Explore Features
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      size="lg"
                      disabled
                    >
                      Coming Soon
                    </Button>
                  )}
                </div>

                {/* Shine effect on hover */}
                {!isLocked && (
                  <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
