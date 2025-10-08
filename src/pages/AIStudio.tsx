import React, { useRef, useState, useEffect, useCallback } from "react";
import { Helmet } from 'react-helmet-async';
import GlobalHeader from "@/components/GlobalHeader";
import { usePrime } from "@/contexts/PrimeContext";
import { useToast } from "@/hooks/use-toast";
import { StudioConsole } from "@/components/studio/StudioConsole";
import { HardwareRack } from "@/components/studio/HardwareRack";
import { TransportControls } from "@/components/studio/TransportControls";
import { WaveformTimeline } from "@/components/studio/WaveformTimeline";
import { BrowserSidebar } from "@/components/studio/BrowserSidebar";
import { InspectorSidebar } from "@/components/studio/InspectorSidebar";
import { AudioEngine } from "@/components/studio/AudioEngine";
import { PluginManager } from "@/components/plugins/PluginManager";
import AudioImportDialog from "@/components/AudioImportDialog";
import { useAIStudioStore, EffectUnit } from "@/stores/aiStudioStore";
import { TrackEffectsDialog } from "@/components/studio/TrackEffectsDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Plug2, Upload } from "lucide-react";
import { AudioAnalysisPanel } from "@/components/studio/AudioAnalysisPanel";
import { AIAssistantPanel } from "@/components/studio/AIAssistantPanel";
import { useAudioPermissions } from "@/hooks/useAudioPermissions";
import { audioEngine } from "@/services/audioEngine";
import { toast as sonnerToast } from 'sonner';

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

  // Initialize audio engine for all tracks
  useEffect(() => {
    tracks.forEach((track) => {
      if (track.audioBuffer) {
        audioEngine.initTrack(track.id, track.audioBuffer);
        audioEngine.setTrackVolume(track.id, track.volume);
        audioEngine.setTrackPan(track.id, track.pan);
      }
    });
  }, [tracks]);

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
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
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
    
    return { buffer: audioBuffer, waveform };
  };

  const handleImportComplete = async (file: any) => {
    setIsLoadingAudio(true);
    
    try {
      // Determine track type
      const trackType = detectTrackType(file.fileName, file.analysis?.instruments || []);
      
      // Sequential track naming: Track 1, Track 2, Track 3...
      const trackNumber = tracks.length + 1;
      const trackName = `Track ${trackNumber}`;
      
      // Load audio buffer and generate waveform
      const { buffer, waveform } = await loadAudioBuffer(file.url);
      
      // Create new track
      const newTrack = {
        id: `track-${Date.now()}-${Math.random().toString(36).slice(2)}`,
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
      };
      
      // Add track to store
      addTrack(newTrack);
      
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
      
      startAnalysis(trackName);
      
    } catch (error) {
      console.error('Error loading audio:', error);
      sonnerToast.error('Import Error', {
        description: 'Failed to load audio buffer. File may be corrupted.',
      });
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
        <AudioEngine />
        <GlobalHeader />

        {/* Quick Actions Bar - Prominent Upload */}
        <div className="flex-shrink-0 mt-16 px-6 py-3 border-b border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-muted-foreground">Quick Start</h2>
              <Button 
                onClick={() => setIsImportDialogOpen(true)}
                className="gap-2"
                size="lg"
              >
                <Upload className="w-5 h-5" />
                Import Audio to Begin
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{tracks.length} tracks loaded</span>
            </div>
          </div>
        </div>

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

          {/* Right Sidebar - Inspector (Resizable) */}
          <ResizablePanel 
            defaultSize={inspectorSize} 
            minSize={18} 
            maxSize={35}
            id="inspector"
          >
            <InspectorSidebar />
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
      </main>
    </>
  );
}
