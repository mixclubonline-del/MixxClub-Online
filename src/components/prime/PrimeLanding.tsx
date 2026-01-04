import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ParticleBackground } from "@/components/home/2030/ParticleBackground";
import { NetworkConstellationHero } from "@/components/home/NetworkConstellationHero";
import { NetworkExplainer } from "@/components/home/NetworkExplainer";
import { LiveActivityTicker } from "@/components/home/LiveActivityTicker";
import { FloatingPrimeChat } from "@/components/landing/FloatingPrimeChat";
import { ScrollRevealSection } from "@/components/landing/ScrollRevealSection";
import { PulsingCTA } from "@/components/landing/PulsingCTA";
import { ThreeStories } from "@/components/waitlist/ThreeStories";
import { ProblemStatementAnimated } from "@/components/home/ProblemStatementAnimated";
import { SessionPreview } from "@/components/home/SessionPreview";
import { StudioPreview } from "@/components/home/StudioPreview";
import { TransformationDemo } from "@/components/home/TransformationDemo";
import { RevenuePreview } from "@/components/home/RevenuePreview";
import { RoleGateway } from "@/components/home/RoleGateway";

export default function PrimeLanding() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-foreground overflow-hidden relative">
      {/* Particle Network Background */}
      <ParticleBackground />
      
      {/* Network Constellation Hero */}
      <NetworkConstellationHero />

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

      {/* Network Explainer - The Connection Story */}
      <ScrollRevealSection delay={0.1}>
        <NetworkExplainer />
      </ScrollRevealSection>

      {/* Stories Carousel - Role Diversity */}
      <ScrollRevealSection delay={0.1}>
        <ThreeStories />
      </ScrollRevealSection>

      {/* Live Activity Ticker */}
      <ScrollRevealSection delay={0.1}>
        <div className="py-8 px-6">
          <LiveActivityTicker />
        </div>
      </ScrollRevealSection>

      {/* Role Gateway - Artist or Engineer */}
      <ScrollRevealSection delay={0.1}>
        <RoleGateway />
      </ScrollRevealSection>

      {/* Footer CTA */}
      <section className="relative px-6 py-24 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollRevealSection>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Your Music Deserves This
              </h2>
              <p className="text-xl text-muted-foreground mb-10">
                Join the artists and engineers building the future of hip-hop
              </p>
              <Link to="/auth?mode=signup">
                <PulsingCTA text="Find Your People" icon="sparkles" />
              </Link>
            </motion.div>
          </ScrollRevealSection>
        </div>
      </section>

      {/* Floating Prime Chat Widget */}
      <FloatingPrimeChat />
    </div>
  );
}
