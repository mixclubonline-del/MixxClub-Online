import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useState } from 'react';

interface FloatingAudioControlsProps {
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  onToggle: () => void;
  onVolumeChange: (volume: number) => void;
  amplitude: number;
}

export function FloatingAudioControls({
  isPlaying,
  isLoading,
  volume,
  onToggle,
  onVolumeChange,
  amplitude,
}: FloatingAudioControlsProps) {
  const [showVolume, setShowVolume] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleToggle = () => {
    setHasInteracted(true);
    onToggle();
  };

  return (
    <>
      {/* Experience with Sound prompt - shows until first interaction */}
      <AnimatePresence>
        {!hasInteracted && (
          <motion.div
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 2 }}
          >
            <motion.div
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-md border border-primary/30 cursor-pointer hover:border-primary/60 transition-colors"
              onClick={handleToggle}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Headphones className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground">Experience with Sound</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating controls */}
      <motion.div
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        onMouseEnter={() => setShowVolume(true)}
        onMouseLeave={() => setShowVolume(false)}
      >
        {/* Volume slider */}
        <AnimatePresence>
          {showVolume && (
            <motion.div
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-background/80 backdrop-blur-md border border-border/50"
              initial={{ opacity: 0, width: 0, x: 20 }}
              animate={{ opacity: 1, width: 'auto', x: 0 }}
              exit={{ opacity: 0, width: 0, x: 20 }}
            >
              <Slider
                value={[volume * 100]}
                max={100}
                step={1}
                className="w-20"
                onValueChange={([v]) => onVolumeChange(v / 100)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Play/Pause button */}
        <motion.div
          className="relative"
          animate={{
            scale: isPlaying ? 1 + (amplitude / 255) * 0.1 : 1,
          }}
          transition={{ duration: 0.1 }}
        >
          {/* Glow ring when playing */}
          {isPlaying && (
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/30 blur-md"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
          
          <Button
            size="icon"
            variant="outline"
            className="relative w-12 h-12 rounded-full bg-background/80 backdrop-blur-md border-primary/50 hover:border-primary hover:bg-background/90"
            onClick={handleToggle}
            disabled={isLoading}
          >
            {isLoading ? (
              <motion.div
                className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 text-primary" />
            ) : (
              <Play className="w-5 h-5 text-primary ml-0.5" />
            )}
          </Button>
        </motion.div>

        {/* Volume icon */}
        <Button
          size="icon"
          variant="ghost"
          className="w-10 h-10 rounded-full"
          onClick={() => onVolumeChange(volume > 0 ? 0 : 0.7)}
        >
          {volume > 0 ? (
            <Volume2 className="w-4 h-4 text-muted-foreground" />
          ) : (
            <VolumeX className="w-4 h-4 text-muted-foreground" />
          )}
        </Button>
      </motion.div>
    </>
  );
}
