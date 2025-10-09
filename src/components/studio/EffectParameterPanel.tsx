import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RotateCcw, Save, FolderOpen } from 'lucide-react';
import { EffectUnit } from '@/stores/aiStudioStore';
import { audioEngine } from '@/services/audioEngine';
import { cn } from '@/lib/utils';

interface EffectParameterPanelProps {
  trackId: string;
  effect: EffectUnit;
  onUpdateParameter: (paramKey: string, value: number) => void;
  onSavePreset?: () => void;
  onLoadPreset?: () => void;
}

/**
 * Real-time effect parameter controls connected to audio engine
 */
export const EffectParameterPanel = ({
  trackId,
  effect,
  onUpdateParameter,
  onSavePreset,
  onLoadPreset,
}: EffectParameterPanelProps) => {
  const [localParams, setLocalParams] = useState(effect.parameters);

  useEffect(() => {
    setLocalParams(effect.parameters);
  }, [effect.parameters]);

  const handleParameterChange = (paramKey: string, value: number) => {
    // Update local state for smooth UI
    setLocalParams((prev) => ({ ...prev, [paramKey]: value }));
    
    // Update audio engine in real-time
    audioEngine.updateEffectParameter(trackId, effect.id, paramKey, value);
    
    // Update store
    onUpdateParameter(paramKey, value);
  };

  const resetToDefaults = () => {
    const defaults = getDefaultParameters(effect.type);
    Object.entries(defaults).forEach(([key, value]) => {
      audioEngine.updateEffectParameter(trackId, effect.id, key, value);
    });
    setLocalParams(defaults);
  };

  const getDefaultParameters = (type: EffectUnit['type']): Record<string, number> => {
    switch (type) {
      case 'eq':
        return { 
          lowGain: 0.5, lowFreq: 0.2, 
          lowMidGain: 0.5, lowMidFreq: 0.4,
          highMidGain: 0.5, highMidFreq: 0.6,
          highGain: 0.5, highFreq: 0.8
        };
      case 'compressor':
        return { 
          threshold: 0.6, ratio: 0.3, 
          attack: 0.2, release: 0.4, 
          makeup: 0.5, knee: 0.3
        };
      case 'reverb':
        return { 
          mix: 0.3, decay: 0.5, 
          damping: 0.5, size: 0.6,
          predelay: 0.2
        };
      case 'delay':
        return { 
          time: 0.375, feedback: 0.4, 
          mix: 0.3, filter: 0.6,
          pingpong: 0
        };
      case 'saturator':
        return { 
          drive: 0.5, warmth: 0.5, 
          output: 0.8, color: 0.5
        };
      case 'limiter':
        return { 
          threshold: 0.9, release: 0.5, 
          ceiling: 0.95, lookahead: 0.5
        };
      default:
        return {};
    }
  };

  const getParameterLabel = (paramKey: string): string => {
    const labels: Record<string, string> = {
      // EQ
      lowGain: 'Low Gain',
      lowFreq: 'Low Freq',
      lowMidGain: 'Low Mid Gain',
      lowMidFreq: 'Low Mid Freq',
      highMidGain: 'High Mid Gain',
      highMidFreq: 'High Mid Freq',
      highGain: 'High Gain',
      highFreq: 'High Freq',
      // Compressor
      threshold: 'Threshold',
      ratio: 'Ratio',
      attack: 'Attack',
      release: 'Release',
      makeup: 'Makeup',
      knee: 'Knee',
      // Reverb
      mix: 'Mix',
      decay: 'Decay',
      damping: 'Damping',
      size: 'Room Size',
      predelay: 'Pre-delay',
      // Delay
      time: 'Time',
      feedback: 'Feedback',
      filter: 'Filter',
      pingpong: 'Ping-Pong',
      // Saturator
      drive: 'Drive',
      warmth: 'Warmth',
      output: 'Output',
      color: 'Color',
      // Limiter
      ceiling: 'Ceiling',
      lookahead: 'Lookahead',
    };
    return labels[paramKey] || paramKey;
  };

  const formatValue = (paramKey: string, value: number): string => {
    // Special formatting for specific parameters
    if (paramKey.includes('Freq')) {
      return `${Math.round(20 + value * 19980)} Hz`;
    }
    if (paramKey === 'threshold' || paramKey === 'ceiling') {
      return `${(value * -60).toFixed(1)} dB`;
    }
    if (paramKey === 'ratio') {
      return `${(1 + value * 19).toFixed(1)}:1`;
    }
    if (paramKey === 'attack' || paramKey === 'release') {
      return `${(value * 1000).toFixed(0)} ms`;
    }
    if (paramKey === 'time') {
      return `${(value * 2000).toFixed(0)} ms`;
    }
    if (paramKey === 'mix' || paramKey === 'feedback') {
      return `${Math.round(value * 100)}%`;
    }
    return `${Math.round(value * 100)}`;
  };

  return (
    <div 
      className="p-4 rounded-lg border"
      style={{
        background: 'var(--panel-gradient)',
        borderColor: 'hsl(220, 14%, 28%)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[hsl(var(--studio-text))] uppercase">
          {effect.name} Parameters
        </h3>
        <div className="flex gap-2">
          {onLoadPreset && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLoadPreset}
              className="h-7 px-2"
            >
              <FolderOpen className="w-3 h-3" />
            </Button>
          )}
          {onSavePreset && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSavePreset}
              className="h-7 px-2"
            >
              <Save className="w-3 h-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={resetToDefaults}
            className="h-7 px-2"
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(localParams).map(([paramKey, value]) => (
          <div key={paramKey} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-[hsl(var(--studio-text-dim))]">
                {getParameterLabel(paramKey)}
              </Label>
              <span className="text-xs font-mono text-[hsl(var(--studio-text))]">
                {formatValue(paramKey, value)}
              </span>
            </div>
            <Slider
              value={[value]}
              onValueChange={([newValue]) => handleParameterChange(paramKey, newValue)}
              min={0}
              max={1}
              step={0.01}
              className={cn(
                'cursor-pointer',
                '[&_[role=slider]]:bg-[hsl(var(--studio-accent))]',
                '[&_[role=slider]]:border-2',
                '[&_[role=slider]]:border-[hsl(var(--studio-accent))]',
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
