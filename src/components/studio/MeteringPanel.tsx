import React, { useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Radio, Activity, Compass } from 'lucide-react';

interface MeteringPanelProps {
  audioBuffer?: AudioBuffer;
  currentLevel: number; // 0-1
  peakLevel: number; // 0-1
}

/**
 * Enhanced Metering Panel
 * - Spectral Analyzer
 * - Phase Correlation Meter
 * - LUFS Loudness Meter
 * - Vectorscope (Stereo Imaging)
 */
export const MeteringPanel: React.FC<MeteringPanelProps> = ({
  audioBuffer,
  currentLevel,
  peakLevel,
}) => {
  const spectralCanvasRef = useRef<HTMLCanvasElement>(null);
  const phaseCanvasRef = useRef<HTMLCanvasElement>(null);
  const vectorscopeCanvasRef = useRef<HTMLCanvasElement>(null);

  // Draw Spectral Analyzer
  useEffect(() => {
    const canvas = spectralCanvasRef.current;
    if (!canvas || !audioBuffer) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create analyzer
    const analyzerNode = new AnalyserNode(new AudioContext(), {
      fftSize: 2048,
    });

    // Draw spectrum
    const draw = () => {
      const bufferLength = analyzerNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyzerNode.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'hsl(220, 18%, 14%)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;

        // Gradient from green to red based on frequency
        const hue = 120 - (i / bufferLength) * 60;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth;
      }
    };

    // Animate
    const interval = setInterval(draw, 50);
    return () => clearInterval(interval);
  }, [audioBuffer]);

  // Draw Phase Correlation Meter
  useEffect(() => {
    const canvas = phaseCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Phase correlation from audio analysis (simulated for v1)
    const correlation = 0.8;

    ctx.fillStyle = 'hsl(220, 18%, 14%)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw scale
    ctx.strokeStyle = 'hsl(220, 14%, 40%)';
    ctx.lineWidth = 1;
    
    // Center line (0)
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // -1 line
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(0, canvas.height);
    ctx.stroke();

    // +1 line
    ctx.beginPath();
    ctx.moveTo(canvas.width, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.stroke();

    // Draw correlation indicator
    const x = ((correlation + 1) / 2) * canvas.width;
    ctx.fillStyle = correlation > 0 
      ? 'hsl(120, 100%, 50%)' 
      : 'hsl(0, 100%, 50%)';
    ctx.fillRect(x - 2, canvas.height / 2, 4, canvas.height / 2);

    // Label
    ctx.fillStyle = 'hsl(var(--studio-text))';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(correlation.toFixed(2), x, canvas.height / 2 - 5);
  }, [currentLevel]);

  // Draw Vectorscope
  useEffect(() => {
    const canvas = vectorscopeCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.fillStyle = 'hsl(220, 18%, 14%)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw circular grid
    ctx.strokeStyle = 'hsl(220, 14%, 28%)';
    ctx.lineWidth = 1;

    for (let r = radius / 4; r <= radius; r += radius / 4) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvas.height);
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.stroke();

    // Stereo field visualization (simulated for v1)
    const points = 100;
    ctx.fillStyle = 'hsla(var(--studio-accent), 0.6)';
    
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const r = radius * (0.5 + Math.random() * 0.5) * currentLevel;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [currentLevel]);

  // Calculate LUFS (simplified)
  const calculateLUFS = (): number => {
    // Real LUFS requires complex weighting filters
    // This is a simplified approximation
    const rms = currentLevel;
    const lufs = -23 + (20 * Math.log10(Math.max(0.001, rms)));
    return Math.max(-60, Math.min(0, lufs));
  };

  const lufs = calculateLUFS();

  return (
    <div className="w-full h-full bg-[hsl(220,18%,14%)] rounded-lg border border-[hsl(220,14%,28%)]">
      <Tabs defaultValue="spectral" className="w-full h-full flex flex-col">
        <TabsList className="w-full justify-start border-b bg-transparent">
          <TabsTrigger value="spectral" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Spectral
          </TabsTrigger>
          <TabsTrigger value="phase" className="gap-2">
            <Radio className="w-4 h-4" />
            Phase
          </TabsTrigger>
          <TabsTrigger value="lufs" className="gap-2">
            <Activity className="w-4 h-4" />
            LUFS
          </TabsTrigger>
          <TabsTrigger value="vectorscope" className="gap-2">
            <Compass className="w-4 h-4" />
            Vectorscope
          </TabsTrigger>
        </TabsList>

        <TabsContent value="spectral" className="flex-1 p-3">
          <canvas
            ref={spectralCanvasRef}
            width={400}
            height={200}
            className="w-full h-full rounded"
          />
        </TabsContent>

        <TabsContent value="phase" className="flex-1 p-3">
          <div className="space-y-3">
            <canvas
              ref={phaseCanvasRef}
              width={400}
              height={100}
              className="w-full rounded"
            />
            <div className="flex justify-between text-[10px] text-[hsl(var(--studio-text-dim))]">
              <span>-1 (Out of Phase)</span>
              <span>0 (Mono)</span>
              <span>+1 (Perfect Stereo)</span>
            </div>
            <p className="text-xs text-[hsl(var(--studio-text-dim))]">
              Phase correlation indicates mono compatibility. Values near -1 indicate phase cancellation.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="lufs" className="flex-1 p-3">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Integrated Loudness</span>
              <Badge variant="secondary" className="text-lg font-mono">
                {lufs.toFixed(1)} LUFS
              </Badge>
            </div>

            {/* LUFS Meter */}
            <div className="relative h-32 bg-[hsl(220,20%,12%)] rounded">
              <div className="absolute inset-0 flex flex-col justify-between p-2 text-[10px] text-[hsl(var(--studio-text-dim))]">
                <span>0 LUFS</span>
                <span>-12 LUFS</span>
                <span className="text-yellow-500">-23 LUFS (Broadcast)</span>
                <span>-40 LUFS</span>
                <span>-60 LUFS</span>
              </div>

              {/* Level indicator */}
              <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 transition-all"
                style={{
                  height: `${((lufs + 60) / 60) * 100}%`,
                }}
              />
            </div>

            <div className="space-y-1 text-xs text-[hsl(var(--studio-text-dim))]">
              <p>LUFS (Loudness Units Full Scale) measures perceived loudness.</p>
              <p className="text-yellow-500">• -23 LUFS: Broadcast standard</p>
              <p className="text-green-500">• -14 LUFS: Streaming platforms</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="vectorscope" className="flex-1 p-3">
          <div className="space-y-3">
            <canvas
              ref={vectorscopeCanvasRef}
              width={300}
              height={300}
              className="w-full rounded"
            />
            <p className="text-xs text-[hsl(var(--studio-text-dim))]">
              Vectorscope visualizes stereo image. Horizontal spread = stereo width, vertical = mono content.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
