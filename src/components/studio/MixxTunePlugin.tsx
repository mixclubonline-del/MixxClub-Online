import { useState } from 'react';
import { motion } from 'framer-motion';
import { Waves, Zap, Settings2, Power } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MixxTunePluginProps {
  onClose?: () => void;
  onParameterChange?: (params: MixxTuneParams) => void;
}

export interface MixxTuneParams {
  enabled: boolean;
  correction: number; // 0-100: natural to extreme
  speed: number; // 0-100: slow to instant
  key: string;
  scale: string;
  humanize: number; // 0-100: vibrato preservation
  lowLatency: boolean;
  formantCorrection: boolean;
  breathControl: number;
}

const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const SCALES = ['Major', 'Minor', 'Dorian', 'Mixolydian', 'Chromatic'];

export const MixxTunePlugin = ({ onClose, onParameterChange }: MixxTunePluginProps) => {
  const [params, setParams] = useState<MixxTuneParams>({
    enabled: true,
    correction: 75,
    speed: 85,
    key: 'C',
    scale: 'Minor',
    humanize: 30,
    lowLatency: true,
    formantCorrection: true,
    breathControl: 50,
  });

  const updateParam = <K extends keyof MixxTuneParams>(key: K, value: MixxTuneParams[K]) => {
    const updated = { ...params, [key]: value };
    setParams(updated);
    onParameterChange?.(updated);
  };

  const presets = [
    { name: 'Natural', correction: 40, speed: 60, humanize: 60 },
    { name: 'R&B Smooth', correction: 70, speed: 75, humanize: 40 },
    { name: 'Hip-Hop', correction: 85, speed: 95, humanize: 20 },
    { name: 'T-Pain', correction: 100, speed: 100, humanize: 0 },
  ];

  return (
    <div className="relative p-6 rounded-xl bg-gradient-to-br from-[hsl(var(--studio-panel))] to-[hsl(var(--studio-black))] border-2 border-[hsl(var(--studio-accent)/0.3)] shadow-[var(--shadow-glass-lg)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-primary rounded-lg shadow-[var(--shadow-glow)]">
            <Waves className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[hsl(var(--studio-text))]">MixxTune</h3>
            <p className="text-xs text-[hsl(var(--studio-text-dim))]">Pro Auto-Tune Engine</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant={params.lowLatency ? "default" : "secondary"}
            className="text-xs"
          >
            {params.lowLatency ? '< 2ms' : 'Normal'}
          </Badge>
          <motion.button
            onClick={() => updateParam('enabled', !params.enabled)}
            className={cn(
              'p-2 rounded-lg transition-all',
              params.enabled 
                ? 'bg-[hsl(var(--led-green))] text-white shadow-[0_0_12px_hsl(var(--led-green)/0.6)]' 
                : 'bg-[hsl(var(--studio-panel-raised))] text-[hsl(var(--studio-text-dim))]'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Power className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Presets */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {presets.map((preset) => (
          <Button
            key={preset.name}
            variant="outline"
            size="sm"
            onClick={() => {
              updateParam('correction', preset.correction);
              updateParam('speed', preset.speed);
              updateParam('humanize', preset.humanize);
            }}
            className="text-xs hover:bg-[hsl(var(--studio-accent)/0.1)] hover:border-[hsl(var(--studio-accent))]"
          >
            {preset.name}
          </Button>
        ))}
      </div>

      {/* Main Controls */}
      <div className="space-y-6">
        {/* Key & Scale */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono text-[hsl(var(--studio-text-dim))] uppercase mb-2 block">
              Key
            </label>
            <Select value={params.key} onValueChange={(v) => updateParam('key', v)}>
              <SelectTrigger className="bg-[hsl(var(--studio-panel-raised))] border-[hsl(var(--studio-border))]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KEYS.map((key) => (
                  <SelectItem key={key} value={key}>{key}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-mono text-[hsl(var(--studio-text-dim))] uppercase mb-2 block">
              Scale
            </label>
            <Select value={params.scale} onValueChange={(v) => updateParam('scale', v)}>
              <SelectTrigger className="bg-[hsl(var(--studio-panel-raised))] border-[hsl(var(--studio-border))]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCALES.map((scale) => (
                  <SelectItem key={scale} value={scale}>{scale}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Correction Amount */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-mono text-[hsl(var(--studio-text-dim))] uppercase">
              Correction
            </label>
            <span className="text-xs font-mono text-[hsl(var(--studio-accent))]">
              {params.correction}%
            </span>
          </div>
          <Slider
            value={[params.correction]}
            onValueChange={([v]) => updateParam('correction', v)}
            min={0}
            max={100}
            step={1}
            className="mb-1"
          />
          <div className="flex justify-between text-[10px] text-[hsl(var(--studio-text-dim))]">
            <span>Natural</span>
            <span>Extreme</span>
          </div>
        </div>

        {/* Speed */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-mono text-[hsl(var(--studio-text-dim))] uppercase">
              Speed
            </label>
            <span className="text-xs font-mono text-[hsl(var(--studio-accent))]">
              {params.speed}%
            </span>
          </div>
          <Slider
            value={[params.speed]}
            onValueChange={([v]) => updateParam('speed', v)}
            min={0}
            max={100}
            step={1}
            className="mb-1"
          />
          <div className="flex justify-between text-[10px] text-[hsl(var(--studio-text-dim))]">
            <span>Slow</span>
            <span>Instant</span>
          </div>
        </div>

        {/* Humanize */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-mono text-[hsl(var(--studio-text-dim))] uppercase">
              Humanize
            </label>
            <span className="text-xs font-mono text-[hsl(var(--studio-accent))]">
              {params.humanize}%
            </span>
          </div>
          <Slider
            value={[params.humanize]}
            onValueChange={([v]) => updateParam('humanize', v)}
            min={0}
            max={100}
            step={1}
            className="mb-1"
          />
          <div className="flex justify-between text-[10px] text-[hsl(var(--studio-text-dim))]">
            <span>Robotic</span>
            <span>Natural Vibrato</span>
          </div>
        </div>

        {/* Breath Control */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-mono text-[hsl(var(--studio-text-dim))] uppercase">
              Breath Control
            </label>
            <span className="text-xs font-mono text-[hsl(var(--studio-accent))]">
              {params.breathControl}%
            </span>
          </div>
          <Slider
            value={[params.breathControl]}
            onValueChange={([v]) => updateParam('breathControl', v)}
            min={0}
            max={100}
            step={1}
          />
        </div>

        {/* Advanced Toggles */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[hsl(var(--studio-border))]">
          <button
            onClick={() => updateParam('lowLatency', !params.lowLatency)}
            className={cn(
              'p-3 rounded-lg text-xs font-medium transition-all',
              params.lowLatency
                ? 'bg-[hsl(var(--studio-accent)/0.2)] text-[hsl(var(--studio-accent))] border border-[hsl(var(--studio-accent))]'
                : 'bg-[hsl(var(--studio-panel-raised))] text-[hsl(var(--studio-text-dim))] border border-[hsl(var(--studio-border))]'
            )}
          >
            <Zap className="w-4 h-4 mx-auto mb-1" />
            Low Latency
          </button>
          <button
            onClick={() => updateParam('formantCorrection', !params.formantCorrection)}
            className={cn(
              'p-3 rounded-lg text-xs font-medium transition-all',
              params.formantCorrection
                ? 'bg-[hsl(var(--studio-accent)/0.2)] text-[hsl(var(--studio-accent))] border border-[hsl(var(--studio-accent))]'
                : 'bg-[hsl(var(--studio-panel-raised))] text-[hsl(var(--studio-text-dim))] border border-[hsl(var(--studio-border))]'
            )}
          >
            <Settings2 className="w-4 h-4 mx-auto mb-1" />
            Formant Correct
          </button>
        </div>
      </div>

      {/* Algorithm Info */}
      <div className="mt-6 p-3 bg-[hsl(var(--studio-panel-raised))] rounded-lg border border-[hsl(var(--studio-border))]">
        <div className="flex items-start gap-2">
          <div className="w-2 h-2 rounded-full bg-[hsl(var(--led-green))] mt-1 animate-pulse" />
          <div className="text-xs text-[hsl(var(--studio-text-dim))]">
            <span className="text-[hsl(var(--studio-accent))] font-semibold">Algorithm:</span> YIN-Enhanced Autocorrelation
            <br />
            <span className="text-[hsl(var(--studio-accent))] font-semibold">Latency:</span> {params.lowLatency ? '1.8ms' : '5.2ms'} @ 48kHz
            <br />
            <span className="text-[hsl(var(--studio-accent))] font-semibold">Mode:</span> Hip-Hop/R&B Optimized
          </div>
        </div>
      </div>
    </div>
  );
};
