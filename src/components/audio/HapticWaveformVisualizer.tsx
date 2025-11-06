import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Smartphone, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface HapticWaveformVisualizerProps {
  audioUrl?: string;
  barsCount?: number;
  sensitivity?: number;
}

export const HapticWaveformVisualizer = ({ 
  audioUrl,
  barsCount = 64,
  sensitivity = 1.5
}: HapticWaveformVisualizerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioData, setAudioData] = useState<number[]>(Array(barsCount).fill(0.1));
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [hapticIntensity, setHapticIntensity] = useState(50);
  const [lastHapticTime, setLastHapticTime] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    // Initialize audio context
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = barsCount * 2;
      analyserRef.current = analyser;

      const source = audioContext.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      audio.addEventListener('ended', () => setIsPlaying(false));
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      audioRef.current?.pause();
      audioContextRef.current?.close();
    };
  }, [audioUrl, barsCount]);

  const triggerHapticFeedback = async (intensity: number) => {
    if (!hapticEnabled) return;
    
    const now = Date.now();
    // Throttle haptics to avoid overwhelming the device (minimum 100ms between haptics)
    if (now - lastHapticTime < 100) return;
    
    try {
      const normalizedIntensity = (intensity * hapticIntensity) / 100;
      
      if (normalizedIntensity > 0.7) {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } else if (normalizedIntensity > 0.4) {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } else if (normalizedIntensity > 0.2) {
        await Haptics.impact({ style: ImpactStyle.Light });
      }
      
      setLastHapticTime(now);
    } catch (error) {
      console.log('Haptics not available');
    }
  };

  const visualize = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Process audio data into bars
    const barData: number[] = [];
    const samplesPerBar = Math.floor(bufferLength / barsCount);
    
    let maxIntensity = 0;
    for (let i = 0; i < barsCount; i++) {
      const start = i * samplesPerBar;
      const end = start + samplesPerBar;
      const slice = dataArray.slice(start, end);
      const average = slice.reduce((sum, val) => sum + val, 0) / slice.length;
      const normalized = (average / 255) * sensitivity;
      barData.push(Math.min(normalized, 1));
      
      if (normalized > maxIntensity) {
        maxIntensity = normalized;
      }
    }

    setAudioData(barData);

    // Trigger haptic on peaks
    if (maxIntensity > 0.5) {
      triggerHapticFeedback(maxIntensity);
    }

    animationFrameRef.current = requestAnimationFrame(visualize);
  };

  const togglePlayback = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setIsPlaying(false);
    } else {
      await audioRef.current.play();
      setIsPlaying(true);
      visualize();
      
      // Trigger haptic on play
      if (hapticEnabled) {
        try {
          await Haptics.impact({ style: ImpactStyle.Medium });
        } catch (error) {
          console.log('Haptics not available');
        }
      }
    }
  };

  const testHaptic = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (error) {
      console.log('Haptics not available');
    }
  };

  return (
    <div className="w-full space-y-6 p-6 bg-card rounded-lg border border-border">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Haptic Waveform Visualizer</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={testHaptic}
          className="gap-2"
        >
          Test Haptic
        </Button>
      </div>

      {/* Waveform Display */}
      <div className="relative h-48 bg-background rounded-lg border border-border p-4 overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-full border-t border-muted-foreground"
              style={{ top: `${(i + 1) * 20}%` }}
            />
          ))}
        </div>

        {/* Waveform bars */}
        <div className="relative h-full flex items-end justify-center gap-[2px]">
          {audioData.map((value, index) => (
            <motion.div
              key={index}
              className="relative rounded-t-sm"
              style={{
                width: `${100 / barsCount}%`,
                maxWidth: '8px',
              }}
              animate={{
                height: `${Math.max(value * 100, 5)}%`,
                background: value > 0.7
                  ? 'linear-gradient(to top, hsl(var(--primary)), hsl(var(--primary-glow)))'
                  : value > 0.4
                  ? 'linear-gradient(to top, hsl(var(--primary)/0.8), hsl(var(--primary)))'
                  : 'linear-gradient(to top, hsl(var(--primary)/0.4), hsl(var(--primary)/0.6))',
              }}
              transition={{
                duration: 0.05,
                ease: "easeOut"
              }}
            >
              {/* Glow effect on high intensity */}
              {value > 0.7 && (
                <motion.div
                  className="absolute inset-0 rounded-t-sm blur-sm"
                  style={{
                    background: 'hsl(var(--primary))',
                    opacity: 0.5
                  }}
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 0.3,
                    repeat: Infinity,
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Center line */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-primary/20 -translate-y-1/2" />
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            size="lg"
            onClick={togglePlayback}
            disabled={!audioUrl}
            className="gap-2"
          >
            {isPlaying ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
        </div>

        {/* Haptic Settings */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <Label htmlFor="haptic-toggle" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Enable Haptic Feedback
            </Label>
            <Switch
              id="haptic-toggle"
              checked={hapticEnabled}
              onCheckedChange={setHapticEnabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="haptic-intensity">
              Haptic Intensity: {hapticIntensity}%
            </Label>
            <Slider
              id="haptic-intensity"
              min={0}
              max={100}
              step={10}
              value={[hapticIntensity]}
              onValueChange={([value]) => setHapticIntensity(value)}
              disabled={!hapticEnabled}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Info */}
      {!audioUrl && (
        <p className="text-sm text-muted-foreground text-center">
          No audio file loaded. Upload or select an audio file to visualize.
        </p>
      )}
    </div>
  );
};
