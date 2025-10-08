import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
  Upload,
  LogOut
} from "lucide-react";
import EnhancedDAWTimeline from "@/components/daw/EnhancedDAWTimeline";
import DAWMixerPanel from "@/components/daw/DAWMixerPanel";
import DAWCollaboration from "@/components/daw/DAWCollaboration";
import DAW3DView from "@/components/daw/DAW3DView";
import DAWEffectsPanel from "@/components/daw/DAWEffectsPanel";
import DAWGamification from "@/components/daw/DAWGamification";
import AudioImportDialog from "@/components/AudioImportDialog";
import StemSeparationWindow from "@/components/studio/StemSeparationWindow";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useAudioPermissions } from "@/hooks/useAudioPermissions";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useRealTimePresence } from "@/hooks/useRealTimePresence";

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { permissions, requestAudioPermissions, hasAudioAccess, isRequesting } = useAudioPermissions();
  
  // Session State
  const sessionId = searchParams.get('session');
  const [sessionData, setSessionData] = useState<any>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(!!sessionId);
  
  // Real-time presence for collaboration
  const { onlineUsers } = useRealTimePresence(sessionId ? `session:${sessionId}` : 'daw:standalone');
  
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
  const [showStemSeparationDialog, setShowStemSeparationDialog] = useState(false);
  
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

  // Load session data if session ID exists
  useEffect(() => {
    if (!sessionId || !user) return;

    const loadSessionData = async () => {
      setIsLoadingSession(true);
      try {
        // Load session details
        const { data: session, error: sessionError } = await supabase
          .from('collaboration_sessions')
          .select('*, session_participants(*)')
          .eq('id', sessionId)
          .single();

        if (sessionError) throw sessionError;

        setSessionData(session);
        setIsCollabConnected(true);

        // Load audio files for this session
        const { data: audioFiles, error: filesError } = await supabase
          .from('audio_files')
          .select('*')
          .eq('project_id', sessionId);

        if (!filesError && audioFiles) {
          // Convert audio files to tracks
          const loadedTracks: Track[] = audioFiles.map(file => ({
            id: file.id,
            name: file.file_name,
            color: 'hsl(262, 83%, 58%)',
            regions: [{
              id: `region-${file.id}`,
              start: 0,
              end: file.duration_seconds || 10,
              url: file.file_path,
              gain: 1,
              fadeIn: 0,
              fadeOut: 0
            }],
            solo: false,
            mute: false,
            volume: 0.8,
            effects: {},
            automation: []
          }));
          setTracks(loadedTracks);
        }

        toast({
          title: "Session Loaded",
          description: `Connected to ${session.session_name}`,
        });
      } catch (error) {
        console.error('Error loading session:', error);
        toast({
          title: "Session Load Error",
          description: "Failed to load session data",
          variant: "destructive"
        });
      } finally {
        setIsLoadingSession(false);
      }
    };

    loadSessionData();
  }, [sessionId, user, toast]);

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

  // Handle Processed Stems
  const handleStemsProcessed = (stems: Array<{
    stemType: string;
    stemName: string;
    filePath: string;
  }>) => {
    // Close the dialog
    setShowStemSeparationDialog(false);
    
    // Create a new track for each stem
    stems.forEach((stem, index) => {
      const stemColors: Record<string, string> = {
        'vocals': 'hsl(280, 70%, 75%)',
        'drums': 'hsl(0, 70%, 65%)',
        'bass': 'hsl(220, 100%, 70%)',
        'other': 'hsl(140, 60%, 65%)',
        'piano': 'hsl(40, 80%, 70%)',
        'guitar': 'hsl(30, 70%, 65%)',
      };

      const newTrack: Track = {
        id: `stem-track-${Date.now()}-${index}`,
        name: stem.stemName,
        color: stemColors[stem.stemType.toLowerCase()] || 'hsl(262, 83%, 58%)',
        regions: [{
          id: `stem-region-${Date.now()}-${index}`,
          start: 0,
          end: 0, // Will be set when audio loads
          url: stem.filePath,
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
    });
    
    toast({
      title: "Stems Imported!",
      description: `${stems.length} stems added to your project`,
    });
  };

  // Leave session handler
  const handleLeaveSession = () => {
    if (sessionData?.host_user_id === user?.id) {
      navigate('/artist');
    } else {
      navigate('/engineer');
    }
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
              <Button className="w-full" onClick={() => { const a = document.createElement('a'); a.href = '/auth'; a.click(); }}>
                Sign In
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden">
      <Navigation />
      
      {/* Modern Glassmorphic Top Toolbar */}
      <div className="pt-24 glass border-b border-border/50 shadow-glass animate-slide-up">
        <div className="px-6 py-3 flex items-center justify-between">
          {/* Left - Session Info & Transport Controls */}
          <div className="flex items-center gap-3">
            {sessionId && sessionData && (
              <>
                <div className="flex items-center gap-2 glass-hover px-4 py-2 rounded-lg border border-primary/30">
                  <Users className="w-4 h-4 text-primary" />
                  <div>
                    <div className="text-xs font-bold">{sessionData.session_name}</div>
                    <div className="text-xs text-muted-foreground">{onlineUsers.length} online</div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleLeaveSession} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  <span className="text-xs">Leave Session</span>
                </Button>
                <div className="w-px h-8 bg-border/50" />
              </>
            )}
            <Button variant="glass" size="sm" className="text-xs font-semibold">
              FILE
            </Button>
            <div className="w-px h-8 bg-border/50" />
            
            <div className="flex items-center gap-2 glass-hover p-1 rounded-lg">
              <Button
                variant="glow"
                size="icon"
                onClick={togglePlayback}
                className="relative overflow-hidden group"
              >
                {isPlaying ? 
                  <Pause className="w-5 h-5 relative z-10" /> : 
                  <Play className="w-5 h-5 relative z-10 ml-0.5" />
                }
                {isPlaying && (
                  <div className="absolute inset-0 animate-glow-pulse bg-gradient-to-r from-primary to-accent opacity-20" />
                )}
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={stopPlayback}
                className="hover:scale-110"
              >
                <Square className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => seekToTime(0)}
                className="hover:scale-110"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            <div className="w-px h-8 bg-border/50" />
            
            <Button
              variant={hasAudioAccess ? "destructive" : "outline"}
              size="sm"
              onClick={requestMicrophone}
              disabled={isRequesting}
              className="gap-2 group"
            >
              <Mic className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold">
                {isRequesting ? "..." : hasAudioAccess ? "REC READY" : "ENABLE MIC"}
              </span>
            </Button>
          </div>

          {/* Center - Time & BPM Display */}
          <div className="flex items-center gap-4">
            <div className="glass-hover px-6 py-2 rounded-xl border border-primary/30 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-0.5">BPM</div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {bpm}
                  </div>
                </div>
                <div className="w-px h-10 bg-border/50" />
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-0.5">TIME</div>
                  <div className="text-xl font-mono text-primary">
                    {Math.floor(currentTime / 60).toString().padStart(2, '0')}:
                    {Math.floor(currentTime % 60).toString().padStart(2, '0')}.
                    {Math.floor((currentTime % 1) * 100).toString().padStart(2, '0')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - View & Actions */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => addTrack('vocal')}
              className="gap-2"
            >
              <FileAudio className="w-4 h-4" />
              <span className="text-xs font-semibold">ADD TRACK</span>
            </Button>
            
            <Button 
              variant="glass" 
              size="sm"
              onClick={() => setShowImportDialog(true)}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              <span className="text-xs font-semibold">IMPORT</span>
            </Button>
            
            <Button 
              variant="glass" 
              size="sm"
              onClick={() => setShowStemSeparationDialog(true)}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-semibold">SEPARATE STEMS</span>
            </Button>
            
            <div className="w-px h-8 bg-border/50" />
            
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
        </div>
      </div>

      {/* Main DAW Layout with Modern Glassmorphism */}
      <div className="flex-1 flex overflow-hidden">
        {/* Modern Track Sidebar */}
        <div className="w-72 glass border-r border-border/50 flex flex-col shadow-glass-lg animate-slide-up" style={{ animationDelay: '100ms' }}>
          {/* Track Controls Header */}
          <div className="p-4 border-b border-border/30 glass-hover">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
                <h3 className="text-sm font-bold">TRACKS</h3>
                <Badge variant="outline" className="text-xs">{tracks.length}</Badge>
              </div>
              <Settings className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Track List with Smooth Animations */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {tracks.map((track, index) => (
              <div 
                key={track.id} 
                className="glass-hover p-3 rounded-xl border border-border/30 transition-all duration-300 hover:border-primary/50 hover:shadow-glass animate-scale-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Track Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div 
                      className="w-1 h-12 rounded-full animate-pulse-glow"
                      style={{ 
                        backgroundColor: track.color,
                        boxShadow: `0 0 10px ${track.color}40`
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">
                        {track.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {track.regions.length} region{track.regions.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  {track.isRecording && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-destructive rounded-full animate-pulse-glow" />
                      <span className="text-xs text-destructive font-bold">REC</span>
                    </div>
                  )}
                </div>
                
                {/* Track Controls */}
                <div className="flex items-center gap-2 mb-3">
                  <Button
                    variant={track.solo ? "glow" : "ghost"}
                    size="sm"
                    onClick={() => setTracks(prev => 
                      prev.map(t => ({ ...t, solo: t.id === track.id ? !t.solo : false }))
                    )}
                    className="flex-1 text-xs font-bold"
                  >
                    S
                  </Button>
                  <Button
                    variant={track.mute ? "destructive" : "ghost"}
                    size="sm"
                    onClick={() => setTracks(prev => 
                      prev.map(t => t.id === track.id ? { ...t, mute: !t.mute } : t)
                    )}
                    className="flex-1 text-xs font-bold"
                  >
                    M
                  </Button>
                  <Button
                    variant={track.isRecording ? "destructive" : "ghost"}
                    size="sm"
                    onClick={() => !track.isRecording ? startRecording(track.id) : stopRecording()}
                    className="flex-1 text-xs font-bold"
                  >
                    <Mic className="w-3 h-3" />
                  </Button>
                </div>
                
                {/* Volume Control with Modern Styling */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Volume</span>
                    <span className="font-mono text-primary font-bold">
                      {Math.round(track.volume * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {track.mute ? 
                      <VolumeX className="w-3 h-3 text-destructive" /> : 
                      <Volume2 className="w-3 h-3 text-primary" />
                    }
                    <Slider
                      value={[track.volume * 100]}
                      onValueChange={(value) => setTracks(prev => 
                        prev.map(t => t.id === track.id ? { ...t, volume: value[0] / 100 } : t)
                      )}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                  </div>
                  
                  {/* Visual Level Meter */}
                  <div className="flex gap-1 h-1.5">
                    {Array.from({ length: 12 }, (_, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-150 ${
                          i < Math.floor(track.volume * 12)
                            ? i < 8 
                              ? 'bg-gradient-to-r from-green-500 to-green-400 shadow-[0_0_4px_rgba(34,197,94,0.5)]' 
                              : i < 10 
                              ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 shadow-[0_0_4px_rgba(234,179,8,0.5)]' 
                              : 'bg-gradient-to-r from-red-500 to-red-400 shadow-[0_0_4px_rgba(239,68,68,0.5)] animate-pulse-glow'
                            : 'bg-muted/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
            
            {tracks.length === 0 && (
              <div className="text-center py-12 px-6 animate-fade-in">
                <div className="glass-hover rounded-2xl p-8 border border-border/30">
                  <AudioWaveform className="w-12 h-12 mx-auto mb-4 text-primary/50 animate-pulse" />
                  <p className="text-sm font-semibold text-foreground mb-1">No tracks yet</p>
                  <p className="text-xs text-muted-foreground">Add a track or import audio to start</p>
                  <Button 
                    variant="glow" 
                    size="sm" 
                    onClick={() => addTrack('vocal')}
                    className="mt-4"
                  >
                    <FileAudio className="w-4 h-4 mr-2" />
                    Create Track
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Timeline Area with Modern Styling */}
          <div className="flex-1 bg-gradient-to-br from-background to-background/50 animate-fade-in">
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

          {/* Modern Bottom Panel */}
          <div className="h-64 glass border-t border-border/50 shadow-glass-lg animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between p-4 border-b border-border/30">
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-primary" />
                  MIXER CONSOLE
                </h3>
                <div className="flex items-center gap-2">
                  <Button variant={activePanel === 'mixer' ? 'default' : 'ghost'} size="sm" onClick={() => setActivePanel('mixer')}>
                    MIX
                  </Button>
                  <Button variant={activePanel === 'effects' ? 'default' : 'ghost'} size="sm" onClick={() => setActivePanel('effects')}>
                    FX
                  </Button>
                  <Button variant={activePanel === 'collab' ? 'default' : 'ghost'} size="sm" onClick={() => setActivePanel('collab')}>
                    <Users className="w-4 h-4 mr-1" />
                    COLLAB
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-3 glass-hover px-4 py-2 rounded-lg">
                <span className="text-xs font-semibold text-muted-foreground">MASTER</span>
                <Volume2 className="w-4 h-4 text-primary" />
                <Slider
                  value={[masterVolume * 100]}
                  onValueChange={(value) => setMasterVolume(value[0] / 100)}
                  max={100}
                  step={1}
                  className="w-32"
                />
                <span className="text-sm font-mono font-bold text-primary w-12 text-right">
                  {Math.round(masterVolume * 100)}%
                </span>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
              {activePanel === 'mixer' && (
                <div className="h-full overflow-x-auto p-2">
                  <DAWMixerPanel 
                    tracks={tracks}
                    onTracksChange={setTracks}
                    masterVolume={masterVolume}
                    onMasterVolumeChange={setMasterVolume}
                  />
                </div>
              )}
              {activePanel === 'effects' && (
                <DAWEffectsPanel tracks={tracks} onTracksChange={setTracks} />
              )}
              {activePanel === 'collab' && user && (
                <DAWCollaboration 
                  sessionId={`daw-session-${user.id}`}
                  userId={user.id}
                  userName={user.email || 'User'}
                  onTrackUpdate={(trackData) => console.log('Track updated:', trackData)}
                  onEffectChange={(trackId, effectData) => console.log('Effect changed:', trackId, effectData)}
                />
              )}
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

      {/* Stem Separation Dialog */}
      {showStemSeparationDialog && (
        <StemSeparationWindow
          onClose={() => setShowStemSeparationDialog(false)}
          onStemsProcessed={handleStemsProcessed}
        />
      )}
    </div>
  );
};

export default HybridDAW;