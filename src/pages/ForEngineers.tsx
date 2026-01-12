import { 
  Video, 
  Zap, 
  DollarSign, 
  Users, 
  Award,
  TrendingUp,
  Globe,
  CheckCircle2,
  ArrowRight,
  Sliders,
  Briefcase,
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { LandingPortal } from "@/components/landing/LandingPortal";
import { PortalHero } from "@/components/landing/PortalHero";
import { FeatureGlassCards } from "@/components/landing/FeatureGlassCards";
import { PortalInvitation } from "@/components/landing/PortalInvitation";
import { FoundingBanner } from "@/components/landing/FoundingBanner";
import { ScrollRevealSection } from "@/components/landing/ScrollRevealSection";
import { RevenuePreview } from "@/components/home/RevenuePreview";
import { StudioPreview } from "@/components/home/StudioPreview";
import portalEngineerImage from "@/assets/portal-engineer.jpg";

export default function ForEngineers() {
  const stats = [
    { value: "$4,200", label: "Avg Monthly Earnings" },
    { value: "10", label: "Revenue Streams" },
    { value: "85%", label: "Max Revenue Split" },
    { value: "2,500+", label: "Engineers Earning" },
  ];

  const tiers = [
    {
      tier: "Bronze",
      split: "70%",
      requirements: ["New engineers", "Basic remote tools"],
      color: "from-orange-600 to-orange-400"
    },
    {
      tier: "Silver", 
      split: "75%",
      requirements: ["3+ months", "4.0+ rating"],
      color: "from-slate-400 to-slate-300"
    },
    {
      tier: "Gold",
      split: "80%",
      requirements: ["6+ months", "4.5+ rating", "20+ projects"],
      color: "from-yellow-600 to-yellow-400"
    },
    {
      tier: "Platinum",
      split: "85%",
      requirements: ["1+ year", "4.8+ rating", "50+ projects"],
      color: "from-purple-600 to-purple-400"
    }
  ];

  const crmFeatures = [
    { icon: BarChart3, title: "Dashboard", description: "Real-time business metrics and earnings" },
    { icon: Users, title: "Clients Hub", description: "Full CRM with deal pipeline" },
    { icon: DollarSign, title: "Revenue Hub", description: "Track all 10 revenue streams" },
    { icon: Video, title: "Sessions", description: "Manage live collaboration sessions" },
    { icon: Globe, title: "Opportunities", description: "Browse and bid on projects" },
    { icon: Award, title: "Growth Hub", description: "Level up with coaching and goals" },
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

      {/* Revenue Tiers Section */}
      <section className="py-24 px-6 relative">
        <div className="container mx-auto max-w-6xl">
          <ScrollRevealSection className="text-center mb-12">
            <Badge 
              variant="outline" 
              className="mb-4 bg-background/30 backdrop-blur-md border-white/20"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Revenue Tiers
            </Badge>
            <h2 className="text-4xl font-bold mb-4">Industry-Leading Splits</h2>
            <p className="text-xl text-muted-foreground">
              Grow your career and increase your earnings
            </p>
          </ScrollRevealSection>

          <div className="grid md:grid-cols-4 gap-6">
            {tiers.map((tier, i) => (
              <ScrollRevealSection key={i} delay={i * 0.1}>
                <motion.div
                  className="relative p-6 rounded-2xl bg-background/40 backdrop-blur-md border border-white/10 overflow-hidden hover:shadow-lg transition-all"
                  whileHover={{ y: -4 }}
                >
                  <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${tier.color}`} />
                  <h3 className="text-2xl font-bold mb-2 mt-2">{tier.tier}</h3>
                  <div className="text-4xl font-bold text-secondary mb-4">{tier.split}</div>
                  <ul className="space-y-2">
                    {tier.requirements.map((req, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </ScrollRevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* CRM Preview Section */}
      <FeatureGlassCards
        badge={{ icon: <Briefcase className="w-4 h-4" />, text: "Your Business HQ" }}
        title="This is YOUR Engineer CRM"
        subtitle="Everything you need to run your audio business."
        features={crmFeatures}
        variant="engineer"
      />

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
