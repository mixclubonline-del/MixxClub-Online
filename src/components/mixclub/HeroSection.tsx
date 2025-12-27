import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 text-center max-w-5xl"
      >
        {/* MIXXCLUB badge */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="inline-flex items-center gap-3 mb-8 px-6 py-3 rounded-full glass border border-primary/40 shadow-glow-sm"
        >
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          <span className="text-sm font-semibold">AI-Powered Audio Engineering</span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent-cyan bg-clip-text text-transparent leading-tight"
        >
          Ready to Transform
          <br />
          Your Sound?
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
        >
          From bedroom to billboard. AI meets human creativity in the ultimate music collaboration network.
        </motion.p>

        {/* Animated divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.9, duration: 1 }}
          className="w-64 h-1 mx-auto mt-8 bg-gradient-to-r from-transparent via-primary to-transparent"
        />
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};
