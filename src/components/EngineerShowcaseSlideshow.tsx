import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import engineerStudio from "@/assets/engineer-studio-hero.jpg";

const scriptSegments = [
  { 
    text: "Welcome to the club — Mixx Club Online.", 
    duration: 2500,
    focus: "center",
  },
  { 
    text: "Engineers, this is your stage.", 
    duration: 3000,
    focus: "left",
  },
  { 
    text: "Get paid, get recognized,", 
    duration: 3000,
    focus: "right",
  },
  { 
    text: "and use powerful tools to take your craft to the next level.", 
    duration: 4000,
    focus: "center-zoom",
  },
  { 
    text: "The future of mixing is here.", 
    duration: 3000,
    focus: "full",
  },
];

export const EngineerShowcaseSlideshow = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const navigate = useNavigate();

  const currentText = scriptSegments[currentSegment];
  const totalDuration = scriptSegments.reduce((acc, seg) => acc + seg.duration, 0);

  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = Date.now();
      playSegment();
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, currentSegment]);

  const playSegment = () => {
    const segment = scriptSegments[currentSegment];
    
    timerRef.current = setTimeout(() => {
      if (currentSegment < scriptSegments.length - 1) {
        setCurrentSegment(prev => prev + 1);
      } else {
        setIsPlaying(false);
        setCurrentSegment(0);
        setProgress(0);
      }
    }, segment.duration);

    // Update progress
    const interval = setInterval(() => {
      if (isPlaying) {
        const elapsed = Date.now() - startTimeRef.current;
        const segmentProgress = (elapsed / segment.duration) * 100;
        
        const previousDuration = scriptSegments
          .slice(0, currentSegment)
          .reduce((acc, seg) => acc + seg.duration, 0);
        
        const totalProgress = ((previousDuration + elapsed) / totalDuration) * 100;
        setProgress(Math.min(totalProgress, 100));
      }
    }, 50);

    return () => clearInterval(interval);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReplay = () => {
    setCurrentSegment(0);
    setProgress(0);
    setIsPlaying(true);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
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
    <section className="relative w-full min-h-screen overflow-hidden bg-gradient-to-b from-background via-background/95 to-background">
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
      <div className="relative z-20 container mx-auto px-4 min-h-screen flex flex-col items-center justify-center">
        {/* Text Content */}
        <div className="max-w-4xl w-full text-center space-y-8 mb-12">
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

          {/* CTA Button - Show on last segment */}
          <AnimatePresence>
            {currentSegment === scriptSegments.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: 1 }}
              >
                <Button
                  size="lg"
                  onClick={() => navigate("/for-engineers")}
                  className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30"
                >
                  Join as Engineer - Earn 70%
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="glass-studio rounded-2xl p-6 max-w-2xl w-full space-y-4">
          {/* Progress Bar */}
          <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary-glow"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="hover:bg-secondary/80"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>

            <Button
              size="icon"
              onClick={handleReplay}
              className="hover:bg-secondary/80"
              variant="ghost"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>

            <Button
              size="lg"
              onClick={handlePlayPause}
              className="bg-primary hover:bg-primary/90 text-primary-foreground w-16 h-16 rounded-full shadow-lg shadow-primary/30"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </Button>
          </div>

          {/* Segment Indicators */}
          <div className="flex justify-center gap-2">
            {scriptSegments.map((_, index) => (
              <motion.div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentSegment
                    ? "w-8 bg-primary"
                    : index < currentSegment
                    ? "w-4 bg-primary/50"
                    : "w-4 bg-secondary"
                }`}
                animate={{
                  scale: index === currentSegment ? [1, 1.2, 1] : 1,
                }}
                transition={{
                  duration: 0.5,
                  repeat: index === currentSegment && isPlaying ? Infinity : 0,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};
