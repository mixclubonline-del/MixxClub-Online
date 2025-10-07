import React, { useRef, useState, useEffect } from "react";
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
import { useAIStudioStore } from "@/stores/aiStudioStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Plug2, Upload } from "lucide-react";

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
    currentTime,
    duration,
    tempo,
    effects,
    setPlaying,
    setTempo,
    setCurrentTime,
    updateEffect,
    updateTrack,
  } = useAIStudioStore();

  const speak = (message: string) => {
    toast({ title: message });
  };

  const startAnalysis = (name: string) => {
    speak(`Prime: Analyzing "${name}"…`);
    setTimeout(() => speak("Prime: Detecting stems & spectral balance…"), 1800);
    setTimeout(() => speak("Prime: Suggesting mix improvements…"), 3800);
    setTimeout(() => speak("Prime: Ready — apply recommendations when you're set."), 6200);
  };

  const handleImportComplete = (file: any) => {
    toast({
      title: "Audio Imported",
      description: `${file.fileName} added to studio`,
    });
    startAnalysis(file.fileName);
    setIsImportDialogOpen(false);
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

        {/* Transport Bar */}
        <div className="flex-shrink-0">
          <TransportControls
            isPlaying={isPlaying}
            isRecording={false}
            currentTime={currentTime}
            duration={duration}
            tempo={tempo}
            onPlay={() => setPlaying(!isPlaying)}
            onStop={() => setPlaying(false)}
            onRecord={() => toast({ title: "Recording feature coming soon" })}
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

                  <TabsContent value="insights" className="flex-1 overflow-auto mt-0 px-4">
                    <Panel title="Prime Insights">
                      <div className="text-sm text-[hsl(var(--studio-text))] leading-relaxed">
                        <p>• Vocal clarity target: +2.5 dB @ 3.2 kHz (Q 1.1)</p>
                        <p>• Transient control: fast attack on drum bus (3–5 ms)</p>
                        <p>• Stereo width: +8 % above 8 kHz, keep mono below 120 Hz</p>
                        <p className="mt-2 text-[hsl(var(--studio-text-dim))]">
                          Tip: Upload audio files to get AI-powered analysis and suggestions.
                        </p>
                      </div>
                    </Panel>
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

        {/* Audio Import Dialog */}
        {isImportDialogOpen && (
          <AudioImportDialog
            sessionId="ai-studio-default"
            onImportComplete={handleImportComplete}
            onClose={() => setIsImportDialogOpen(false)}
          />
        )}
      </main>
    </>
  );
}
