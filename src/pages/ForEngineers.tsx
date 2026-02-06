import { 
  Video, 
  Zap, 
  DollarSign, 
  Users, 
  Award,
  TrendingUp,
  Globe,
  ArrowRight,
  Sliders,
  Briefcase,
  BarChart3
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LandingPortal } from "@/components/landing/LandingPortal";
import { PortalHero } from "@/components/landing/PortalHero";
import { ShowcaseFeature } from "@/components/services/ShowcaseFeature";
import { PortalInvitation } from "@/components/landing/PortalInvitation";
import { FoundingBanner } from "@/components/landing/FoundingBanner";
import { ScrollRevealSection } from "@/components/landing/ScrollRevealSection";
import { RevenuePreview } from "@/components/home/RevenuePreview";
import { StudioPreview } from "@/components/home/StudioPreview";
import portalEngineerImage from "@/assets/portal-engineer.jpg";

// Engineer Images
import engineerRevenueStreams from "@/assets/promo/engineer-revenue-streams.jpg";
import engineerClientPipeline from "@/assets/promo/engineer-client-pipeline.jpg";
import engineerOpportunities from "@/assets/promo/engineer-opportunities.jpg";
import engineerTierProgression from "@/assets/promo/engineer-tier-progression.jpg";
import engineerGrowthCoaching from "@/assets/promo/engineer-growth-coaching.jpg";
import engineerWorkspaceHero from "@/assets/promo/engineer-workspace-hero.jpg";

export default function ForEngineers() {
  const stats = [
    { value: "$4,200", label: "Avg Monthly Earnings" },
    { value: "10", label: "Revenue Streams" },
    { value: "85%", label: "Max Revenue Split" },
    { value: "2,500+", label: "Engineers Earning" },
  ];

  const businessFeatures = [
    {
      image: engineerRevenueStreams,
      icon: DollarSign,
      title: "10 Revenue Streams",
      subtitle: "Multiple Income Sources",
      description: "Diversify your income with mixing, mastering, consulting, courses, sample packs, and more. Our platform maximizes every opportunity to earn.",
      stats: [
        { label: "Streams", value: "10" },
        { label: "Avg/Month", value: "$4,200" },
        { label: "Top Earners", value: "$15K+" }
      ],
      techDetails: ["Mixing", "Mastering", "Consulting", "Courses", "Sample Packs"]
    },
    {
      image: engineerTierProgression,
      icon: TrendingUp,
      title: "Industry-Leading Splits",
      subtitle: "Tier Progression",
      description: "Start at 70% and climb to 85% as you grow. Our tier system rewards consistency, quality, and client satisfaction with increasing revenue share.",
      stats: [
        { label: "Bronze", value: "70%" },
        { label: "Silver", value: "75%" },
        { label: "Platinum", value: "85%" }
      ],
      techDetails: ["Bronze → Silver → Gold → Platinum", "Performance Bonuses", "Locked Rates"]
    },
    {
      image: engineerClientPipeline,
      icon: Users,
      title: "Full CRM Pipeline",
      subtitle: "Client Management",
      description: "Manage your entire client pipeline from lead to closed deal. Track every interaction, set follow-ups, and never lose a potential project.",
      stats: [
        { label: "Pipeline Stages", value: "6" },
        { label: "Auto-Reminders", value: "✓" },
        { label: "Win Rate", value: "+40%" }
      ],
      techDetails: ["Deal Pipeline", "Client Cards", "Interaction History", "Auto Follow-Up"]
    },
    {
      image: engineerOpportunities,
      icon: Globe,
      title: "Global Opportunity Board",
      subtitle: "Find Projects Worldwide",
      description: "Access projects from artists around the world. Filter by genre, budget, timeline, and style. Submit proposals and grow your international client base.",
      stats: [
        { label: "Daily Projects", value: "200+" },
        { label: "Countries", value: "50+" },
        { label: "Genres", value: "All" }
      ],
      techDetails: ["AI Matching", "Genre Filters", "Budget Ranges", "Proposal Templates"]
    },
    {
      image: engineerWorkspaceHero,
      icon: BarChart3,
      title: "Business Dashboard",
      subtitle: "Your Command Center",
      description: "See everything at a glance: earnings, active projects, client health, and growth metrics. Make data-driven decisions to scale your audio business.",
      stats: [
        { label: "Metrics", value: "30+" },
        { label: "Reports", value: "Weekly" },
        { label: "Forecasting", value: "AI" }
      ],
      techDetails: ["Live Analytics", "Revenue Tracking", "Client Insights", "Goal Tracking"]
    },
    {
      image: engineerGrowthCoaching,
      icon: Award,
      title: "Growth Academy",
      subtitle: "Level Up Your Skills",
      description: "Access mentorship, courses, and coaching to improve your craft and business acumen. Set goals, track progress, and unlock your full potential.",
      stats: [
        { label: "Courses", value: "50+" },
        { label: "Mentors", value: "Verified" },
        { label: "Certifications", value: "Industry" }
      ],
      techDetails: ["Skill Tracking", "Goal Setting", "Peer Coaching", "Certifications"]
    }
  ];

  return (
    <LandingPortal backgroundImage={portalEngineerImage} variant="engineer">
      {/* Founding Engineer Banner */}
      <FoundingBanner
        icon={<Award className="w-6 h-6 text-purple-400" />}
        text="⚡ Founding Engineer Program - First 50 get"
        highlight="Platinum tier locked forever"
        badge="23 spots left"
        variant="engineer"
      />

      {/* Hero Section */}
      <PortalHero
        badge={{ icon: <Sliders className="w-4 h-4" />, text: "For Engineers" }}
        title="Your Skills Deserve to Be Paid"
        subtitle="Transform your audio expertise into a thriving business with 10 revenue streams and automatic client matching."
        stats={stats}
        primaryAction={{
          text: "Start Earning Today",
          icon: <ArrowRight className="w-5 h-5" />,
          href: "/engineer-onboarding"
        }}
        secondaryAction={{
          text: "See The Technology",
          icon: <Zap className="w-5 h-5" />,
          href: "/showcase"
        }}
        variant="engineer"
      />

      {/* Revenue Streams Preview */}
      <div className="relative z-10">
        <RevenuePreview />
      </div>

      {/* Studio Preview */}
      <div className="relative z-10">
        <StudioPreview />
      </div>

      {/* Business Features Section - Upgraded to ShowcaseFeature */}
      <section className="py-24 px-6 relative">
        <div className="container mx-auto max-w-6xl">
          <ScrollRevealSection className="text-center mb-16">
            <Badge 
              variant="outline" 
              className="mb-4 bg-background/30 backdrop-blur-md border-white/20"
            >
              <Briefcase className="w-4 h-4" />
              <span className="ml-2">Your Business HQ</span>
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">This is YOUR Engineer CRM</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to run and grow your audio business.
            </p>
          </ScrollRevealSection>
          
          <div className="space-y-24">
            {businessFeatures.map((feature, index) => (
              <ShowcaseFeature
                key={feature.title}
                {...feature}
                reversed={index % 2 !== 0}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Portal Invitation */}
      <PortalInvitation
        icon={<Award className="w-10 h-10" />}
        title="Ready to Transform Your Engineering Career?"
        subtitle="Join thousands of engineers already earning more on MixClub."
        cta={{ text: "Get Started Now", href: "/engineer-onboarding" }}
        variant="engineer"
        disclaimer="No setup fees • Keep 70-85% of earnings • Instant payouts"
      />
    </LandingPortal>
  );
}
