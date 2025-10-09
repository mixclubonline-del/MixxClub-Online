import React, { useState } from 'react';
import { PluginWindow } from './shared/PluginWindow';
import { PluginKnob } from './shared/PluginKnob';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MixxVintageProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MixxVintage: React.FC<MixxVintageProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState('tape');
  const [saturation, setSaturation] = useState(30);
  const [wow, setWow] = useState(10);
  const [flutter, setFlutter] = useState(5);
  const [hiss, setHiss] = useState(15);
  const [warmth, setWarmth] = useState(50);

  return (
    <PluginWindow title="MixxVintage" category="Tape & Vinyl" isOpen={isOpen} onClose={onClose} width={600} height={450}>
      <div className="space-y-6">
        <Select value={mode} onValueChange={setMode}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="tape">Analog Tape</SelectItem>
            <SelectItem value="vinyl">Vinyl Record</SelectItem>
            <SelectItem value="cassette">Cassette</SelectItem>
          </SelectContent>
        </Select>
        <div className="grid grid-cols-3 gap-6">
          <PluginKnob label="Saturation" value={saturation} min={0} max={100} unit="%" onChange={setSaturation} />
          <PluginKnob label="Wow" value={wow} min={0} max={50} unit="%" onChange={setWow} />
          <PluginKnob label="Flutter" value={flutter} min={0} max={50} unit="%" onChange={setFlutter} />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <PluginKnob label="Hiss" value={hiss} min={0} max={100} unit="%" onChange={setHiss} />
          <PluginKnob label="Warmth" value={warmth} min={0} max={100} unit="%" onChange={setWarmth} />
        </div>
      </div>
    </PluginWindow>
  );
};
