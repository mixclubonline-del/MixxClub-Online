/**
 * StageReveal - Phase 7: "Go Live. Get Heard."
 * Simulated live broadcast frame with viewer count,
 * floating emoji reactions, chat ticker. Audio-reactive border.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Heart, Flame, Sparkles, MessageCircle, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';

interface StageRevealProps {
  amplitude: number;
  bass: number;
  isPlaying: boolean;
}

const REACTIONS = ['🔥', '❤️', '🎶', '💯', '🙌', '✨', '🎧', '💜'];

const CHAT_MESSAGES = [
  { user: 'DJ_Nova', msg: 'This beat is INSANE 🔥' },
  { user: 'VocalQueen', msg: 'Collab?? Drop your link!' },
  { user: 'BassHead_ATL', msg: 'That 808 pattern tho 💀' },
  { user: 'MelodyMaker', msg: 'Premier vibes right here' },
  { user: 'StudioRat', msg: 'Mix is clean. What monitors?' },
  { user: 'BeatSmith_UK', msg: 'Need this on streaming ASAP' },
];

const FEATURES = [
  { icon: Radio, label: 'Live Sessions' },
  { icon: Heart, label: 'Fan Reactions' },
  { icon: Sparkles, label: 'Premiere Drops' },
];

export const StageReveal = ({ amplitude, bass, isPlaying }: StageRevealProps) => {
  const [viewerCount, setViewerCount] = useState(847);
  const [chatIndex, setChatIndex] = useState(0);
  const [floatingReactions, setFloatingReactions] = useState<{ id: number; emoji: string; x: number }[]>([]);

  // Tick up viewer count
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 5) + 1);
    }, 1200);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Cycle chat messages
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setChatIndex(prev => (prev + 1) % CHAT_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Spawn floating reactions
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const emoji = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
      const x = 30 + Math.random() * 40;
      setFloatingReactions(prev => [...prev.slice(-8), { id: Date.now(), emoji, x }]);
    }, 800);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <motion.div
      className="relative w-full max-w-5xl mx-auto text-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      {/* Headline */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-pink-500/20 border border-pink-500/40 mb-4"
          animate={{
            boxShadow: isPlaying
              ? `0 0 ${20 + (bass / 255) * 25}px rgba(236, 72, 153, 0.4)`
              : 'none',
          }}
        >
          <Radio className="w-7 h-7 text-pink-400" />
        </motion.div>

        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-black mb-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400">
            Go Live. Get Heard.
          </span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Stream your session. Premiere your track. Let fans react in real-time. The stage is always open.
        </motion.p>
      </motion.div>

      {/* Broadcast Frame */}
      <motion.div
        className="rounded-2xl bg-background/60 backdrop-blur-md border-2 border-pink-500/30 p-1 relative overflow-hidden mb-8 max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        style={{
          boxShadow: isPlaying
            ? `0 0 ${15 + (bass / 255) * 30}px rgba(236, 72, 153, 0.25), inset 0 0 ${10 + (bass / 255) * 15}px rgba(236, 72, 153, 0.1)`
            : undefined,
        }}
      >
        {/* Simulated broadcast content */}
        <div className="aspect-video rounded-xl bg-gradient-to-br from-pink-950/60 via-background to-purple-950/60 relative overflow-hidden">
          {/* LIVE badge */}
          <motion.div
            className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600/90 text-white text-xs font-bold"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            LIVE
          </motion.div>

          {/* Viewer count */}
          <motion.div
            className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/60 backdrop-blur-sm text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <Eye className="w-3.5 h-3.5 text-pink-400" />
            <span className="font-mono text-foreground/80">{viewerCount.toLocaleString()}</span>
          </motion.div>

          {/* Waveform animation in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex gap-1 h-16">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 rounded-full bg-gradient-to-t from-pink-500 to-fuchsia-400"
                  animate={{
                    scaleY: isPlaying
                      ? 0.15 + Math.sin(Date.now() / 200 + i * 0.8) * 0.3 + (amplitude / 255) * 0.5
                      : 0.15,
                  }}
                  style={{ originY: '50%' }}
                  transition={{ duration: 0.1 }}
                />
              ))}
            </div>
          </div>

          {/* Floating reactions */}
          <div className="absolute bottom-0 left-0 right-0 h-full pointer-events-none">
            <AnimatePresence>
              {floatingReactions.map(r => (
                <motion.span
                  key={r.id}
                  className="absolute text-2xl"
                  style={{ left: `${r.x}%`, bottom: '10%' }}
                  initial={{ opacity: 1, y: 0, scale: 0.5 }}
                  animate={{ opacity: 0, y: -200, scale: 1.2 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                >
                  {r.emoji}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>

          {/* Chat ticker at bottom */}
          <motion.div
            className="absolute bottom-4 left-4 right-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={chatIndex}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50 backdrop-blur-sm text-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <MessageCircle className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
                <span className="font-semibold text-foreground/70 text-xs">{CHAT_MESSAGES[chatIndex].user}</span>
                <span className="text-muted-foreground text-xs truncate">{CHAT_MESSAGES[chatIndex].msg}</span>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>

      {/* Feature Pills */}
      <motion.div
        className="flex flex-wrap justify-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
      >
        {FEATURES.map((feat, i) => {
          const Icon = feat.icon;
          return (
            <motion.div
              key={feat.label}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/30 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2 + i * 0.15 }}
            >
              <Icon className="w-4 h-4 text-pink-400" />
              <span className="text-sm text-foreground/80">{feat.label}</span>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};
