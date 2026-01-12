import { NetworkExplainer } from "@/components/home/NetworkExplainer";
import { StudioHallway } from "@/components/scene/StudioHallway";
import { CommunityPulseDisplay } from "@/components/scene/CommunityPulseDisplay";

import { ScrollRevealSection } from "@/components/landing/ScrollRevealSection";
import { ProblemStatementAnimated } from "@/components/home/ProblemStatementAnimated";
import { SessionPreview } from "@/components/home/SessionPreview";
import { StudioPreview } from "@/components/home/StudioPreview";
import { TransformationDemo } from "@/components/home/TransformationDemo";
import { RevenuePreview } from "@/components/home/RevenuePreview";
import { RoleGateway } from "@/components/home/RoleGateway";
import { HomeHeroSection } from "@/components/home/HomeHeroSection";
import { LiveRoomWindow } from "@/components/home/LiveRoomWindow";
import { SocialProofSection } from "@/components/home/SocialProofSection";
import { HomeFooter } from "@/components/home/HomeFooter";
import { HomeLiveActivitySidebar } from "@/components/home/HomeLiveActivitySidebar";

export default function PrimeLanding() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
      {/* Live Activity Sidebar - Desktop only */}
      <HomeLiveActivitySidebar />

      {/* Hero Section - Above the fold */}
      <HomeHeroSection />

      {/* Living Studio Hallway - Real Data */}
      <StudioHallway />

      {/* Live Room Window - Active Sessions */}
      <ScrollRevealSection>
        <LiveRoomWindow />
      </ScrollRevealSection>

      {/* The Problem - Animated Pain Points */}
      <ScrollRevealSection>
        <ProblemStatementAnimated />
      </ScrollRevealSection>

      {/* Session Preview - Live Collaboration */}
      <ScrollRevealSection delay={0.1}>
        <SessionPreview />
      </ScrollRevealSection>

      {/* Transformation Demo - Before/After */}
      <ScrollRevealSection delay={0.1}>
        <TransformationDemo />
      </ScrollRevealSection>

      {/* Studio Preview - Browser DAW */}
      <ScrollRevealSection delay={0.1}>
        <StudioPreview />
      </ScrollRevealSection>

      {/* Revenue Preview - 10 Streams + Pipeline */}
      <ScrollRevealSection delay={0.1}>
        <RevenuePreview />
      </ScrollRevealSection>

      {/* Social Proof - Testimonials */}
      <ScrollRevealSection delay={0.1}>
        <SocialProofSection />
      </ScrollRevealSection>

      {/* Network Explainer - The Connection Story */}
      <ScrollRevealSection delay={0.1}>
        <NetworkExplainer />
      </ScrollRevealSection>

      {/* Community Pulse - Real Progress */}
      <ScrollRevealSection delay={0.1}>
        <div className="py-8 px-6">
          <CommunityPulseDisplay />
        </div>
      </ScrollRevealSection>

      {/* Role Gateway - Artist or Engineer */}
      <ScrollRevealSection delay={0.1}>
        <RoleGateway />
      </ScrollRevealSection>

      {/* Footer */}
      <HomeFooter />
    </div>
  );
}
