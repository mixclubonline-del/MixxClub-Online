import { motion } from "framer-motion";
import { useAudioVisualization } from "@/hooks/useAudioVisualization";
import { usePrime } from "@/contexts/PrimeContext";
import PrimeGlow from "@/components/prime/PrimeGlow";

export default function HubDashboard() {
  const { audioData, isPlaying, togglePlay } = useAudioVisualization();
  const { accentColor, pulseRate } = usePrime();

  return (
    <section className="relative min-h-[70vh] flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Breathing pulse background - connected to Prime */}
      <motion.div 
        className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent"
        animate={{ 
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          duration: pulseRate / 1000,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Central infinity logo - connected to Prime glow */}
      <PrimeGlow className="relative z-10 mb-8">
        <div className="w-32 h-32 flex items-center justify-center text-6xl cursor-pointer" onClick={togglePlay}>
          ∞
        </div>
      </PrimeGlow>

      {/* Title */}
      <motion.h1 
        className="text-5xl md:text-7xl font-bold text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-accent-blue">
          Mixxclub Online
        </span>
      </motion.h1>

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
