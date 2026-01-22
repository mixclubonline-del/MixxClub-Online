/**
 * Information Scene
 * 
 * The third phase of the home flow - detailed information and social proof.
 * Displays the pitch content for users who want to learn more.
 */

import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { ScrollRevealSection } from '@/components/landing/ScrollRevealSection';
import { ProblemStatementAnimated } from '@/components/home/ProblemStatementAnimated';
import { SessionPreview } from '@/components/home/SessionPreview';
import { StudioPreview } from '@/components/home/StudioPreview';
import { TransformationDemo } from '@/components/home/TransformationDemo';
import { RevenuePreview } from '@/components/home/RevenuePreview';
import { SocialProofSection } from '@/components/home/SocialProofSection';
import { NetworkExplainer } from '@/components/home/NetworkExplainer';
import { RoleGateway } from '@/components/home/RoleGateway';
import { HomeFooter } from '@/components/home/HomeFooter';

interface InformationSceneProps {
  onBack?: () => void;
}

export function InformationScene({ onBack }: InformationSceneProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Back Button */}
      {onBack && (
        <motion.button
          onClick={onBack}
          className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-md border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">Back to Demo</span>
        </motion.button>
      )}

      {/* Hero */}
      <section className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            className="text-4xl md:text-6xl font-black mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-cyan-500">
              Everything You Need to Know
            </span>
          </motion.h1>
          <motion.p 
            className="text-xl text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            The full story behind MixxClub
          </motion.p>
        </div>
      </section>

      {/* Problem Statement */}
      <ScrollRevealSection>
        <ProblemStatementAnimated />
      </ScrollRevealSection>

      {/* Session Preview */}
      <ScrollRevealSection delay={0.1}>
        <SessionPreview />
      </ScrollRevealSection>

      {/* Transformation Demo */}
      <ScrollRevealSection delay={0.1}>
        <TransformationDemo />
      </ScrollRevealSection>

      {/* Studio Preview */}
      <ScrollRevealSection delay={0.1}>
        <StudioPreview />
      </ScrollRevealSection>

      {/* Revenue Preview */}
      <ScrollRevealSection delay={0.1}>
        <RevenuePreview />
      </ScrollRevealSection>

      {/* Social Proof */}
      <ScrollRevealSection delay={0.1}>
        <SocialProofSection />
      </ScrollRevealSection>

      {/* Network Explainer */}
      <ScrollRevealSection delay={0.1}>
        <NetworkExplainer />
      </ScrollRevealSection>

      {/* Role Gateway */}
      <ScrollRevealSection delay={0.1}>
        <RoleGateway />
      </ScrollRevealSection>

      {/* Footer */}
      <HomeFooter />
    </div>
  );
}
