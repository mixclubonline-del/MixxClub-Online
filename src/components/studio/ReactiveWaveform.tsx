import { useEffect, useRef, useState } from 'react';

interface ReactiveWaveformProps {
  activeColors?: string[];
  pulseIntensity?: number;
}

export const ReactiveWaveform = ({ 
  activeColors = ["#A7B7FF", "#C5A3FF", "#FF70D0"],
  pulseIntensity: externalPulse = 1.0
}: ReactiveWaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState(0);
  const [pulseIntensity, setPulseIntensity] = useState(1.0);
  const animationRef = useRef<number>();

  useEffect(() => {
    setPulseIntensity(externalPulse);
  }, [externalPulse]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      
      ctx.clearRect(0, 0, width, height);
      const mid = height / 2;
      const bars = 120;
      const barW = width / bars;
      
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, activeColors[0]);
      gradient.addColorStop(0.5, activeColors[1]);
      gradient.addColorStop(1, activeColors[2]);
      
      ctx.fillStyle = gradient;
      
      for (let i = 0; i < bars; i++) {
        const amp = Math.sin(i * 0.25 + phase) * 0.6 + 0.4;
        const barH = (Math.sin(i * 0.5 + phase * 2) * amp) * 60 * pulseIntensity + 80;
        const x = i * barW;
        ctx.fillRect(x, mid - barH / 2, barW * 0.8, barH);
      }
      
      setPhase(prev => prev + 0.04);
      setPulseIntensity(prev => Math.max(1.0, prev - 0.01));
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [activeColors, phase, pulseIntensity]);

  return (
    <div className="w-full h-[180px] rounded-xl bg-gradient-to-br from-purple-950/30 to-indigo-950/50 shadow-[inset_0_0_30px_rgba(163,125,255,0.1)] overflow-hidden">
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  );
};
