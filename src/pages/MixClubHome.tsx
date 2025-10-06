import { Helmet } from 'react-helmet-async';
import { NetworkHero } from '@/components/mixclub/NetworkHero';
import { FeatureHub } from '@/components/mixclub/FeatureHub';
import { MissionSection } from '@/components/mixclub/MissionSection';
import { CTASection } from '@/components/mixclub/CTASection';
import GlobalHeader from '@/components/GlobalHeader';

export default function MixClubHome() {
  return (
    <>
      <Helmet>
        <title>MixClub Online — The Future of Music Collaboration</title>
        <meta 
          name="description" 
          content="Transform home-recorded tracks into radio-ready songs. AI-driven music platform where artists and engineers collaborate, compete, and create together." 
        />
        <meta name="keywords" content="music mixing, AI mastering, audio engineering, music collaboration, mix battles, plugin presets" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background via-[hsl(265_50%_10%)] to-background">
        {/* Animated background grid */}
        <div className="fixed inset-0 bg-[linear-gradient(to_right,hsl(235_40%_20%/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(235_40%_20%/0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        <GlobalHeader />
        <NetworkHero />
        <MissionSection />
        <FeatureHub />
        <CTASection />
      </div>
    </>
  );
}
