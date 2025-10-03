import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface SpectrumAnalyzerProps {
  audioContext: AudioContext;
  audioSource: MediaElementAudioSourceNode | null;
}

export const SpectrumAnalyzer = ({ audioContext, audioSource }: SpectrumAnalyzerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();
  const [smoothing, setSmoothing] = useState(0.8);
  const [showPeaks, setShowPeaks] = useState(true);
  const [fftSize, setFftSize] = useState(2048);

  useEffect(() => {
    if (!audioSource || !audioContext) return;

    // Create analyzer
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = fftSize;
    analyser.smoothingTimeConstant = smoothing;
    audioSource.connect(analyser);
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const peakArray = new Array(bufferLength).fill(0);

    const draw = () => {
      if (!canvasRef.current || !analyserRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
      gradient.addColorStop(1, 'rgba(20, 20, 40, 0.9)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw frequency bars
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        
        // Update peaks
        if (dataArray[i] > peakArray[i]) {
          peakArray[i] = dataArray[i];
        } else {
          peakArray[i] *= 0.95; // Peak decay
        }

        // Color based on frequency (low = red, mid = green, high = blue)
        const hue = (i / bufferLength) * 240;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        // Draw peaks
        if (showPeaks) {
          const peakHeight = (peakArray[i] / 255) * canvas.height;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillRect(x, canvas.height - peakHeight, barWidth, 2);
        }

        x += barWidth + 1;
      }

      // Draw frequency labels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '10px monospace';
      const frequencies = ['20Hz', '100Hz', '1kHz', '10kHz', '20kHz'];
      frequencies.forEach((freq, idx) => {
        const xPos = (canvas.width / frequencies.length) * idx;
        ctx.fillText(freq, xPos, canvas.height - 5);
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      analyser.disconnect();
    };
  }, [audioSource, audioContext, smoothing, showPeaks, fftSize]);

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Spectrum Analyzer</h3>
        <canvas
          ref={canvasRef}
          width={800}
          height={200}
          className="w-full rounded-lg border border-border"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="space-y-2">
          <Label>Smoothing: {smoothing.toFixed(2)}</Label>
          <Slider
            value={[smoothing]}
            onValueChange={([v]) => setSmoothing(v)}
            min={0}
            max={1}
            step={0.05}
          />
        </div>

        <div className="space-y-2">
          <Label>FFT Size: {fftSize}</Label>
          <Slider
            value={[Math.log2(fftSize)]}
            onValueChange={([v]) => setFftSize(Math.pow(2, v))}
            min={8}
            max={14}
            step={1}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>Show Peaks</Label>
          <Switch checked={showPeaks} onCheckedChange={setShowPeaks} />
        </div>
      </div>
    </Card>
  );
};
