import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Pause, 
  Square, 
  Mic, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  Settings,
  Users,
  FileAudio,
  AudioWaveform,
  Sparkles,
  Trophy,
  Gamepad2,
  Download,
  Upload
} from "lucide-react";
import DAWTimeline from "@/components/daw/DAWTimeline";
import DAWMixerPanel from "@/components/daw/DAWMixerPanel";
import DAWCollaboration from "@/components/daw/DAWCollaboration";
import DAW3DView from "@/components/daw/DAW3DView";
import DAWEffectsPanel from "@/components/daw/DAWEffectsPanel";
import DAWGamification from "@/components/daw/DAWGamification";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";

export interface Track {
  id: string;
  name: string;
  color: string;
  regions: AudioRegion[];
  solo: boolean;
  mute: boolean;
  volume: number;
  effects: { [key: string]: any };
  automation: AutomationPoint[];
  isRecording?: boolean;
}

export interface AudioRegion {
  id: string;
  start: number;
  end: number;
  url?: string;
  blob?: Blob;
  gain: number;
  fadeIn: number;
  fadeOut: number;
}

export interface AutomationPoint {
  time: number;
  parameter: string;
  value: number;
}

export interface CollaborationUser {
  id: string;
  name: string;
  avatar?: string;
  cursor?: { x: number; y: number };
  status: 'online' | 'offline';
}

const HybridDAW = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Core DAW State
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [masterVolume, setMasterVolume] = useState(0.8);
  
  // View State
  const [view, setView] = useState<'2d' | '3d'>('2d');
  const [activePanel, setActivePanel] = useState<'timeline' | 'mixer' | 'effects' | 'collab' | 'achievements'>('timeline');
  
  // Collaboration State
  const [collaborators, setCollaborators] = useState<CollaborationUser[]>([]);
  const [isCollabConnected, setIsCollabConnected] = useState(false);
  
  // Audio Context References
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  // Gamification State
  const [achievements, setAchievements] = useState<Array<{ id: string; title: string; description: string; unlocked: boolean }>>([
    { id: 'first-track', title: 'First Steps', description: 'Create your first track', unlocked: false },
    { id: 'first-recording', title: 'Sound Engineer', description: 'Record your first audio', unlocked: false },
    { id: 'collab-master', title: 'Team Player', description: 'Collaborate with another user', unlocked: false },
    { id: 'effect-wizard', title: 'Effect Master', description: 'Apply 5 different effects', unlocked: false },
  ]);

  // Initialize Audio Context
  useEffect(() => {
    const initAudio = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('Audio Context initialized');
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
        toast({
          title: "Audio Error",
          description: "Failed to initialize audio system. Some features may not work.",
          variant: "destructive"
        });
      }
    };
    
    initAudio();
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [toast]);

  // Request Microphone Access
  const requestMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });
      streamRef.current = stream;
      toast({
        title: "Microphone Access Granted",
        description: "You can now record audio directly into the DAW.",
      });
    } catch (error) {
      console.error('Microphone access denied:', error);
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to record audio.",
        variant: "destructive"
      });
    }
  };

  // Add New Track
  const addTrack = (type: 'audio' | 'vocal' | 'instrument' = 'audio') => {
    const trackColors = {
      audio: 'hsl(262, 83%, 58%)',
      vocal: 'hsl(280, 70%, 75%)',
      instrument: 'hsl(220, 100%, 70%)'
    };

    const newTrack: Track = {
      id: `track-${Date.now()}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Track ${tracks.length + 1}`,
      color: trackColors[type],
      regions: [],
      solo: false,
      mute: false,
      volume: 0.8,
      effects: {},
      automation: []
    };

    setTracks(prev => [...prev, newTrack]);
    
    // Check for first track achievement
    if (tracks.length === 0) {
      setAchievements(prev => 
        prev.map(achievement => 
          achievement.id === 'first-track' 
            ? { ...achievement, unlocked: true }
            : achievement
        )
      );
      toast({
        title: "Achievement Unlocked!",
        description: "🎉 First Steps - You created your first track!",
      });
    }
  };

  // Start Recording
  const startRecording = async (trackId: string) => {
    if (!streamRef.current) {
      await requestMicrophone();
      return;
    }

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const newRegion: AudioRegion = {
          id: `region-${Date.now()}`,
          start: currentTime,
          end: currentTime + 10, // Default 10 second region
          blob,
          gain: 1,
          fadeIn: 0,
          fadeOut: 0
        };

        setTracks(prev => 
          prev.map(track => 
            track.id === trackId 
              ? { ...track, regions: [...track.regions, newRegion] }
              : track
          )
        );

        // Check for first recording achievement
        setAchievements(prev => 
          prev.map(achievement => 
            achievement.id === 'first-recording' 
              ? { ...achievement, unlocked: true }
              : achievement
          )
        );

        toast({
          title: "Recording Complete",
          description: "Audio recorded successfully!",
        });
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      setTracks(prev => 
        prev.map(track => 
          track.id === trackId 
            ? { ...track, isRecording: true }
            : track
        )
      );

    } catch (error) {
      console.error('Recording failed:', error);
      toast({
        title: "Recording Error",
        description: "Failed to start recording. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      setTracks(prev => 
        prev.map(track => ({ ...track, isRecording: false }))
      );
    }
  };

  // Play/Pause Transport
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    // TODO: Implement actual audio playback logic
  };

  // Stop Transport
  const stopPlayback = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Export Project
  const exportProject = () => {
    // TODO: Implement project export
    toast({
      title: "Export Started",
      description: "Your project is being exported...",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <Card className="p-8 max-w-md w-full mx-4">
            <div className="text-center space-y-4">
              <Sparkles className="w-12 h-12 mx-auto text-primary" />
              <h2 className="text-2xl font-bold">Access Required</h2>
              <p className="text-muted-foreground">
                Please sign in to access the Hybrid AI DAW.
              </p>
              <Button className="w-full" onClick={() => window.location.href = '/auth'}>
                Sign In
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 h-screen flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur">
          <div className="container px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <AudioWaveform className="w-6 h-6 text-primary" />
              Hybrid AI DAW
            </h1>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  Beta
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                {/* Transport Controls */}
                <div className="flex items-center gap-1 bg-card/50 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlayback}
                    className="hover:bg-primary/10"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={stopPlayback}
                    className="hover:bg-primary/10"
                  >
                    <Square className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentTime(0)}
                    className="hover:bg-primary/10"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-card/50 rounded-lg p-1">
                  <Button
                    variant={view === '2d' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setView('2d')}
                    className="text-xs"
                  >
                    2D
                  </Button>
                  <Button
                    variant={view === '3d' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setView('3d')}
                    className="text-xs"
                  >
                    3D
                  </Button>
                </div>

                {/* Actions */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={requestMicrophone}
                  className="gap-2"
                >
                  <Mic className="w-4 h-4" />
                  Mic
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportProject}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Left Sidebar - Tools */}
          <div className="w-64 border-r border-border bg-card/30 flex flex-col">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start gap-2"
                  onClick={() => addTrack('vocal')}
                >
                  <Mic className="w-4 h-4" />
                  Add Vocal Track
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start gap-2"
                  onClick={() => addTrack('instrument')}
                >
                  <FileAudio className="w-4 h-4" />
                  Add Instrument
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start gap-2"
                  onClick={() => {/* TODO: Import beat */}}
                >
                  <Upload className="w-4 h-4" />
                  Import Beat
                </Button>
              </div>
            </div>

            <div className="p-4 border-b border-border">
              <h3 className="font-semibold mb-3">Master Controls</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground">BPM</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Slider
                      value={[bpm]}
                      onValueChange={(value) => setBpm(value[0])}
                      min={60}
                      max={200}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm font-mono w-8">{bpm}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground">Master Volume</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                    <Slider
                      value={[masterVolume * 100]}
                      onValueChange={(value) => setMasterVolume(value[0] / 100)}
                      min={0}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 p-4">
              <Tabs value={activePanel} onValueChange={(value) => setActivePanel(value as any)} className="h-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="effects" className="text-xs">
                    <Settings className="w-3 h-3 mr-1" />
                    Effects
                  </TabsTrigger>
                  <TabsTrigger value="achievements" className="text-xs">
                    <Trophy className="w-3 h-3 mr-1" />
                    Goals
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="effects" className="mt-4 space-y-0">
                  <DAWEffectsPanel tracks={tracks} onTracksChange={setTracks} />
                </TabsContent>
                
                <TabsContent value="achievements" className="mt-4 space-y-0">
                  <DAWGamification achievements={achievements} />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Main Workspace */}
          <div className="flex-1 flex flex-col">
            {view === '2d' ? (
              <div className="flex-1 flex flex-col">
                <DAWTimeline 
                  tracks={tracks}
                  onTracksChange={setTracks}
                  currentTime={currentTime}
                  onTimeChange={setCurrentTime}
                  isPlaying={isPlaying}
                  bpm={bpm}
                  onStartRecording={startRecording}
                  onStopRecording={stopRecording}
                  isRecording={isRecording}
                />
              </div>
            ) : (
              <div className="flex-1">
                <DAW3DView 
                  tracks={tracks}
                  isPlaying={isPlaying}
                  currentTime={currentTime}
                />
              </div>
            )}
          </div>

          {/* Right Sidebar - Mixer & Collaboration */}
          <div className="w-80 border-l border-border bg-card/30">
            <Tabs defaultValue="mixer" className="h-full">
              <TabsList className="grid w-full grid-cols-2 m-2">
                <TabsTrigger value="mixer" className="text-xs">
                  <Volume2 className="w-3 h-3 mr-1" />
                  Mixer
                </TabsTrigger>
                <TabsTrigger value="collab" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  Live
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="mixer" className="mt-0 h-full">
                <DAWMixerPanel 
                  tracks={tracks}
                  onTracksChange={setTracks}
                  masterVolume={masterVolume}
                  onMasterVolumeChange={setMasterVolume}
                />
              </TabsContent>
              
              <TabsContent value="collab" className="mt-0 h-full">
                <DAWCollaboration 
                  sessionId={`session-${user?.id || 'anonymous'}`}
                  userId={user?.id || 'anonymous'}
                  userName={user?.user_metadata?.full_name || user?.email || 'Anonymous'}
                  onTrackUpdate={(trackData) => {
                    // Handle real-time track updates from collaborators
                    console.log('Received track update:', trackData);
                  }}
                  onEffectChange={(trackId, effectData) => {
                    // Handle real-time effect changes from collaborators
                    console.log('Received effect change:', trackId, effectData);
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HybridDAW;