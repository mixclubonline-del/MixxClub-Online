import { motion } from 'framer-motion';
import { Store, Sparkles } from 'lucide-react';

export function BazaarHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative pt-32 pb-8 px-4 text-center"
    >
      {/* Decorative glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[300px] bg-gradient-radial from-orange-500/20 via-transparent to-transparent blur-3xl" />
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative inline-flex items-center gap-3 mb-6"
      >
        <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30">
          <Store className="h-8 w-8 text-orange-400" />
        </div>
        <Sparkles className="h-5 w-5 text-orange-400 animate-pulse" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-5xl md:text-6xl font-bold mb-4"
      >
        <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
          Commerce District
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-lg text-white/60 max-w-2xl mx-auto"
      >
        Discover premium beats, samples, and presets from talented creators across Mixxclub City
      </motion.p>

      {/* Animated underline */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mx-auto mt-8 h-px w-32 bg-gradient-to-r from-transparent via-orange-500 to-transparent"
      />
    </motion.div>
  );
}
