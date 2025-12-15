import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ParticleBackground } from "@/components/home/2030/ParticleBackground";
import { AudioReactiveHero } from "@/components/landing/AudioReactiveHero";
import { FloatingPrimeChat } from "@/components/landing/FloatingPrimeChat";
import { LiveAIMasteringDemo } from "@/components/landing/LiveAIMasteringDemo";
import { EngineerMatchingDemo } from "@/components/landing/EngineerMatchingDemo";
import { RevenueStreamsDemo } from "@/components/landing/RevenueStreamsDemo";
import { FullWidthVisualizer } from "@/components/landing/FullWidthVisualizer";
import { FeatureVideoPreview } from "@/components/landing/FeatureVideoPreview";
import { RolePortals } from "@/components/landing/RolePortals";
import { ScrollRevealSection } from "@/components/landing/ScrollRevealSection";
import { PulsingCTA } from "@/components/landing/PulsingCTA";

export default function PrimeLanding() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-foreground overflow-hidden relative">
      {/* Particle Network Background */}
      <ParticleBackground />
      
      {/* Audio-Reactive Hero Section */}
      <AudioReactiveHero />

      {/* Interactive Feature Demos Section */}
      <section className="relative px-6 py-24 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <ScrollRevealSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">See It In Action</h2>
            <p className="text-xl text-muted-foreground">Interactive demos - click to experience</p>
          </ScrollRevealSection>

          <div className="grid md:grid-cols-3 gap-8">
            <ScrollRevealSection delay={0.1} direction="up">
              <LiveAIMasteringDemo />
            </ScrollRevealSection>
            <ScrollRevealSection delay={0.2} direction="up">
              <EngineerMatchingDemo />
            </ScrollRevealSection>
            <ScrollRevealSection delay={0.3} direction="up">
              <RevenueStreamsDemo />
            </ScrollRevealSection>
          </div>
        </div>
      </section>

      {/* Full Width Audio Visualizer */}
      <ScrollRevealSection>
        <FullWidthVisualizer />
      </ScrollRevealSection>

      {/* Feature Video Previews */}
      <ScrollRevealSection delay={0.1}>
        <FeatureVideoPreview />
      </ScrollRevealSection>

      {/* Role Selection Portals */}
      <ScrollRevealSection delay={0.2}>
        <RolePortals />
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
                Ready to Transform Your Sound?
              </h2>
              <p className="text-xl text-muted-foreground mb-10">
                Join thousands of artists and engineers creating the future of music
              </p>
              <Link to="/auth?mode=signup">
                <PulsingCTA text="Enter MixClub" icon="sparkles" />
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
