import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import engineerStudio from "@/assets/engineer-studio-hero.jpg";
import { Button } from "@/components/ui/button";

const scriptSegments = [
  { 
    text: "Welcome to the club — Mixx Club Online.", 
    duration: 2500,
    focus: "center",
  },
  { 
    text: "Artists, this is where your bedroom recordings", 
    duration: 3000,
    focus: "left",
  },
  { 
    text: "get transformed into billboard-ready tracks.", 
    duration: 3500,
    focus: "right",
  },
  { 
    text: "Upload your music, connect with real engineers,", 
    duration: 3500,
    focus: "center-zoom",
  },
  { 
    text: "and level up your sound.", 
    duration: 3000,
    focus: "full",
  },
];

interface ArtistCRMSlideshowProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const ArtistCRMSlideshow = ({ onComplete, onSkip }: ArtistCRMSlideshowProps) => {
  const [currentSegment, setCurrentSegment] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
        // Auto-complete after last segment
        setTimeout(() => {
          onComplete();
        }, 1500);
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background"
    >
      {/* Skip Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onSkip}
        className="absolute top-4 right-4 z-50 hover:bg-background/80"
      >
        <X className="h-5 w-5" />
      </Button>

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
      <div className="relative z-20 h-full flex flex-col items-center justify-center px-4">
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
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <Button
                  onClick={onComplete}
                  size="lg"
                  className="text-lg px-8 py-6"
                >
                  Start Your First Project
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Indicator */}
          <div className="flex gap-2 justify-center mt-8">
            {scriptSegments.map((_, index) => (
              <motion.div
                key={index}
                className={`h-1 rounded-full ${
                  index === currentSegment ? "bg-primary w-8" : "bg-primary/30 w-6"
                }`}
                animate={{
                  scale: index === currentSegment ? 1.2 : 1,
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </motion.div>
  );
};
