import { motion } from 'framer-motion';

interface DistrictWelcomeProps {
  title: string;
  subtitle: string;
}

export function DistrictWelcome({ title, subtitle }: DistrictWelcomeProps) {
  return (
    <motion.div
      className="text-center mb-16"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
    >
      {/* Glowing accent line */}
      <motion.div
        className="w-24 h-1 bg-gradient-to-r from-accent to-accent-blue mx-auto mb-8 rounded-full"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      />

      <h1 className="text-5xl md:text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-accent to-white">
        {title}
      </h1>
      
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        {subtitle}
      </p>

      {/* Decorative elements */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        <span className="text-xs font-mono text-accent/60 tracking-wider">
          SERVICES DISTRICT
        </span>
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
      </div>
    </motion.div>
  );
}
