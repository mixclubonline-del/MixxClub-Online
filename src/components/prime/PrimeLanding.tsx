import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ParticleBackground } from "@/components/home/2030/ParticleBackground";
import { AudioReactiveHero } from "@/components/landing/AudioReactiveHero";
import { FloatingPrimeChat } from "@/components/landing/FloatingPrimeChat";
import { LiveAIMasteringDemo } from "@/components/landing/LiveAIMasteringDemo";
import { EngineerMatchingDemo } from "@/components/landing/EngineerMatchingDemo";
import { RevenueStreamsDemo } from "@/components/landing/RevenueStreamsDemo";
import { FullWidthVisualizer } from "@/components/landing/FullWidthVisualizer";
import { FeatureVideoPreview } from "@/components/landing/FeatureVideoPreview";
import { RolePortals } from "@/components/landing/RolePortals";
import { Button } from "@/components/ui/button";


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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">See It In Action</h2>
            <p className="text-xl text-muted-foreground">Interactive demos - click to experience</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <LiveAIMasteringDemo />
            <EngineerMatchingDemo />
            <RevenueStreamsDemo />
          </div>
        </div>
      </section>

      {/* Full Width Audio Visualizer */}
      <FullWidthVisualizer />

      {/* Feature Video Previews */}
      <FeatureVideoPreview />

      {/* Role Selection Portals */}
      <RolePortals />

      {/* Footer CTA */}
      <section className="relative px-6 py-24 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
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
              <Button size="lg" className="group bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-cyan))] hover:shadow-[0_0_80px_hsl(var(--primary)/0.8)] transition-all border border-[hsl(var(--primary)/0.3)]">
                <span className="flex items-center gap-2 font-semibold">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Floating Prime Chat Widget */}
      <FloatingPrimeChat />
    </div>
  );
}
