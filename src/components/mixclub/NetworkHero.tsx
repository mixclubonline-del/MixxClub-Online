import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export const NetworkHero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Central hub */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-center max-w-4xl"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full" />
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <h1 className="text-7xl md:text-9xl font-bold mb-4 bg-gradient-to-r from-primary via-accent-blue to-accent-cyan bg-clip-text text-transparent">
            Mixxclub Online
          </h1>
          <p className="text-2xl md:text-4xl text-foreground/90 font-light mb-8">
            The Social Hub
          </p>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12">
            From Bedroom to Billboard. AI Meets Human Creativity.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-glow">
            Get Started <ArrowRight className="ml-2" />
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary/50 hover:bg-primary/10">
            <Sparkles className="mr-2" />
            Explore AI Studio
          </Button>
        </motion.div>
      </motion.div>

      {/* Floating network nodes */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
          className="absolute"
          style={{
            left: `${15 + (i % 4) * 25}%`,
            top: `${20 + Math.floor(i / 4) * 60}%`,
          }}
        >
          <NetworkNode 
            label={getNodeLabel(i)} 
            color={i % 2 === 0 ? 'primary' : 'cyan'}
            delay={i * 0.1}
          />
        </motion.div>
      ))}
      
      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(265 85% 65%)" />
            <stop offset="100%" stopColor="hsl(195 100% 60%)" />
          </linearGradient>
        </defs>
        {[...Array(12)].map((_, i) => (
          <motion.line
            key={i}
            x1={`${Math.random() * 100}%`}
            y1={`${Math.random() * 100}%`}
            x2={`${Math.random() * 100}%`}
            y2={`${Math.random() * 100}%`}
            stroke="url(#lineGradient)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{ delay: 1 + i * 0.1, duration: 1.5 }}
          />
        ))}
      </svg>
    </section>
  );
};

const NetworkNode = ({ label, color, delay }: { label: string; color: 'primary' | 'cyan'; delay: number }) => {
  const colorClass = color === 'primary' ? 'from-primary to-primary-glow' : 'from-accent-blue to-accent-cyan';
  
  return (
    <motion.div
      animate={{
        y: [0, -15, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut"
      }}
      className="relative"
    >
      <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${colorClass} p-[2px] shadow-glow`}>
        <div className="w-full h-full rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center">
          <span className="text-xs font-medium text-center px-2">{label}</span>
        </div>
      </div>
      
      {/* Inner particles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-3 h-3 rounded-full bg-gradient-to-br ${colorClass}`}
          style={{
            left: `${30 + i * 15}%`,
            top: `${25 + i * 20}%`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}
    </motion.div>
  );
};

const getNodeLabel = (index: number): string => {
  const labels = [
    'Artist\nUpload Hub',
    'Engineer\nFinder',
    'AI Tools\nPrime Analyzer',
    'Gamification\nMix Battles',
    'Engineer\nHirder',
    'Vision\n2027',
    'AI Studio\nGlobal Mix Battles',
    'Listening\nParties'
  ];
  return labels[index];
};
