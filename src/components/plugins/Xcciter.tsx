import React, { useState } from 'react';
import { PluginWindow } from './shared/PluginWindow';
import { PluginKnob } from './shared/PluginKnob';
import { WaveformVisualizer } from './shared/WaveformVisualizer';

interface XcciterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Xcciter: React.FC<XcciterProps> = ({ isOpen, onClose }) => {
  const [harmonics, setHarmonics] = useState(50);
  const [brilliance, setBrilliance] = useState(50);

  return (
    <PluginWindow
      title="Xcciter"
      category="Harmonic Enhancer"
      isOpen={isOpen}
      onClose={onClose}
      width={500}
      height={480}
    >
      <div className="space-y-8">
        {/* X'Z Logo */}
        <div className="flex justify-center">
          <div 
            className="text-6xl font-black tracking-tighter"
            style={{
              background: 'linear-gradient(135deg, #FF70D0, #C5A3FF, #70E6FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 30px rgba(197,163,255,0.5)',
            }}
          >
            X'Z
          </div>
        </div>

        {/* Two large knobs */}
        <div className="grid grid-cols-2 gap-8">
          <div className="text-center space-y-2">
            <PluginKnob
              label="Harmonics"
              value={harmonics}
              min={0}
              max={100}
              unit="%"
              onChange={setHarmonics}
              size="lg"
            />
            <div className="text-sm text-mixx-cyan font-mono">
              {harmonics.toFixed(0)}% Gain
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <PluginKnob
              label="Brilliance"
              value={brilliance}
              min={0}
              max={100}
              unit="%"
              onChange={setBrilliance}
              size="lg"
            />
            <div className="text-sm text-mixx-pink font-mono">
              {brilliance.toFixed(0)}% Mix
            </div>
          </div>
        </div>

        {/* Central waveform visualization */}
        <div className="p-4 rounded-lg bg-mixx-navy-deep/60 border border-mixx-lavender/20">
          <WaveformVisualizer height={100} amplitude={0.5 + (harmonics / 100) * 0.5} />
        </div>
      </div>
    </PluginWindow>
  );
};
