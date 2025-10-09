import { useState, useEffect, useRef } from 'react';
import { Circle, Square, Activity, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RecordingControlsProps {
  isRecording: boolean;
  onRecordToggle: () => void;
  tempo: number;
  metronomeEnabled: boolean;
  onMetronomeToggle: () => void;
  countInBars: number;
  onCountInChange: (bars: number) => void;
  inputMonitoring: boolean;
  onInputMonitoringToggle: () => void;
  punchInEnabled: boolean;
  onPunchInToggle: () => void;
  punchInTime?: number;
  punchOutTime?: number;
}

/**
 * Recording workflow controls with metronome, count-in, and punch-in/out
 */
export const RecordingControls = ({
  isRecording,
  onRecordToggle,
  tempo,
  metronomeEnabled,
  onMetronomeToggle,
  countInBars,
  onCountInChange,
  inputMonitoring,
  onInputMonitoringToggle,
  punchInEnabled,
  onPunchInToggle,
  punchInTime,
  punchOutTime,
}: RecordingControlsProps) => {
  const [metronomeVolume, setMetronomeVolume] = useState([80]);
  const [beatCount, setBeatCount] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextBeatTimeRef = useRef(0);
  const timerIdRef = useRef<number>();

  // Initialize audio context for metronome
  useEffect(() => {
    audioContextRef.current = new AudioContext();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Metronome click generator
  const playMetronomeClick = (isDownbeat: boolean) => {
    if (!audioContextRef.current || !metronomeEnabled) return;

    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Downbeat = higher pitch
    osc.frequency.value = isDownbeat ? 1200 : 800;
    gain.gain.value = (metronomeVolume[0] / 100) * 0.3;

    const now = ctx.currentTime;
    osc.start(now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    osc.stop(now + 0.05);
  };

  // Schedule metronome beats
  useEffect(() => {
    if (!metronomeEnabled || !isRecording) {
      if (timerIdRef.current) {
        window.clearTimeout(timerIdRef.current);
      }
      setBeatCount(0);
      return;
    }

    const secondsPerBeat = 60 / tempo;
    const scheduleAhead = 0.1; // Schedule 100ms ahead

    const scheduler = () => {
      const ctx = audioContextRef.current;
      if (!ctx) return;

      while (nextBeatTimeRef.current < ctx.currentTime + scheduleAhead) {
        const isDownbeat = beatCount % 4 === 0;
        playMetronomeClick(isDownbeat);
        nextBeatTimeRef.current += secondsPerBeat;
        setBeatCount((c) => c + 1);
      }

      timerIdRef.current = window.setTimeout(scheduler, 25);
    };

    nextBeatTimeRef.current = audioContextRef.current?.currentTime || 0;
    scheduler();

    return () => {
      if (timerIdRef.current) {
        window.clearTimeout(timerIdRef.current);
      }
    };
  }, [metronomeEnabled, isRecording, tempo, beatCount, metronomeVolume]);

  return (
    <div
      className="flex flex-col gap-3 p-4 rounded-lg border"
      style={{
        background: 'var(--panel-gradient)',
        borderColor: 'hsl(220, 14%, 28%)',
        boxShadow: 'var(--shadow-glass)',
      }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[hsl(var(--studio-text))] uppercase tracking-wider">
          Recording
        </h3>
        {isRecording && (
          <Badge variant="destructive" className="animate-pulse">
            <Circle className="w-2 h-2 mr-1 fill-current" />
            REC
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Record Button */}
        <Button
          variant={isRecording ? 'destructive' : 'outline'}
          onClick={onRecordToggle}
          className={cn(
            'h-10',
            isRecording && 'animate-pulse'
          )}
        >
          {isRecording ? (
            <>
              <Square className="w-4 h-4 mr-2" />
              Stop
            </>
          ) : (
            <>
              <Circle className="w-4 h-4 mr-2" />
              Record
            </>
          )}
        </Button>

        {/* Metronome Toggle */}
        <div className="flex items-center justify-between px-3 rounded border border-[hsl(var(--studio-border))] bg-[hsl(var(--studio-panel))]">
          <Label htmlFor="metronome" className="text-xs cursor-pointer flex items-center gap-2">
            <Activity className="w-3 h-3" />
            Metronome
          </Label>
          <Switch
            id="metronome"
            checked={metronomeEnabled}
            onCheckedChange={onMetronomeToggle}
          />
        </div>
      </div>

      {/* Metronome Volume */}
      {metronomeEnabled && (
        <div className="flex items-center gap-2 px-2">
          <Volume2 className="w-3 h-3 text-[hsl(var(--studio-text-dim))]" />
          <Slider
            value={metronomeVolume}
            onValueChange={setMetronomeVolume}
            max={100}
            step={1}
            className="flex-1"
          />
          <span className="text-xs font-mono text-[hsl(var(--studio-text-dim))] w-8 text-right">
            {metronomeVolume[0]}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {/* Count-in */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="countin" className="text-xs text-[hsl(var(--studio-text-dim))]">
            Count-in (bars)
          </Label>
          <select
            id="countin"
            value={countInBars}
            onChange={(e) => onCountInChange(Number(e.target.value))}
            className="h-8 px-2 rounded border border-[hsl(var(--studio-border))] bg-[hsl(var(--studio-panel))] text-xs text-[hsl(var(--studio-text))]"
          >
            <option value={0}>Off</option>
            <option value={1}>1 bar</option>
            <option value={2}>2 bars</option>
            <option value={4}>4 bars</option>
          </select>
        </div>

        {/* Input Monitoring */}
        <div className="flex items-end">
          <div className="flex items-center justify-between w-full px-3 py-2 rounded border border-[hsl(var(--studio-border))] bg-[hsl(var(--studio-panel))]">
            <Label htmlFor="monitoring" className="text-xs cursor-pointer">
              Monitor
            </Label>
            <Switch
              id="monitoring"
              checked={inputMonitoring}
              onCheckedChange={onInputMonitoringToggle}
            />
          </div>
        </div>
      </div>

      {/* Punch In/Out */}
      <div className="flex items-center justify-between px-3 py-2 rounded border border-[hsl(var(--studio-border))] bg-[hsl(var(--studio-panel))]">
        <div className="flex items-center gap-2">
          <Label htmlFor="punchin" className="text-xs cursor-pointer">
            Punch Recording
          </Label>
          {punchInEnabled && punchInTime !== undefined && punchOutTime !== undefined && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {punchInTime.toFixed(1)}s - {punchOutTime.toFixed(1)}s
            </Badge>
          )}
        </div>
        <Switch
          id="punchin"
          checked={punchInEnabled}
          onCheckedChange={onPunchInToggle}
        />
      </div>

      {/* Beat indicator */}
      {metronomeEnabled && isRecording && (
        <div className="flex items-center justify-center gap-1 py-2">
          {[0, 1, 2, 3].map((beat) => (
            <div
              key={beat}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                beatCount % 4 === beat
                  ? 'bg-[hsl(var(--studio-accent))] scale-125 shadow-[0_0_8px_hsl(var(--studio-accent))]'
                  : 'bg-[hsl(var(--studio-panel-raised))]'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};
