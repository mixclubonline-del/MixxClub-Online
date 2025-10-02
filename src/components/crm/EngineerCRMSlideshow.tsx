import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Volume2, VolumeX } from 'lucide-react';
import heroImage from '@/assets/engineer-studio-hero.jpg';
import { useWelcomeAudio } from '@/hooks/useWelcomeAudio';
import { useAudioReactivity } from '@/hooks/useAudioReactivity';

const scriptSegments = [
  { text: "Welcome to the club — Mixx Club Online.", duration: 2500, focus: 'center' },
  { text: "Engineers, this is your stage.", duration: 3000, focus: 'left' },
  { text: "Get paid, get recognized, and use powerful tools", duration: 3500, focus: 'right' },
  { text: "to take your craft to the next level.", duration: 3500, focus: 'center-zoom' },
  { text: "The future of mixing is here.", duration: 3000, focus: 'full' }
];

interface EngineerCRMSlideshowProps {
  onComplete: () => void;
  onSkip: () => void;
}

const EngineerCRMSlideshow = ({ onComplete, onSkip }: EngineerCRMSlideshowProps) => {
  const [currentSegment, setCurrentSegment] = useState(0);
  const [showAudioPrompt, setShowAudioPrompt] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const audio = useWelcomeAudio(scriptSegments.length);
  const audioReactivity = useAudioReactivity({
    audioDataCallback: audio.isAudioEnabled ? audio.getAudioData : undefined,
    simulationMode: !audio.isAudioEnabled
  });

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
    
    // Play audio for this segment
    if (audio.isAudioEnabled) {
      audio.playSegment(currentSegment);
    }
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      if (currentSegment < scriptSegments.length - 1) {
        setCurrentSegment(currentSegment + 1);
      } else {
        // Loop back to start for continuous playback
        setCurrentSegment(0);
      }
    }, segment.duration);
  };

  const getImageTransform = () => {
    const segment = scriptSegments[currentSegment];
    
    switch(segment.focus) {
      case 'left':
        return { scale: 1.2, x: '10%', y: '0%' };
      case 'right':
        return { scale: 1.2, x: '-10%', y: '0%' };
      case 'center-zoom':
        return { scale: 1.3, x: '0%', y: '0%' };
      case 'full':
        return { scale: 1.4, x: '0%', y: '0%' };
      default:
        return { scale: 1.1, x: '0%', y: '0%' };
    }
  };

  const imageTransform = getImageTransform();

  return (
    <div className="fixed top-20 left-0 right-0 bottom-0 z-50 bg-background">
      {/* Audio Prompt */}
      {showAudioPrompt && !audio.isAudioEnabled && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-background/95 backdrop-blur-sm p-8 rounded-lg border border-secondary/30 max-w-md">
          <h3 className="text-2xl font-bold mb-4">Experience with Audio?</h3>
          <p className="text-muted-foreground mb-6">
            Get the full experience with dynamic trap beats that sync with the visuals
          </p>
          <div className="flex gap-4">
            <Button
              variant="secondary"
              onClick={() => {
                audio.enableAudio();
                setShowAudioPrompt(false);
              }}
              disabled={audio.isLoading}
              className="flex-1"
            >
              {audio.isLoading ? 'Loading Beats...' : '🔥 Yes, Let\'s Go!'}
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
      
      {/* Skip Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-50 text-foreground hover:bg-secondary/20"
        onClick={onSkip}
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Audio Controls */}
      {audio.isAudioEnabled && (
        <div className="absolute top-4 left-4 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => audio.setIsMuted(!audio.isMuted)}
            className="hover:bg-secondary/20"
          >
            {audio.isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
        </div>
      )}

      {/* Background Image with Parallax */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        initial={{ scale: 1.1 }}
        animate={imageTransform}
        transition={{ duration: 2, ease: "easeInOut" }}
      >
        <img
          src={heroImage}
          alt="Engineer Studio"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/90 via-background/80 to-secondary/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </motion.div>

      {/* Audio-Reactive Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
                backgroundColor: `hsl(var(--secondary) / ${0.3 + beatIntensity * 0.5})`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30 - beatIntensity * 20, 0],
                opacity: [0.2, 0.2 + beatIntensity * 0.6, 0.2],
                scale: [1, 1 + beatIntensity * 0.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
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
              className="w-1 bg-secondary/60 rounded-full"
              style={{
                height: `${8 + (beat / 100) * 24}px`,
              }}
              animate={{
                scaleY: [0.5, 1 + (beat / 100), 0.5],
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
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="max-w-4xl w-full text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSegment}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-8"
            >
              {/* Main Text */}
              <motion.h1
                className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--secondary-foreground)))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: audio.isAudioEnabled 
                    ? `0 0 ${20 + audioReactivity.amplitude / 5}px hsl(var(--secondary) / 0.5)`
                    : undefined,
                }}
                animate={{
                  scale: audio.isAudioEnabled ? [1, 1 + (audioReactivity.amplitude / 1000), 1] : 1
                }}
                transition={{
                  scale: { duration: 0.15, ease: "easeOut" }
                }}
              >
                {scriptSegments[currentSegment].text}
              </motion.h1>

              {/* Show CTA on last segment */}
              {currentSegment === scriptSegments.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12"
                >
                  <Button
                    size="lg"
                    variant="secondary"
                    className="text-lg px-8 py-6 h-auto"
                    onClick={onComplete}
                  >
                    Browse Open Jobs
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6 h-auto"
                    onClick={onComplete}
                  >
                    View Your Studio
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Progress Indicator */}
          <motion.div
            className="flex gap-2 justify-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {scriptSegments.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentSegment
                    ? 'w-12 bg-secondary'
                    : index < currentSegment
                    ? 'w-8 bg-secondary/60'
                    : 'w-8 bg-secondary/20'
                }`}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EngineerCRMSlideshow;
