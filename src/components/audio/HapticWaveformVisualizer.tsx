import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Smartphone, Volume2, VolumeX, ZoomIn, ZoomOut, Trash2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useGestureControls } from "@/hooks/useGestureControls";
import { Badge } from "@/components/ui/badge";

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
  const waveformContainerRef = useRef<HTMLDivElement>(null);
  
  // Gesture controls
  const { zoom, pan, markers, addMarker, removeMarker, resetZoom, clearMarkers } = 
    useGestureControls(waveformContainerRef);

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
      // Haptics not available on this platform
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

      {/* Gesture Controls Info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
        <div className="flex items-center gap-4">
          <span>🤏 Pinch to zoom</span>
          <span>👆 Swipe to pan</span>
          <span>👆👆 Double-tap for marker</span>
        </div>
        <Badge variant="outline">Zoom: {zoom.toFixed(1)}x</Badge>
      </div>

      {/* Waveform Display */}
      <div 
        ref={waveformContainerRef}
        className="relative h-48 bg-background rounded-lg border border-border p-4 overflow-hidden touch-none select-none"
      >
        {/* Background grid */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-full border-t border-muted-foreground"
              style={{ top: `${(i + 1) * 20}%` }}
            />
          ))}
        </div>

        {/* Markers */}
        {markers.map((markerPos, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-0 bottom-0 w-0.5 bg-accent z-10 cursor-pointer group"
            style={{ left: `${markerPos * 100}%` }}
            onClick={(e) => {
              e.stopPropagation();
              removeMarker(index);
            }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-accent rounded-full" />
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {(markerPos * 100).toFixed(0)}% - Click to remove
            </div>
          </motion.div>
        ))}

        {/* Waveform bars */}
        <div 
          className="relative h-full flex items-end justify-center gap-[2px] transition-transform"
          style={{
            transform: `scale(${zoom}) translateX(${pan}px)`,
            transformOrigin: 'center bottom',
          }}
        >
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
        <div className="absolute top-1/2 left-0 right-0 h-px bg-primary/20 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Zoom & Marker Controls */}
      <div className="flex items-center gap-2 justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetZoom}
            disabled={zoom === 1 && pan === 0}
            className="gap-2"
          >
            <ZoomOut className="w-4 h-4" />
            Reset View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearMarkers}
            disabled={markers.length === 0}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear Markers
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {markers.length} {markers.length === 1 ? 'marker' : 'markers'}
          </span>
        </div>
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
