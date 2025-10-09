import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
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
  Save,
  FolderOpen,
  Sliders,
  SkipBack
} from "lucide-react";
import EnhancedDAWTimeline from "@/components/daw/EnhancedDAWTimeline";
import DAWMixerPanel from "@/components/daw/DAWMixerPanel";
import DAWCollaboration from "@/components/daw/DAWCollaboration";
import DAW3DView from "@/components/daw/DAW3DView";
import DAWEffectsPanel from "@/components/daw/DAWEffectsPanel";
import DAWGamification from "@/components/daw/DAWGamification";
import AudioImportDialog from "@/components/AudioImportDialog";
import StemSeparationWindow from "@/components/studio/StemSeparationWindow";
import { CloudProjectManager } from "@/components/daw/CloudProjectManager";
import { PrimeBotAssistant } from "@/components/studio/PrimeBotAssistant";
import { AIAssistantPanel } from "@/components/studio/AIAssistantPanel";
import { StudioSystemCheck } from "@/components/studio/StudioSystemCheck";
import { ClipEditorPanel } from "@/components/daw/ClipEditorPanel";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useAudioPermissions } from "@/hooks/useAudioPermissions";
import { useAudioEngineBridge } from "@/hooks/useAudioEngineBridge";
import { useAIStudioStore, Track, AudioRegion } from "@/stores/aiStudioStore";
import { WaveformGenerator } from "@/services/waveformGenerator";
import Navigation from "@/components/Navigation";

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
  const [viewMode, setViewMode] = useState<'arrange' | 'mix'>('arrange');
  const [activePanel, setActivePanel] = useState<'timeline' | 'mixer' | 'effects' | 'collab' | 'achievements'>('timeline');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showStemSeparationDialog, setShowStemSeparationDialog] = useState(false);
  const [showCloudManager, setShowCloudManager] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showSystemCheck, setShowSystemCheck] = useState(false);
  const [showPrimeBotModal, setShowPrimeBotModal] = useState(false);
  
  // Collaboration State
  const [collaborators, setCollaborators] = useState<CollaborationUser[]>([]);
  const [isCollabConnected, setIsCollabConnected] = useState(false);
  
  // Audio Context References
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // Removed manual playback refs - using audioEngine only
  
  // Gamification State
  const [achievements, setAchievements] = useState<Array<{ id: string; title: string; description: string; unlocked: boolean }>>([
    { id: 'first-track', title: 'First Steps', description: 'Create your first track', unlocked: false },
    { id: 'first-recording', title: 'Sound Engineer', description: 'Record your first audio', unlocked: false },
    { id: 'collab-master', title: 'Team Player', description: 'Collaborate with another user', unlocked: false },
    { id: 'effect-wizard', title: 'Effect Master', description: 'Apply 5 different effects', unlocked: false },
  ]);

  // Initialize Audio Engine Bridge
  useAudioEngineBridge();

  // Sync playback state to store for audio engine bridge
  const { 
    setPlaying: setStorePlaying, 
    setCurrentTime: setStoreCurrentTime,
    setMasterVolume: setStoreMasterVolume,
    addTrack: addStoreTrack,
    updateTrack: updateStoreTrack
  } = useAIStudioStore();

  // Sync playback state to store
  useEffect(() => {
    setStorePlaying(isPlaying);
  }, [isPlaying, setStorePlaying]);

  // Sync current time to store
  useEffect(() => {
    setStoreCurrentTime(currentTime);
  }, [currentTime, setStoreCurrentTime]);

  // Sync master volume to store
  useEffect(() => {
    setStoreMasterVolume(masterVolume);
  }, [masterVolume, setStoreMasterVolume]);

  // Sync tracks to store when they change
  useEffect(() => {
    const storeState = useAIStudioStore.getState();
    const storeTracks = storeState.tracks;
    
    // Remove tracks from store that no longer exist in HybridDAW
    const hybridTrackIds = new Set(tracks.map(t => t.id));
    storeTracks.forEach(st => {
      if (!hybridTrackIds.has(st.id)) {
        useAIStudioStore.getState().removeTrack(st.id);
      }
    });
    
    // Add or update tracks in store with FULL data
    tracks.forEach((track) => {
      const existsInStore = storeTracks.some(st => st.id === track.id);
      
      if (!existsInStore) {
        console.log('[HybridDAW] Adding track to store:', track.name, 'hasBuffer:', !!track.audioBuffer);
        // Add new track with FULL data including audioBuffer and waveformData
        addStoreTrack({
          id: track.id,
          name: track.name,
          type: track.type || 'audio',
          color: track.color,
          volume: track.volume,
          pan: track.pan || 0,
          mute: track.mute,
          solo: track.solo,
          audioBuffer: track.audioBuffer,  // ✅ Pass audio!
          waveformData: track.waveformData, // ✅ Pass waveform!
          regions: track.regions,  // ✅ Pass regions with audio!
          effects: track.effects || [],
          sends: track.sends || {},
        });
      } else {
        // Update existing track
        updateStoreTrack(track.id, {
          name: track.name,
          volume: track.volume,
          pan: track.pan || 0,
          mute: track.mute,
          solo: track.solo,
          audioBuffer: track.audioBuffer,  // ✅ Update audio buffer if changed!
          waveformData: track.waveformData, // ✅ Update waveform if changed!
          regions: track.regions,  // ✅ Update regions!
        });
      }
    });
  }, [tracks, addStoreTrack, updateStoreTrack]);

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
      type: type === 'instrument' ? 'audio' : type,
      color: trackColors[type],
      volume: 0.8,
      pan: 0,
      mute: false,
      solo: false,
      regions: [],
      effects: [],
      sends: {},
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

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        
        // Decode audio and generate waveform
        if (audioContextRef.current) {
          try {
            console.log('[Recording] Decoding recorded audio...');
            const arrayBuffer = await blob.arrayBuffer();
            const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
            
            const { peaks } = WaveformGenerator.generateFromBuffer(audioBuffer, {
              width: 1024,
              normalize: true,
            });
            
            console.log('[Recording] Waveform generated:', peaks.length, 'peaks');
            
            // Stable IDs for region
            const regionId = `region-${Date.now()}`;
            
            const newRegion: AudioRegion = {
              id: regionId,
              trackId: trackId,
              startTime: currentTime,
              duration: audioBuffer.duration,
              audioBuffer,
              sourceStartOffset: 0,
              fadeIn: { duration: 0, curve: 'linear' },
              fadeOut: { duration: 0, curve: 'linear' },
              gain: 1.0,
            };

            setTracks(prev => 
              prev.map(track => 
                track.id === trackId 
                  ? { 
                      ...track, 
                      armed: false,
                      audioBuffer,
                      waveformData: peaks, // ✅ Keep as Float32Array
                      regions: [...(track.regions || []), newRegion] 
                    }
                  : track
              )
            );
          } catch (error) {
            console.error('[Recording] Failed to decode:', error);
          }
        };

        // Check for first recording achievement
        setAchievements(prev => 
          prev.map(achievement => 
            achievement.id === 'first-recording' 
              ? { ...achievement, unlocked: true }
              : achievement
          )
        );

        // Recording automatically added to track with audioBuffer
        // audioEngine will play it when user clicks play
        toast({
          title: "Recording Complete",
          description: "Recording added to timeline and ready to play",
        });
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      setTracks(prev => 
        prev.map(track => 
          track.id === trackId 
            ? { ...track, armed: true }
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
  const stopRecording = async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      setTracks(prev => 
        prev.map(track => ({ ...track, armed: false }))
      );
    }
  };

  // ============================================================================
  // PLAYBACK FUNCTIONS (Using audioEngine)
  // ============================================================================

  /**
   * Toggle playback - now uses audioEngine
   */
  const handlePlayPause = async () => {
    if (isPlaying) {
      setIsPlaying(false);
      // audioEngine.pause() called by useAudioEngineBridge
    } else {
      setIsPlaying(true);
      // audioEngine.play(currentTime) called by useAudioEngineBridge
    }
  };

  /**
   * Stop playback and reset to beginning
   */
  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    // audioEngine.stop() called by useAudioEngineBridge
  };

  // Handle imported audio file with automatic BPM detection
  const handleImportedAudio = async (importedFile: any) => {
    if (!audioContextRef.current) {
      toast({ 
        title: "Audio Error", 
        description: "Audio system not initialized",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('[Import] Start - File:', importedFile.fileName);
      
      // 1. Decode audio - prefer Blob to avoid fetch(blob:) edge cases
      const dataBuffer = importedFile?.blob 
        ? await importedFile.blob.arrayBuffer()
        : await (await fetch(importedFile.url)).arrayBuffer();
      
      const audioBuffer = await audioContextRef.current.decodeAudioData(dataBuffer.slice(0));
      console.log('[Import] Decoded:', audioBuffer.duration.toFixed(2), 's,', audioBuffer.numberOfChannels, 'ch,', audioBuffer.sampleRate, 'Hz');
      
      // 2. Generate waveform - keep as Float32Array!
      const { peaks } = WaveformGenerator.generateFromBuffer(audioBuffer, {
        width: 1024,
        normalize: true,
      });
      
      console.log('[Waveform] Generated:', peaks.length, 'peaks, min:', Math.min(...peaks).toFixed(3), 'max:', Math.max(...peaks).toFixed(3));
      
      // 3. Use stable IDs to avoid drift between track/region
      const trackId = `track-${Date.now()}`;
      const regionId = `region-${Date.now()}`;
      
      // 4. Create track with ALL audio data
      const newTrack: Track = {
        id: trackId,
        name: importedFile.fileName,
        type: 'audio',
        color: 'hsl(42, 100%, 70%)',
        volume: 0.8,
        pan: 0,
        mute: false,
        solo: false,
        audioBuffer,  // ✅ Real decoded audio
        waveformData: peaks, // ✅ Keep as Float32Array!
        regions: [{
          id: regionId,
          trackId: trackId, // ✅ Use same stable ID
          startTime: 0,
          duration: audioBuffer.duration,
          audioBuffer, // ✅ Also store in region
          sourceStartOffset: 0,
          fadeIn: { duration: 0, curve: 'linear' },
          fadeOut: { duration: 0, curve: 'linear' },
          gain: 1.0,
        }],
        effects: [],
        sends: {},
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
            description: `${importedFile.fileName} added with real audio data. BPM detection confidence low - consider manual adjustment.`,
          });
        }
      } else {
        toast({
          title: "Track Added!",
          description: `${importedFile.fileName} ready with real audio data`,
        });
      }
      
    } catch (error) {
      console.error('[Import] Failed:', error);
      toast({
        title: "Import Failed",
        description: "Could not decode audio file",
        variant: "destructive"
      });
    }
  };

  // Seek to time position
  const seekToTime = (time: number) => {
    setCurrentTime(time);
    // audioEngine will handle the seek via useAudioEngineBridge
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
  const handleStemsProcessed = async (stems: Array<{
    stemType: string;
    stemName: string;
    filePath: string;
  }>) => {
    // Close the dialog
    setShowStemSeparationDialog(false);
    
    if (!audioContextRef.current) {
      toast({
        title: "Audio Error",
        description: "Audio system not initialized",
        variant: "destructive"
      });
      return;
    }
    
    // Create a new track for each stem with decoded audio
    for (const [index, stem] of stems.entries()) {
      try {
        // Fetch and decode stem audio
        const response = await fetch(stem.filePath);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
        
        // Generate waveform
        const waveformData = WaveformGenerator.generateFromBuffer(audioBuffer, {
          width: 800,
          normalize: true,
        });
        
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
          type: stem.stemType.toLowerCase() as any || 'audio',
          color: stemColors[stem.stemType.toLowerCase()] || 'hsl(262, 83%, 58%)',
          volume: 0.8,
          pan: 0,
          mute: false,
          solo: false,
          audioBuffer,
          waveformData: Array.from(waveformData.peaks),
          regions: [{
            id: `stem-region-${Date.now()}-${index}`,
            trackId: `stem-track-${Date.now()}-${index}`,
            startTime: 0,
            duration: audioBuffer.duration,
            audioBuffer,
            sourceStartOffset: 0,
            fadeIn: { duration: 0, curve: 'linear' },
            fadeOut: { duration: 0, curve: 'linear' },
            gain: 1.0,
          }],
          effects: [],
          sends: {},
        };
        
        setTracks(prev => [...prev, newTrack]);
      } catch (error) {
        console.error(`[Stems] Failed to decode ${stem.stemName}:`, error);
        toast({
          title: "Stem Import Error",
          description: `Failed to decode ${stem.stemName}`,
          variant: "destructive"
        });
      }
    }
    
    toast({
      title: "Stems Imported!",
      description: `${stems.length} stems added with real audio data`,
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
          {/* Left - Transport Controls */}
          <div className="flex items-center gap-3">
            <Button 
              variant="glass" 
              size="sm" 
              onClick={() => setShowCloudManager(true)}
              className="text-xs font-semibold gap-2"
            >
              <FolderOpen className="w-3 h-3" />
              PROJECT
            </Button>
            <div className="w-px h-8 bg-border/50" />
            
            <div className="flex items-center gap-2 glass-hover p-1 rounded-lg">
              <Button
                variant="glow"
                size="icon"
                onClick={handlePlayPause}
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
                onClick={handleStop}
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
              variant={viewMode === 'mix' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode(viewMode === 'arrange' ? 'mix' : 'arrange')}
              className="gap-2"
            >
              <Sliders className="w-4 h-4" />
              <span className="text-xs font-semibold">
                {viewMode === 'arrange' ? 'MIXING MODE' : 'ARRANGEMENT MODE'}
              </span>
            </Button>
            
            <div className="w-px h-8 bg-border/50" />
            
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
            
            <Button 
              variant="glass" 
              size="sm"
              onClick={() => setShowAIAssistant(!showAIAssistant)}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-semibold">AI ASSISTANT</span>
            </Button>
            
            <Button 
              variant="glass" 
              size="sm"
              onClick={() => setShowSystemCheck(!showSystemCheck)}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              <span className="text-xs font-semibold">SYSTEM CHECK</span>
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

      {/* Main DAW Layout - Mode-Aware */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        {viewMode === 'arrange' ? (
          // ========== ARRANGEMENT MODE ==========
          <>
          {/* Left: Track List (15%) */}
          <ResizablePanel defaultSize={15} minSize={12} maxSize={20}>
          <div className="h-full glass border-r border-border/50 flex flex-col shadow-glass-lg animate-slide-up" style={{ animationDelay: '100ms' }}>
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
                    {track.armed && (
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
                      variant={track.armed ? "destructive" : "ghost"}
                      size="sm"
                      onClick={() => !track.armed ? startRecording(track.id) : stopRecording()}
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
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Center: Timeline (70%) */}
        <ResizablePanel defaultSize={70}>
          <div className="h-full bg-gradient-to-br from-background to-background/50 animate-fade-in overflow-hidden">
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
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right: Clip Editor (15%) */}
        <ResizablePanel defaultSize={15} minSize={12} maxSize={25}>
          <ClipEditorPanel 
            selectedRegion={null}
            selectedTrack={null}
            onUpdateRegion={(regionId, updates) => {
              // TODO: Wire to region update
            }}
          />
        </ResizablePanel>
                  <div className="h-full glass border-t border-border/50 shadow-glass-lg animate-slide-up flex flex-col" style={{ animationDelay: '200ms' }}>
                    <div className="flex items-center justify-between p-3 border-b border-border/30 flex-shrink-0">
                      <h3 className="text-sm font-bold flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-primary" />
                        MIXER CONSOLE
                      </h3>
                      
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
                    
                    <div className="flex-1 overflow-x-auto p-2">
                      <DAWMixerPanel 
                        tracks={tracks}
                        onTracksChange={setTracks}
                        masterVolume={masterVolume}
                        onMasterVolumeChange={setMasterVolume}
                      />
                    </div>
                  </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Secondary Panels: Effects / Collaboration */}
                <ResizablePanel defaultSize={30} minSize={15}>
                  <div className="h-full glass border-t border-border/50 flex flex-col">
                    <div className="flex items-center gap-2 p-3 border-b border-border/30 flex-shrink-0">
                      <Button 
                        variant={activePanel === 'effects' ? 'default' : 'ghost'} 
                        size="sm" 
                        onClick={() => setActivePanel('effects')}
                      >
                        FX
                      </Button>
                      <Button 
                        variant={activePanel === 'collab' ? 'default' : 'ghost'} 
                        size="sm" 
                        onClick={() => setActivePanel('collab')}
                      >
                        <Users className="w-4 h-4 mr-1" />
                        COLLAB
                      </Button>
                      <Button 
                        variant={activePanel === 'achievements' ? 'default' : 'ghost'} 
                        size="sm" 
                        onClick={() => setActivePanel('achievements')}
                      >
                        <Trophy className="w-4 h-4 mr-1" />
                        ACHIEVEMENTS
                      </Button>
                    </div>
                    
                    <div className="flex-1 overflow-hidden">
                      {activePanel === 'effects' && (
                        <div className="h-full overflow-y-auto p-2">
                          <DAWEffectsPanel tracks={tracks} onTracksChange={setTracks} />
                        </div>
                      )}
                      {activePanel === 'collab' && user && (
                        <div className="h-full overflow-y-auto">
                          <DAWCollaboration 
                            sessionId={`daw-session-${user.id}`}
                            userId={user.id}
                            userName={user.email || 'User'}
                            onTrackUpdate={(trackData) => console.log('Track updated:', trackData)}
                            onEffectChange={(trackId, effectData) => console.log('Effect changed:', trackId, effectData)}
                          />
                        </div>
                      )}
                      {activePanel === 'achievements' && (
                        <div className="h-full overflow-y-auto p-4">
                          <DAWGamification 
                            achievements={achievements}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        {/* Left: Compact Track List (12%) */}
        <ResizablePanel defaultSize={12} minSize={10} maxSize={15}>
            <div className="h-full glass border-r border-border/50 flex flex-col">
              <div className="p-3 border-b border-border/30">
                <h3 className="text-xs font-bold">TRACKS</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {tracks.map((track) => (
                  <div 
                    key={track.id}
                    className="glass-hover p-2 rounded border border-border/20 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-8 rounded" style={{ backgroundColor: track.color }} />
                      <span className="text-xs font-medium truncate flex-1">{track.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right: Timeline + Mixer (88%) */}
          <ResizablePanel defaultSize={88}>
            <ResizablePanelGroup direction="vertical" className="h-full">
              {/* Timeline (50%) */}
              <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
                <div className="h-full overflow-hidden">
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
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Mixer Console (50%) - FULL WIDTH */}
              <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
                <div className="h-full glass border-t border-border/50 shadow-glass-lg flex flex-col">
                  {/* Mixer Header */}
                  <div className="flex items-center justify-between p-3 border-b border-border/30 flex-shrink-0">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-primary" />
                      MIXER CONSOLE
                      <Badge variant="outline" className="text-xs">
                        {tracks.length} Channels
                      </Badge>
                    </h3>
                    
                    <div className="flex items-center gap-3 glass-hover px-4 py-2 rounded-lg">
                      <span className="text-xs font-semibold text-muted-foreground">MASTER</span>
                      <Volume2 className="w-4 h-4 text-primary" />
                      <Slider
                        value={[masterVolume * 100]}
                        onValueChange={(value) => setMasterVolume(value[0] / 100)}
                        max={150}
                        step={0.1}
                        className="w-32"
                      />
                      <span className="text-sm font-mono font-bold text-primary w-16 text-right">
                        {masterVolume === 0 ? '-∞' : `${(20 * Math.log10(masterVolume)).toFixed(1)}`} dB
                      </span>
                    </div>
                  </div>
                  
                  {/* Mixer Content */}
                  <div className="flex-1 overflow-hidden">
                    <DAWMixerPanel 
                      tracks={tracks}
                      onTracksChange={setTracks}
                      masterVolume={masterVolume}
                      onMasterVolumeChange={setMasterVolume}
                    />
                  </div>

                  {/* Mixer Footer with Secondary Panel Triggers */}
                  <div className="p-2 border-t border-border/30 flex gap-2 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => setActivePanel('effects')}>
                      FX
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setActivePanel('collab')}>
                      <Users className="w-3 h-3 mr-1" />
                      COLLAB
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setActivePanel('achievements')}>
                      <Trophy className="w-3 h-3 mr-1" />
                      ACHIEVEMENTS
                    </Button>
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </>
        )}
      </ResizablePanelGroup>

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

      {/* Cloud Project Manager */}
      {showCloudManager && (
        <CloudProjectManager
          isOpen={showCloudManager}
          onClose={() => setShowCloudManager(false)}
        />
      )}

      {/* System Check Dialog */}
      {showSystemCheck && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-2xl animate-scale-in">
            <div className="flex justify-end mb-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowSystemCheck(false)}
              >
                Close
              </Button>
            </div>
            <StudioSystemCheck />
          </div>
        </div>
      )}

      {/* AI Assistant Panel */}
      {showAIAssistant && (
        <div className="fixed right-4 bottom-4 z-50 w-96 animate-slide-up">
          <AIAssistantPanel />
        </div>
      )}

      {/* Floating PrimeBot Button */}
      <Button 
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-glow z-50 bg-gradient-to-br from-primary to-accent"
        onClick={() => setShowPrimeBotModal(!showPrimeBotModal)}
      >
        <Sparkles className="w-7 h-7" />
      </Button>

      {/* PrimeBot Modal */}
      {showPrimeBotModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-3xl max-h-[80vh] animate-scale-in bg-card rounded-2xl border border-primary/30 shadow-glass-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-border/30">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                PrimeBot 4.0 Assistant
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowPrimeBotModal(false)}>
                Close
              </Button>
            </div>
            <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
              <PrimeBotAssistant message="Ready to help with your production!" />
            </div>
          </div>
        </div>
      )}
      
      {/* Secondary Panels as Modals */}
      {activePanel === 'effects' && viewMode === 'mix' && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[80vh] bg-card rounded-2xl border shadow-glass-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold">Effects Panel</h2>
              <Button variant="ghost" size="sm" onClick={() => setActivePanel('timeline')}>Close</Button>
            </div>
            <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-4">
              <DAWEffectsPanel tracks={tracks} onTracksChange={setTracks} />
            </div>
          </div>
        </div>
      )}

      {activePanel === 'collab' && viewMode === 'mix' && user && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[80vh] bg-card rounded-2xl border shadow-glass-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold">Collaboration</h2>
              <Button variant="ghost" size="sm" onClick={() => setActivePanel('timeline')}>Close</Button>
            </div>
            <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
              <DAWCollaboration 
                sessionId={`daw-session-${user.id}`}
                userId={user.id}
                userName={user.email || 'User'}
                onTrackUpdate={(trackData) => console.log('Track updated:', trackData)}
                onEffectChange={(trackId, effectData) => console.log('Effect changed:', trackId, effectData)}
              />
            </div>
          </div>
        </div>
      )}

      {activePanel === 'achievements' && viewMode === 'mix' && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[80vh] bg-card rounded-2xl border shadow-glass-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold">Achievements</h2>
              <Button variant="ghost" size="sm" onClick={() => setActivePanel('timeline')}>Close</Button>
            </div>
            <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-4">
              <DAWGamification achievements={achievements} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HybridDAW;