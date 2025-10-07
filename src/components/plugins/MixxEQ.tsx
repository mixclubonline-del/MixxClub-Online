import React, { useState, useEffect } from 'react';
import { PluginWindow } from './shared/PluginWindow';
import { PluginKnob } from './shared/PluginKnob';
import { SpectrumAnalyzer } from './shared/SpectrumAnalyzer';
import { Button } from '@/components/ui/button';
import { Sparkles, RotateCcw } from 'lucide-react';
import { AISuggestion } from '@/types/mixxPlugin';

interface MixxEQProps {
  isOpen: boolean;
  onClose: () => void;
  audioContext?: AudioContext;
}

export const MixxEQ: React.FC<MixxEQProps> = ({ isOpen, onClose, audioContext }) => {
  const [analyser, setAnalyser] = useState<AnalyserNode>();
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  
  const [bands, setBands] = useState([
    { id: 'low', freq: 80, gain: 0, q: 1.0, label: 'Low' },
    { id: 'lowMid', freq: 250, gain: 0, q: 1.0, label: 'Low Mid' },
    { id: 'mid', freq: 1000, gain: 0, q: 1.0, label: 'Mid' },
    { id: 'highMid', freq: 3000, gain: 0, q: 1.0, label: 'High Mid' },
    { id: 'high', freq: 8000, gain: 0, q: 1.0, label: 'High' },
    { id: 'air', freq: 16000, gain: 0, q: 1.0, label: 'Air' },
  ]);

  useEffect(() => {
    if (audioContext && isOpen) {
      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 2048;
      setAnalyser(analyserNode);
    }
  }, [audioContext, isOpen]);

  const updateBand = (id: string, param: string, value: number) => {
    setBands(prev => prev.map(band => 
      band.id === id ? { ...band, [param]: value } : band
    ));
  };

  const resetAll = () => {
    setBands(prev => prev.map(band => ({ ...band, gain: 0, q: 1.0 })));
  };

  const applyAISuggestion = (suggestion: AISuggestion) => {
    updateBand(suggestion.parameter, 'gain', suggestion.suggestedValue);
  };

  return (
    <PluginWindow
      title="MixxEQ"
      category="6-Band Parametric EQ"
      isOpen={isOpen}
      onClose={onClose}
      width={800}
      height={600}
    >
      <div className="space-y-6">
        {/* Spectrum Analyzer */}
        <SpectrumAnalyzer 
          analyser={analyser} 
          width={752} 
          height={180}
          showGrid
        />

        {/* EQ Bands */}
        <div className="grid grid-cols-6 gap-4">
          {bands.map(band => (
            <div key={band.id} className="space-y-3">
              <PluginKnob
                label="Gain"
                value={band.gain}
                min={-18}
                max={18}
                unit="dB"
                onChange={(val) => updateBand(band.id, 'gain', val)}
                aiSuggested={aiSuggestions.some(s => s.parameter === band.id)}
              />
              <PluginKnob
                label="Freq"
                value={band.freq}
                min={20}
                max={20000}
                unit="Hz"
                onChange={(val) => updateBand(band.id, 'freq', val)}
                size="sm"
                displayValue={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : `${Math.round(val)}`}
              />
              <PluginKnob
                label="Q"
                value={band.q}
                min={0.1}
                max={10}
                onChange={(val) => updateBand(band.id, 'q', val)}
                size="sm"
              />
              <div className="text-center text-xs text-muted-foreground uppercase tracking-wider">
                {band.label}
              </div>
            </div>
          ))}
        </div>

        {/* AI Suggestions */}
        {aiSuggestions.length > 0 && (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">AI Suggestions</span>
            </div>
            <div className="space-y-2">
              {aiSuggestions.map(suggestion => (
                <div key={suggestion.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{suggestion.reason}</span>
                  <Button size="sm" variant="outline" onClick={() => applyAISuggestion(suggestion)}>
                    Apply
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={resetAll}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset All
          </Button>
          <Button>
            <Sparkles className="w-4 h-4 mr-2" />
            Get AI Suggestions
          </Button>
        </div>
      </div>
    </PluginWindow>
  );
};
