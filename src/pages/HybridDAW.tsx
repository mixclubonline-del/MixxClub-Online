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
  const playbackSourcesRef = useRef<Map<string, AudioBufferSourceNode>>(new Map());
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  
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
      // Cleanup on unmount
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      playbackSourcesRef.current.forEach(source => {
        try {
          source.stop();
        } catch (e) {
          // Source might already be stopped
        }
      });
      playbackSourcesRef.current.clear();
      
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

  // Update playback time
  const updatePlaybackTime = () => {
    if (isPlaying && audioContextRef.current) {
      const elapsed = audioContextRef.current.currentTime - startTimeRef.current + pauseTimeRef.current;
      setCurrentTime(elapsed);
      animationFrameRef.current = requestAnimationFrame(updatePlaybackTime);
    }
  };

  // Play audio from blob or URL
  const playAudioRegion = async (region: AudioRegion, trackVolume: number = 0.8, trackMute: boolean = false) => {
    if (!audioContextRef.current || trackMute) return;

    try {
      let audioBuffer: AudioBuffer;
      
      if (region.blob) {
        const arrayBuffer = await region.blob.arrayBuffer();
        audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      } else if (region.url) {
        const response = await fetch(region.url);
        const arrayBuffer = await response.arrayBuffer();
        audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      } else {
        return;
      }

      const source = audioContextRef.current.createBufferSource();
      const gainNode = audioContextRef.current.createGain();
      
      source.buffer = audioBuffer;
      gainNode.gain.value = (region.gain || 1) * trackVolume * masterVolume;
      
      source.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      // Start playback from current time position
      const startOffset = Math.max(0, currentTime - region.start);
      const duration = Math.max(0, region.end - region.start - startOffset);
      
      if (startOffset < audioBuffer.duration && duration > 0) {
        source.start(0, startOffset, duration);
        playbackSourcesRef.current.set(region.id, source);
        
        source.onended = () => {
          playbackSourcesRef.current.delete(region.id);
        };
      }
    } catch (error) {
      console.error('Error playing audio region:', error);
    }
  };

  // Play/Pause Transport
  const togglePlayback = async () => {
    if (!audioContextRef.current) {
      toast({
        title: "Audio Error",
        description: "Audio system not initialized",
        variant: "destructive"
      });
      return;
    }

    if (isPlaying) {
      // Pause playback
      setIsPlaying(false);
      pauseTimeRef.current = currentTime;
      
      // Stop all current audio sources
      playbackSourcesRef.current.forEach(source => {
        try {
          source.stop();
        } catch (e) {
          // Source might already be stopped
        }
      });
      playbackSourcesRef.current.clear();
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    } else {
      // Resume/start playback
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      setIsPlaying(true);
      startTimeRef.current = audioContextRef.current.currentTime;
      
      // Play all audio regions that should be playing at current time
      tracks.forEach(track => {
        if (!track.mute && !track.solo) {
          track.regions.forEach(region => {
            if (currentTime >= region.start && currentTime < region.end) {
              playAudioRegion(region, track.volume, track.mute);
            }
          });
        }
      });
      
      // Play solo tracks if any
      const soloTracks = tracks.filter(track => track.solo);
      soloTracks.forEach(track => {
        track.regions.forEach(region => {
          if (currentTime >= region.start && currentTime < region.end) {
            playAudioRegion(region, track.volume, false);
          }
        });
      });
      
      updatePlaybackTime();
    }
  };

  // Stop Transport
  const stopPlayback = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    pauseTimeRef.current = 0;
    
    // Stop all audio sources
    playbackSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Source might already be stopped
      }
    });
    playbackSourcesRef.current.clear();
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
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

  // Seek to time position
  const seekToTime = (time: number) => {
    setCurrentTime(time);
    pauseTimeRef.current = time;
    
    if (isPlaying) {
      // Stop current playback and restart from new position
      playbackSourcesRef.current.forEach(source => {
        try {
          source.stop();
        } catch (e) {
          // Source might already be stopped
        }
      });
      playbackSourcesRef.current.clear();
      
      // Restart playback from new position
      setTimeout(() => togglePlayback().then(() => togglePlayback()), 50);
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
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <Navigation />
      
      {/* Top Toolbar - Bitwig Style */}
      <div className="pt-24 bg-slate-800 border-b border-slate-700">
        <div className="px-4 py-2 flex items-center justify-between">
          {/* Left - File Menu & Tools */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-xs text-slate-300 hover:text-white hover:bg-slate-700">
              FILE
            </Button>
            <Button variant="ghost" size="sm" className="text-xs text-slate-300 hover:text-white hover:bg-slate-700">
              PLAY
            </Button>
            <div className="w-px h-6 bg-slate-600 mx-2" />
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlayback}
              className="hover:bg-slate-700 p-2"
            >
              {isPlaying ? <Pause className="w-5 h-5 text-orange-500" /> : <Play className="w-5 h-5 text-orange-500" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={stopPlayback}
              className="hover:bg-slate-700 p-2"
            >
              <Square className="w-4 h-4 text-slate-300" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => seekToTime(0)}
              className="hover:bg-slate-700 p-2"
            >
              <RotateCcw className="w-4 h-4 text-slate-300" />
            </Button>
          </div>

          {/* Center - Time & BPM Display */}
          <div className="flex items-center gap-6">
            <div className="bg-slate-700 px-3 py-1 rounded text-sm font-mono">
              <span className="text-cyan-400">{bpm}.00</span>
              <span className="text-slate-400 ml-2">4/4</span>
            </div>
            <div className="bg-slate-700 px-3 py-1 rounded text-sm font-mono">
              <span className="text-orange-400">
                {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(2).padStart(5, '0')}
              </span>
            </div>
          </div>

          {/* Right - Tools & Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-xs text-slate-300 hover:text-white hover:bg-slate-700">
              ADD
            </Button>
            <Button variant="ghost" size="sm" className="text-xs text-slate-300 hover:text-white hover:bg-slate-700">
              EDIT
            </Button>
            <Button
              variant={hasAudioAccess ? "default" : "ghost"}
              size="sm"
              onClick={requestMicrophone}
              disabled={isRequesting}
              className="text-xs bg-orange-600 hover:bg-orange-700"
            >
              <Mic className="w-4 h-4 mr-1" />
              {isRequesting ? "..." : hasAudioAccess ? "REC" : "MIC"}
            </Button>
            <Button variant="ghost" size="sm" className="text-xs text-slate-300 hover:text-white hover:bg-slate-700">
              TRACK
            </Button>
          </div>
        </div>

        {/* Timeline Header */}
        <div className="px-4 py-1 bg-slate-750 border-t border-slate-700 flex items-center text-xs text-slate-400">
          <div className="w-64 flex items-center gap-2">
            <span>TRACKS</span>
          </div>
          <div className="flex-1 flex">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(bar => (
              <div key={bar} className="flex-1 text-center border-r border-slate-700 py-1">
                {bar}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main DAW Layout */}
      <div className="flex-1 flex">
        {/* Track List Sidebar */}
        <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
          {/* Track Controls */}
          <div className="p-2 border-b border-slate-700">
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => addTrack('vocal')}
                className="flex-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700"
              >
                + Audio
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowImportDialog(true)}
                className="flex-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700"
              >
                Import
              </Button>
            </div>
          </div>

          {/* Track List */}
          <div className="flex-1 overflow-y-auto">
            {tracks.map((track, index) => (
              <div key={track.id} className="border-b border-slate-700/50 hover:bg-slate-750">
                <div className="p-3">
                  {/* Track Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div 
                        className="w-2 h-8 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: track.color }}
                      />
                      <span className="text-sm font-medium text-white truncate">
                        {track.name}
                      </span>
                    </div>
                    {track.isRecording && (
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </div>
                  
                  {/* Track Controls Row */}
                  <div className="flex items-center gap-1 mb-2">
                    <Button
                      variant={track.solo ? "default" : "ghost"}
                      size="sm"
                      className={`text-xs px-2 py-1 h-6 min-w-6 ${
                        track.solo 
                          ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                      onClick={() => setTracks(prev => 
                        prev.map(t => t.id === track.id ? { ...t, solo: !t.solo } : t)
                      )}
                    >
                      S
                    </Button>
                    <Button
                      variant={track.mute ? "default" : "ghost"}
                      size="sm"
                      className={`text-xs px-2 py-1 h-6 min-w-6 ${
                        track.mute 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                      onClick={() => setTracks(prev => 
                        prev.map(t => t.id === track.id ? { ...t, mute: !t.mute } : t)
                      )}
                    >
                      M
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs px-2 py-1 h-6 min-w-6 text-slate-400 hover:text-white hover:bg-slate-700"
                      onClick={() => !track.isRecording ? startRecording(track.id) : stopRecording()}
                    >
                      <Mic className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  {/* Volume Level */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2">
                        {track.mute ? 
                          <VolumeX className="w-2 h-2 text-red-500" /> : 
                          <Volume2 className="w-2 h-2 text-slate-400" />
                        }
                      </div>
                      <Slider
                        value={[track.volume * 100]}
                        onValueChange={(value) => setTracks(prev => 
                          prev.map(t => t.id === track.id ? { ...t, volume: value[0] / 100 } : t)
                        )}
                        max={100}
                        step={1}
                        className="flex-1 h-1"
                      />
                      <span className="text-xs text-slate-400 w-6 text-right">
                        {Math.round(track.volume * 100)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {tracks.length === 0 && (
              <div className="p-6 text-center text-slate-500">
                <AudioWaveform className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tracks</p>
                <p className="text-xs">Add a track to start</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Timeline Area */}
          <div className="flex-1 bg-slate-900">
            {view === '2d' ? (
              <EnhancedDAWTimeline 
                tracks={tracks}
                onTracksChange={setTracks}
                currentTime={currentTime}
                onTimeChange={seekToTime}
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

          {/* Bottom Device/Plugin Panel */}
          <div className="h-56 bg-slate-800 border-t border-slate-700">
            <div className="flex items-center justify-between p-2 border-b border-slate-700">
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-medium text-white">Device Panel</h3>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-white">
                    ARRANGE
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-white">
                    MIX
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-white">
                    EDIT
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Master:</span>
                <Slider
                  value={[masterVolume * 100]}
                  onValueChange={(value) => setMasterVolume(value[0] / 100)}
                  max={100}
                  step={1}
                  className="w-20"
                />
                <span className="text-xs text-slate-400 w-8">{Math.round(masterVolume * 100)}</span>
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-x-auto">
              <DAWMixerPanel 
                tracks={tracks}
                onTracksChange={setTracks}
                masterVolume={masterVolume}
                onMasterVolumeChange={setMasterVolume}
              />
            </div>
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