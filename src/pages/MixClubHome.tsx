import { Helmet } from 'react-helmet-async';
import { FeatureHub } from '@/components/mixclub/FeatureHub';
import { MissionSection } from '@/components/mixclub/MissionSection';
import { CTASection } from '@/components/mixclub/CTASection';
import GlobalHeader from '@/components/GlobalHeader';
import NeuralHub from '@/components/mixclub/NeuralHub';

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

      <div className="min-h-screen bg-[#0a0a1a]">
        <GlobalHeader />
        <NeuralHub />
        <MissionSection />
        <FeatureHub />
        <CTASection />
      </div>
    </>
  );
}
