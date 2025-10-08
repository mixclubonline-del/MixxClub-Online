import React, { useRef, useState, useEffect, useCallback } from "react";
import { Helmet } from 'react-helmet-async';
import GlobalHeader from "@/components/GlobalHeader";
import { usePrime } from "@/contexts/PrimeContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { StudioConsole } from "@/components/studio/StudioConsole";
import { HardwareRack } from "@/components/studio/HardwareRack";
import { TransportControls } from "@/components/studio/TransportControls";
import { WaveformTimeline } from "@/components/studio/WaveformTimeline";
import { BrowserSidebar } from "@/components/studio/BrowserSidebar";
import { InspectorSidebar } from "@/components/studio/InspectorSidebar";

import { PluginManager } from "@/components/plugins/PluginManager";
import AudioImportDialog from "@/components/AudioImportDialog";
import DAWCollaboration from "@/components/daw/DAWCollaboration";
import DAWEffectsPanel from "@/components/daw/DAWEffectsPanel";
import { useAIStudioStore, EffectUnit } from "@/stores/aiStudioStore";
import { TrackEffectsDialog } from "@/components/studio/TrackEffectsDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plug2, Upload, Users, Sparkles, Sliders, Layers } from "lucide-react";
import { AudioAnalysisPanel } from "@/components/studio/AudioAnalysisPanel";
import { AIAssistantPanel } from "@/components/studio/AIAssistantPanel";
import { useAudioPermissions } from "@/hooks/useAudioPermissions";
import { audioEngine } from "@/services/audioEngine";
import { toast as sonnerToast } from 'sonner';
import { ReactiveWaveform } from "@/components/studio/ReactiveWaveform";
import { PluginRack } from "@/components/studio/PluginRack";
import { PrimeBotAssistant } from "@/components/studio/PrimeBotAssistant";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-6 shadow-[var(--shadow-glass)] hover:shadow-[var(--shadow-glass-lg)] transition">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wide text-[hsl(var(--foreground)/0.9)]">
          {title}
        </h3>
        <span className="h-2 w-2 rounded-full bg-[hsl(var(--primary))] pulse-live" />
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Range({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[hsl(var(--primary))]"
      />
    </div>
  );
}

export default function AIStudio() {
  const { systemMode, userMood } = usePrime();
  const { toast } = useToast();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploadName, setUploadName] = useState<string | null>(null);
  const [isPluginManagerOpen, setIsPluginManagerOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [recordArmedTracks, setRecordArmedTracks] = useState<Set<string>>(new Set());
  const [selectedTrackForEffects, setSelectedTrackForEffects] = useState<string | null>(null);
  const [trackEffects, setTrackEffects] = useState<Map<string, EffectUnit[]>>(new Map());
  const playbackIntervalRef = useRef<number | null>(null);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [activeRightPanel, setActiveRightPanel] = useState<'inspector' | 'collaborate' | 'ai-effects'>('inspector');
  const [showPluginRack, setShowPluginRack] = useState(false);
  const [activePluginColors, setActivePluginColors] = useState(["#A7B7FF", "#C5A3FF", "#FF70D0"]);
  const [waveformPulse, setWaveformPulse] = useState(1.0);
  const [primeBotMessage, setPrimeBotMessage] = useState<string | null>(null);
  
  const { permissions, requestAudioPermissions, hasAudioAccess } = useAudioPermissions();
  
  // Panel size state with localStorage persistence
  const [browserSize, setBrowserSize] = useState(() => {
    const saved = localStorage.getItem('mixclub-browser-panel-size');
    return saved ? parseFloat(saved) : 20;
  });
  
  const [inspectorSize, setInspectorSize] = useState(() => {
    const saved = localStorage.getItem('mixclub-inspector-panel-size');
    return saved ? parseFloat(saved) : 24;
  });
  
  const [timelineSize, setTimelineSize] = useState(() => {
    const saved = localStorage.getItem('mixclub-timeline-console-split');
    return saved ? parseFloat(saved) : 60;
  });

  // Save panel sizes to localStorage
  useEffect(() => {
    localStorage.setItem('mixclub-browser-panel-size', browserSize.toString());
  }, [browserSize]);

  useEffect(() => {
    localStorage.setItem('mixclub-inspector-panel-size', inspectorSize.toString());
  }, [inspectorSize]);

  useEffect(() => {
    localStorage.setItem('mixclub-timeline-console-split', timelineSize.toString());
  }, [timelineSize]);
  
  const {
    tracks,
    isPlaying,
    isRecording,
    currentTime,
    duration,
    tempo,
    effects,
    setPlaying,
    setRecording,
    setTempo,
    setCurrentTime,
    updateEffect,
    updateTrack,
    addTrack,
    removeTrack,
  } = useAIStudioStore();

  const masterVolume = useAIStudioStore((state) => state.masterVolume);
  const masterPeakLevel = useAIStudioStore((state) => state.masterPeakLevel);
  const updateMasterLevels = useAIStudioStore((state) => state.updateMasterLevels);
  const setDuration = useAIStudioStore((state) => state.setDuration);

  // Sync master volume to audio engine
  useEffect(() => {
    audioEngine.setMasterVolume(masterVolume);
  }, [masterVolume]);

  // Sync track parameters (volume, pan) to audio engine when they change
  useEffect(() => {
    tracks.forEach((track) => {
      audioEngine.setTrackVolume(track.id, track.volume);
      audioEngine.setTrackPan(track.id, track.pan);
    });
  }, [tracks]);

  // Real-time metering loop - runs during playback
  useEffect(() => {
    if (!isPlaying) return;

    const meteringInterval = setInterval(() => {
      let maxPeak = 0;

      tracks.forEach((track) => {
        if (!track.mute) {
          const levels = audioEngine.getTrackLevels(track.id);
          const trackPeak = levels.peak * track.volume;
          const trackRms = levels.rms * track.volume;
          
          maxPeak = Math.max(maxPeak, trackPeak);
          
          updateTrack(track.id, {
            peakLevel: trackPeak,
            rmsLevel: trackRms
          });
        }
      });

      updateMasterLevels(maxPeak);
      
      // Update waveform pulse based on audio level
      setWaveformPulse(0.5 + (maxPeak * 0.5));
    }, 1000 / 60); // 60fps metering

    return () => clearInterval(meteringInterval);
  }, [isPlaying, tracks, updateTrack, updateMasterLevels]);


  const speak = (message: string) => {
    toast({ title: message });
  };

  const startAnalysis = (name: string) => {
    speak(`Prime: Analyzing "${name}"…`);
    setTimeout(() => speak("Prime: Detecting stems & spectral balance…"), 1800);
    setTimeout(() => speak("Prime: Suggesting mix improvements…"), 3800);
    setTimeout(() => speak("Prime: Ready — apply recommendations when you're set."), 6200);
  };

  const detectTrackType = (fileName: string, instruments: string[] = []): 'vocal' | 'drums' | 'bass' | 'keys' | 'guitar' | 'other' => {
    const nameLower = fileName.toLowerCase();
    const instrumentStr = instruments.join(' ').toLowerCase();
    
    if (nameLower.includes('vocal') || nameLower.includes('voice') || instrumentStr.includes('vocal')) return 'vocal';
    if (nameLower.includes('drum') || nameLower.includes('kick') || nameLower.includes('808') || instrumentStr.includes('drum')) return 'drums';
    if (nameLower.includes('bass') || instrumentStr.includes('bass')) return 'bass';
    if (nameLower.includes('key') || nameLower.includes('piano') || instrumentStr.includes('piano') || instrumentStr.includes('synth')) return 'keys';
    if (nameLower.includes('guitar') || instrumentStr.includes('guitar')) return 'guitar';
    
    return 'other';
  };

  const loadAudioBuffer = async (url: string): Promise<{ buffer: AudioBuffer; waveform: number[] }> => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    try {
      console.log('[AIStudio] Loading audio from:', url);
      
      // Fetch the audio file
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
      }
      
      // Get content type for validation
      const contentType = response.headers.get('content-type');
      console.log('[AIStudio] Audio content-type:', contentType);
      
      // Get array buffer
      const arrayBuffer = await response.arrayBuffer();
      console.log('[AIStudio] Audio buffer size:', arrayBuffer.byteLength, 'bytes');
      
      if (arrayBuffer.byteLength === 0) {
        throw new Error('Audio file is empty');
      }
      
      // Decode audio data
      let audioBuffer: AudioBuffer;
      try {
        audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        console.log('[AIStudio] Audio decoded successfully:', {
          duration: audioBuffer.duration,
          sampleRate: audioBuffer.sampleRate,
          channels: audioBuffer.numberOfChannels
        });
      } catch (decodeError: any) {
        console.error('[AIStudio] Audio decode error:', decodeError);
        
        // Provide specific error messages based on common issues
        if (decodeError.name === 'EncodingError' || decodeError.message?.includes('codec')) {
          throw new Error('Unsupported audio format. Please use WAV, MP3, AAC, or OGG files.');
        } else if (arrayBuffer.byteLength < 1000) {
          throw new Error('Audio file appears to be corrupted or incomplete.');
        } else {
          throw new Error(`Unable to decode audio: ${decodeError.message || 'Unknown format'}`);
        }
      }
      
      // Generate waveform data
      const channelData = audioBuffer.getChannelData(0);
      const waveform: number[] = [];
      const peakSamples = 1000;
      const samplesPerPeak = Math.floor(channelData.length / peakSamples);
      
      for (let i = 0; i < peakSamples; i++) {
        let peak = 0;
        for (let j = 0; j < samplesPerPeak; j++) {
          const sample = Math.abs(channelData[i * samplesPerPeak + j] || 0);
          peak = Math.max(peak, sample);
        }
        waveform.push(peak);
      }
      
      console.log('[AIStudio] Waveform generated, peaks:', waveform.length);
      return { buffer: audioBuffer, waveform };
      
    } catch (error: any) {
      console.error('[AIStudio] loadAudioBuffer error:', error);
      throw error;
    } finally {
      // Close the temporary audio context
      try {
        await audioContext.close();
      } catch (e) {
        console.warn('[AIStudio] Failed to close audio context:', e);
      }
    }
  };

  const loadAudioFromBlob = async (blob: Blob): Promise<{ buffer: AudioBuffer; waveform: number[] }> => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    try {
      console.log('[AIStudio] Loading audio from Blob...');
      const arrayBuffer = await blob.arrayBuffer();
      if (arrayBuffer.byteLength === 0) {
        throw new Error('Audio file is empty');
      }
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const channelData = audioBuffer.getChannelData(0);
      const waveform: number[] = [];
      const peakSamples = 1000;
      const samplesPerPeak = Math.floor(channelData.length / peakSamples);
      for (let i = 0; i < peakSamples; i++) {
        let peak = 0;
        for (let j = 0; j < samplesPerPeak; j++) {
          const sample = Math.abs(channelData[i * samplesPerPeak + j] || 0);
          peak = Math.max(peak, sample);
        }
        waveform.push(peak);
      }
      return { buffer: audioBuffer, waveform };
    } catch (error) {
      console.error('[AIStudio] loadAudioFromBlob error:', error);
      throw error;
    } finally {
      try { await audioContext.close(); } catch {}
    }
  };

  const handleImportComplete = async (file: any) => {
    console.log('[AIStudio] handleImportComplete called with file:', {
      fileName: file.fileName,
      hasUrl: !!file.url,
      url: file.url,
      fileSize: file.fileSize
    });
    
    setIsLoadingAudio(true);
    
    try {
      // Validate file data (URL or Blob)
      if (!file.url && !file.blob) {
        throw new Error('Audio data missing. Please try uploading again.');
      }
      
      // Determine track type
      const trackType = detectTrackType(file.fileName, file.analysis?.instruments || []);
      
      // Sequential track naming: Track 1, Track 2, Track 3...
      const trackNumber = tracks.length + 1;
      const trackName = `Track ${trackNumber}`;
      
      console.log('[AIStudio] Loading audio buffer from source...');
      // Load audio buffer and generate waveform
      const { buffer, waveform } = file.blob
        ? await loadAudioFromBlob(file.blob as Blob)
        : await loadAudioBuffer(file.url as string);
      console.log('[AIStudio] Audio buffer loaded successfully:', {
        duration: buffer.duration,
        channels: buffer.numberOfChannels,
        sampleRate: buffer.sampleRate
      });
      
      // Create new track with initial region spanning full audio
      const trackId = `track-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const initialRegion = {
        id: `region-${trackId}-initial`,
        trackId,
        startTime: 0,
        duration: buffer.duration,
        sourceStartOffset: 0,
        fadeIn: { duration: 0, curve: 'linear' as const },
        fadeOut: { duration: 0, curve: 'linear' as const },
        gain: 1.0,
      };
      
      const newTrack = {
        id: trackId,
        name: trackName,
        type: trackType,
        volume: 0.8,
        pan: 0,
        mute: false,
        solo: false,
        peakLevel: 0,
        rmsLevel: 0,
        audioBuffer: buffer,
        waveformData: waveform,
        analysis: file.analysis,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        regions: [initialRegion],
        effects: [],
        sends: {},
      };
      
      console.log('[AIStudio] Adding track to store:', trackName);
      // Add track to store
      addTrack(newTrack);

      // Initialize audio engine for this track
      audioEngine.initTrack(trackId, buffer);
      audioEngine.setTrackVolume(trackId, 0.8);
      audioEngine.setTrackPan(trackId, 0);

      // Update session duration to longest track
      const currentDuration = useAIStudioStore.getState().duration;
      if (buffer.duration > currentDuration) {
        setDuration(buffer.duration);
      }
      
      // Auto-configure session if first track
      if (tracks.length === 0 && file.analysis?.bpm) {
        setTempo(file.analysis.recommendations?.sessionBpm || file.analysis.bpm);
      }
      
      // Store analysis for display
      if (file.analysis) {
        setLatestAnalysis({
          ...file.analysis,
          trackName: trackName
        });
      }
      
      sonnerToast.success('Track Added!', {
        description: `${file.fileName} → ${trackName} (${trackType})`,
      });
      
      console.log('[AIStudio] Track added successfully. Total tracks:', tracks.length + 1);
      startAnalysis(trackName);
      setIsImportDialogOpen(false);
      
    } catch (error: any) {
      console.error('[AIStudio] Error in handleImportComplete:', error);
      
      // Provide helpful error message
      const errorMessage = error.message || 'Unknown error occurred';
      const isFormatError = errorMessage.includes('format') || errorMessage.includes('codec');
      const isCorruptionError = errorMessage.includes('corrupt') || errorMessage.includes('empty');
      
      sonnerToast.error('Import Failed', {
        description: errorMessage,
        duration: 5000,
      });
      
      // Additional guidance based on error type
      if (isFormatError) {
        sonnerToast.info('Supported Formats', {
          description: 'Try converting your file to WAV, MP3, AAC, or OGG format.',
          duration: 7000,
        });
      } else if (isCorruptionError) {
        sonnerToast.info('File Issue', {
          description: 'The file may be incomplete or corrupted. Try re-exporting from your DAW.',
          duration: 7000,
        });
      }
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handlePlay = useCallback(async () => {
    await audioEngine.resume();
    
    if (!isPlaying) {
      // Start playback
      tracks.forEach((track) => {
        if (track.audioBuffer && !track.mute) {
          const shouldPlay = !track.solo || tracks.some(t => t.solo);
          const isSoloed = tracks.some(t => t.solo);
          
          if ((!isSoloed || track.solo) && shouldPlay) {
            audioEngine.playTrack(track.id, track.audioBuffer, currentTime);
            audioEngine.setTrackVolume(track.id, track.volume);
            audioEngine.setTrackPan(track.id, track.pan);
          }
        }
      });
      
      // Start playback position updater
      const startTime = audioEngine.getCurrentTime() - currentTime;
      playbackIntervalRef.current = window.setInterval(() => {
        const elapsed = audioEngine.getCurrentTime() - startTime;
        setCurrentTime(Math.min(elapsed, duration));
        
        if (elapsed >= duration) {
          handleStop();
        }
      }, 50);
      
      setPlaying(true);
    } else {
      // Pause playback
      tracks.forEach((track) => {
        audioEngine.stopTrack(track.id);
      });
      
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
        playbackIntervalRef.current = null;
      }
      
      setPlaying(false);
    }
  }, [isPlaying, tracks, currentTime, duration, setPlaying, setCurrentTime]);

  const handleStop = useCallback(() => {
    // Stop all tracks
    tracks.forEach((track) => {
      audioEngine.stopTrack(track.id);
    });
    
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }
    
    setPlaying(false);
    setCurrentTime(0);
  }, [tracks, setPlaying, setCurrentTime]);

  const handleRecord = useCallback(async () => {
    if (!isRecording) {
      // Start recording on armed tracks
      if (recordArmedTracks.size === 0) {
        sonnerToast.error('No tracks armed for recording', {
          description: 'Arm at least one track by clicking the record button in the track header'
        });
        return;
      }
      
      // Request audio permissions
      if (!hasAudioAccess) {
        const granted = await requestAudioPermissions();
        if (!granted) return;
      }
      
      // Start recording on armed tracks
      recordArmedTracks.forEach((trackId) => {
        if (permissions.stream) {
          audioEngine.startRecording(trackId, permissions.stream);
        }
      });
      
      setRecording(true);
      
      // Auto-start playback
      if (!isPlaying) {
        handlePlay();
      }
      
      sonnerToast.success('Recording started', {
        description: `Recording on ${recordArmedTracks.size} track(s)`
      });
    } else {
      // Stop recording
      recordArmedTracks.forEach((trackId) => {
        audioEngine.stopRecording(trackId);
      });
      
      setRecording(false);
      
      sonnerToast.success('Recording stopped');
    }
  }, [isRecording, recordArmedTracks, hasAudioAccess, permissions.stream, isPlaying, setRecording, requestAudioPermissions, handlePlay]);

  const handleToggleRecordArm = useCallback((trackId: string) => {
    setRecordArmedTracks((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      return next;
    });
  }, []);

  const handleOpenTrackEffects = useCallback((trackId: string) => {
    setSelectedTrackForEffects(trackId);
  }, []);

  const handleDeleteTrack = useCallback((trackId: string) => {
    audioEngine.cleanupTrack(trackId);
    removeTrack(trackId);
    setRecordArmedTracks((prev) => {
      const next = new Set(prev);
      next.delete(trackId);
      return next;
    });
    sonnerToast.success('Track deleted');
  }, [removeTrack]);

  const selectedTrack = selectedTrackForEffects 
    ? tracks.find(t => t.id === selectedTrackForEffects) 
    : null;
  const selectedTrackEffects = selectedTrackForEffects 
    ? trackEffects.get(selectedTrackForEffects) || [] 
    : [];

  const handlePluginSelect = (plugin: any) => {
    setPrimeBotMessage(plugin.description);
    setActivePluginColors(plugin.colors);
    setWaveformPulse(1.3);
  };

  return (
    <>
      <Helmet>
        <title>AI Studio — MixClub Online</title>
        <meta 
          name="description" 
          content="Intelligent creative suite for music production. Upload, analyze, and enhance with AI-powered mixing and mastering." 
        />
      </Helmet>

      <main 
        className="h-screen flex flex-col text-[hsl(var(--studio-text))] overflow-hidden"
        style={{
          background: 'var(--bg-workspace)',
        }}
      >
        
        <GlobalHeader />

        {/* Quick Actions Bar - Prominent Upload */}
        <div className="flex-shrink-0 mt-16 px-6 py-3 border-b border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {tracks.length === 0 ? 'PrimeBot 4.0 Studio' : 'Session Active'}
              </h2>
              <Button 
                onClick={() => setIsImportDialogOpen(true)}
                className="gap-2"
                size={tracks.length === 0 ? "lg" : "default"}
              >
                <Upload className="w-4 h-4" />
                {tracks.length === 0 ? 'Import Audio to Begin' : 'Add Track'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowPluginRack(true)}
                className="gap-2"
              >
                <Layers className="w-4 h-4" />
                Plugin Rack
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="gap-2 text-purple-400 border-purple-400/30">
                {tempo} BPM
              </Badge>
              <Badge variant="outline" className="gap-2">
                <Users className="w-3 h-3" />
                {sessionId.slice(-8)}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reactive Waveform Overlay */}
        {tracks.length > 0 && (
          <div className="flex-shrink-0 px-6 py-4">
                <ReactiveWaveform 
                  activeColors={activePluginColors}
                  pulseIntensity={waveformPulse}
                  isPlaying={isPlaying}
                  audioLevel={masterPeakLevel}
                />
            {primeBotMessage && (
              <div className="mt-2">
                <PrimeBotAssistant activePlugin={primeBotMessage} />
              </div>
            )}
          </div>
        )}

        {/* Conditionally render dialog */}
        {isImportDialogOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
            <div className="relative bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
              <AudioImportDialog
                sessionId="studio-session"
                onImportComplete={(file) => {
                  handleImportComplete(file);
                }}
                onClose={() => setIsImportDialogOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Transport Bar */}
        <div className="flex-shrink-0">
          <TransportControls
            isPlaying={isPlaying}
            isRecording={isRecording}
            currentTime={currentTime}
            duration={duration}
            tempo={tempo}
            onPlay={handlePlay}
            onStop={handleStop}
            onRecord={handleRecord}
            onTempoChange={setTempo}
          />
        </div>

        {/* Main Studio Layout - Resizable Panels */}
        <ResizablePanelGroup 
          direction="horizontal" 
          className="flex-1"
          onLayout={(sizes) => {
            if (sizes[0]) setBrowserSize(sizes[0]);
            if (sizes[2]) setInspectorSize(sizes[2]);
          }}
        >
          {/* Left Sidebar - Browser (Resizable) */}
          <ResizablePanel 
            defaultSize={browserSize} 
            minSize={15} 
            maxSize={30}
            id="browser"
          >
            <BrowserSidebar />
          </ResizablePanel>

          {/* Glass Resize Handle */}
          <ResizableHandle 
            withHandle
            className="w-1 hover:w-2 transition-all"
            style={{
              background: 'linear-gradient(90deg, hsl(var(--primary) / 0.2), hsl(var(--accent) / 0.2))',
              backdropFilter: 'blur(8px)',
            }}
          />

          {/* Center - Timeline & Console (Vertical Split) */}
          <ResizablePanel defaultSize={100 - browserSize - inspectorSize} minSize={40}>
            <ResizablePanelGroup 
              direction="vertical"
              onLayout={(sizes) => {
                if (sizes[0]) setTimelineSize(sizes[0]);
              }}
            >
              {/* Timeline/Arrangement View - Top */}
              <ResizablePanel 
                defaultSize={timelineSize} 
                minSize={40} 
                maxSize={75}
                id="timeline"
              >
                <WaveformTimeline
                  tracks={tracks}
                  currentTime={currentTime}
                  duration={duration}
                  isPlaying={isPlaying}
                  onTimeChange={setCurrentTime}
                  onTrackUpdate={updateTrack}
                  recordArmedTracks={recordArmedTracks}
                  onToggleRecordArm={handleToggleRecordArm}
                  onOpenTrackEffects={handleOpenTrackEffects}
                  onDeleteTrack={handleDeleteTrack}
                />
              </ResizablePanel>

              {/* Glass Resize Handle - Horizontal */}
              <ResizableHandle 
                withHandle
                className="h-1 hover:h-2 transition-all"
                style={{
                  background: 'linear-gradient(180deg, hsl(var(--primary) / 0.2), hsl(var(--accent) / 0.2))',
                  backdropFilter: 'blur(8px)',
                }}
              />

              {/* Mixer/Console View - Bottom */}
              <ResizablePanel 
                defaultSize={100 - timelineSize} 
                minSize={25} 
                maxSize={60}
                id="console"
              >
                <Tabs defaultValue="console" className="h-full flex flex-col">
                  <TabsList className="flex-shrink-0 w-full max-w-md mx-auto grid grid-cols-3 my-3 bg-[hsl(var(--studio-panel))]">
                    <TabsTrigger 
                      value="console"
                      className="data-[state=active]:bg-[hsl(var(--studio-panel-raised))] data-[state=active]:text-[hsl(var(--studio-accent))]"
                    >
                      Console
                    </TabsTrigger>
                    <TabsTrigger 
                      value="rack"
                      className="data-[state=active]:bg-[hsl(var(--studio-panel-raised))] data-[state=active]:text-[hsl(var(--studio-accent))]"
                    >
                      Effects
                    </TabsTrigger>
                    <TabsTrigger 
                      value="insights"
                      className="data-[state=active]:bg-[hsl(var(--studio-panel-raised))] data-[state=active]:text-[hsl(var(--studio-accent))]"
                    >
                      Insights
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="console" className="flex-1 overflow-auto mt-0 px-4">
                    <StudioConsole />
                  </TabsContent>

                   <TabsContent value="rack" className="flex-1 overflow-auto mt-0 px-4 py-4">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold">Plugin Suite</h3>
                      <Button onClick={() => setIsPluginManagerOpen(true)}>
                        <Plug2 className="w-4 h-4 mr-2" />
                        Plugin Manager
                      </Button>
                    </div>
                    <HardwareRack
                      effects={effects}
                      onAddEffect={() => setIsPluginManagerOpen(true)}
                      onToggleEffect={(id) => {
                        const effect = effects.find(e => e.id === id);
                        if (effect) {
                          updateEffect(id, { enabled: !effect.enabled });
                        }
                      }}
                      onConfigureEffect={(id) => toast({ title: `Configure ${id}` })}
                      onUpdateParameter={(id, param, value) => {
                        const effect = effects.find(e => e.id === id);
                        if (effect) {
                          updateEffect(id, {
                            parameters: { ...effect.parameters, [param]: value }
                          });
                        }
                      }}
                      onRemoveEffect={() => {}}
                    />
                  </TabsContent>

                   <TabsContent value="insights" className="flex-1 overflow-auto mt-0 px-4 py-4">
                    <div className="grid gap-4 h-full">
                      {latestAnalysis && (
                        <AudioAnalysisPanel 
                          analysis={latestAnalysis} 
                          trackName={latestAnalysis.trackName}
                        />
                      )}
                      <AIAssistantPanel />
                    </div>
                  </TabsContent>
                </Tabs>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          {/* Glass Resize Handle */}
          <ResizableHandle 
            withHandle
            className="w-1 hover:w-2 transition-all"
            style={{
              background: 'linear-gradient(90deg, hsl(var(--accent) / 0.2), hsl(var(--primary) / 0.2))',
              backdropFilter: 'blur(8px)',
            }}
          />

          {/* Right Sidebar - Multi-Function Panel (Resizable) */}
          <ResizablePanel 
            defaultSize={inspectorSize} 
            minSize={18} 
            maxSize={35}
            id="inspector"
          >
            <div className="h-full flex flex-col bg-[hsl(var(--studio-panel))]">
              {/* Panel Tab Switcher */}
              <div className="flex-shrink-0 border-b border-border/30">
                <div className="flex items-center gap-1 p-2">
                  <Button
                    variant={activeRightPanel === 'inspector' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveRightPanel('inspector')}
                    className="flex-1 gap-2 text-xs"
                  >
                    <Sparkles className="w-3 h-3" />
                    Inspector
                  </Button>
                  <Button
                    variant={activeRightPanel === 'collaborate' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveRightPanel('collaborate')}
                    className="flex-1 gap-2 text-xs"
                  >
                    <Users className="w-3 h-3" />
                    Collab
                  </Button>
                  <Button
                    variant={activeRightPanel === 'ai-effects' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveRightPanel('ai-effects')}
                    className="flex-1 gap-2 text-xs"
                  >
                    <Sliders className="w-3 h-3" />
                    AI FX
                  </Button>
                </div>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-hidden">
                {activeRightPanel === 'inspector' && (
                  <InspectorSidebar />
                )}

                {activeRightPanel === 'collaborate' && (
                  <DAWCollaboration
                    sessionId={sessionId}
                    userId={user?.id || 'guest'}
                    userName={user?.user_metadata?.full_name || 'Guest User'}
                    onTrackUpdate={(trackData) => {
                      sonnerToast.info('Track Updated', {
                        description: 'A collaborator made changes'
                      });
                    }}
                    onEffectChange={(trackId, effectData) => {
                      sonnerToast.info('Effect Modified', {
                        description: 'A collaborator adjusted an effect'
                      });
                    }}
                  />
                )}

                {activeRightPanel === 'ai-effects' && (
                  <div className="h-full overflow-auto p-4">
                    <div className="mb-4">
                      <Badge variant="outline" className="gap-2">
                        <Sparkles className="w-3 h-3" />
                        AI Composition Tools
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        Intelligent effects that adapt to your music
                      </p>
                    </div>
                    <DAWEffectsPanel
                      tracks={tracks.map(t => ({
                        id: t.id,
                        name: t.name,
                        type: t.type,
                        color: t.color || `hsl(${Math.random() * 360}, 70%, 60%)`,
                        regions: [],
                        solo: t.solo,
                        mute: t.mute,
                        volume: t.volume,
                        effects: {},
                        automation: []
                      }))}
                      onTracksChange={(updatedTracks) => {
                        sonnerToast.success('AI Effects Updated', {
                          description: 'Effects have been applied to your tracks'
                        });
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>

        {/* Plugin Manager Dialog */}
        <PluginManager 
          isOpen={isPluginManagerOpen} 
          onClose={() => setIsPluginManagerOpen(false)} 
        />

        {/* Track Effects Dialog */}
        {selectedTrack && (
          <TrackEffectsDialog
            open={!!selectedTrackForEffects}
            onOpenChange={(open) => !open && setSelectedTrackForEffects(null)}
            trackName={selectedTrack.name}
            effects={selectedTrackEffects}
            onAddEffect={() => setIsPluginManagerOpen(true)}
            onToggleEffect={(id) => {
              const trackFx = trackEffects.get(selectedTrackForEffects!) || [];
              const effect = trackFx.find(e => e.id === id);
              if (effect) {
                const updated = trackFx.map(e => 
                  e.id === id ? { ...e, enabled: !e.enabled } : e
                );
                setTrackEffects(new Map(trackEffects).set(selectedTrackForEffects!, updated));
              }
            }}
            onUpdateParameter={(id, param, value) => {
              const trackFx = trackEffects.get(selectedTrackForEffects!) || [];
              const updated = trackFx.map(e => 
                e.id === id ? { ...e, parameters: { ...e.parameters, [param]: value } } : e
              );
              setTrackEffects(new Map(trackEffects).set(selectedTrackForEffects!, updated));
            }}
            onRemoveEffect={(id) => {
              const trackFx = trackEffects.get(selectedTrackForEffects!) || [];
              const updated = trackFx.filter(e => e.id !== id);
              setTrackEffects(new Map(trackEffects).set(selectedTrackForEffects!, updated));
            }}
          />
        )}

        {/* Plugin Rack Dialog */}
        <Dialog open={showPluginRack} onOpenChange={setShowPluginRack}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto bg-gradient-radial from-[#0a0618] via-[#04020b] to-[#04020b]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                PrimeBot 4.0 Plugin Suite
              </DialogTitle>
            </DialogHeader>
            <PluginRack onPluginSelect={handlePluginSelect} />
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}
