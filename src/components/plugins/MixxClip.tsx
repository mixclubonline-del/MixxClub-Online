import React, { useState } from 'react';
import { PluginWindow } from './shared/PluginWindow';
import { PluginKnob } from './shared/PluginKnob';
import { Switch } from '@/components/ui/switch';
import { Zap } from 'lucide-react';

interface MixxClipProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MixxClip: React.FC<MixxClipProps> = ({ isOpen, onClose }) => {
  const [ceiling, setCeiling] = useState(-0.3);
  const [drive, setDrive] = useState(0);
  const [carThump, setCarThump] = useState(false);
  const [softClip, setSoftClip] = useState(true);
  const [lookahead, setLookahead] = useState(5);

  return (
    <PluginWindow
      title="MixxClip"
      category="Limiter & Clipper"
      isOpen={isOpen}
      onClose={onClose}
      width={550}
      height={450}
    >
      <div className="space-y-6">
        {/* Main Meter */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Output Level</span>
            <span className="font-mono text-primary">{ceiling.toFixed(2)} dBFS</span>
          </div>
          <div className="h-32 flex items-end gap-1">
            {Array.from({ length: 40 }).map((_, i) => {
              const height = Math.random() * 100;
              const isClipping = height > 85;
              const position = i / 40;
              const gradientColor = position < 0.33 ? '#FF70D0' : position < 0.66 ? '#C5A3FF' : '#70E6FF';
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t transition-all duration-100"
                  style={{ 
                    height: `${height}%`,
                    background: isClipping ? '#ef4444' : height > 70 ? '#eab308' : gradientColor,
                    boxShadow: isClipping ? '0 0 8px #ef4444' : `0 0 4px ${gradientColor}40`
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Main Controls */}
        <div className="grid grid-cols-2 gap-6">
          <PluginKnob
            label="Ceiling"
            value={ceiling}
            min={-3}
            max={0}
            unit="dB"
            onChange={setCeiling}
            size="lg"
          />
          <PluginKnob
            label="Drive"
            value={drive}
            min={0}
            max={12}
            unit="dB"
            onChange={setDrive}
            size="lg"
          />
        </div>

        <PluginKnob
          label="Lookahead"
          value={lookahead}
          min={0}
          max={10}
          unit="ms"
          onChange={setLookahead}
        />

        {/* Mode Switches */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-lg bg-mixx-navy/40 border border-mixx-lavender/20">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-white">Car Thump Mode</span>
              </div>
              <div className="text-xs text-mixx-cyan">
                Extreme bass punch for car systems
              </div>
            </div>
            <Switch checked={carThump} onCheckedChange={setCarThump} />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-mixx-navy/40 border border-mixx-lavender/20">
            <div className="space-y-1">
              <div className="text-sm font-medium text-white">Soft Clipping</div>
              <div className="text-xs text-mixx-cyan">
                Gentle saturation vs hard limiting
              </div>
            </div>
            <Switch checked={softClip} onCheckedChange={setSoftClip} />
          </div>
        </div>

        {/* Waveform Visualization */}
        <div className="p-4 rounded-lg bg-mixx-navy-deep/60 border border-mixx-lavender/20">
          <div className="text-xs text-mixx-cyan uppercase tracking-wider mb-2">Clipping Behavior</div>
          <svg viewBox="0 0 200 60" className="w-full">
            <defs>
              <linearGradient id="waveform-gradient-clip" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF70D0" />
                <stop offset="50%" stopColor="#C5A3FF" />
                <stop offset="100%" stopColor="#70E6FF" />
              </linearGradient>
            </defs>
            {/* Input waveform */}
            <path
              d="M 0 30 Q 25 10 50 30 T 100 30 Q 125 50 150 30 T 200 30"
              stroke="rgba(197,163,255,0.3)"
              strokeWidth="1"
              fill="none"
              strokeDasharray="2"
            />
            
            {/* Clipped output */}
            <path
              d={softClip 
                ? "M 0 30 Q 25 15 50 30 T 100 30 Q 125 45 150 30 T 200 30"
                : "M 0 30 L 25 18 L 50 18 L 75 30 L 100 30 L 125 42 L 150 42 L 175 30 L 200 30"
              }
              stroke="url(#waveform-gradient-clip)"
              strokeWidth="2"
              fill="none"
            />
            
            {/* Ceiling line */}
            <line 
              x1="0" 
              y1={18} 
              x2="200" 
              y2={18} 
              stroke="#ef4444" 
              strokeWidth="1" 
              strokeDasharray="4" 
              opacity="0.5"
            />
          </svg>
        </div>
      </div>
    </PluginWindow>
  );
};
