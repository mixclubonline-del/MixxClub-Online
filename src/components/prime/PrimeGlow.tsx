import { motion } from "framer-motion";
import { usePrime } from "@/contexts/PrimeContext";

interface PrimeGlowProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export default function PrimeGlow({ children, className = "", intensity: overrideIntensity }: PrimeGlowProps) {
  const { glowIntensity, pulseRate, accentColor } = usePrime();
  
  const finalIntensity = overrideIntensity ?? glowIntensity;

  return (
    <motion.div
      className={`relative ${className}`}
      animate={{
        filter: [
          `drop-shadow(0 0 ${10 * finalIntensity}px ${accentColor})`,
          `drop-shadow(0 0 ${20 * finalIntensity}px ${accentColor})`,
          `drop-shadow(0 0 ${10 * finalIntensity}px ${accentColor})`
        ]
      }}
      transition={{
        duration: pulseRate / 1000,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
}
