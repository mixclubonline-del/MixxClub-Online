import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, Volume2 } from 'lucide-react';

interface AudioMeteringProps {
  audioContext: AudioContext;
  audioSource: MediaElementAudioSourceNode | null;
}

export const AudioMetering = ({ audioContext, audioSource }: AudioMeteringProps) => {
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();
  const [peak, setPeak] = useState(0);
  const [rms, setRms] = useState(0);
  const [lufs, setLufs] = useState(-23);
  const [peakHold, setPeakHold] = useState(0);

  useEffect(() => {
    if (!audioSource || !audioContext) return;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    audioSource.connect(analyser);
    analyserRef.current = analyser;

    const bufferLength = analyser.fftSize;
    const dataArray = new Float32Array(bufferLength);
    let peakHoldValue = 0;
    let peakHoldTimeout = 0;

    const calculateMetrics = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getFloatTimeDomainData(dataArray);

      // Calculate Peak
      let maxPeak = 0;
      let sumSquares = 0;

      for (let i = 0; i < bufferLength; i++) {
        const abs = Math.abs(dataArray[i]);
        maxPeak = Math.max(maxPeak, abs);
        sumSquares += dataArray[i] * dataArray[i];
      }

      // Update peak
      const currentPeak = maxPeak;
      setPeak(currentPeak);

      // Peak hold
      if (currentPeak > peakHoldValue) {
        peakHoldValue = currentPeak;
        setPeakHold(peakHoldValue);
        peakHoldTimeout = 60; // Hold for 60 frames (~1 second)
      } else if (peakHoldTimeout > 0) {
        peakHoldTimeout--;
      } else {
        peakHoldValue *= 0.99;
        setPeakHold(peakHoldValue);
      }

      // Calculate RMS
      const rmsValue = Math.sqrt(sumSquares / bufferLength);
      setRms(rmsValue);

      // Approximate LUFS (simplified K-weighted loudness)
      const lufsValue = 20 * Math.log10(rmsValue) - 0.691;
      setLufs(Math.max(-60, Math.min(0, lufsValue)));

      animationRef.current = requestAnimationFrame(calculateMetrics);
    };

    calculateMetrics();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      analyser.disconnect();
    };
  }, [audioSource, audioContext]);

  const peakDb = 20 * Math.log10(peak || 0.00001);
  const rmsDb = 20 * Math.log10(rms || 0.00001);
  const peakHoldDb = 20 * Math.log10(peakHold || 0.00001);

  const getMeterColor = (db: number) => {
    if (db > -3) return 'bg-red-500';
    if (db > -6) return 'bg-yellow-500';
    if (db > -18) return 'bg-green-500';
    return 'bg-green-600';
  };

  const getMeterWidth = (db: number) => {
    const normalized = Math.max(0, Math.min(100, ((db + 60) / 60) * 100));
    return `${normalized}%`;
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Audio Metering</h3>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs">
            <Activity className="w-3 h-3 mr-1" />
            Live
          </Badge>
        </div>
      </div>

      {/* Peak Meter */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Volume2 className="w-3 h-3" />
            Peak
          </span>
          <span className="font-mono">{peakDb.toFixed(1)} dB</span>
        </div>
        <div className="relative h-8 bg-secondary rounded-lg overflow-hidden">
          <div
            className={`h-full transition-all duration-75 ${getMeterColor(peakDb)}`}
            style={{ width: getMeterWidth(peakDb) }}
          />
          {/* Peak hold indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white"
            style={{ left: getMeterWidth(peakHoldDb) }}
          />
          {/* dB scale */}
          <div className="absolute inset-0 flex justify-between items-center px-2 text-[10px] font-mono text-white/70">
            <span>-60</span>
            <span>-40</span>
            <span>-20</span>
            <span>-10</span>
            <span>-6</span>
            <span>0</span>
          </div>
        </div>
      </div>

      {/* RMS Meter */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            RMS
          </span>
          <span className="font-mono">{rmsDb.toFixed(1)} dB</span>
        </div>
        <div className="relative h-6 bg-secondary rounded-lg overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ${getMeterColor(rmsDb)}`}
            style={{ width: getMeterWidth(rmsDb) }}
          />
        </div>
      </div>

      {/* LUFS Meter */}
      <div className="grid grid-cols-3 gap-4 pt-2 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold font-mono">{lufs.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">LUFS</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold font-mono">{peakDb.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">Peak dB</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold font-mono">{rmsDb.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">RMS dB</div>
        </div>
      </div>

      {/* Warning indicators */}
      {peakDb > -0.1 && (
        <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-500">
          ⚠️ Clipping detected! Reduce input gain.
        </div>
      )}
      {lufs > -9 && (
        <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-600">
          ℹ️ High loudness detected. Consider reducing overall level.
        </div>
      )}
    </Card>
  );
};
