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
import type { Track } from "@/pages/HybridDAW";

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
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Volume2 className="w-4 h-4" />
          Mixer Console
        </h3>
      </div>

      {/* Master Section */}
      <div className="p-4 border-b border-border bg-muted/20">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Master</span>
            <Badge variant="secondary" className="text-xs">
              {Math.round(masterVolume * 100)}%
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <VolumeX className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={[masterVolume * 100]}
              onValueChange={(value) => onMasterVolumeChange(value[0] / 100)}
              min={0}
              max={100}
              step={1}
              className="flex-1"
              orientation="horizontal"
            />
            <Volume2 className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="text-xs gap-1">
              <Headphones className="w-3 h-3" />
              Monitor
            </Button>
            <Button variant="outline" size="sm" className="text-xs gap-1">
              <Settings className="w-3 h-3" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Track Strips */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {tracks.map((track) => (
          <Card 
            key={track.id}
            className={`p-3 transition-all duration-200 cursor-pointer ${
              selectedTrack === track.id 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:bg-muted/30'
            }`}
            onClick={() => setSelectedTrack(track.id)}
          >
            {/* Track Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: track.color }}
                />
                <span className="text-sm font-medium truncate">{track.name}</span>
              </div>
              <div className="flex gap-1">
                <Button
                  variant={track.solo ? "default" : "ghost"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSolo(track.id);
                  }}
                  className="h-6 w-6 p-0 text-xs"
                >
                  S
                </Button>
                <Button
                  variant={track.mute ? "destructive" : "ghost"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateTrack(track.id, { mute: !track.mute });
                  }}
                  className="h-6 w-6 p-0 text-xs"
                >
                  M
                </Button>
              </div>
            </div>

            {/* Volume Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Volume</span>
                <span className="text-xs font-mono">
                  {Math.round(track.volume * 100)}%
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <VolumeX className="w-3 h-3 text-muted-foreground" />
                <Slider
                  value={[track.volume * 100]}
                  onValueChange={(value) => updateTrack(track.id, { volume: value[0] / 100 })}
                  min={0}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <Volume2 className="w-3 h-3 text-muted-foreground" />
              </div>
            </div>

            {/* AI Effects */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">AI Effects</span>
                <Zap className="w-3 h-3 text-primary" />
              </div>
              
              <div className="grid grid-cols-2 gap-1">
                <Button
                  variant={track.effects.reverb ? "default" : "outline"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    addAIEffect(track.id, 'reverb');
                  }}
                  className="text-xs h-7"
                >
                  Reverb
                </Button>
                <Button
                  variant={track.effects.pitch ? "default" : "outline"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    addAIEffect(track.id, 'pitch');
                  }}
                  className="text-xs h-7"
                >
                  Pitch
                </Button>
                <Button
                  variant={track.effects.harmony ? "default" : "outline"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    addAIEffect(track.id, 'harmony');
                  }}
                  className="text-xs h-7"
                >
                  Harmony
                </Button>
                <Button
                  variant={track.effects.filter ? "default" : "outline"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    addAIEffect(track.id, 'filter');
                  }}
                  className="text-xs h-7"
                >
                  Filter
                </Button>
              </div>

              {/* Effect Parameters */}
              {Object.keys(track.effects).length > 0 && (
                <div className="space-y-1">
                  {Object.entries(track.effects).map(([effectName, effect]) => (
                    <div key={effectName} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground capitalize">
                          {effectName}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newEffects = { ...track.effects };
                            delete newEffects[effectName];
                            updateTrack(track.id, { effects: newEffects });
                          }}
                          className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <RotateCcw className="w-2 h-2" />
                        </Button>
                      </div>
                      <Slider
                        value={[effect.intensity * 100]}
                        onValueChange={(value) => {
                          const newEffects = {
                            ...track.effects,
                            [effectName]: {
                              ...effect,
                              intensity: value[0] / 100
                            }
                          };
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

            {/* Meters */}
            <div className="mt-3 flex gap-1 h-2">
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm ${
                    i < Math.floor(track.volume * 8)
                      ? i < 5 
                        ? 'bg-green-500' 
                        : i < 7 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </Card>
        ))}

        {tracks.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Volume2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tracks to mix</p>
            <p className="text-xs">Add tracks to get started</p>
          </div>
        )}
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