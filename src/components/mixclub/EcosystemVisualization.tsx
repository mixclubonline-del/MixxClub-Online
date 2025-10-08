import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Users, Zap, Headphones } from 'lucide-react';
import ecosystemImage from '@/assets/ecosystem-architecture.png';

export default function EcosystemVisualization() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const zones = {
    artist: {
      name: 'Artist Studio',
      stats: '1,247 tracks uploaded today',
      icon: Headphones,
      color: 'hsl(280, 90%, 60%)',
      position: 'left-[15%] top-[35%]'
    },
    ai: {
      name: 'AI Core (PrimeBot)',
      stats: 'Processing in real-time',
      icon: Zap,
      color: 'hsl(190, 90%, 50%)',
      position: 'left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2'
    },
    engineer: {
      name: 'Engineer Studio',
      stats: '342 engineers online now',
      icon: Users,
      color: 'hsl(210, 90%, 60%)',
      position: 'right-[15%] top-[35%]'
    }
  };

  const handlePlayDemo = () => {
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 5000);
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4">
      {/* Main Ecosystem Image */}
      <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden">
        <img 
          src={ecosystemImage} 
          alt="MIXXCLUB Ecosystem Architecture"
          className="w-full h-full object-contain"
        />
        
        {/* Interactive Overlay Zones */}
        {Object.entries(zones).map(([key, zone]) => {
          const Icon = zone.icon;
          return (
            <motion.div
              key={key}
              className={`absolute ${zone.position} w-12 h-12 cursor-pointer`}
              onHoverStart={() => setHoveredZone(key)}
              onHoverEnd={() => setHoveredZone(null)}
              animate={{
                scale: hoveredZone === key ? 1.2 : 1,
              }}
            >
              {/* Pulsing Indicator */}
              <motion.div
                className="absolute inset-0 rounded-full opacity-40"
                style={{ backgroundColor: zone.color }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.4, 0, 0.4],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Icon */}
              <div 
                className="relative w-full h-full rounded-full flex items-center justify-center backdrop-blur-xl border-2"
                style={{ 
                  backgroundColor: `${zone.color.replace(')', ' / 0.2)')}`,
                  borderColor: zone.color
                }}
              >
                <Icon size={24} style={{ color: zone.color }} />
              </div>

              {/* Info Card on Hover */}
              {hoveredZone === key && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-64 p-4 rounded-xl backdrop-blur-xl border z-50"
                  style={{ 
                    backgroundColor: 'hsl(var(--card) / 0.95)',
                    borderColor: zone.color
                  }}
                >
                  <h4 className="font-bold text-sm mb-2" style={{ color: zone.color }}>
                    {zone.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">{zone.stats}</p>
                </motion.div>
              )}
            </motion.div>
          );
        })}

        {/* Animated Data Streams */}
        {isPlaying && (
          <>
            {/* Left to Center */}
            <motion.div
              className="absolute left-[20%] top-[40%] w-[25%] h-1 bg-gradient-to-r from-purple-500 to-cyan-400"
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8 }}
            />
            
            {/* Center to Right */}
            <motion.div
              className="absolute left-[55%] top-[40%] w-[25%] h-1 bg-gradient-to-r from-cyan-400 to-blue-500"
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            />
            
            {/* Pulsing Center */}
            <motion.div
              className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-cyan-400/20 border-2 border-cyan-400"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.8, 0, 0.8],
              }}
              transition={{
                duration: 1.6,
                repeat: 2
              }}
            />
          </>
        )}
      </div>

      {/* Watch It Work Button */}
      <div className="flex justify-center mt-8">
        <motion.button
          onClick={handlePlayDemo}
          disabled={isPlaying}
          className="group relative px-8 py-4 rounded-full font-bold text-lg overflow-hidden backdrop-blur-xl border-2 border-cyan-400/50 hover:border-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 group-hover:from-purple-600/30 group-hover:to-cyan-600/30 transition-all" />
          <span className="relative flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            <Play size={20} className={isPlaying ? 'animate-pulse' : ''} />
            {isPlaying ? 'Processing...' : 'Watch It Work'}
          </span>
        </motion.button>
      </div>

      {/* Tagline */}
      <motion.p 
        className="text-center text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mt-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        This is how the future of sound gets made — <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 font-semibold">human creativity, guided by AI precision.</span>
      </motion.p>
    </div>
  );
}
