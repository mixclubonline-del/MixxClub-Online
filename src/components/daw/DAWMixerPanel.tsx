import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff,
  Settings,
  Mic,
  Headphones,
  Filter,
  Zap,
  RotateCcw
} from "lucide-react";
import type { Track } from "@/stores/aiStudioStore";

interface DAWMixerPanelProps {
  tracks: Track[];
  onTracksChange: (tracks: Track[]) => void;
  masterVolume: number;
  onMasterVolumeChange: (volume: number) => void;
}

const DAWMixerPanel: React.FC<DAWMixerPanelProps> = ({
  tracks,
  onTracksChange,
  masterVolume,
  onMasterVolumeChange
}) => {
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);

  // Update track property
  const updateTrack = (trackId: string, updates: Partial<Track>) => {
    onTracksChange(
      tracks.map(track => 
        track.id === trackId 
          ? { ...track, ...updates }
          : track
      )
    );
  };

  // Toggle solo (exclusive)
  const toggleSolo = (trackId: string) => {
    onTracksChange(
      tracks.map(track => ({
        ...track,
        solo: track.id === trackId ? !track.solo : false
      }))
    );
  };

  // Add AI effect to track
  const addAIEffect = (trackId: string, effectType: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    const newEffects = {
      ...track.effects,
      [effectType]: {
        enabled: true,
        intensity: 0.5,
        type: effectType
      }
    };

    updateTrack(trackId, { effects: newEffects });
  };

  return (
    <div className="h-full flex flex-col bg-card/10">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Volume2 className="w-4 h-4" />
          Mixer Console
        </h3>
      </div>

      {/* Horizontal Scrollable Mixer */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-3 p-4 h-full min-w-max">
          {/* Track Strips */}
          {tracks.map((track) => (
            <div
              key={track.id}
              className={`w-24 flex flex-col bg-card border rounded-lg p-2 transition-all duration-200 ${
                selectedTrack === track.id 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-muted/30'
              }`}
              onClick={() => setSelectedTrack(track.id)}
            >
              {/* Track Name & Color */}
              <div className="text-center mb-2">
                <div 
                  className="w-full h-1 rounded-full mb-1"
                  style={{ backgroundColor: track.color }}
                />
                <span className="text-xs font-medium truncate block">{track.name}</span>
              </div>

              {/* Mute/Solo Buttons */}
              <div className="flex gap-1 mb-2">
                <Button
                  variant={track.mute ? "destructive" : "ghost"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateTrack(track.id, { mute: !track.mute });
                  }}
                  className="flex-1 h-6 text-xs"
                >
                  M
                </Button>
                <Button
                  variant={track.solo ? "default" : "ghost"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSolo(track.id);
                  }}
                  className="flex-1 h-6 text-xs"
                >
                  S
                </Button>
              </div>

              {/* Level Meter */}
              <div className="flex-1 bg-background rounded p-1 flex flex-col-reverse gap-0.5 mb-2 min-h-[120px]">
                {Array.from({ length: 12 }, (_, i) => {
                  const level = track.volume * 12;
                  const isActive = i < level;
                  let color = 'bg-green-500';
                  if (i > 9) color = 'bg-red-500';
                  else if (i > 7) color = 'bg-yellow-500';

                  return (
                    <div
                      key={i}
                      className={`h-2 rounded-sm transition-colors ${
                        isActive ? color : 'bg-muted'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Vertical Fader */}
              <div className="h-32 flex justify-center mb-2">
                <Slider
                  orientation="vertical"
                  value={[track.volume * 100]}
                  onValueChange={(value) => updateTrack(track.id, { volume: value[0] / 100 })}
                  min={0}
                  max={100}
                  step={1}
                  className="h-full"
                />
              </div>

              {/* Volume Display */}
              <div className="text-xs text-center font-mono mb-2">
                {Math.round(track.volume * 100)}%
              </div>

              {/* AI Effects Buttons */}
              <div className="grid grid-cols-2 gap-1 mb-2">
                <Button
                  variant={(track.effects || []).some(e => e.type === 'reverb') ? "default" : "outline"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    addAIEffect(track.id, 'reverb');
                  }}
                  className="text-[10px] h-6 px-1"
                >
                  Rev
                </Button>
                <Button
                  variant={(track.effects || []).some(e => e.type === 'compressor') ? "default" : "outline"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    addAIEffect(track.id, 'compressor');
                  }}
                  className="text-[10px] h-6 px-1"
                >
                  Comp
                </Button>
                <Button
                  variant={(track.effects || []).some(e => e.type === 'eq') ? "default" : "outline"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    addAIEffect(track.id, 'eq');
                  }}
                  className="text-[10px] h-6 px-1"
                >
                  EQ
                </Button>
                <Button
                  variant={(track.effects || []).some(e => e.type === 'delay') ? "default" : "outline"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    addAIEffect(track.id, 'delay');
                  }}
                  className="text-[10px] h-6 px-1"
                >
                  Dly
                </Button>
              </div>

              {/* Effect Parameters */}
              {(track.effects || []).length > 0 && (
                <div className="space-y-1 pt-2 border-t border-border">
                  {(track.effects || []).map((effect) => (
                    <div key={effect.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground capitalize truncate">
                          {effect.type}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newEffects = (track.effects || []).filter(e => e.id !== effect.id);
                            updateTrack(track.id, { effects: newEffects });
                          }}
                          className="h-3 w-3 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <RotateCcw className="w-2 h-2" />
                        </Button>
                      </div>
                      <Slider
                        value={[((effect.parameters?.intensity || 0.5) as number) * 100]}
                        onValueChange={(value) => {
                          const newEffects = (track.effects || []).map(e =>
                            e.id === effect.id
                              ? {
                                  ...e,
                                  parameters: {
                                    ...e.parameters,
                                    intensity: value[0] / 100
                                  }
                                }
                              : e
                          );
                          updateTrack(track.id, { effects: newEffects });
                        }}
                        min={0}
                        max={100}
                        step={1}
                        className="h-1"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Master Channel */}
          <div className="w-28 flex flex-col bg-primary/10 border-2 border-primary rounded-lg p-3">
            <div className="text-sm font-bold text-center mb-2">MASTER</div>

            {/* Master Level Meter */}
            <div className="flex-1 bg-background rounded p-1 flex flex-col-reverse gap-0.5 mb-2 min-h-[120px]">
              {Array.from({ length: 12 }, (_, i) => {
                const level = masterVolume * 12;
                const isActive = i < level;
                let color = 'bg-green-500';
                if (i > 9) color = 'bg-red-500';
                else if (i > 7) color = 'bg-yellow-500';

                return (
                  <div
                    key={i}
                    className={`h-2 rounded-sm transition-colors ${
                      isActive ? color : 'bg-muted'
                    }`}
                  />
                );
              })}
            </div>

            {/* Master Vertical Fader */}
            <div className="h-32 flex justify-center mb-2">
              <Slider
                orientation="vertical"
                value={[masterVolume * 100]}
                onValueChange={(value) => onMasterVolumeChange(value[0] / 100)}
                min={0}
                max={100}
                step={1}
                className="h-full"
              />
            </div>

            {/* Master Volume Display */}
            <div className="text-sm text-center font-mono font-bold mb-2">
              {Math.round(masterVolume * 100)}%
            </div>

            {/* Master Controls */}
            <div className="grid grid-cols-1 gap-1">
              <Button variant="outline" size="sm" className="text-xs gap-1 h-7">
                <Headphones className="w-3 h-3" />
                Mon
              </Button>
              <Button variant="outline" size="sm" className="text-xs gap-1 h-7">
                <Settings className="w-3 h-3" />
                Set
              </Button>
            </div>
          </div>

          {/* Empty State */}
          {tracks.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Volume2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tracks to mix</p>
              <p className="text-xs">Add tracks to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border bg-muted/10">
        <div className="text-xs text-muted-foreground text-center">
          {tracks.length} channel{tracks.length !== 1 ? 's' : ''} • AI-Enhanced Mixing
        </div>
      </div>
    </div>
  );
};

export default DAWMixerPanel;