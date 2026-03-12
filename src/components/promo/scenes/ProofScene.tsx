import { motion } from 'framer-motion';
import { Sparkles, Users, Brain } from 'lucide-react';
import { SceneBackground } from './SceneBackground';
import funnelProofBg from '@/assets/promo/funnel-proof-bg.jpg';
import mixxcoinzHero from '@/assets/promo/mixxcoinz-hero.png';

interface Props {
  asset: { url: string | null; isVideo: boolean };
}

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI Mastering',
    desc: 'Velvet Curve masters your track in seconds — genre-aware, streaming-ready.',
  },
  {
    icon: Users,
    title: 'Engineer Matching',
    desc: 'Connect with real engineers who get your sound. Not algorithms — people.',
  },
  {
    icon: null,
    image: mixxcoinzHero,
    title: 'MixxCoinz Economy',
    desc: 'Earn, spend, unlock — a creator economy built for artists, not advertisers.',
  },
  {
    icon: Brain,
    title: 'Prime AI',
    desc: 'Your personal A&R, mixing coach, and career guide — always in your corner.',
  },
];

export function ProofScene({ asset }: Props) {
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center">
      <SceneBackground asset={asset} fallbackSrc={funnelProofBg} />
      <div className="relative z-10 px-4 w-full max-w-md mx-auto">
        <div className="rounded-2xl bg-black/70 backdrop-blur-xl border border-white/10 p-6 space-y-6">
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

          {/* Feature cards */}
          <div className="space-y-3">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.2, duration: 0.5 }}
                className="flex items-start gap-3 rounded-xl bg-white/5 border border-white/10 p-3"
              >
                <div className="shrink-0 w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{title}</p>
                  <p className="text-xs text-white/60 leading-relaxed mt-0.5">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

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
