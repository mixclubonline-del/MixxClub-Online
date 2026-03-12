// Cinematic urban+studio backgrounds v2
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SceneBackground } from './SceneBackground';
import funnelProofBg from '@/assets/promo/funnel-proof-bg.jpg';

// Screenshot imports
import beforeAfterMaster from '@/assets/promo/before-after-master.jpg';
import dawInterfaceHero from '@/assets/promo/daw-interface-hero.jpg';
import primebotAvatar from '@/assets/promo/primebot-avatar.jpg';
import artistEngineerMatch from '@/assets/promo/artist-engineer-match.jpg';
import webrtcCollaboration from '@/assets/promo/webrtc-collaboration.jpg';
import mixingCollaboration from '@/assets/promo/mixing-collaboration.jpg';
import mixxcoinzHero from '@/assets/promo/mixxcoinz-hero.png';
import studioConsoleHero from '@/assets/promo/studio-console-hero.jpg';
import artistReleaseGrowth from '@/assets/promo/artist-release-growth.jpg';

interface Props {
  asset: { url: string | null; isVideo: boolean };
}

type TabId = 'create' | 'connect' | 'earn';

interface Feature {
  image: string;
  title: string;
  desc: string;
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'create', label: 'Create' },
  { id: 'connect', label: 'Connect' },
  { id: 'earn', label: 'Earn' },
];

const FEATURES: Record<TabId, Feature[]> = {
  create: [
    { image: beforeAfterMaster, title: 'AI Mastering', desc: 'Velvet Curve masters your track in seconds — genre-aware, streaming-ready.' },
    { image: dawInterfaceHero, title: 'Hybrid DAW', desc: 'F.L.O.W. Studio: a sentient DAW that adapts to your workflow, not the other way around.' },
    { image: primebotAvatar, title: 'Prime AI', desc: 'Your personal A&R, mixing coach, and career guide — always in your corner.' },
  ],
  connect: [
    { image: artistEngineerMatch, title: 'Engineer Matching', desc: 'Connect with real engineers who get your sound. Not algorithms — people.' },
    { image: webrtcCollaboration, title: 'Real-Time Collabs', desc: 'Record, mix, and produce together in real time — zero latency, full creative freedom.' },
    { image: mixingCollaboration, title: 'Battle Tournaments', desc: 'Compete head-to-head in mixing battles. Win MixxCoinz, earn clout, level up.' },
  ],
  earn: [
    { image: mixxcoinzHero, title: 'MixxCoinz Economy', desc: 'Earn, spend, unlock — a creator economy built for artists, not advertisers.' },
    { image: studioConsoleHero, title: 'Beat Marketplace', desc: 'Sell beats, stems, and presets directly. Keep more of what you earn.' },
    { image: artistReleaseGrowth, title: 'Distribution Hub', desc: 'Release to every platform. Track royalties. Own your masters.' },
  ],
};

const AUTO_MS = 3000;

export function ProofScene({ asset }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('create');
  const [userOverride, setUserOverride] = useState(false);

  const advanceTab = useCallback(() => {
    setActiveTab((prev) => {
      const idx = TABS.findIndex((t) => t.id === prev);
      return TABS[(idx + 1) % TABS.length].id;
    });
  }, []);

  // Auto-cycle unless user tapped
  useEffect(() => {
    if (userOverride) return;
    const timer = setTimeout(advanceTab, AUTO_MS);
    return () => clearTimeout(timer);
  }, [activeTab, userOverride, advanceTab]);

  // Reset override after 10s of inactivity
  useEffect(() => {
    if (!userOverride) return;
    const reset = setTimeout(() => setUserOverride(false), 10000);
    return () => clearTimeout(reset);
  }, [userOverride, activeTab]);

  const handleTabClick = (id: TabId) => {
    setActiveTab(id);
    setUserOverride(true);
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center">
      <SceneBackground asset={asset} fallbackSrc={funnelProofBg} />
      <div className="relative z-10 px-4 w-full max-w-md mx-auto">
        <div className="rounded-2xl bg-black/70 backdrop-blur-xl border border-white/10 p-6 space-y-5">
          {/* Logo */}
          <motion.img
            src="/mixxclub-3d-logo.png"
            alt="Mixxclub"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="h-12 mx-auto object-contain drop-shadow-[0_0_20px_rgba(var(--primary),0.4)]"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl sm:text-4xl font-black uppercase text-center text-white tracking-tight leading-tight"
          >
            This is{' '}
            <span className="text-primary">Mixxclub.</span>
          </motion.h2>

          {/* Tabs */}
          <div className="flex gap-2 justify-center">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-[0_0_16px_hsl(var(--primary)/0.4)]'
                    : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Feature cards */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {FEATURES[activeTab].map((feat, i) => (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.35 }}
                  className="flex items-start gap-3 rounded-xl bg-white/5 border border-white/10 p-3"
                >
                  <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden ring-1 ring-white/10">
                    <img
                      src={feat.image}
                      alt={feat.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">{feat.title}</p>
                    <p className="text-xs text-white/60 leading-relaxed mt-0.5">{feat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Closing */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="text-center text-sm font-bold text-white/80"
          >
            Everything independent artists need.{' '}
            <span className="text-primary">Nothing they don't.</span>
          </motion.p>
        </div>
      </div>
    </div>
  );
}
