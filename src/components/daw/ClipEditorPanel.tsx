import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { PluginKnob } from '@/components/plugins/shared/PluginKnob';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Settings, Plus, X } from 'lucide-react';
import type { Track, AudioRegion } from '@/stores/aiStudioStore';

interface ClipEditorPanelProps {
  selectedRegion: AudioRegion | null;
  selectedTrack: Track | null;
  onUpdateRegion?: (regionId: string, updates: Partial<AudioRegion>) => void;
}

export const ClipEditorPanel: React.FC<ClipEditorPanelProps> = ({
  selectedRegion,
  selectedTrack,
  onUpdateRegion,
}) => {
  const [volume, setVolume] = useState(selectedRegion?.gain || 1.0);
  const [pan, setPan] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [reverbSend, setReverbSend] = useState(0);
  const [delaySend, setDelaySend] = useState(0);

  if (!selectedRegion || !selectedTrack) {
    return (
      <div className="h-full glass border-l border-border/50 flex items-center justify-center p-8">
        <div className="text-center text-muted-foreground">
          <Settings className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Select a clip to edit</p>
          <p className="text-xs mt-1">Click on a region in the timeline</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full glass border-l border-border/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/30 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold">CLIP EDITOR</h3>
          <Badge variant="outline" className="text-xs">
            {selectedTrack.name}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Duration: {selectedRegion.duration.toFixed(2)}s
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Knob Controls Grid */}
          <div className="grid grid-cols-2 gap-4">
            <PluginKnob
              label="Volume"
              value={volume}
              min={0}
              max={2}
              unit="x"
              onChange={(v) => {
                setVolume(v);
                onUpdateRegion?.(selectedRegion.id, { gain: v });
              }}
              size="md"
            />
            <PluginKnob
              label="Pan"
              value={pan}
              min={-1}
              max={1}
              onChange={setPan}
              displayValue={(v) => v === 0 ? 'C' : v < 0 ? `L${Math.abs(Math.round(v * 100))}` : `R${Math.round(v * 100)}`}
              size="md"
            />
            <PluginKnob
              label="Pitch"
              value={pitch}
              min={-12}
              max={12}
              unit="st"
              onChange={setPitch}
              size="md"
            />
            <PluginKnob
              label="Speed"
              value={speed}
              min={0.5}
              max={2}
              unit="x"
              onChange={setSpeed}
              size="md"
            />
          </div>

          {/* Insert FX Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-muted-foreground">INSERT FX</h4>
              <Button variant="ghost" size="sm" className="h-6 text-xs">
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>
            {[1, 2, 3, 4].map((slot) => (
              <div key={slot} className="glass-hover p-2 rounded-lg border border-border/20 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Slot {slot}: Empty</span>
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                  <Settings className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>

          {/* Send Controls */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground">SENDS</h4>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">Reverb</span>
                  <span className="text-xs font-mono">{Math.round(reverbSend)}%</span>
                </div>
                <Slider 
                  min={0} 
                  max={100} 
                  step={1} 
                  value={[reverbSend]} 
                  onValueChange={(v) => setReverbSend(v[0])}
                  className="w-full" 
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">Delay</span>
                  <span className="text-xs font-mono">{Math.round(delaySend)}%</span>
                </div>
                <Slider 
                  min={0} 
                  max={100} 
                  step={1} 
                  value={[delaySend]}
                  onValueChange={(v) => setDelaySend(v[0])}
                  className="w-full" 
                />
              </div>
            </div>
          </div>

          {/* Fade Controls */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground">FADES</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs mb-1 block">Fade In</label>
                <Slider 
                  min={0} 
                  max={1000} 
                  step={10} 
                  value={[selectedRegion.fadeIn.duration * 1000]} 
                  onValueChange={(v) => onUpdateRegion?.(selectedRegion.id, {
                    fadeIn: { ...selectedRegion.fadeIn, duration: v[0] / 1000 }
                  })}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {(selectedRegion.fadeIn.duration * 1000).toFixed(0)}ms
                </div>
              </div>
              <div>
                <label className="text-xs mb-1 block">Fade Out</label>
                <Slider 
                  min={0} 
                  max={1000} 
                  step={10} 
                  value={[selectedRegion.fadeOut.duration * 1000]}
                  onValueChange={(v) => onUpdateRegion?.(selectedRegion.id, {
                    fadeOut: { ...selectedRegion.fadeOut, duration: v[0] / 1000 }
                  })}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {(selectedRegion.fadeOut.duration * 1000).toFixed(0)}ms
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
