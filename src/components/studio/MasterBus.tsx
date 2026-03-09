'use client';
import { useEffect, useRef, useState } from 'react';
import { audioEngine } from '@/services/audioEngine';
import { AudioMeter } from './VUMeter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SlidersHorizontal, Gauge, ShieldCheck, Zap } from 'lucide-react';
import { useAIStudioStore } from '@/stores/aiStudioStore';

export interface MasterBusProps {
  vertical?: boolean; // not used yet, default horizontal layout
}

function linToDb(x: number) {
  return 20 * Math.log10(Math.max(1e-6, x));
}

export const MasterBus: React.FC<MasterBusProps> = ({}) => {
  const setMasterVolume = useAIStudioStore((s) => s.setMasterVolume);
  const masterVolume = useAIStudioStore((s) => s.masterVolume);

  const [peakDb, setPeakDb] = useState(-24);
  const [rmsDb, setRmsDb] = useState(-28);

  useEffect(() => {
    let raf = 0;
    const a = audioEngine.getMasterAnalyser();
    const data = new Uint8Array(a.fftSize);

    const loop = () => {
      a.getByteTimeDomainData(data);
      let max = 0;
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        const av = Math.abs(v);
        if (av > max) max = av;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / data.length);
      setPeakDb((prev) => Math.max(linToDb(max), prev - 0.8));
      setRmsDb((prev) => Math.max(linToDb(rms), prev - 0.5));
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="rounded-md p-3"
      style={{
        border: '1px solid hsl(220,20%,22%)',
        background: 'linear-gradient(180deg,hsl(220,20%,12%),hsl(220,20%,10%))',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold" style={{ color: 'hsl(220,20%,85%)' }}>
          Master
        </div>
        <Badge variant="outline" style={{ borderColor: 'hsl(220,20%,28%)', color: 'hsl(220,20%,70%)' }}>
          Output Chain
        </Badge>
      </div>

      {/* Meter + Fader */}
      <div className="flex items-end gap-8">
        <div className="flex-1">
          {/* Horizontal large meter */}
          <AudioMeter peakDb={peakDb} rmsDb={rmsDb} vertical={false} width={480} height={18} />
          <div className="mt-1 text-[11px]" style={{ color: 'hsl(220,20%,70%)' }}>
            Peak {peakDb.toFixed(1)} dBFS • RMS {rmsDb.toFixed(1)} dBFS
          </div>
        </div>

        {/* Master fader */}
        <div className="flex items-center gap-2">
          <div className="text-xs" style={{ color: 'hsl(220,20%,70%)' }}>Vol</div>
          <input
            type="range"
            min={0}
            max={1.5}
            step={0.01}
            value={masterVolume}
            onChange={(e) => setMasterVolume(Number(e.target.value))}
          />
          <div className="text-xs" style={{ width: 52, textAlign: 'right', color: 'hsl(220,20%,70%)' }}>
            {(20 * Math.log10(Math.max(1e-6, masterVolume))).toFixed(1)} dB
          </div>
        </div>
      </div>

      {/* Processor chips */}
      <div className="flex items-center gap-2 mt-3">
        <Button 
          size="sm" 
          variant="outline" 
          className="gap-1" 
          title="EQ (click to open, Alt-click to bypass)"
          onClick={() => {
            const { toast } = require('sonner');
            toast.info('Master EQ editor coming in Phase 3 — stay tuned! 🎛️');
          }}
        >
          <SlidersHorizontal size={14} /> EQ
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="gap-1" 
          title="Multiband"
          onClick={() => console.log('TODO: Open MultiComp editor')}
        >
          <Gauge size={14} /> MultiComp
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="gap-1" 
          title="Limiter"
          onClick={() => console.log('TODO: Open Limiter editor')}
        >
          <ShieldCheck size={14} /> Limiter
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="gap-1" 
          title="Clipper"
          onClick={() => console.log('TODO: Open Clipper editor')}
        >
          <Zap size={14} /> Clipper
        </Button>
      </div>
    </div>
  );
};
