/**
 * MoneyReveal - Phase 8: "Get Paid. Period."
 * Revenue flow animation with streaming sources,
 * ticking stat cards, and audio-reactive money particles.
 */

import { motion } from 'framer-motion';
import { DollarSign, Music2, Shirt, Radio, FileAudio, Wallet, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

interface MoneyRevealProps {
  amplitude: number;
  bass: number;
  isPlaying: boolean;
}

const REVENUE_STREAMS = [
  { icon: Music2, label: 'Streaming', amount: '$2,847', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/30' },
  { icon: Shirt, label: 'Merch', amount: '$1,203', color: 'text-green-400', bgColor: 'bg-green-500/10 border-green-500/30' },
  { icon: FileAudio, label: 'Licensing', amount: '$3,450', color: 'text-lime-400', bgColor: 'bg-lime-500/10 border-lime-500/30' },
  { icon: Radio, label: 'Sessions', amount: '$890', color: 'text-teal-400', bgColor: 'bg-teal-500/10 border-teal-500/30' },
];

const STATS = [
  { label: 'Distribution to 150+ Platforms', icon: TrendingUp },
  { label: 'Merch Storefronts', icon: Shirt },
  { label: 'Session Payments', icon: DollarSign },
  { label: 'Royalty Tracking', icon: Music2 },
];

export const MoneyReveal = ({ amplitude, bass, isPlaying }: MoneyRevealProps) => {
  const [totalRevenue, setTotalRevenue] = useState(8390);

  // Tick up revenue when playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTotalRevenue(prev => prev + Math.floor(Math.random() * 12) + 3);
    }, 500);
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
        className="mb-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 mb-4"
          animate={{
            boxShadow: isPlaying
              ? `0 0 ${20 + (bass / 255) * 30}px rgba(16, 185, 129, 0.4)`
              : 'none',
          }}
        >
          <Wallet className="w-8 h-8 text-emerald-400" />
        </motion.div>

        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-black mb-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-400 to-lime-400">
            Get Paid. Period.
          </span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Distribution. Merch. Licensing. Session fees. Every revenue stream, one dashboard. Your money, your way.
        </motion.p>
      </motion.div>

      {/* Central Total + Revenue Stream Cards */}
      <motion.div
        className="rounded-2xl bg-background/60 backdrop-blur-md border border-border/20 p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        {/* Total Revenue Counter */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-sm text-muted-foreground mb-1">Total Revenue This Month</p>
          <motion.div
            className="text-5xl md:text-6xl font-black text-emerald-400 font-mono"
            animate={{ scale: isPlaying ? [1, 1.02, 1] : 1 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ${totalRevenue.toLocaleString()}
          </motion.div>
        </motion.div>

        {/* Revenue Stream Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {REVENUE_STREAMS.map((stream, i) => {
            const Icon = stream.icon;
            return (
              <motion.div
                key={stream.label}
                className={`p-4 rounded-xl border backdrop-blur-sm ${stream.bgColor}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 + i * 0.15 }}
                whileHover={{ scale: 1.03 }}
              >
                <Icon className={`w-5 h-5 ${stream.color} mx-auto mb-2`} />
                <div className={`text-lg font-bold ${stream.color} font-mono`}>{stream.amount}</div>
                <div className="text-xs text-muted-foreground mt-1">{stream.label}</div>
                {/* Mini bar */}
                <div className="mt-2 h-1 rounded-full bg-muted/30 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-emerald-500/60"
                    initial={{ width: '0%' }}
                    animate={{ width: `${40 + (amplitude / 255) * 60}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Animated flow lines connecting sources to total */}
        <motion.div
          className="mt-4 flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-emerald-500"
              animate={{
                opacity: isPlaying ? [0.3, 1, 0.3] : 0.3,
                scale: isPlaying ? [0.8, 1.3, 0.8] : 1,
              }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
          <span className="text-xs text-muted-foreground/60 ml-2">Revenue flowing in real-time</span>
        </motion.div>
      </motion.div>

      {/* Stat Pills */}
      <motion.div
        className="flex flex-wrap justify-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2 }}
      >
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.4 + i * 0.12 }}
            >
              <Icon className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-foreground/80">{stat.label}</span>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};
