import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWelcomeAudio } from "@/hooks/useWelcomeAudio";
import { useAudioReactivity } from "@/hooks/useAudioReactivity";

const scriptSegments = [
  {
    text: "Welcome to the lab — your beat empire starts here.",
    duration: 5000,
    focus: "center",
  },
  {
    text: "Upload beats, set licenses, connect with artists.",
    duration: 6000,
    focus: "left",
  },
  {
    text: "Track sales, splits, and royalties in real-time.",
    duration: 7000,
    focus: "right",
  },
  {
    text: "Let's build your catalog.",
    duration: 6000,
    focus: "full",
  },
];

interface ProducerCRMSlideshowProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const ProducerCRMSlideshow = ({ onComplete, onSkip }: ProducerCRMSlideshowProps) => {
  const [currentSegment, setCurrentSegment] = useState(0);
  const [showAudioPrompt, setShowAudioPrompt] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const audio = useWelcomeAudio(1);
  const audioReactivity = useAudioReactivity({
    audioDataCallback: audio.isAudioEnabled ? audio.getAudioData : undefined,
    simulationMode: !audio.isAudioEnabled,
  });

  const currentText = scriptSegments[currentSegment];

  useEffect(() => {
    if (audio.isAudioEnabled) {
      audio.playSegment(0);
    }
  }, [audio.isAudioEnabled]);

  useEffect(() => {
    playSegment();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentSegment]);

  const playSegment = () => {
    const segment = scriptSegments[currentSegment];
    timerRef.current = setTimeout(() => {
      if (currentSegment < scriptSegments.length - 1) {
        setCurrentSegment((prev) => prev + 1);
      } else {
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed top-20 left-0 right-0 bottom-0 z-50 bg-background"
    >
      {/* Audio Prompt */}
      {showAudioPrompt && !audio.isAudioEnabled && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-background/95 backdrop-blur-sm p-8 rounded-lg border border-amber-500/30 max-w-md">
          <h3 className="text-2xl font-bold mb-4">Experience with Audio?</h3>
          <p className="text-muted-foreground mb-6">
            Get the full experience with dynamic beats that sync with the visuals
          </p>
          <div className="flex gap-4">
            <Button
              onClick={() => {
                audio.enableAudio();
                setShowAudioPrompt(false);
              }}
              disabled={audio.isLoading}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
            >
              {audio.isLoading ? "Loading Beats..." : "🔥 Yes, Let's Go!"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAudioPrompt(false)}
              className="flex-1"
            >
              Continue Silent
            </Button>
          </div>
        </div>
      )}

      {/* Enter Button */}
      <Button onClick={onSkip} className="absolute top-4 right-4 z-50">
        Enter
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>

      {/* Audio Controls */}
      {audio.isAudioEnabled && (
        <div className="absolute top-4 left-4 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => audio.setIsMuted(!audio.isMuted)}
            className="hover:bg-background/80"
          >
            {audio.isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
        </div>
      )}

      {/* Background with amber glow */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1 }}
        animate={getImageTransform()}
        transition={{ duration: 2, ease: "easeInOut" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, hsl(38 92% 20% / 0.6) 0%, hsl(0 0% 3%) 70%)",
          }}
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
      </motion.div>

      {/* Audio-Reactive Particles — amber tint */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => {
          const beatIndex = i % audioReactivity.beats.length;
          const beatIntensity = audioReactivity.beats[beatIndex] / 100;

          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${2 + beatIntensity * 4}px`,
                height: `${2 + beatIntensity * 4}px`,
                backgroundColor: `hsl(38 92% 50% / ${0.3 + beatIntensity * 0.5})`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30 - beatIntensity * 20, 0],
                opacity: [0.3, 0.3 + beatIntensity * 0.5, 0.3],
                scale: [1, 1 + beatIntensity * 0.5, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          );
        })}
      </div>

      {/* Beat Visualization Bars */}
      {audio.isAudioEnabled && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1 z-20">
          {audioReactivity.beats.map((beat, i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full"
              style={{
                height: `${8 + (beat / 100) * 24}px`,
                backgroundColor: "hsl(38 92% 50% / 0.6)",
              }}
              animate={{
                scaleY: [0.5, 1 + beat / 100, 0.5],
              }}
              transition={{
                duration: 0.15,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Content Container */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center px-4">
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
                  background: "linear-gradient(135deg, hsl(38 92% 50%) 0%, hsl(45 93% 60%) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textShadow: audio.isAudioEnabled
                    ? `0 0 ${20 + audioReactivity.amplitude / 5}px hsl(38 92% 50% / 0.5)`
                    : undefined,
                }}
                animate={{
                  scale: audio.isAudioEnabled ? [1, 1 + audioReactivity.amplitude / 1000, 1] : 1,
                }}
                transition={{
                  scale: { duration: 0.15, ease: "easeOut" },
                }}
              >
                {currentText.text}
              </motion.h2>

              <motion.div
                className="h-1 mx-auto"
                style={{
                  background: "linear-gradient(90deg, transparent, hsl(38 92% 50%), transparent)",
                }}
                initial={{ width: "0%" }}
                animate={{ width: "60%" }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </motion.div>
          </AnimatePresence>

          {/* CTA on last segment */}
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
                  className="text-lg px-8 py-6 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Open Your Catalog
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
                  index === currentSegment ? "w-8" : "w-6"
                }`}
                style={{
                  backgroundColor:
                    index === currentSegment ? "hsl(38 92% 50%)" : "hsl(38 92% 50% / 0.3)",
                }}
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
