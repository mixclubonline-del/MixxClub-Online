/**
 * DrumMachine808 - Pad-based 808 drum machine with slide and presets
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { audioEngine } from '@/services/audioEngine';
import { TR808Engine, TR808_PRESETS, TR808Preset } from '@/audio/synth/TR808Engine';
import { Settings2, Volume2 } from 'lucide-react';

interface DrumMachine808Props {
  onNoteTriggered?: (note: number, velocity: number) => void;
}

// Note layout for pads (low to high)
const PAD_NOTES = [
  { note: 36, label: 'C1' },
  { note: 38, label: 'D1' },
  { note: 40, label: 'E1' },
  { note: 41, label: 'F1' },
  { note: 43, label: 'G1' },
  { note: 45, label: 'A1' },
  { note: 47, label: 'B1' },
  { note: 48, label: 'C2' },
];

export const DrumMachine808: React.FC<DrumMachine808Props> = ({ onNoteTriggered }) => {
  // State
  const [activePreset, setActivePreset] = useState<string>('atlanta-trap');
  const [volume, setVolume] = useState(80);
  const [slideEnabled, setSlideEnabled] = useState(true);
  const [activePads, setActivePads] = useState<Set<number>>(new Set());
  const [showSettings, setShowSettings] = useState(false);
  
  // Custom parameters
  const [decay, setDecay] = useState(2.5);
  const [slideTime, setSlideTime] = useState(80);
  const [pitchEnv, setPitchEnv] = useState(40);
  const [saturation, setSaturation] = useState(15);
  
  // Engine ref
  const engineRef = useRef<TR808Engine | null>(null);
  
  // Initialize engine
  useEffect(() => {
    const init = async () => {
      await audioEngine.resume();
      engineRef.current = new TR808Engine(audioEngine.ctx, audioEngine.master.input);
      engineRef.current.setPreset(activePreset);
    };
    
    init();
    
    return () => {
      engineRef.current?.stop();
    };
  }, []);
  
  // Update preset
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setPreset(activePreset);
      
      // Update local state from preset
      const preset = TR808_PRESETS[activePreset];
      if (preset) {
        setDecay(preset.decay);
        setSlideTime(preset.slideTime * 1000); // Convert to ms
        setPitchEnv(preset.pitchEnvAmount);
        setSaturation(preset.saturation);
      }
    }
  }, [activePreset]);
  
  // Update volume
  useEffect(() => {
    engineRef.current?.setVolume(volume / 100);
  }, [volume]);
  
  // Update custom parameters
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setParameter('decay', decay);
      engineRef.current.setParameter('slideTime', slideTime / 1000);
      engineRef.current.setParameter('pitchEnvAmount', pitchEnv);
      engineRef.current.setParameter('saturation', saturation);
    }
  }, [decay, slideTime, pitchEnv, saturation]);
  
  // Handle pad press
  const handlePadPress = (noteInfo: typeof PAD_NOTES[0]) => {
    if (!engineRef.current) return;
    
    const frequency = TR808Engine.midiToFreq(noteInfo.note);
    const velocity = 1.0;
    
    // Temporarily disable slide if not enabled
    if (!slideEnabled) {
      engineRef.current.setParameter('slideTime', 0);
    }
    
    engineRef.current.trigger(frequency, velocity);
    
    // Restore slide time
    if (!slideEnabled) {
      engineRef.current.setParameter('slideTime', slideTime / 1000);
    }
    
    // Visual feedback
    setActivePads(prev => new Set([...prev, noteInfo.note]));
    setTimeout(() => {
      setActivePads(prev => {
        const next = new Set(prev);
        next.delete(noteInfo.note);
        return next;
      });
    }, 150);
    
    onNoteTriggered?.(noteInfo.note, 127);
  };
  
  // Handle keyboard input
  useEffect(() => {
    const keyMap: Record<string, number> = {
      'z': 0, 'x': 1, 'c': 2, 'v': 3,
      'a': 4, 's': 5, 'd': 6, 'f': 7,
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const padIndex = keyMap[e.key.toLowerCase()];
      if (padIndex !== undefined && PAD_NOTES[padIndex]) {
        handlePadPress(PAD_NOTES[padIndex]);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slideEnabled, slideTime]);
  
  return (
    <Card className="p-4 bg-gradient-to-b from-[hsl(230,35%,10%)] to-[hsl(230,30%,8%)] border-primary/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-display font-semibold text-primary tracking-wide">TR-808</h3>
          <Select value={activePreset} onValueChange={setActivePreset}>
            <SelectTrigger className="w-[140px] h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(TR808_PRESETS).map(preset => (
                <SelectItem key={preset.id} value={preset.id}>
                  {preset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={slideEnabled ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setSlideEnabled(!slideEnabled)}
          >
            Slide
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Pad Grid */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {PAD_NOTES.map((pad, index) => (
          <button
            key={pad.note}
            onMouseDown={() => handlePadPress(pad)}
            onTouchStart={(e) => {
              e.preventDefault();
              handlePadPress(pad);
            }}
            className={cn(
              'aspect-square rounded-lg transition-all duration-75',
              'flex flex-col items-center justify-center gap-1',
              'bg-gradient-to-b border',
              activePads.has(pad.note)
                ? 'from-primary to-primary/70 border-primary shadow-[0_0_20px_hsl(var(--primary)/0.5)] scale-95'
                : 'from-[hsl(230,35%,16%)] to-[hsl(230,35%,12%)] border-white/10 hover:from-[hsl(230,35%,20%)] hover:border-white/20'
            )}
          >
            <span className="text-lg font-bold">{pad.label}</span>
            <span className="text-[10px] text-muted-foreground opacity-50">
              {['Z', 'X', 'C', 'V', 'A', 'S', 'D', 'F'][index]}
            </span>
          </button>
        ))}
      </div>
      
      {/* Volume */}
      <div className="flex items-center gap-3 mb-4">
        <Volume2 className="w-4 h-4 text-muted-foreground" />
        <Slider
          value={[volume]}
          onValueChange={([v]) => setVolume(v)}
          min={0}
          max={100}
          step={1}
          className="flex-1"
        />
        <span className="text-xs text-muted-foreground w-8 text-right">{volume}%</span>
      </div>
      
      {/* Settings Panel */}
      {showSettings && (
        <div className="space-y-3 pt-4 border-t border-white/10">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Decay</label>
              <Slider
                value={[decay * 100]}
                onValueChange={([v]) => setDecay(v / 100)}
                min={10}
                max={500}
                step={10}
              />
              <span className="text-xs text-primary">{decay.toFixed(1)}s</span>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Slide Time</label>
              <Slider
                value={[slideTime]}
                onValueChange={([v]) => setSlideTime(v)}
                min={0}
                max={300}
                step={5}
              />
              <span className="text-xs text-primary">{slideTime}ms</span>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Pitch Env</label>
              <Slider
                value={[pitchEnv]}
                onValueChange={([v]) => setPitchEnv(v)}
                min={0}
                max={100}
                step={5}
              />
              <span className="text-xs text-primary">{pitchEnv}%</span>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Saturation</label>
              <Slider
                value={[saturation]}
                onValueChange={([v]) => setSaturation(v)}
                min={0}
                max={100}
                step={5}
              />
              <span className="text-xs text-primary">{saturation}%</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
