import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Volume2, 
  Settings, 
  Zap, 
  Brain, 
  Waves, 
  Mic,
  Users,
  BarChart3,
  Sparkles,
  Headphones
} from 'lucide-react';

interface MixingChannelProps {
  name: string;
  id: string;
  level: number;
  isMuted: boolean;
  isSolo: boolean;
  isActive: boolean;
  waveformData: number[];
  onLevelChange: (level: number) => void;
  onMute: () => void;
  onSolo: () => void;
}

const MixingChannel = ({ 
  name, 
  level, 
  isMuted, 
  isSolo, 
  isActive, 
  waveformData,
  onLevelChange, 
  onMute, 
  onSolo 
}: MixingChannelProps) => {
  return (
    <Card className={`h-96 w-20 relative overflow-hidden transition-all ${
      isActive ? 'ring-2 ring-primary shadow-lg scale-105' : ''
    }`}>
      <CardHeader className="p-2 text-center">
        <h4 className="text-xs font-semibold truncate">{name}</h4>
        <div className="flex flex-col gap-1">
          <Button
            size="sm"
            variant={isSolo ? "default" : "outline"}
            className="h-6 text-xs"
            onClick={onSolo}
          >
            S
          </Button>
          <Button
            size="sm"
            variant={isMuted ? "destructive" : "outline"}
            className="h-6 text-xs"
            onClick={onMute}
          >
            M
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-2 h-full flex flex-col">
        {/* Waveform Visualization */}
        <div className="flex-1 bg-background rounded p-1 mb-2 relative overflow-hidden">
          <div className="h-full flex items-end justify-center gap-px">
            {waveformData.map((amplitude, index) => (
              <div
                key={index}
                className={`w-1 rounded-t transition-all ${
                  isActive ? 'bg-primary' : 'bg-muted-foreground'
                }`}
                style={{ 
                  height: `${Math.max(2, amplitude * 80)}%`,
                  opacity: isActive ? 0.8 + (amplitude * 0.2) : 0.6
                }}
              />
            ))}
          </div>
          {isActive && (
            <div className="absolute inset-0 bg-primary/10 animate-pulse" />
          )}
        </div>
        
        {/* Volume Fader */}
        <div className="flex-1 flex justify-center">
          <Slider
            value={[level]}
            onValueChange={(value) => onLevelChange(value[0])}
            min={0}
            max={100}
            step={1}
            orientation="vertical"
            className="h-full"
          />
        </div>
        
        {/* Level Meter */}
        <div className="text-xs text-center mt-2">
          <span className={level > 80 ? 'text-red-500' : level > 60 ? 'text-yellow-500' : 'text-green-500'}>
            {level}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export const AdvancedMixingStudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [masterVolume, setMasterVolume] = useState(75);
  const [channels, setChannels] = useState([
    { 
      id: '1', 
      name: 'Lead Vocal', 
      level: 85, 
      isMuted: false, 
      isSolo: false, 
      isActive: true,
      waveformData: Array.from({ length: 20 }, () => Math.random())
    },
    { 
      id: '2', 
      name: 'Drums', 
      level: 92, 
      isMuted: false, 
      isSolo: false, 
      isActive: true,
      waveformData: Array.from({ length: 20 }, () => Math.random() * 0.8)
    },
    { 
      id: '3', 
      name: 'Bass', 
      level: 78, 
      isMuted: false, 
      isSolo: false, 
      isActive: false,
      waveformData: Array.from({ length: 20 }, () => Math.random() * 0.6)
    },
    { 
      id: '4', 
      name: 'Guitar', 
      level: 65, 
      isMuted: false, 
      isSolo: false, 
      isActive: true,
      waveformData: Array.from({ length: 20 }, () => Math.random() * 0.7)
    },
    { 
      id: '5', 
      name: 'Keys', 
      level: 58, 
      isMuted: true, 
      isSolo: false, 
      isActive: false,
      waveformData: Array.from({ length: 20 }, () => Math.random() * 0.5)
    }
  ]);

  const [aiSuggestions, setAiSuggestions] = useState([
    { type: 'EQ', message: 'Try reducing 3kHz on Lead Vocal for warmth', confidence: 92 },
    { type: 'Compression', message: 'Bass could use gentle compression (3:1 ratio)', confidence: 87 },
    { type: 'Reverb', message: 'Add hall reverb to vocals for depth', confidence: 78 }
  ]);

  const [collaborators] = useState([
    { name: 'Sarah Chen', role: 'Mix Engineer', isActive: true, avatar: 'SC' },
    { name: 'Mike Rodriguez', role: 'Producer', isActive: true, avatar: 'MR' },
    { name: 'Alex Kim', role: 'Artist', isActive: false, avatar: 'AK' }
  ]);

  // Simulate real-time waveform updates
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setChannels(prev => prev.map(channel => ({
        ...channel,
        waveformData: Array.from({ length: 20 }, () => 
          channel.isActive ? Math.random() * (channel.isMuted ? 0.1 : 1) : Math.random() * 0.3
        )
      })));
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleChannelLevelChange = (channelId: string, level: number) => {
    setChannels(prev => prev.map(channel => 
      channel.id === channelId ? { ...channel, level } : channel
    ));
  };

  const handleChannelMute = (channelId: string) => {
    setChannels(prev => prev.map(channel => 
      channel.id === channelId ? { ...channel, isMuted: !channel.isMuted } : channel
    ));
  };

  const handleChannelSolo = (channelId: string) => {
    setChannels(prev => prev.map(channel => 
      channel.id === channelId ? { ...channel, isSolo: !channel.isSolo } : channel
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header with Master Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setIsPlaying(!isPlaying)}
            size="lg"
            className="gap-2"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            <Slider
              value={[masterVolume]}
              onValueChange={(value) => setMasterVolume(value[0])}
              min={0}
              max={100}
              step={1}
              className="w-32"
            />
            <span className="text-sm font-mono w-8">{masterVolume}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Users className="w-3 h-3" />
            {collaborators.filter(c => c.isActive).length} Live
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Zap className="w-3 h-3" />
            AI Assist
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="mixer" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="mixer" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Mixer
          </TabsTrigger>
          <TabsTrigger value="ai-assist" className="gap-2">
            <Brain className="w-4 h-4" />
            AI Assist
          </TabsTrigger>
          <TabsTrigger value="analysis" className="gap-2">
            <Waves className="w-4 h-4" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="collaboration" className="gap-2">
            <Users className="w-4 h-4" />
            Live Session
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mixer" className="space-y-4">
          {/* Mixing Console */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Digital Mixing Console
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {channels.map((channel) => (
                  <MixingChannel
                    key={channel.id}
                    name={channel.name}
                    id={channel.id}
                    level={channel.level}
                    isMuted={channel.isMuted}
                    isSolo={channel.isSolo}
                    isActive={channel.isActive}
                    waveformData={channel.waveformData}
                    onLevelChange={(level) => handleChannelLevelChange(channel.id, level)}
                    onMute={() => handleChannelMute(channel.id)}
                    onSolo={() => handleChannelSolo(channel.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Real-time Spectrum Analyzer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Waves className="w-5 h-5" />
                Real-time Spectrum Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-background rounded-lg p-4 flex items-end justify-between">
                {Array.from({ length: 30 }, (_, i) => (
                  <div
                    key={i}
                    className="w-2 bg-gradient-to-t from-primary to-accent rounded-t transition-all duration-75"
                    style={{ 
                      height: `${Math.random() * 80 + 10}%`,
                      opacity: isPlaying ? 0.8 : 0.3
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>20Hz</span>
                <span>1kHz</span>
                <span>20kHz</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-assist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Mixing Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{suggestion.type}</Badge>
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs text-muted-foreground">
                            {suggestion.confidence}% confidence
                          </span>
                        </div>
                      </div>
                      <p className="text-sm">{suggestion.message}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Apply
                    </Button>
                  </div>
                  <Progress value={suggestion.confidence} className="mt-2 h-1" />
                </div>
              ))}
              
              <Button className="w-full gap-2">
                <Brain className="w-4 h-4" />
                Analyze Full Mix
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Dynamic Range</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>LUFS</span>
                    <span>-14.2</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  <div className="flex justify-between text-xs">
                    <span>Peak</span>
                    <span>-0.1 dB</span>
                  </div>
                  <Progress value={99} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Phase Correlation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-background rounded flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center">
                    <span className="text-lg font-mono">+0.8</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Live Collaboration Session
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {collaborators.map((collaborator, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                        collaborator.isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {collaborator.avatar}
                      </div>
                      <div>
                        <p className="font-medium">{collaborator.name}</p>
                        <p className="text-xs text-muted-foreground">{collaborator.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {collaborator.isActive && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-600">Live</span>
                        </div>
                      )}
                      <Button size="sm" variant="outline">
                        <Mic className="w-3 h-3 mr-1" />
                        Voice
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 gap-2">
                  <Headphones className="w-4 h-4" />
                  Start Listening Party
                </Button>
                <Button variant="outline" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Session Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};