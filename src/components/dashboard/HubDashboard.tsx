import { motion } from "framer-motion";
import { useAudioVisualization } from "@/hooks/useAudioVisualization";

export default function HubDashboard() {
  const { audioData, isPlaying, togglePlay } = useAudioVisualization();

  return (
    <section className="relative min-h-[70vh] flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Breathing pulse background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent"
        animate={{ 
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Central infinity logo - placeholder for uploaded logo */}
      <motion.div 
        className="relative z-10 mb-8"
        animate={{ 
          filter: [
            "drop-shadow(0 0 20px hsl(var(--primary)/0.5))",
            "drop-shadow(0 0 40px hsl(var(--primary)/0.8))",
            "drop-shadow(0 0 20px hsl(var(--primary)/0.5))"
          ]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-32 h-32 flex items-center justify-center text-6xl cursor-pointer" onClick={togglePlay}>
          ∞
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1 
        className="text-5xl md:text-7xl font-bold text-center mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-accent-blue">
          MixClub Online
        </span>
      </motion.h1>

      <motion.p 
        className="text-lg text-muted-foreground mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        The Prime Brain
      </motion.p>

      {/* Waveform visualization */}
      <motion.div 
        className="flex items-end justify-center gap-1 h-16 mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {audioData.map((value, i) => (
          <motion.div
            key={i}
            className="w-2 bg-gradient-to-t from-primary to-accent-blue rounded-full"
            animate={{ 
              height: `${value * 100}%`,
              opacity: isPlaying ? [0.5, 1, 0.5] : 0.3
            }}
            transition={{ 
              height: { duration: 0.1 },
              opacity: { duration: 1, repeat: Infinity }
            }}
          />
        ))}
      </motion.div>

      <p className="text-xs text-muted-foreground">
        {isPlaying ? "Audio Active" : "Click ∞ to activate"}
      </p>
    </section>
  );
}
