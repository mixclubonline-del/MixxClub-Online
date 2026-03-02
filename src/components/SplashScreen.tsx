import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number;
}

export const SplashScreen = ({ onComplete, duration = 2500 }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(async () => {
      // Trigger haptic feedback on mobile before hiding splash
      try {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } catch (error) {
        // Haptics not available (desktop or unsupported device)
        console.log('Haptics not available');
      }
      
      setIsVisible(false);
      setTimeout(() => {
        onComplete?.();
      }, 500); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0A0A0A]"
        >
          <div className="relative flex flex-col items-center justify-center">
            {/* Animated background glow */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [0.8, 1.2, 1],
                opacity: [0, 0.5, 0.3],
              }}
              transition={{ 
                duration: 1.5,
                times: [0, 0.5, 1],
                ease: "easeOut"
              }}
              className="absolute w-96 h-96 rounded-full bg-primary/30 blur-[120px]"
            />
            
            {/* Logo with multiple animation layers */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                y: 0,
              }}
              transition={{ 
                duration: 0.8,
                ease: [0.34, 1.56, 0.64, 1], // Custom spring-like easing
                delay: 0.2
              }}
              className="relative z-10"
            >
              <img 
                src="/splash-screen.png" 
                alt="Mixxclub" 
                className="w-64 h-64 object-contain"
              />
            </motion.div>

            {/* Animated waveform bars */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex gap-1 mt-8"
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleY: 0.3 }}
                  animate={{ 
                    scaleY: [0.3, 1, 0.5, 1, 0.3],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut"
                  }}
                  className="w-1 h-8 bg-gradient-to-t from-primary/60 to-primary rounded-full"
                  style={{ originY: 1 }}
                />
              ))}
            </motion.div>

            {/* Loading text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ 
                duration: 2,
                times: [0, 0.2, 0.8, 1],
                delay: 0.8
              }}
              className="mt-6 text-sm text-muted-foreground font-medium tracking-wider"
            >
              Loading your studio...
            </motion.p>
          </div>

          {/* Particle effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight + 20,
                  opacity: 0,
                  scale: 0
                }}
                animate={{ 
                  y: -20,
                  opacity: [0, 0.6, 0],
                  scale: [0, 1, 0.5]
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 1.5,
                  ease: "easeOut"
                }}
                className="absolute w-1 h-1 bg-primary/40 rounded-full"
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
