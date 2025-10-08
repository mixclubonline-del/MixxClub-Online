import React, { useState } from 'react';
import { PluginWindow } from './shared/PluginWindow';
import { PluginKnob } from './shared/PluginKnob';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface MixxGlueProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MixxGlue: React.FC<MixxGlueProps> = ({ isOpen, onClose }) => {
  const [enabled, setEnabled] = useState(true);
  const [threshold, setThreshold] = useState(-18);
  const [ratio, setRatio] = useState(4);
  const [attack, setAttack] = useState(10);
  const [release, setRelease] = useState(150);
  const [mix, setMix] = useState(50);
  const [makeupGain, setMakeupGain] = useState(0);
  const [glueMode, setGlueMode] = useState<'soft' | 'hard'>('soft');
  const [gainReduction, setGainReduction] = useState(0);

  return (
    <PluginWindow
      title="MixxGlue"
      category="Bus Compressor"
      isOpen={isOpen}
      onClose={onClose}
      width={600}
      height={480}
    >
      {/* Gain Reduction Meter */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Gain Reduction</span>
          <span className="font-mono text-primary">{gainReduction.toFixed(1)} dB</span>
        </div>
        <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-white/10">
          <div
            className={`h-full ${glueMode === 'soft' ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gradient-to-r from-pink-500 to-red-500'} transition-all duration-150`}
            style={{ width: `${Math.min(Math.abs(gainReduction) * 5, 100)}%` }}
          />
        </div>
      </div>

      {/* Control Rows */}
      <div className="grid grid-cols-3 gap-6 mt-6">
        <PluginKnob label="Threshold" value={threshold} min={-60} max={0} unit="dB" onChange={setThreshold} />
        <PluginKnob label="Ratio" value={ratio} min={1} max={10} onChange={setRatio} />
        <PluginKnob label="Attack" value={attack} min={0.1} max={100} unit="ms" onChange={setAttack} />
        <PluginKnob label="Release" value={release} min={10} max={1000} unit="ms" onChange={setRelease} />
        <PluginKnob label="Mix" value={mix} min={0} max={100} unit="%" onChange={setMix} />
        <PluginKnob label="Makeup" value={makeupGain} min={0} max={24} unit="dB" onChange={setMakeupGain} />
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-between items-center mt-6">
        <Button variant="outline" onClick={() => setGlueMode(glueMode === 'soft' ? 'hard' : 'soft')}>
          {glueMode === 'soft' ? 'Soft Glue' : 'Hard Glue'}
        </Button>
        <Button>
          <Sparkles className="w-4 h-4 mr-2" />
          AI Preset
        </Button>
      </div>
    </PluginWindow>
  );
};
