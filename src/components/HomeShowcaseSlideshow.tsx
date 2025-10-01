import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import engineerStudio from "@/assets/engineer-studio-hero.jpg";

const scriptSegments = [
  { 
    text: "Welcome to the club — Mixx Club Online.", 
    duration: 2500,
    focus: "center",
  },
  { 
    text: "This isn't just a platform, it's a movement.", 
    duration: 3000,
    focus: "left",
  },
  { 
    text: "Artists and engineers working together,", 
    duration: 3000,
    focus: "right",
  },
  { 
    text: "powered by AI and creativity.", 
    duration: 3500,
    focus: "center-zoom",
  },
  { 
    text: "The future of music starts here.", 
    duration: 3000,
    focus: "full",
  },
];

export const HomeShowcaseSlideshow = () => {
  const [currentSegment, setCurrentSegment] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  const currentText = scriptSegments[currentSegment];

  useEffect(() => {
    playSegment();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentSegment]);

  const playSegment = () => {
    const segment = scriptSegments[currentSegment];
    
    timerRef.current = setTimeout(() => {
      if (currentSegment < scriptSegments.length - 1) {
        setCurrentSegment(prev => prev + 1);
      } else {
        // Loop back to start
        setCurrentSegment(0);
      }
    }, segment.duration);
  };

  const getImageTransform = () => {
    switch (currentText.focus) {
      case "left":
        return { scale: 1.1, x: "-5%", y: "0%" };
      case "right":
        return { scale: 1.1, x: "5%", y: "0%" };
      case "center-zoom":
        return { scale: 1.2, x: "0%", y: "0%" };
      case "full":
        return { scale: 1.3, x: "0%", y: "0%" };
      default:
        return { scale: 1, x: "0%", y: "0%" };
    }
  };

  return (
    <section className="relative w-full py-32 pt-40 overflow-hidden bg-gradient-to-b from-background via-background/95 to-background">
      {/* Background Image with Parallax */}
      <motion.div 
        className="absolute inset-0 z-0"
        initial={{ scale: 1 }}
        animate={getImageTransform()}
        transition={{ duration: 2, ease: "easeInOut" }}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${engineerStudio})`,
            filter: "brightness(0.4) contrast(1.1)",
          }}
        />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
      </motion.div>

      {/* Particles Effect */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0,
            }}
            animate={{
              y: [null, -100],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Content Container */}
      <div className="relative z-20 container mx-auto px-4 flex flex-col items-center justify-center">
        {/* Text Content */}
        <div className="max-w-4xl w-full text-center space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSegment}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <motion.h2 
                className="text-4xl md:text-6xl lg:text-7xl font-bold"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-glow)) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {currentText.text}
              </motion.h2>

              {/* Animated Line */}
              <motion.div
                className="h-1 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent"
                initial={{ width: "0%" }}
                animate={{ width: "60%" }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </motion.div>
          </AnimatePresence>

          {/* CTA Buttons - Show on last segment */}
          <AnimatePresence>
            {currentSegment === scriptSegments.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: 1 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <button
                  onClick={() => navigate("/auth")}
                  className="text-lg px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-lg shadow-primary/30 transition-all duration-300"
                >
                  Get Started - Artists
                </button>
                <button
                  onClick={() => navigate("/for-engineers")}
                  className="text-lg px-8 py-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-lg shadow-lg transition-all duration-300"
                >
                  Join as Engineer
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};
