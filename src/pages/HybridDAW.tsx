/**
 * MixxClub Hybrid DAW - Industry-Standard Architecture
 * 
 * ARCHITECTURE OVERVIEW:
 * This DAW follows modern web audio best practices used by BandLab, Soundtrap, and Ableton Note.
 * 
 * LAYER 1: UI Components (React)
 * - EnhancedDAWTimeline, DAWMixerPanel, Transport buttons
 * - Displays waveforms, tracks, playhead position
 * - Sends user actions (play, pause, seek, volume changes) to Store
 * 
 * LAYER 2: State Management (Zustand Store - aiStudioStore)
 * - Single source of truth for: tracks, regions, currentTime, isPlaying, bpm
 * - Pure data layer - NO audio logic
 * - Actions: addTrack, updateTrack, setPlaying, setCurrentTime, etc.
 * 
 * LAYER 3: Bridge Hooks (useTransportBridge, useAudioEngineBridge)
 * - useTransportBridge: Syncs playback state → Transport → Scheduler
 * - useAudioEngineBridge: Syncs track params (volume, pan, effects) → Audio Graph
 * - Bridges connect reactive state to imperative audio APIs
 * 
 * LAYER 4: Transport (Transport.ts)
 * - Manages timing: currentTime, play/pause/stop/seek
 * - Uses AudioContext.currentTime for microsecond precision
 * - Event-based design: emits onStart/onStop/onPause/onSeek to listeners
 * - Does NOT handle audio playback - only timing control
 * 
 * LAYER 5: Scheduler (TrackScheduler.ts)
 * - Creates fresh AudioBufferSourceNode instances just-in-time
 * - Calculates buffer offsets for region-based playback
 * - Handles mid-region seeks (e.g., start playing at 5.3s in a region)
 * - Auto-cleanup when sources finish playing
 * - CRITICAL: AudioBufferSourceNode is one-time-use per Web Audio API spec
 * 
 * LAYER 6: Audio Engine (audioEngine.ts)
 * - Web Audio routing: sources → tracks → buses → effects → master → speakers
 * - TrackGraph per track: input → gain → pan → effects chain → output
 * - Volume, pan, effects processing
 * - Does NOT handle playback timing - only signal routing
 * 
 * DATA FLOW EXAMPLE (User Clicks Play):
 * User clicks Play 
 * → handlePlayPause() calls setPlaying(true)
 * → aiStudioStore updates isPlaying = true
 * → useTransportBridge detects change
 * → Calls Transport.start()
 * → Calls TrackScheduler.scheduleAll(currentTime, tracks)
 * → Scheduler creates fresh AudioBufferSourceNode for each region
 * → Sources connect to audioEngine TrackGraphs
 * → Audio plays through Web Audio pipeline!
 * → Transport continuously updates currentTime
 * → useTransportBridge syncs time back to store (60fps loop)
 * → Store update triggers React re-render
 * → UI updates playhead position smoothly
 * 
 * WHY THIS ARCHITECTURE?
 * ✅ Separation of Concerns - Each layer has one job
 * ✅ Testable - Can test each layer independently
 * ✅ Scalable - Easy to add features (MIDI, automation, offline rendering)
 * ✅ Industry Standard - Proven pattern used by professional DAWs
 * ✅ Web Audio Compliant - Respects AudioBufferSourceNode one-time-use rule
 * ✅ Sample-Accurate - Uses AudioContext.currentTime, not setTimeout/setInterval
 * 
 * KNOWN LIMITATIONS (Future Enhancements):
 * - No AudioWorklet yet (currently on main thread)
 * - No offline rendering (export/bounce)
 * - No time stretching
 * - No MIDI support
 * - No automation curves
 */

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
import { StemSeparationWindow } from "@/components/studio/StemSeparationWindow";
import VelvetCurve from "@/components/plugins/VelvetCurve";
import { AIBeatGenerator } from "@/components/daw/AIBeatGenerator";
import { DrumMachine808 } from "@/components/daw/DrumMachine808";
import { CloudProjectManager } from "@/components/daw/CloudProjectManager";
import { PrimeBotAssistant } from "@/components/studio/PrimeBotAssistant";
import { AIAssistantPanel } from "@/components/studio/AIAssistantPanel";
import { StudioSystemCheck } from "@/components/studio/StudioSystemCheck";
import { ClipEditorPanel } from "@/components/daw/ClipEditorPanel";
import { RSDChamberPortal } from "@/components/daw/RSDChamberPortal";
import { ConsoleOverlay } from "@/components/daw/ConsoleOverlay";
import { ConsoleTransport } from "@/components/daw/ConsoleTransport";
import { StudioPanel } from "@/components/daw/StudioPanel";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useAudioPermissions } from "@/hooks/useAudioPermissions";
import { useAudioEngineBridge } from "@/hooks/useAudioEngineBridge";
import { useSimplifiedTransportBridge } from "@/hooks/useSimplifiedTransportBridge";
import { useAchievements } from "@/hooks/useAchievements";
import { useAIStudioStore, Track, AudioRegion } from "@/stores/aiStudioStore";
import { WaveformGenerator } from "@/services/waveformGenerator";
import { audioEngine } from "@/services/audioEngine";
import Navigation from "@/components/Navigation";
import rsdChamberBg from "@/assets/rsd-chamber.jpg";

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
  
  // Core DAW State - Use Zustand store directly (single source of truth)
  const tracks = useAIStudioStore((s) => s.tracks);
  const isPlaying = useAIStudioStore((s) => s.isPlaying);
  const currentTime = useAIStudioStore((s) => s.currentTime);
  const bpm = useAIStudioStore((s) => s.bpm);
  const masterVolume = useAIStudioStore((s) => s.masterVolume);
  const setPlaying = useAIStudioStore((s) => s.setPlaying);
  const setCurrentTime = useAIStudioStore((s) => s.setCurrentTime);
  const setBpm = useAIStudioStore((s) => s.setBpm);
  const setMasterVolume = useAIStudioStore((s) => s.setMasterVolume);
  const addTrack = useAIStudioStore((s) => s.addTrack);
  const updateTrack = useAIStudioStore((s) => s.updateTrack);
  const removeTrack = useAIStudioStore((s) => s.removeTrack);
  
  const [isRecording, setIsRecording] = useState(false);
  
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
  const [showVelvetCurve, setShowVelvetCurve] = useState(false);
  const [showAIBeatGenerator, setShowAIBeatGenerator] = useState(false);
  const [show808, setShow808] = useState(false);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  
  // Collaboration State
  const [collaborators, setCollaborators] = useState<CollaborationUser[]>([]);
  const [isCollabConnected, setIsCollabConnected] = useState(false);
  
  // Audio Context References
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // Removed manual playback refs - using audioEngine only
  
  // Gamification - use hook
  const { achievements, unlockAchievement } = useAchievements();

  // Initialize bridges
  useAudioEngineBridge(); // Handles audio graph parameter sync (volume, pan, effects)
  useSimplifiedTransportBridge(); // Handles transport control (PHASE 5 - simplified architecture)

  // Initialize AudioWorklet modules for professional audio thread
  useEffect(() => {
    const initWorklets = async () => {
      await audioEngine.initWorklets();
    };
    initWorklets();
  }, []);

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

  // Add New Track (renamed to avoid conflict with store action)
  const createNewTrack = (type: 'audio' | 'vocal' | 'instrument' = 'audio') => {
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

    addTrack(newTrack);
    
    // Check for first track achievement
    if (tracks.length === 0) {
      unlockAchievement('first-track');
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
        
        // Decode audio and generate waveform using audioEngine context
        if (audioContextRef.current) {
          try {
            console.log('[Recording] Decoding recorded audio...');
            await audioEngine.resume();
            const arrayBuffer = await blob.arrayBuffer();
            const audioBuffer = await audioEngine.ctx.decodeAudioData(arrayBuffer);
            
            const waveformData = await WaveformGenerator.generateMultiResolutionAsync(audioBuffer);
            
            console.log('[Recording] Multi-resolution waveform generated (async)');
            
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

            // Update track with recording
            const currentTrack = tracks.find(t => t.id === trackId);
            if (currentTrack) {
              updateTrack(trackId, {
                armed: false,
                audioBuffer,
                waveformData, // Multi-resolution waveform data
                regions: [...(currentTrack.regions || []), newRegion]
              });
            }
          } catch (error) {
            console.error('[Recording] Failed to decode:', error);
          }
        };

        // Check for first recording achievement
        unlockAchievement('first-recording');

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

      updateTrack(trackId, { armed: true });

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
      
      tracks.forEach(track => {
        if (track.armed) {
          updateTrack(track.id, { armed: false });
        }
      });
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
      setPlaying(false);
      // Transport.pause() called by useTransportBridge
    } else {
      setPlaying(true);
      // Transport.start() called by useTransportBridge
    }
  };

  /**
   * Stop playback and reset to beginning
   */
  const handleStop = () => {
    setPlaying(false);
    setCurrentTime(0);
    // Transport.stop() called by useTransportBridge
  };

  // Handle imported audio file with automatic BPM detection
  const handleImportedAudio = async (importedFile: any) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[HybridDAW] 🎵 handleImportedAudio called');
    console.log('[HybridDAW] Imported file:', {
      fileName: importedFile.fileName,
      fileSize: importedFile.fileSize,
      duration: importedFile.duration,
      hasBlob: !!importedFile.blob,
      hasUrl: !!importedFile.url,
    });
    
    if (!audioContextRef.current) {
      console.error('[HybridDAW] ❌ No audio context!');
      toast({ 
        title: "❌ Audio Error", 
        description: "Audio system not initialized",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('[HybridDAW] 🔊 Step 1: Decoding audio...');
      
      // 1. Decode audio using audioEngine context to avoid mismatch
      await audioEngine.resume();
      
      const dataBuffer = importedFile?.blob 
        ? await importedFile.blob.arrayBuffer()
        : await (await fetch(importedFile.url)).arrayBuffer();
      
      console.log('[HybridDAW] ArrayBuffer size:', (dataBuffer.byteLength / 1024 / 1024).toFixed(2), 'MB');
      
      const audioBuffer = await audioEngine.ctx.decodeAudioData(dataBuffer.slice(0));
      console.log('[HybridDAW] ✅ Audio decoded:', {
        duration: audioBuffer.duration.toFixed(2) + 's',
        channels: audioBuffer.numberOfChannels,
        sampleRate: audioBuffer.sampleRate + 'Hz',
        length: audioBuffer.length + ' samples',
      });
      
      // 2. Generate multi-resolution waveform using Web Worker (PHASE 6)
      console.log('[HybridDAW] 📊 Step 2: Generating multi-resolution waveform (async)...');
      
      let waveformData;
      try {
        waveformData = await WaveformGenerator.generateMultiResolutionAsync(
          audioBuffer,
          (progress, stage) => {
            console.log(`[HybridDAW] Waveform ${stage}: ${(progress * 100).toFixed(0)}%`);
          }
        );
      } catch (error) {
        console.warn('[HybridDAW] Async generation failed, using sync fallback');
        waveformData = WaveformGenerator.generateMultiResolution(audioBuffer);
      }
      
      console.log('[HybridDAW] ✅ Multi-resolution waveform generated:', {
        low: waveformData.multiResolution?.low.length + ' peaks (overview)',
        medium: waveformData.multiResolution?.medium.length + ' peaks (normal)',
        high: waveformData.multiResolution?.high.length + ' peaks (detail)',
      });
      
      // 3. Use stable IDs to avoid drift between track/region
      console.log('[HybridDAW] 🏷️ Step 3: Creating track with stable IDs...');
      const trackId = `track-${Date.now()}`;
      const regionId = `region-${Date.now()}`;
      console.log('[HybridDAW] Generated IDs:', { trackId, regionId });
      
      // 4. Create track with ALL audio data
      console.log('[HybridDAW] 🎨 Step 4: Building track object...');
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
        waveformData, // ✅ Multi-resolution waveform data (PHASE 3)
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
      
      // Validation
      if (!newTrack.audioBuffer) {
        throw new Error('❌ Track missing audioBuffer after creation!');
      }
      if (!newTrack.waveformData) {
        throw new Error('❌ Track missing waveformData after creation!');
      }
      if (!newTrack.regions || newTrack.regions.length === 0) {
        throw new Error('❌ Track missing regions after creation!');
      }
      
      console.log('[HybridDAW] ✅ Track validation passed:', {
        hasAudioBuffer: !!newTrack.audioBuffer,
        waveformData: typeof newTrack.waveformData,
        regionCount: newTrack.regions.length,
        regionHasBuffer: !!newTrack.regions[0].audioBuffer,
      });
      
      console.log('[HybridDAW] 📤 Step 5: Adding track to state...');
      const currentTrackCount = tracks.length;
      addTrack(newTrack);
      console.log('[HybridDAW] ✅ Track added to state (was', currentTrackCount, 'tracks, now should be', currentTrackCount + 1, ')');
      
      setShowImportDialog(false);
      console.log('[HybridDAW] ✅ Import dialog closed');

      // If analysis is available, update session BPM and time signature
      if (importedFile.analysis) {
        const { recommendations, bpm: detectedBpm, timeSignature, confidence } = importedFile.analysis;
        
        if (confidence > 0.6 && recommendations.sessionBpm) {
          setBpm(recommendations.sessionBpm);
          console.log('[HybridDAW] 🎼 BPM updated to:', recommendations.sessionBpm);
          
          toast({
            title: "✅ Session Updated!",
            description: `Auto-detected BPM: ${recommendations.sessionBpm} | Time: ${recommendations.sessionTimeSignature} | Genre: ${importedFile.analysis.genre}`,
            duration: 5000
          });
        } else {
          toast({
            title: "✅ Track Added!",
            description: `${importedFile.fileName} added with real audio data. BPM detection confidence low - consider manual adjustment.`,
          });
        }
      } else {
        console.log('[HybridDAW] 🎉 Import complete!');
        toast({
          title: "✅ Track Added to Timeline!",
          description: `${importedFile.fileName} • ${audioBuffer.duration.toFixed(1)}s • Multi-resolution waveform`,
        });
      }
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
    } catch (error) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('[HybridDAW] ❌ Import failed:', error);
      console.error('[HybridDAW] Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      toast({
        title: "❌ Import Failed",
        description: error instanceof Error ? error.message : "Could not decode audio file",
        variant: "destructive"
      });
    }
  };

  // Seek to time position
  const seekToTime = (time: number) => {
    console.log('[HybridDAW] Seeking to:', time.toFixed(3), 's');
    setCurrentTime(time);
    // Transport will handle the seek via useTransportBridge
  };

  // Handle track changes from Timeline (mute, solo, volume, delete)
  const onTracksChange = (updatedTracks: Track[]) => {
    // Update changed tracks
    updatedTracks.forEach(ut => {
      const orig = tracks.find(t => t.id === ut.id);
      if (!orig) return;
      
      const patch: Partial<Track> = {};
      if (orig.mute !== ut.mute) patch.mute = ut.mute;
      if (orig.solo !== ut.solo) patch.solo = ut.solo;
      if (orig.volume !== ut.volume) patch.volume = ut.volume;
      
      if (Object.keys(patch).length) {
        updateTrack(ut.id, patch);
      }
    });
    
    // Remove tracks deleted by the timeline
    tracks.forEach(t => {
      if (!updatedTracks.find(u => u.id === t.id)) {
        removeTrack(t.id);
      }
    });
  };

  // Keyboard shortcuts for transport control
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs/textareas
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekToTime(Math.max(0, currentTime - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekToTime(currentTime + 1);
          break;
        case 'Home':
          e.preventDefault();
          seekToTime(0);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, isPlaying]);

  // Region selection helpers
  const getSelectedRegion = (): AudioRegion | null => {
    if (!selectedRegionId) return null;
    return tracks.flatMap(t => t.regions || []).find(r => r.id === selectedRegionId) || null;
  };

  const getSelectedRegionTrack = (): Track | null => {
    const region = getSelectedRegion();
    if (!region) return null;
    return tracks.find(t => t.id === region.trackId) || null;
  };

  const handleUpdateRegion = (regionId: string, updates: Partial<AudioRegion>) => {
    tracks.forEach(track => {
      const updatedRegions = track.regions?.map(r =>
        r.id === regionId ? { ...r, ...updates } : r
      );
      if (updatedRegions && updatedRegions !== track.regions) {
        updateTrack(track.id, { regions: updatedRegions });
      }
    });
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
          waveformData,
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
        
        addTrack(newTrack);
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
      <RSDChamberPortal isPlaying={false} isRecording={false}>
        {/* Chamber Locked State */}
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-background/80 backdrop-blur-xl border border-primary/20 rounded-2xl p-8 max-w-md w-full mx-4 shadow-[0_0_60px_hsl(var(--primary)/0.1)]">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Chamber Locked</h2>
              <p className="text-muted-foreground">
                Sign in to enter the RSD Chamber and start creating.
              </p>
              <Button className="w-full" onClick={() => { window.location.href = '/auth'; }}>
                Enter Chamber
              </Button>
            </div>
          </div>
        </div>
      </RSDChamberPortal>
    );
  }

  return (
    <RSDChamberPortal isPlaying={isPlaying} isRecording={isRecording}>
      {/* Console Transport Bar */}
      <div className="pt-16">
        <ConsoleTransport
          isPlaying={isPlaying}
          isRecording={isRecording}
          currentTime={currentTime}
          bpm={bpm}
          hasAudioAccess={hasAudioAccess}
          onPlayPause={handlePlayPause}
          onStop={handleStop}
          onRewind={() => seekToTime(0)}
          onRecord={() => tracks[0] ? startRecording(tracks[0].id) : createNewTrack('vocal')}
          onRequestMic={requestMicrophone}
        />
      </div>

      {/* Console Overlay with DAW Content */}
      <ConsoleOverlay isPlaying={isPlaying}>
        {/* Toolbar Actions */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/20">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowCloudManager(true)} className="gap-2">
              <FolderOpen className="w-4 h-4" />
              <span className="text-xs">PROJECT</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => createNewTrack('vocal')} className="gap-2">
              <FileAudio className="w-4 h-4" />
              <span className="text-xs">ADD TRACK</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowImportDialog(true)} className="gap-2">
              <Upload className="w-4 h-4" />
              <span className="text-xs">IMPORT</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowStemSeparationDialog(true)} className="gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs">STEMS</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowVelvetCurve(true)} className="gap-2">
              <AudioWaveform className="w-4 h-4" />
              <span className="text-xs">VELVET</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShow808(true)} className="gap-2">
              <Gamepad2 className="w-4 h-4" />
              <span className="text-xs">808</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowAIBeatGenerator(true)} className="gap-2">
              <Mic className="w-4 h-4" />
              <span className="text-xs">AI BEATS</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={viewMode === 'mix' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode(viewMode === 'arrange' ? 'mix' : 'arrange')} className="gap-2">
              <Sliders className="w-4 h-4" />
              <span className="text-xs">{viewMode === 'arrange' ? 'MIX' : 'ARRANGE'}</span>
            </Button>
            <Button variant={view === '3d' ? 'default' : 'ghost'} size="sm" onClick={() => setView(view === '2d' ? '3d' : '2d')} className="text-xs">
              {view === '2d' ? '3D' : '2D'}
            </Button>
          </div>
        </div>

        {/* Main DAW Content */}
        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="h-full">
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
                      onClick={() => {
                        // Unsolo all other tracks, then toggle this one
                        tracks.forEach(t => {
                          if (t.id !== track.id && t.solo) {
                            updateTrack(t.id, { solo: false });
                          }
                        });
                        updateTrack(track.id, { solo: !track.solo });
                      }}
                      className="flex-1 text-xs font-bold"
                    >
                      S
                    </Button>
                    <Button
                      variant={track.mute ? "destructive" : "ghost"}
                      size="sm"
                      onClick={() => updateTrack(track.id, { mute: !track.mute })}
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
                        onValueChange={(value) => updateTrack(track.id, { volume: value[0] / 100 })}
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
                      onClick={() => createNewTrack('vocal')}
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
                onTracksChange={onTracksChange}
                currentTime={currentTime}
                onTimeChange={seekToTime}
                isPlaying={isPlaying}
                bpm={bpm}
                onStartRecording={startRecording}
                onStopRecording={stopRecording}
                isRecording={isRecording}
                onRegionSelect={setSelectedRegionId}
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
            selectedRegion={getSelectedRegion()}
            selectedTrack={getSelectedRegionTrack()}
            onUpdateRegion={handleUpdateRegion}
          />
        </ResizablePanel>
        </>
        ) : (
        <>
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
                    onTracksChange={onTracksChange}
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
                      onTracksChange={() => {
                        // Legacy prop - components should use store actions directly
                        // This prevents infinite loops from full track object updates
                      }}
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
              <DAWEffectsPanel 
                tracks={tracks} 
                onTracksChange={() => {
                  // Legacy prop - components should use store actions directly
                  // This prevents infinite loops from full track object updates
                }}
              />
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
      </ConsoleOverlay>

      {/* VelvetCurve Modal */}
      {showVelvetCurve && (
        <VelvetCurve isOpen={showVelvetCurve} onClose={() => setShowVelvetCurve(false)} />
      )}

      {/* 808 Drum Machine Modal */}
      {show808 && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border shadow-glass-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">808 Drum Machine</h2>
              <Button variant="ghost" size="sm" onClick={() => setShow808(false)}>Close</Button>
            </div>
            <DrumMachine808 onNoteTriggered={(note, vel) => console.log('808:', note, vel)} />
          </div>
        </div>
      )}

      {/* AI Beat Generator Modal */}
      {showAIBeatGenerator && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border shadow-glass-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">AI Beat Generator</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowAIBeatGenerator(false)}>Close</Button>
            </div>
            <AIBeatGenerator />
          </div>
        </div>
      )}
    </RSDChamberPortal>
  );
};

export default HybridDAW;