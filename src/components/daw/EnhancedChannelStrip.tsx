import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Track } from '@/stores/aiStudioStore';

interface EnhancedChannelStripProps {
  track: Track;
  isSelected: boolean;
  onSelect: () => void;
  onVolumeChange: (value: number) => void;
  onPanChange: (value: number) => void;
  onMuteToggle: () => void;
  onSoloToggle: () => void;
  trackColor: string;
}

export const EnhancedChannelStrip = ({
  track,
  isSelected,
  onSelect,
  onVolumeChange,
  onPanChange,
  onMuteToggle,
  onSoloToggle,
  trackColor,
}: EnhancedChannelStripProps) => {
  const [peakLevel, setPeakLevel] = useState(0);
  const [gainReduction, setGainReduction] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulate audio metering
  useEffect(() => {
    const interval = setInterval(() => {
      if (!track.mute) {
        const randomPeak = Math.random() * track.volume * 0.8 + 0.1;
        setPeakLevel(randomPeak);
        
        // Simulate compression gain reduction
        if (randomPeak > 0.7) {
          setGainReduction(Math.min((randomPeak - 0.7) * 20, 12));
        } else {
          setGainReduction(Math.max(gainReduction - 1, 0));
        }
      } else {
        setPeakLevel(0);
        setGainReduction(0);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [track.mute, track.volume, gainReduction]);

  // Draw mini EQ spectrum
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw frequency spectrum bars
      const bars = 12;
      const barWidth = canvas.width / bars;
      
      for (let i = 0; i < bars; i++) {
        // Simulate frequency spectrum with some randomness
        const baseHeight = Math.sin(i * 0.5) * 20 + 10;
        const height = baseHeight + Math.random() * peakLevel * 20;
        
        const hue = (i / bars) * 60 + 200; // Blue to cyan gradient
        ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.6)`;
        ctx.fillRect(
          i * barWidth,
          canvas.height - height,
          barWidth - 1,
          height
        );
      }
    };

    const animationId = requestAnimationFrame(function animate() {
      draw();
      requestAnimationFrame(animate);
    });

    return () => cancelAnimationFrame(animationId);
  }, [peakLevel]);

  return (
    <div
      className={cn(
        "flex flex-col border rounded-lg transition-all cursor-pointer",
        isSelected && "ring-2"
      )}
      style={{
        width: '120px',
        background: 'linear-gradient(135deg, hsl(220, 20%, 18%) 0%, hsl(220, 20%, 16%) 50%, hsl(220, 20%, 14%) 100%)',
        borderColor: isSelected ? trackColor : 'hsl(220, 20%, 24%)',
        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.05), inset 0 -1px 2px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.3)',
      }}
      onClick={onSelect}
    >
      {/* Mini EQ Spectrum */}
      <div className="p-2 border-b" style={{ borderColor: 'hsl(220, 20%, 24%)' }}>
        <canvas
          ref={canvasRef}
          width={104}
          height={40}
          className="w-full rounded"
          style={{ background: 'hsl(220, 20%, 10%)' }}
        />
      </div>

      {/* Gain Reduction Meter */}
      {gainReduction > 0 && (
        <div className="px-2 py-1 border-b" style={{ borderColor: 'hsl(220, 20%, 24%)' }}>
          <div className="text-[8px] font-mono mb-1" style={{ color: 'hsl(50, 100%, 60%)' }}>
            GR: -{gainReduction.toFixed(1)}dB
          </div>
          <div className="h-1 rounded-full" style={{ background: 'hsl(220, 20%, 12%)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(gainReduction / 12) * 100}%`,
                background: 'linear-gradient(90deg, hsl(120, 70%, 50%), hsl(50, 100%, 50%), hsl(0, 80%, 50%))',
              }}
            />
          </div>
        </div>
      )}

      {/* Level Meter */}
      <div className="px-2 py-2 border-b" style={{ borderColor: 'hsl(220, 20%, 24%)' }}>
        <div className="flex gap-1 h-16">
          {/* Left channel */}
          <div className="flex-1 rounded-sm overflow-hidden" style={{ background: 'hsl(220, 20%, 12%)' }}>
            <div
              className="w-full transition-all"
              style={{
                height: `${peakLevel * 100}%`,
                background: peakLevel > 0.9
                  ? 'hsl(0, 80%, 50%)'
                  : peakLevel > 0.7
                  ? 'hsl(50, 100%, 50%)'
                  : 'hsl(120, 70%, 50%)',
                marginTop: `${(1 - peakLevel) * 100}%`,
              }}
            />
          </div>
          {/* Right channel */}
          <div className="flex-1 rounded-sm overflow-hidden" style={{ background: 'hsl(220, 20%, 12%)' }}>
            <div
              className="w-full transition-all"
              style={{
                height: `${peakLevel * 0.95 * 100}%`,
                background: peakLevel > 0.9
                  ? 'hsl(0, 80%, 50%)'
                  : peakLevel > 0.7
                  ? 'hsl(50, 100%, 50%)'
                  : 'hsl(120, 70%, 50%)',
                marginTop: `${(1 - peakLevel * 0.95) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Pan Control */}
      <div className="px-2 py-2 border-b" style={{ borderColor: 'hsl(220, 20%, 24%)' }}>
        <div className="text-[8px] font-mono mb-1 text-center" style={{ color: 'hsl(220, 20%, 70%)' }}>
          PAN
        </div>
        <Slider
          value={[track.pan * 100 + 50]}
          onValueChange={(value) => onPanChange((value[0] - 50) / 100)}
          max={100}
          step={1}
          className="mb-1"
        />
        <div className="text-[8px] font-mono text-center" style={{ color: 'hsl(220, 20%, 60%)' }}>
          {track.pan === 0 ? 'C' : track.pan > 0 ? `R${Math.round(track.pan * 100)}` : `L${Math.round(Math.abs(track.pan) * 100)}`}
        </div>
      </div>

      {/* Volume Fader */}
      <div className="flex-1 flex flex-col items-center justify-center p-2">
        <div className="relative w-6" style={{ height: '100%' }}>
          <Slider
            value={[track.volume * 100]}
            onValueChange={(value) => onVolumeChange(value[0] / 100)}
            max={100}
            step={1}
            orientation="vertical"
            className="h-full"
          />
        </div>
        
        <div className="mt-2 text-[10px] font-mono" style={{ color: 'hsl(220, 20%, 70%)' }}>
          {Math.round(track.volume * 100)}
        </div>
      </div>

      {/* M/S Buttons */}
      <div className="flex gap-1 p-1 border-t" style={{ borderColor: 'hsl(220, 20%, 24%)' }}>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 flex-1 text-[10px] font-bold",
            track.mute && "bg-[hsl(0,70%,50%)] text-white hover:bg-[hsl(0,70%,40%)]"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onMuteToggle();
          }}
        >
          M
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 flex-1 text-[10px] font-bold",
            track.solo && "bg-[hsl(50,90%,50%)] text-black hover:bg-[hsl(50,90%,40%)]"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onSoloToggle();
          }}
        >
          S
        </Button>
      </div>

      {/* Track Name */}
      <div 
        className="p-2 text-center text-[10px] font-medium truncate border-t"
        style={{ 
          borderColor: 'hsl(220, 20%, 24%)',
          color: 'hsl(220, 20%, 90%)'
        }}
      >
        {track.name}
      </div>
    </div>
  );
};
