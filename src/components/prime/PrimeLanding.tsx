import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ParticleBackground } from "@/components/home/2030/ParticleBackground";
import { NetworkConstellationHero } from "@/components/home/NetworkConstellationHero";
import { NetworkExplainer } from "@/components/home/NetworkExplainer";
import { CityPreview } from "@/components/home/CityPreview";
import { LiveActivityTicker } from "@/components/home/LiveActivityTicker";
import { FloatingPrimeChat } from "@/components/landing/FloatingPrimeChat";
import { ScrollRevealSection } from "@/components/landing/ScrollRevealSection";
import { PulsingCTA } from "@/components/landing/PulsingCTA";

export default function PrimeLanding() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-foreground overflow-hidden relative">
      {/* Particle Network Background */}
      <ParticleBackground />
      
      {/* Network Constellation Hero */}
      <NetworkConstellationHero />

      {/* Network Explainer - The Connection Story */}
      <ScrollRevealSection>
        <NetworkExplainer />
      </ScrollRevealSection>

      {/* Live Activity Ticker */}
      <ScrollRevealSection delay={0.1}>
        <div className="py-8 px-6">
          <LiveActivityTicker />
        </div>
      </ScrollRevealSection>

      {/* City Preview */}
      <ScrollRevealSection delay={0.2}>
        <CityPreview />
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
