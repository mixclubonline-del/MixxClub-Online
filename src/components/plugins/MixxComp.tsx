import React, { useState } from 'react';
import { PluginWindow } from './shared/PluginWindow';
import { PluginKnob } from './shared/PluginKnob';
import { Button } from '@/components/ui/button';
import { Sparkles, Power } from 'lucide-react';

interface MixxCompProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MixxComp: React.FC<MixxCompProps> = ({ isOpen, onClose }) => {
  const [enabled, setEnabled] = useState(true);
  const [threshold, setThreshold] = useState(-20);
  const [ratio, setRatio] = useState(4);
  const [attack, setAttack] = useState(5);
  const [release, setRelease] = useState(50);
  const [knee, setKnee] = useState(6);
  const [makeupGain, setMakeupGain] = useState(0);
  const [gainReduction, setGainReduction] = useState(0);

  return (
    <PluginWindow
      title="MixxComp"
      category="Dynamics Processor"
      isOpen={isOpen}
      onClose={onClose}
      width={600}
      height={500}
    >
      <div className="space-y-8">
        {/* Power Switch */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant={enabled ? "default" : "outline"}
              onClick={() => setEnabled(!enabled)}
              className={enabled ? "shadow-glow" : ""}
            >
              <Power className="w-4 h-4" />
            </Button>
            <div className={enabled ? "text-foreground" : "text-muted-foreground"}>
              <div className="text-sm font-medium">Compressor</div>
              <div className="text-xs">{enabled ? 'Active' : 'Bypassed'}</div>
            </div>
          </div>

          <Button variant="outline">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Preset
          </Button>
        </div>

        {/* Gain Reduction Meter */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Gain Reduction</span>
            <span className="font-mono text-primary">{gainReduction.toFixed(1)} dB</span>
          </div>
          <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-white/10">
            <div 
              className="h-full bg-gradient-to-r from-primary to-red-500 transition-all duration-100"
              style={{ width: `${Math.min(Math.abs(gainReduction) * 5, 100)}%` }}
            />
          </div>
        </div>

        {/* Main Controls */}
        <div className="grid grid-cols-3 gap-6">
          <PluginKnob
            label="Threshold"
            value={threshold}
            min={-60}
            max={0}
            unit="dB"
            onChange={setThreshold}
          />
          <PluginKnob
            label="Ratio"
            value={ratio}
            min={1}
            max={20}
            onChange={setRatio}
            displayValue={(val) => `${val.toFixed(1)}:1`}
          />
          <PluginKnob
            label="Knee"
            value={knee}
            min={0}
            max={12}
            unit="dB"
            onChange={setKnee}
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <PluginKnob
            label="Attack"
            value={attack}
            min={0.1}
            max={100}
            unit="ms"
            onChange={setAttack}
          />
          <PluginKnob
            label="Release"
            value={release}
            min={10}
            max={1000}
            unit="ms"
            onChange={setRelease}
          />
          <PluginKnob
            label="Makeup"
            value={makeupGain}
            min={0}
            max={24}
            unit="dB"
            onChange={setMakeupGain}
          />
        </div>

        {/* Compression Curve Visualization */}
        <div className="p-4 rounded-lg bg-black/40 border border-white/10">
          <svg viewBox="0 0 200 200" className="w-full h-40">
            {/* Grid */}
            {[0, 50, 100, 150, 200].map(val => (
              <g key={val}>
                <line x1={val} y1="0" x2={val} y2="200" stroke="rgba(255,255,255,0.05)" />
                <line x1="0" y1={val} x2="200" y2={val} stroke="rgba(255,255,255,0.05)" />
              </g>
            ))}
            
            {/* 1:1 line */}
            <line x1="0" y1="200" x2="200" y2="0" stroke="rgba(255,255,255,0.1)" strokeDasharray="4" />
            
            {/* Compression curve */}
            <path
              d={`M 0 200 L ${100 + threshold * 1.5} ${200 + threshold * 1.5} 
                 Q ${110 + threshold * 1.5} ${190 + threshold * 1.5 - knee * 2} 
                 ${150 + threshold * 1.5} ${150 + threshold * 1.5 - (50 / ratio)}`}
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
      </div>
    </PluginWindow>
  );
};
