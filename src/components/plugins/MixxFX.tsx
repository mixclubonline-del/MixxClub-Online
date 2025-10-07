import React, { useState } from 'react';
import { PluginWindow } from './shared/PluginWindow';
import { PluginKnob } from './shared/PluginKnob';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface MixxFXProps {
  isOpen: boolean;
  onClose: () => void;
}

const FX_TYPES = [
  { value: 'chorus', label: 'Chorus' },
  { value: 'flanger', label: 'Flanger' },
  { value: 'phaser', label: 'Phaser' },
  { value: 'tremolo', label: 'Tremolo' },
  { value: 'vibrato', label: 'Vibrato' },
  { value: 'rotary', label: 'Rotary Speaker' },
];

export const MixxFX: React.FC<MixxFXProps> = ({ isOpen, onClose }) => {
  const [fxType, setFxType] = useState('chorus');
  const [rate, setRate] = useState(0.5);
  const [depth, setDepth] = useState(50);
  const [feedback, setFeedback] = useState(30);
  const [mix, setMix] = useState(40);
  const [morphing, setMorphing] = useState(false);
  const [morphPosition, setMorphPosition] = useState([50]);

  return (
    <PluginWindow
      title="MixxFX"
      category="Creative Effects"
      isOpen={isOpen}
      onClose={onClose}
      width={600}
      height={500}
    >
      <div className="space-y-6">
        {/* Effect Type Selector */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground uppercase tracking-wider">Effect Type</label>
          <Select value={fxType} onValueChange={setFxType}>
            <SelectTrigger className="bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FX_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Waveform Visualization */}
        <div className="p-4 rounded-lg bg-black/40 border border-white/10">
          <svg viewBox="0 0 400 100" className="w-full">
            {/* Modulation wave */}
            <path
              d={`M 0 50 ${Array.from({ length: 40 }).map((_, i) => {
                const x = i * 10;
                const y = 50 + Math.sin((i / 5) * rate * Math.PI) * (depth / 2);
                return `L ${x} ${y}`;
              }).join(' ')}`}
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              fill="none"
            />
            
            {/* Feedback loop indicator */}
            {feedback > 0 && (
              <path
                d={`M 0 50 ${Array.from({ length: 40 }).map((_, i) => {
                  const x = i * 10;
                  const y = 50 + Math.sin((i / 5) * rate * Math.PI + Math.PI / 4) * (depth * feedback / 200);
                  return `L ${x} ${y}`;
                }).join(' ')}`}
                stroke="hsl(var(--primary))"
                strokeWidth="1"
                fill="none"
                opacity="0.4"
              />
            )}
          </svg>
        </div>

        {/* Main Controls */}
        <div className="grid grid-cols-2 gap-6">
          <PluginKnob
            label="Rate"
            value={rate}
            min={0.01}
            max={10}
            unit="Hz"
            onChange={setRate}
          />
          <PluginKnob
            label="Depth"
            value={depth}
            min={0}
            max={100}
            unit="%"
            onChange={setDepth}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <PluginKnob
            label="Feedback"
            value={feedback}
            min={0}
            max={95}
            unit="%"
            onChange={setFeedback}
          />
          <PluginKnob
            label="Mix"
            value={mix}
            min={0}
            max={100}
            unit="%"
            onChange={setMix}
          />
        </div>

        {/* Effect Morphing */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Effect Morphing</span>
            <span className="text-xs text-muted-foreground">Beta Feature</span>
          </div>
          <div className="space-y-3">
            <Slider
              value={morphPosition}
              onValueChange={setMorphPosition}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Chorus</span>
              <span>{morphPosition[0]}%</span>
              <span>Flanger</span>
            </div>
          </div>
        </div>

        {/* Stereo Width Control */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground min-w-[100px]">Stereo Width</span>
          <div className="flex-1 h-3 bg-black/40 rounded-full overflow-hidden border border-white/10 relative">
            <div className="absolute left-1/2 top-0 w-0.5 h-full bg-white/20" />
            <div 
              className="h-full bg-gradient-to-r from-primary/50 to-primary absolute left-1/2 -translate-x-1/2"
              style={{ width: '60%' }}
            />
          </div>
        </div>
      </div>
    </PluginWindow>
  );
};
