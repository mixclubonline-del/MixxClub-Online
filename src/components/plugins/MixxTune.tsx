import React, { useState } from 'react';
import { PluginWindow } from './shared/PluginWindow';
import { PluginKnob } from './shared/PluginKnob';
import { Button } from '@/components/ui/button';
import { AIBrainIcon } from './shared/AIBrainIcon';
import { Activity } from 'lucide-react';

interface MixxTuneProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MixxTune: React.FC<MixxTuneProps> = ({ isOpen, onClose }) => {
  const [pitchCorrection, setPitchCorrection] = useState(50);
  const [formantShift, setFormantShift] = useState(0);
  const [breathControl, setBreathControl] = useState(30);
  const [deEsser, setDeEsser] = useState(40);

  return (
    <PluginWindow
      title="MixxTune"
      category="AI Vocal Coach"
      isOpen={isOpen}
      onClose={onClose}
      width={650}
      height={500}
    >
      <div className="space-y-6">
        {/* Main Controls in 2x2 Grid */}
        <div className="grid grid-cols-2 gap-6">
          <PluginKnob
            label="Pitch Correct"
            value={pitchCorrection}
            min={0}
            max={100}
            unit="%"
            onChange={setPitchCorrection}
          />
          <PluginKnob
            label="Formant Shift"
            value={formantShift}
            min={-12}
            max={12}
            unit=" st"
            onChange={setFormantShift}
          />
          <PluginKnob
            label="Breath Control"
            value={breathControl}
            min={0}
            max={100}
            unit="%"
            onChange={setBreathControl}
          />
          <PluginKnob
            label="De-Esser"
            value={deEsser}
            min={0}
            max={100}
            unit="%"
            onChange={setDeEsser}
          />
        </div>

        {/* AI Coach Section */}
        <div className="p-6 rounded-lg bg-gradient-to-br from-mixx-pink/10 via-mixx-lavender/10 to-mixx-cyan/10 border border-mixx-lavender/30">
          <div className="flex items-center gap-3 mb-4">
            <AIBrainIcon size={24} />
            <span className="text-lg font-bold text-white">AI Coach Feedback</span>
          </div>
          
          {/* Feedback text box */}
          <div className="p-4 rounded-lg bg-mixx-navy-deep/60 border border-mixx-cyan/30 space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Activity className="w-4 h-4 text-mixx-cyan mt-0.5 flex-shrink-0" />
              <span className="text-white">Pitch stability is excellent - minimal correction needed</span>
            </div>
            <div className="flex items-start gap-3">
              <Activity className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <span className="text-white">Consider reducing breath noise around 2:15</span>
            </div>
            <div className="flex items-start gap-3">
              <Activity className="w-4 h-4 text-mixx-cyan mt-0.5 flex-shrink-0" />
              <span className="text-white">Sibilance detected at 6-8kHz, de-esser applied</span>
            </div>
          </div>
        </div>

        {/* Action Button with gradient */}
        <Button 
          className="w-full bg-mixx-gradient text-white font-bold hover:opacity-90 transition-opacity"
          size="lg"
        >
          <AIBrainIcon size={18} className="mr-2" />
          Analyze & Apply AI Corrections
        </Button>
      </div>
    </PluginWindow>
  );
};
