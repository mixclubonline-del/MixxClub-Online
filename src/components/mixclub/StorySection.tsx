import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export default function StorySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Generate waveform points
  const generateWaveform = (amplitude: number, smoothness: number) => {
    const points = 50;
    return Array.from({ length: points }, (_, i) => {
      const x = (i / points) * 100;
      const noise = Math.sin(i * smoothness) * amplitude;
      const randomness = amplitude > 0.3 ? Math.random() * 20 - 10 : Math.random() * 5 - 2.5;
      const y = 50 + noise + randomness;
      return `${x},${y}`;
    }).join(' ');
  };

  const rawWaveform = generateWaveform(0.8, 0.3);
  const masteredWaveform = generateWaveform(0.4, 0.5);

  return (
    <section ref={ref} className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
            The Problem We Solve
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Every day, millions of artists record music in bedrooms, cars, or on phones.
            <br />
            <span className="text-foreground/80">But only a few ever make it past the mix.</span>
          </p>
        </motion.div>

        {/* Split Screen Comparison */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Raw Audio - Left */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-red-500/10 blur-3xl rounded-full" />
            <div className="relative p-8 rounded-2xl backdrop-blur-xl border border-red-500/30 bg-card/50">
              <h3 className="text-2xl font-bold mb-4 text-red-400">Raw Audio</h3>
              <div className="relative h-48 bg-background/50 rounded-xl overflow-hidden">
                <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                  <motion.polyline
                    points={rawWaveform}
                    fill="none"
                    stroke="rgb(248, 113, 113)"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={isInView ? { pathLength: 1 } : {}}
                    transition={{ duration: 2, delay: 0.4 }}
                  />
                </svg>
                {/* Noise overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5 animate-pulse" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Unbalanced frequencies • Harsh peaks • Background noise • Inconsistent levels
              </p>
            </div>
          </motion.div>

          {/* Mastered Audio - Right */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-cyan-500/10 blur-3xl rounded-full" />
            <div className="relative p-8 rounded-2xl backdrop-blur-xl border border-cyan-500/30 bg-card/50">
              <h3 className="text-2xl font-bold mb-4 text-cyan-400">MIXXCLUB Mastered</h3>
              <div className="relative h-48 bg-background/50 rounded-xl overflow-hidden">
                <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                  <motion.polyline
                    points={masteredWaveform}
                    fill="none"
                    stroke="rgb(34, 211, 238)"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={isInView ? { pathLength: 1 } : {}}
                    transition={{ duration: 2, delay: 0.6 }}
                  />
                </svg>
                {/* Smooth glow */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Balanced frequencies • Professional loudness • Crystal clarity • Radio-ready
              </p>
            </div>
          </motion.div>
        </div>

        {/* Transformation Arrow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex justify-center my-8"
        >
          <div className="text-6xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 animate-pulse">
            →
          </div>
        </motion.div>

        {/* Solution Statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center mt-16"
        >
          <p className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
            MIXXCLUB changes that.
          </p>
          <p className="text-lg md:text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
            We merge real engineers, AI technology, and creative tools into one connected studio experience.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
