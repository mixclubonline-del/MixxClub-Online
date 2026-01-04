import { Helmet } from 'react-helmet-async';
import GlobalHeader from '@/components/GlobalHeader';
import { motion } from 'framer-motion';

// New Community 2030 Components
import LivePulseHero from '@/components/community/LivePulseHero';
import BattleArenaPreview from '@/components/community/BattleArenaPreview';
import PremiereStage from '@/components/community/PremiereStage';
import DualLeaderboard from '@/components/community/DualLeaderboard';
import AchievementShowcase from '@/components/community/AchievementShowcase';
import ChallengesGrid from '@/components/community/ChallengesGrid';
import ConnectionWeb from '@/components/community/ConnectionWeb';
import RoleGateway from '@/components/community/RoleGateway';

export default function Community() {
  return (
    <>
      <Helmet>
        <title>Community Hub — MixClub Online</title>
        <meta 
          name="description" 
          content="Connect with artists, engineers, and producers. Join battles, view leaderboards, and engage with the music community." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <GlobalHeader />
        
        {/* Main content with proper header offset */}
        <main className="pt-20 pb-24 md:pb-8 max-w-7xl mx-auto px-4 sm:px-6 space-y-12 lg:space-y-16">
          {/* Section 1: Live Pulse Hero */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LivePulseHero />
          </motion.section>

          {/* Section 2: The Arena */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <BattleArenaPreview />
          </motion.section>

          {/* Section 3: Premiere Stage */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <PremiereStage />
          </motion.section>

          {/* Section 4: Leaderboard + Achievements */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid lg:grid-cols-[1.5fr_1fr] gap-8"
          >
            <DualLeaderboard />
            <AchievementShowcase />
          </motion.section>

          {/* Section 5: Challenges & Unlockables */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <ChallengesGrid />
          </motion.section>

          {/* Section 6: The Network */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <ConnectionWeb />
          </motion.section>

          {/* Section 7: Role Gateway */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <RoleGateway />
          </motion.section>
        </main>
      </div>
    </>
  );
}
