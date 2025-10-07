import React, { useRef, useState } from "react";
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
import { useAIStudioStore } from "@/stores/aiStudioStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

        {/* Transport Bar - Fixed at top */}
        <div className="flex-shrink-0 mt-16">
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

        {/* Main Studio Layout - Split View with Sidebars */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Browser */}
          <BrowserSidebar />

          {/* Center - Timeline & Mixer */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Timeline/Arrangement View - Top 60% */}
            <div className="flex-[3] border-b border-[hsl(var(--studio-border))] overflow-hidden">
              <WaveformTimeline
                tracks={tracks}
                currentTime={currentTime}
                duration={duration}
                isPlaying={isPlaying}
                onTimeChange={setCurrentTime}
                onTrackUpdate={updateTrack}
              />
            </div>

            {/* Mixer/Console View - Bottom 40% */}
            <div className="flex-[2] overflow-hidden">
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

              <TabsContent value="rack" className="flex-1 overflow-auto mt-0 px-4">
                <HardwareRack
                  effects={effects}
                  onAddEffect={() => toast({ title: "Effect browser coming soon" })}
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
          </div>
        </div>

          {/* Right Sidebar - Inspector */}
          <InspectorSidebar />
        </div>
      </main>
    </>
  );
}
