import { Swords, Music2, Trophy, Network } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { PublicFooter } from '@/components/layouts/PublicFooter';
import { FAQSection } from '@/components/seo/FAQSection';

// Plaza components
import CommunityPlaza from '@/components/community/CommunityPlaza';
import PlazaAmbience from '@/components/community/PlazaAmbience';
import PlazaZone from '@/components/community/PlazaZone';
import PlazaCore from '@/components/community/PlazaCore';
import PlazaGateway from '@/components/community/PlazaGateway';

// Existing zone content
import BattleArenaPreview from '@/components/community/BattleArenaPreview';
import PremiereStage from '@/components/community/PremiereStage';
import DualLeaderboard from '@/components/community/DualLeaderboard';
import ConnectionWeb from '@/components/community/ConnectionWeb';

// Background asset
import communityPlazaBg from '@/assets/community-plaza.jpg';

export default function Community() {
  return (
    <>
      <SEOHead
        title="Community Plaza"
        description="Enter the Community Plaza. Connect with artists, engineers, and producers. Join battles, view leaderboards, and engage with the music community."
        keywords="music community, artist collaboration, beat battles, leaderboards"
      />

      <CommunityPlaza backgroundAsset={communityPlazaBg}>
        {/* Ambient particles */}
        <PlazaAmbience />
        
        {/* Central stats hub */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-12">
          <PlazaCore />
        </div>
        
        {/* Zone grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-6 mb-12">
          {/* Arena Zone */}
          <PlazaZone 
            id="arena" 
            title="The Arena" 
            icon={<Swords className="w-6 h-6" />}
            glowColor="primary"
            delay={0.2}
          >
            <BattleArenaPreview />
          </PlazaZone>
          
          {/* Stage Zone */}
          <PlazaZone 
            id="stage" 
            title="Premiere Stage" 
            icon={<Music2 className="w-6 h-6" />}
            glowColor="accent-cyan"
            delay={0.3}
          >
            <PremiereStage />
          </PlazaZone>
          
          {/* Leaderboard Zone */}
          <PlazaZone 
            id="leaderboard" 
            title="Leaderboards" 
            icon={<Trophy className="w-6 h-6" />}
            glowColor="primary"
            delay={0.4}
          >
            <DualLeaderboard />
          </PlazaZone>
          
          {/* Network Zone */}
          <PlazaZone 
            id="network" 
            title="The Network" 
            icon={<Network className="w-6 h-6" />}
            glowColor="accent-cyan"
            delay={0.5}
          >
            <ConnectionWeb />
          </PlazaZone>
        </div>
        
        {/* Gateway */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <PlazaGateway />
        </div>

        {/* FAQ */}
        <div className="py-16 px-6">
          <FAQSection
            faqs={[
              { question: 'What are beat battles and how do I participate?', answer: 'Beat battles are community competitions where producers submit instrumentals and the community votes for the winner. Battles run on a seasonal schedule with prize pools in MixxCoinz and cash. Anyone with an account can vote; producers need a verified account to submit entries.' },
              { question: 'How do leaderboards work?', answer: 'Mixxclub maintains dual leaderboards: one for overall engagement (combining uploads, collaborations, and community activity) and one for battle performance. Rankings reset each season, with top performers earning trophies and permanent profile badges.' },
              { question: 'Can I connect and collaborate with other users?', answer: 'Yes. The Network zone lets you discover and connect with artists, engineers, producers, and fans. You can send collaboration requests, share tracks for feedback, and build a professional network within the platform.' },
              { question: 'What are community missions?', answer: 'Missions are structured activities that reward MixxCoinz — things like "Upload your first track," "Complete 3 collaborations," or "Vote in 5 beat battles." Missions rotate weekly and scale in difficulty and reward value as you progress.' },
            ]}
            title="Community Questions"
          />
        </div>
        
        <PublicFooter />
      </CommunityPlaza>
    </>
  );
}
