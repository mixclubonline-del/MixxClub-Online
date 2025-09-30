import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, 
  Sparkles, 
  Settings, 
  RotateCcw,
  Wand2,
  Brain,
  Music,
  Headphones,
  Filter,
  Volume2,
  Waves
} from "lucide-react";
import type { Track } from "@/pages/HybridDAW";

interface DAWEffectsPanelProps {
  tracks: Track[];
  onTracksChange: (tracks: Track[]) => void;
}

interface AIEffect {
  id: string;
  name: string;
  description: string;
  category: 'vocal' | 'instrument' | 'spatial' | 'creative';
  icon: React.ElementType;
  parameters: {
    [key: string]: {
      name: string;
      min: number;
      max: number;
      default: number;
      unit?: string;
    };
  };
}

const aiEffects: AIEffect[] = [
  {
    id: 'pitch',
    name: 'AI Pitch Correction',
    description: 'Intelligent pitch correction with natural vibrato preservation',
    category: 'vocal',
    icon: Music,
    parameters: {
      correction: { name: 'Correction', min: 0, max: 100, default: 50, unit: '%' },
      speed: { name: 'Speed', min: 0, max: 100, default: 30, unit: 'ms' },
      preserve: { name: 'Preserve Vibrato', min: 0, max: 100, default: 70, unit: '%' }
    }
  },
  {
    id: 'harmony',
    name: 'Smart Harmony',
    description: 'AI-generated harmonies that adapt to your vocal style',
    category: 'vocal',
    icon: Waves,
    parameters: {
      voices: { name: 'Voice Count', min: 1, max: 4, default: 2 },
      spread: { name: 'Harmonic Spread', min: 0, max: 100, default: 50, unit: '%' },
      intelligence: { name: 'AI Intelligence', min: 0, max: 100, default: 80, unit: '%' }
    }
  },
  {
    id: 'reverb',
    name: 'Neural Reverb',
    description: 'AI-powered reverb that learns from professional studios',
    category: 'spatial',
    icon: Sparkles,
    parameters: {
      room: { name: 'Room Size', min: 0, max: 100, default: 40, unit: '%' },
      decay: { name: 'Decay Time', min: 0, max: 100, default: 35, unit: 's' },
      intelligence: { name: 'AI Modeling', min: 0, max: 100, default: 75, unit: '%' }
    }
  },
  {
    id: 'filter',
    name: 'Adaptive Filter',
    description: 'Smart filtering that responds to musical content',
    category: 'instrument',
    icon: Filter,
    parameters: {
      cutoff: { name: 'Cutoff', min: 20, max: 20000, default: 1000, unit: 'Hz' },
      resonance: { name: 'Resonance', min: 0, max: 100, default: 25, unit: '%' },
      tracking: { name: 'Content Tracking', min: 0, max: 100, default: 60, unit: '%' }
    }
  },
  {
    id: 'enhance',
    name: 'AI Enhancer',
    description: 'Intelligent audio enhancement and clarity boost',
    category: 'creative',
    icon: Zap,
    parameters: {
      clarity: { name: 'Clarity', min: 0, max: 100, default: 40, unit: '%' },
      warmth: { name: 'Warmth', min: 0, max: 100, default: 30, unit: '%' },
      presence: { name: 'Presence', min: 0, max: 100, default: 50, unit: '%' }
    }
  },
  {
    id: 'spatial',
    name: 'AI Spatializer',
    description: 'Create immersive 3D audio positioning',
    category: 'spatial',
    icon: Brain,
    parameters: {
      width: { name: 'Stereo Width', min: 0, max: 200, default: 100, unit: '%' },
      depth: { name: '3D Depth', min: 0, max: 100, default: 30, unit: '%' },
      movement: { name: 'Auto Movement', min: 0, max: 100, default: 0, unit: '%' }
    }
  }
];

const DAWEffectsPanel: React.FC<DAWEffectsPanelProps> = ({
  tracks,
  onTracksChange
}) => {
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const selectedTrackData = tracks.find(t => t.id === selectedTrack);

  const addEffect = (trackId: string, effectId: string) => {
    const effect = aiEffects.find(e => e.id === effectId);
    if (!effect) return;

    const defaultParams = Object.entries(effect.parameters).reduce((acc, [key, param]) => ({
      ...acc,
      [key]: param.default
    }), {});

    onTracksChange(
      tracks.map(track => 
        track.id === trackId 
          ? { 
              ...track, 
              effects: {
                ...track.effects,
                [effectId]: {
                  id: effectId,
                  enabled: true,
                  parameters: defaultParams
                }
              }
            }
          : track
      )
    );
  };

  const removeEffect = (trackId: string, effectId: string) => {
    onTracksChange(
      tracks.map(track => 
        track.id === trackId 
          ? { 
              ...track, 
              effects: Object.fromEntries(
                Object.entries(track.effects).filter(([key]) => key !== effectId)
              )
            }
          : track
      )
    );
  };

  const updateEffectParameter = (trackId: string, effectId: string, paramKey: string, value: number) => {
    onTracksChange(
      tracks.map(track => 
        track.id === trackId 
          ? { 
              ...track, 
              effects: {
                ...track.effects,
                [effectId]: {
                  ...track.effects[effectId],
                  parameters: {
                    ...track.effects[effectId].parameters,
                    [paramKey]: value
                  }
                }
              }
            }
          : track
      )
    );
  };

  const toggleEffect = (trackId: string, effectId: string) => {
    onTracksChange(
      tracks.map(track => 
        track.id === trackId 
          ? { 
              ...track, 
              effects: {
                ...track.effects,
                [effectId]: {
                  ...track.effects[effectId],
                  enabled: !track.effects[effectId].enabled
                }
              }
            }
          : track
      )
    );
  };

  const filteredEffects = activeCategory === 'all' 
    ? aiEffects 
    : aiEffects.filter(effect => effect.category === activeCategory);

  return (
    <div className="h-full flex flex-col">
      {/* Track Selection */}
      <div className="p-3 border-b border-border">
        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-primary" />
          AI Effects Studio
        </h4>
        
        {tracks.length > 0 ? (
          <div className="space-y-1">
            {tracks.map((track) => (
              <Button
                key={track.id}
                variant={selectedTrack === track.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedTrack(track.id)}
                className="w-full justify-start text-xs gap-2"
              >
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: track.color }}
                />
                {track.name}
                {Object.keys(track.effects).length > 0 && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {Object.keys(track.effects).length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            Add tracks to access effects
          </div>
        )}
      </div>

      {selectedTrackData && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Category Tabs */}
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="flex-1">
            <TabsList className="grid w-full grid-cols-3 mx-3 mt-3">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="vocal" className="text-xs">Vocal</TabsTrigger>
              <TabsTrigger value="spatial" className="text-xs">Spatial</TabsTrigger>
            </TabsList>

            <TabsContent value={activeCategory} className="flex-1 m-0 overflow-y-auto">
              <div className="p-3 space-y-3">
                {/* Available Effects */}
                <div className="space-y-2">
                  {filteredEffects.map((effect) => {
                    const isActive = selectedTrackData.effects[effect.id];
                    const IconComponent = effect.icon;
                    
                    return (
                      <Card key={effect.id} className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4 text-primary" />
                            <div>
                              <div className="text-sm font-medium">{effect.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {effect.description}
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            onClick={() => 
                              isActive 
                                ? removeEffect(selectedTrackData.id, effect.id)
                                : addEffect(selectedTrackData.id, effect.id)
                            }
                            className="text-xs"
                          >
                            {isActive ? 'Remove' : 'Add'}
                          </Button>
                        </div>

                        {/* Effect Parameters */}
                        {isActive && (
                          <div className="space-y-3 pt-3 border-t border-border">
                            <div className="flex items-center justify-between">
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${
                                  selectedTrackData.effects[effect.id].enabled 
                                    ? 'bg-green-500/20 text-green-600' 
                                    : 'bg-red-500/20 text-red-600'
                                }`}
                              >
                                {selectedTrackData.effects[effect.id].enabled ? 'Enabled' : 'Bypassed'}
                              </Badge>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleEffect(selectedTrackData.id, effect.id)}
                                className="h-6 text-xs"
                              >
                                {selectedTrackData.effects[effect.id].enabled ? 'Bypass' : 'Enable'}
                              </Button>
                            </div>

                            {Object.entries(effect.parameters).map(([paramKey, param]) => (
                              <div key={paramKey} className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs text-muted-foreground">
                                    {param.name}
                                  </label>
                                  <span className="text-xs font-mono">
                                    {selectedTrackData.effects[effect.id].parameters[paramKey]}
                                    {param.unit}
                                  </span>
                                </div>
                                <Slider
                                  value={[selectedTrackData.effects[effect.id].parameters[paramKey]]}
                                  onValueChange={(value) => 
                                    updateEffectParameter(
                                      selectedTrackData.id, 
                                      effect.id, 
                                      paramKey, 
                                      value[0]
                                    )
                                  }
                                  min={param.min}
                                  max={param.max}
                                  step={(param.max - param.min) / 100}
                                  className="h-1"
                                />
                              </div>
                            ))}

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Reset to defaults
                                const defaultParams = Object.entries(effect.parameters).reduce((acc, [key, p]) => ({
                                  ...acc,
                                  [key]: p.default
                                }), {});
                                
                                onTracksChange(
                                  tracks.map(track => 
                                    track.id === selectedTrackData.id 
                                      ? { 
                                          ...track, 
                                          effects: {
                                            ...track.effects,
                                            [effect.id]: {
                                              ...track.effects[effect.id],
                                              parameters: defaultParams
                                            }
                                          }
                                        }
                                      : track
                                  )
                                );
                              }}
                              className="w-full text-xs gap-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Reset to Defaults
                            </Button>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {!selectedTrackData && tracks.length > 0 && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-muted-foreground">
            <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select a track to access AI effects</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DAWEffectsPanel;