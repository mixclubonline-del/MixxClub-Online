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
    <PluginWindow title="MixxVintage" category="Tape & Vinyl" isOpen={isOpen} onClose={onClose} width={600} height={480}>
      <div className="space-y-6 p-6">
        {/* Mode selector with glass effect */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger className="bg-gradient-to-r from-[hsl(230_35%_14%)] to-[hsl(230_30%_12%)] 
              border-[hsl(185_100%_50%/0.2)] hover:border-[hsl(185_100%_50%/0.4)] transition-all">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[hsl(235_45%_10%)] border-[hsl(185_100%_50%/0.2)]">
              <SelectItem value="tape">Analog Tape</SelectItem>
              <SelectItem value="vinyl">Vinyl Record</SelectItem>
              <SelectItem value="cassette">Cassette</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Main controls */}
        <div className="grid grid-cols-3 gap-8">
          <PluginKnob label="Saturation" value={saturation} min={0} max={100} unit="%" onChange={setSaturation} />
          <PluginKnob label="Wow" value={wow} min={0} max={50} unit="%" onChange={setWow} />
          <PluginKnob label="Flutter" value={flutter} min={0} max={50} unit="%" onChange={setFlutter} />
        </div>
        
        {/* Secondary controls */}
        <div className="grid grid-cols-2 gap-8 pt-4">
          <PluginKnob label="Hiss" value={hiss} min={0} max={100} unit="%" onChange={setHiss} />
          <PluginKnob label="Warmth" value={warmth} min={0} max={100} unit="%" onChange={setWarmth} />
        </div>
      </div>
    </PluginWindow>
  );
};
