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
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-t transition-all duration-100 ${
                    isClipping 
                      ? 'bg-red-500' 
                      : height > 70 
                      ? 'bg-yellow-500' 
                      : 'bg-primary'
                  }`}
                  style={{ height: `${height}%` }}
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
          <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">Car Thump Mode</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Extreme bass punch for car systems
              </div>
            </div>
            <Switch checked={carThump} onCheckedChange={setCarThump} />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="space-y-1">
              <div className="text-sm font-medium">Soft Clipping</div>
              <div className="text-xs text-muted-foreground">
                Gentle saturation vs hard limiting
              </div>
            </div>
            <Switch checked={softClip} onCheckedChange={setSoftClip} />
          </div>
        </div>

        {/* Waveform Visualization */}
        <div className="p-4 rounded-lg bg-black/40 border border-white/10">
          <div className="text-xs text-muted-foreground mb-2">Clipping Behavior</div>
          <svg viewBox="0 0 200 60" className="w-full">
            {/* Input waveform */}
            <path
              d="M 0 30 Q 25 10 50 30 T 100 30 Q 125 50 150 30 T 200 30"
              stroke="rgba(255,255,255,0.3)"
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
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              fill="none"
            />
            
            {/* Ceiling line */}
            <line 
              x1="0" 
              y1={18} 
              x2="200" 
              y2={18} 
              stroke="red" 
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
