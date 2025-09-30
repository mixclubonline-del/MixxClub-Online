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
import EnhancedDAWTimeline from "@/components/daw/EnhancedDAWTimeline";
import DAWMixerPanel from "@/components/daw/DAWMixerPanel";
import DAWCollaboration from "@/components/daw/DAWCollaboration";
import DAW3DView from "@/components/daw/DAW3DView";
import DAWEffectsPanel from "@/components/daw/DAWEffectsPanel";
import DAWGamification from "@/components/daw/DAWGamification";
import AudioImportDialog from "@/components/AudioImportDialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useAudioPermissions } from "@/hooks/useAudioPermissions";
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
  const { permissions, requestAudioPermissions, hasAudioAccess, isRequesting } = useAudioPermissions();
  
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
  const [showImportDialog, setShowImportDialog] = useState(false);
  
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

  // Enhanced microphone access with permissions hook
  const requestMicrophone = async () => {
    const granted = await requestAudioPermissions();
    if (granted && permissions.stream) {
      streamRef.current = permissions.stream;
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
    if (!hasAudioAccess || !permissions.stream) {
      await requestMicrophone();
      return;
    }
    
    const stream = permissions.stream;

    try {
      const mediaRecorder = new MediaRecorder(stream);
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

  // Handle imported audio file with automatic BPM detection
  const handleImportedAudio = async (importedFile: any) => {
    // Create track with imported audio
    const newTrack: Track = {
      id: `track-${Date.now()}`,
      name: importedFile.fileName,
      color: 'hsl(42, 100%, 70%)', // Orange color for imported audio
      regions: [{
        id: `region-${Date.now()}`,
        start: 0,
        end: importedFile.duration || 10,
        url: importedFile.url,
        gain: 1,
        fadeIn: 0,
        fadeOut: 0
      }],
      solo: false,
      mute: false,
      volume: 0.8,
      effects: {},
      automation: []
    };

    setTracks(prev => [...prev, newTrack]);
    setShowImportDialog(false);

    // If analysis is available, update session BPM and time signature
    if (importedFile.analysis) {
      const { recommendations, bpm: detectedBpm, timeSignature, confidence } = importedFile.analysis;
      
      if (confidence > 0.6 && recommendations.sessionBpm) {
        setBpm(recommendations.sessionBpm);
        
        toast({
          title: "Session Updated!",
          description: `Auto-detected BPM: ${recommendations.sessionBpm} | Time: ${recommendations.sessionTimeSignature} | Genre: ${importedFile.analysis.genre}`,
          duration: 5000
        });
      } else {
        toast({
          title: "Track Added!",
          description: `${importedFile.fileName} added. BPM detection confidence low - consider manual adjustment.`,
        });
      }
    } else {
      toast({
        title: "Track Added!",
        description: `${importedFile.fileName} has been added to your session`,
      });
    }
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
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      {/* Top Toolbar - Clean and Minimal */}
      <div className="pt-24 border-b border-border bg-card/50 backdrop-blur">
        <div className="px-4 py-2 flex items-center justify-between">
          {/* Left - Project Info */}
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <AudioWaveform className="w-5 h-5 text-primary" />
              Untitled Project
            </h1>
            <Badge variant="secondary" className="text-xs">
              {bpm} BPM • 4/4
            </Badge>
          </div>

          {/* Center - Transport Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlayback}
              className="hover:bg-primary/10"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
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
            
            <div className="mx-4 text-sm font-mono bg-card/80 px-2 py-1 rounded">
              {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(2).padStart(5, '0')}
            </div>
          </div>

          {/* Right - Tools & Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImportDialog(true)}
              className="gap-1"
            >
              <Upload className="w-4 h-4" />
              Import
            </Button>
            
            <Button
              variant={hasAudioAccess ? "default" : "outline"}
              size="sm"
              onClick={requestMicrophone}
              disabled={isRequesting}
              className="gap-1"
            >
              <Mic className="w-4 h-4" />
              {isRequesting ? "..." : hasAudioAccess ? "Ready" : "Mic"}
            </Button>

            <div className="flex items-center gap-1 bg-card/80 rounded-lg p-1">
              <Button
                variant={view === '2d' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('2d')}
                className="text-xs px-2"
              >
                2D
              </Button>
              <Button
                variant={view === '3d' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('3d')}
                className="text-xs px-2"
              >
                3D
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main DAW Interface */}
      <div className="flex-1 flex flex-col">
        {/* Track Area + Timeline */}
        <div className="flex-1 flex">
          {/* Track List Sidebar */}
          <div className="w-64 border-r border-border bg-card/30 flex flex-col">
            {/* Track Controls Header */}
            <div className="p-3 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm">Tracks</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addTrack('audio')}
                  className="text-xs gap-1"
                >
                  <FileAudio className="w-3 h-3" />
                  Add
                </Button>
              </div>
              
              {/* Quick Add Buttons */}
              <div className="grid grid-cols-2 gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs justify-start gap-1"
                  onClick={() => addTrack('vocal')}
                >
                  <Mic className="w-3 h-3" />
                  Vocal
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs justify-start gap-1"
                  onClick={() => addTrack('instrument')}
                >
                  <FileAudio className="w-3 h-3" />
                  Beat
                </Button>
              </div>
            </div>

            {/* Track List */}
            <div className="flex-1 overflow-y-auto">
              {tracks.map((track) => (
                <div key={track.id} className="p-3 border-b border-border/50 hover:bg-card/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: track.color }}
                      />
                      <span className="text-sm font-medium truncate">{track.name}</span>
                    </div>
                    {track.isRecording && (
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 mb-2">
                    <Button
                      variant={track.solo ? "default" : "ghost"}
                      size="sm"
                      className="text-xs px-2 h-6"
                      onClick={() => setTracks(prev => 
                        prev.map(t => t.id === track.id ? { ...t, solo: !t.solo } : t)
                      )}
                    >
                      S
                    </Button>
                    <Button
                      variant={track.mute ? "default" : "ghost"}
                      size="sm"
                      className="text-xs px-2 h-6"
                      onClick={() => setTracks(prev => 
                        prev.map(t => t.id === track.id ? { ...t, mute: !t.mute } : t)
                      )}
                    >
                      M
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs px-2 h-6"
                      onClick={() => !track.isRecording ? startRecording(track.id) : stopRecording()}
                    >
                      <Mic className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <VolumeX className="w-3 h-3 text-muted-foreground" />
                      <Slider
                        value={[track.volume * 100]}
                        onValueChange={(value) => setTracks(prev => 
                          prev.map(t => t.id === track.id ? { ...t, volume: value[0] / 100 } : t)
                        )}
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-xs w-8">{Math.round(track.volume * 100)}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {tracks.length === 0 && (
                <div className="p-6 text-center text-muted-foreground">
                  <AudioWaveform className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No tracks yet</p>
                  <p className="text-xs">Add a track to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline Area */}
          <div className="flex-1 bg-background">
            {view === '2d' ? (
              <EnhancedDAWTimeline 
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
            ) : (
              <DAW3DView 
                tracks={tracks}
                isPlaying={isPlaying}
                currentTime={currentTime}
              />
            )}
          </div>
        </div>

        {/* Bottom Mixer Panel */}
        <div className="h-64 border-t border-border bg-card/30">
          <div className="flex items-center justify-between p-2 border-b border-border">
            <h3 className="font-medium text-sm">Mix Console</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Master:</span>
              <Slider
                value={[masterVolume * 100]}
                onValueChange={(value) => setMasterVolume(value[0] / 100)}
                max={100}
                step={1}
                className="w-20"
              />
              <span className="text-xs font-mono w-8">{Math.round(masterVolume * 100)}</span>
            </div>
          </div>
          
          <div className="flex-1 p-2 overflow-x-auto">
            <DAWMixerPanel 
              tracks={tracks}
              onTracksChange={setTracks}
              masterVolume={masterVolume}
              onMasterVolumeChange={setMasterVolume}
            />
          </div>
        </div>
      </div>

      {/* Audio Import Dialog */}
      {showImportDialog && (
        <AudioImportDialog
          sessionId={`session-${user?.id || 'anonymous'}`}
          onImportComplete={handleImportedAudio}
          onClose={() => setShowImportDialog(false)}
        />
      )}
    </div>
  );
};

export default HybridDAW;