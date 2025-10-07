import React, { useState } from 'react';
import { PluginWindow } from './shared/PluginWindow';
import { PluginKnob } from './shared/PluginKnob';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MixxReverbProps {
  isOpen: boolean;
  onClose: () => void;
}

const REVERB_TYPES = [
  { value: 'hall', label: 'Concert Hall' },
  { value: 'room', label: 'Studio Room' },
  { value: 'plate', label: 'Plate Reverb' },
  { value: 'spring', label: 'Spring Reverb' },
  { value: 'chamber', label: 'Chamber' },
  { value: 'cathedral', label: 'Cathedral' },
];

export const MixxReverb: React.FC<MixxReverbProps> = ({ isOpen, onClose }) => {
  const [reverbType, setReverbType] = useState('hall');
  const [mix, setMix] = useState(30);
  const [decay, setDecay] = useState(2.5);
  const [predelay, setPredelay] = useState(20);
  const [size, setSize] = useState(50);
  const [damping, setDamping] = useState(6000);
  const [diffusion, setDiffusion] = useState(75);

  return (
    <PluginWindow
      title="MixxReverb"
      category="Spatial Processor"
      isOpen={isOpen}
      onClose={onClose}
      width={650}
      height={450}
    >
      <div className="space-y-6">
        {/* Reverb Type Selector */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground uppercase tracking-wider">Reverb Type</label>
          <Select value={reverbType} onValueChange={setReverbType}>
            <SelectTrigger className="bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REVERB_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Main Controls */}
        <div className="grid grid-cols-3 gap-6">
          <PluginKnob
            label="Mix"
            value={mix}
            min={0}
            max={100}
            unit="%"
            onChange={setMix}
          />
          <PluginKnob
            label="Decay"
            value={decay}
            min={0.1}
            max={10}
            unit="s"
            onChange={setDecay}
          />
          <PluginKnob
            label="Pre-Delay"
            value={predelay}
            min={0}
            max={500}
            unit="ms"
            onChange={setPredelay}
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <PluginKnob
            label="Size"
            value={size}
            min={0}
            max={100}
            unit="%"
            onChange={setSize}
          />
          <PluginKnob
            label="Damping"
            value={damping}
            min={500}
            max={20000}
            unit="Hz"
            onChange={setDamping}
            displayValue={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : `${Math.round(val)}`}
          />
          <PluginKnob
            label="Diffusion"
            value={diffusion}
            min={0}
            max={100}
            unit="%"
            onChange={setDiffusion}
          />
        </div>

        {/* Visualization */}
        <div className="p-6 rounded-lg bg-black/40 border border-white/10">
          <div className="flex items-end justify-around h-32">
            {Array.from({ length: 20 }).map((_, i) => {
              const height = Math.exp(-i / (decay * 2)) * (diffusion / 100) * 100;
              return (
                <div
                  key={i}
                  className="w-2 bg-gradient-to-t from-primary to-primary/30 rounded-t"
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Early</span>
            <span>Reflections</span>
            <span>Tail</span>
          </div>
        </div>
      </div>
    </PluginWindow>
  );
};
