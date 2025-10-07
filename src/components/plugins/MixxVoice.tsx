import React, { useState } from 'react';
import { PluginWindow } from './shared/PluginWindow';
import { PluginKnob } from './shared/PluginKnob';
import { Button } from '@/components/ui/button';
import { Mic, Brain, Activity } from 'lucide-react';

interface MixxVoiceProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MixxVoice: React.FC<MixxVoiceProps> = ({ isOpen, onClose }) => {
  const [pitchCorrection, setPitchCorrection] = useState(50);
  const [formantShift, setFormantShift] = useState(0);
  const [breathControl, setBreathControl] = useState(30);
  const [deEsser, setDeEsser] = useState(40);
  const [detectedKey, setDetectedKey] = useState('C Major');
  const [detectedPitch, setDetectedPitch] = useState('A4');

  return (
    <PluginWindow
      title="MixxVoice"
      category="AI Vocal Coach"
      isOpen={isOpen}
      onClose={onClose}
      width={650}
      height={520}
    >
      <div className="space-y-6">
        {/* Pitch Detection */}
        <div className="grid grid-cols-2 gap-6">
          <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground uppercase tracking-wider">Detected Pitch</span>
            </div>
            <div className="text-3xl font-bold font-mono text-primary">{detectedPitch}</div>
            <div className="text-xs text-muted-foreground mt-1">440 Hz - In tune</div>
          </div>
          
          <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Mic className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-muted-foreground uppercase tracking-wider">Key Detection</span>
            </div>
            <div className="text-3xl font-bold font-mono text-purple-400">{detectedKey}</div>
            <div className="text-xs text-muted-foreground mt-1">95% confidence</div>
          </div>
        </div>

        {/* Pitch Correction Visualization */}
        <div className="p-4 rounded-lg bg-black/40 border border-white/10">
          <div className="text-sm text-muted-foreground mb-3">Pitch Correction Amount</div>
          <svg viewBox="0 0 400 80" className="w-full">
            {/* Grid lines for notes */}
            {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map((note, i) => (
              <g key={note}>
                <line 
                  x1="0" 
                  y1={10 + i * 10} 
                  x2="400" 
                  y2={10 + i * 10} 
                  stroke="rgba(255,255,255,0.05)" 
                />
                <text x="5" y={13 + i * 10} className="text-[8px] fill-muted-foreground">{note}</text>
              </g>
            ))}
            
            {/* Pitch correction curve */}
            <path
              d="M 0 40 Q 100 30 200 40 T 400 40"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              fill="none"
              opacity={pitchCorrection / 100}
            />
          </svg>
        </div>

        {/* Main Controls */}
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
        </div>

        <div className="grid grid-cols-2 gap-6">
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

        {/* AI Coaching */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">AI Vocal Coach</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-primary mt-2" />
              <span>Pitch stability is good, minimal correction needed</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-yellow-500 mt-2" />
              <span>Consider reducing breath noise at 2:15</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-primary mt-2" />
              <span>Sibilance detected at 6-8kHz, de-esser applied</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button className="w-full">
          <Brain className="w-4 h-4 mr-2" />
          Analyze & Apply AI Corrections
        </Button>
      </div>
    </PluginWindow>
  );
};
