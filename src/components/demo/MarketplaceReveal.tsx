/**
 * MarketplaceReveal - Phase 6: "Trade Your Sound"
 * Floating beat cards with BPM/key/genre tags, price badges,
 * and audio-reactive pulsing. Glassmorphic marketplace vibe.
 */

import { motion } from 'framer-motion';
import { Music, Tag, FileAudio, ShoppingBag } from 'lucide-react';

interface MarketplaceRevealProps {
  amplitude: number;
  bass: number;
  isPlaying: boolean;
}

const BEAT_CARDS = [
  { title: 'Midnight Haze', bpm: 142, key: 'Am', genre: 'Trap', price: '$29.99', licensed: true },
  { title: 'Golden Hour', bpm: 98, key: 'Db', genre: 'R&B', price: '$49.99', licensed: false },
  { title: 'Concrete Dreams', bpm: 130, key: 'Em', genre: 'Boom Bap', price: '$19.99', licensed: false },
  { title: 'Velvet Nights', bpm: 75, key: 'Gb', genre: 'Lo-Fi', price: '$14.99', licensed: true },
  { title: 'Thunder Road', bpm: 160, key: 'Cm', genre: 'Drill', price: '$39.99', licensed: false },
  { title: 'Silk & Steel', bpm: 110, key: 'Bb', genre: 'Neo Soul', price: '$34.99', licensed: true },
];

const CARD_POSITIONS = [
  { x: -220, y: -100, rotate: -6 },
  { x: 180, y: -80, rotate: 4 },
  { x: -160, y: 80, rotate: 3 },
  { x: 200, y: 100, rotate: -5 },
  { x: -300, y: 10, rotate: -2 },
  { x: 300, y: -10, rotate: 7 },
];

const STATS = [
  { icon: Music, label: '1,000+ Beats Listed' },
  { icon: Tag, label: 'Instant Licensing' },
  { icon: FileAudio, label: 'Stem Packs Available' },
];

export const MarketplaceReveal = ({ amplitude, bass, isPlaying }: MarketplaceRevealProps) => {
  return (
    <motion.div
      className="relative w-full max-w-5xl mx-auto text-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      {/* Headline */}
      <motion.div
        className="mb-6 relative z-20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 mb-4"
          animate={{
            boxShadow: isPlaying
              ? `0 0 ${20 + (bass / 255) * 25}px rgba(245, 158, 11, 0.4)`
              : 'none',
          }}
        >
          <ShoppingBag className="w-7 h-7 text-amber-400" />
        </motion.div>

        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-black mb-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400">
            Trade Your Sound
          </span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Buy beats. Sell beats. License stems. The marketplace where sound is currency — and every creator gets paid.
        </motion.p>
      </motion.div>

      {/* Floating Beat Cards */}
      <div className="relative w-full h-[340px] md:h-[380px] flex items-center justify-center overflow-visible mb-6">
        {BEAT_CARDS.map((beat, i) => {
          const pos = CARD_POSITIONS[i];
          return (
            <motion.div
              key={beat.title}
              className="absolute"
              style={{
                left: `calc(50% + ${pos.x}px)`,
                top: `calc(50% + ${pos.y}px)`,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ opacity: 0, scale: 0.5, rotate: pos.rotate }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: pos.rotate,
                y: isPlaying ? [0, -6, 0] : 0,
              }}
              transition={{
                opacity: { duration: 0.5, delay: 0.8 + i * 0.12 },
                scale: { duration: 0.5, delay: 0.8 + i * 0.12 },
                y: { duration: 2.5 + i * 0.2, repeat: Infinity, ease: 'easeInOut' },
              }}
            >
              <motion.div
                className="p-3 rounded-xl backdrop-blur-md border shadow-lg bg-amber-950/40 border-amber-500/25 shadow-amber-500/10 min-w-[150px]"
                animate={{
                  boxShadow: isPlaying
                    ? `0 0 ${10 + (bass / 255) * 20}px rgba(245, 158, 11, 0.2)`
                    : undefined,
                }}
                whileHover={{ scale: 1.08, zIndex: 50 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm truncate">{beat.title}</h4>
                  {beat.licensed && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Licensed
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-2">
                  <span className="px-1.5 py-0.5 rounded bg-muted/40">{beat.bpm} BPM</span>
                  <span className="px-1.5 py-0.5 rounded bg-muted/40">{beat.key}</span>
                  <span className="px-1.5 py-0.5 rounded bg-muted/40">{beat.genre}</span>
                </div>
                {/* Mini waveform */}
                <div className="flex gap-px h-3 mb-1.5">
                  {[...Array(16)].map((_, j) => (
                    <motion.div
                      key={j}
                      className="flex-1 rounded-full bg-amber-500/60"
                      animate={{
                        scaleY: isPlaying ? 0.2 + Math.sin(Date.now() / 250 + j + i) * 0.3 + (amplitude / 255) * 0.4 : 0.2,
                      }}
                      style={{ originY: 1 }}
                      transition={{ duration: 0.1 }}
                    />
                  ))}
                </div>
                <div className="text-right text-sm font-bold text-amber-400">{beat.price}</div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Feature Pills */}
      <motion.div
        className="flex flex-wrap justify-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
      >
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.2 + i * 0.15 }}
            >
              <Icon className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-foreground/80">{stat.label}</span>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};
