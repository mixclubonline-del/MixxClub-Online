import React, { useRef, useState } from "react";
import { Helmet } from 'react-helmet-async';
import GlobalHeader from "@/components/GlobalHeader";
import { usePrime } from "@/contexts/PrimeContext";
import { useToast } from "@/hooks/use-toast";
import { StudioConsole } from "@/components/studio/StudioConsole";
import { HardwareRack } from "@/components/studio/HardwareRack";
import { TransportControls } from "@/components/studio/TransportControls";
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
    isPlaying,
    currentTime,
    duration,
    tempo,
    effects,
    setPlaying,
    setTempo,
    updateEffect,
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

      <main className="min-h-screen bg-[hsl(var(--background))] text-foreground">
        <GlobalHeader />

        {/* Hero / Header */}
        <section className="pt-28 pb-8 text-center max-w-6xl mx-auto px-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[hsl(var(--card)/0.6)] border border-[hsl(var(--border)/0.5)]">
            <span className="text-xs font-mono tracking-tight opacity-80">
              PRIME • {systemMode.toUpperCase()}
            </span>
            <span
              className={`h-2 w-2 rounded-full ${
                systemMode === "active" ? "bg-[hsl(var(--primary))] drop-shadow-glow" : "bg-[hsl(var(--muted))]"
              }`}
            />
          </div>

          <h1 className="mt-6 text-4xl font-bold metallic-accent">AI Studio</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The intelligent creative suite. Upload, analyze, and enhance — powered by Prime.
          </p>

          {/* Background waveform line */}
          <div className="relative mt-8 h-8">
            <div className="absolute inset-0 mx-auto w-full max-w-2xl h-[2px] bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--accent-blue))] to-[hsl(var(--primary))] animate-[gradient-shift_4s_linear_infinite]" />
          </div>

          {/* Upload */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => fileRef.current?.click()}
              className="px-5 py-2 rounded-full bg-gradient-primary hover:bg-gradient-primary-hover transition text-foreground"
            >
              Upload Track / Stems
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setUploadName(f.name);
                startAnalysis(f.name);
              }}
            />
            <button
              onClick={() => speak("Prime: Previewing current chain…")}
              className="px-5 py-2 rounded-full bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.6)] hover:bg-[hsl(var(--card)/0.9)] transition"
            >
              Preview
            </button>
            <button
              onClick={() => speak("Prime: Enhancing mix — clarity + transient control.")}
              className="px-5 py-2 rounded-full bg-gradient-ai-intelligence text-foreground hover:shadow-[var(--shadow-glow-blue)] transition"
            >
              Enhance with Prime
            </button>
          </div>

          {uploadName && (
            <p className="mt-3 text-xs text-muted-foreground">
              Loaded: <span className="opacity-90">{uploadName}</span>
            </p>
          )}
        </section>

        {/* Studio Interface */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <Tabs defaultValue="console" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-6">
              <TabsTrigger value="console">Console</TabsTrigger>
              <TabsTrigger value="rack">Effects Rack</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
            </TabsList>

            {/* Transport Controls */}
            <div className="mb-6">
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

            <TabsContent value="console" className="mt-0">
              <StudioConsole />
            </TabsContent>

            <TabsContent value="rack" className="mt-0">
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

            <TabsContent value="insights" className="mt-0">
              <Panel title="Prime Insights">
                <div className="text-sm text-[hsl(var(--foreground)/0.9)] leading-relaxed">
                  <p>• Vocal clarity target: +2.5 dB @ 3.2 kHz (Q 1.1)</p>
                  <p>• Transient control: fast attack on drum bus (3–5 ms)</p>
                  <p>• Stereo width: +8 % above 8 kHz, keep mono below 120 Hz</p>
                  <p className="mt-2 text-muted-foreground">
                    Tip: Upload audio files to get AI-powered analysis and suggestions.
                  </p>
                </div>
              </Panel>
            </TabsContent>
          </Tabs>
        </section>

        {/* Footer console bar (subtle) */}
        <footer className="sticky bottom-0 w-full border-t border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card)/0.6)] backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-6 h-10 flex items-center justify-between text-xs font-mono">
            <span className="opacity-80">AI Studio • Live</span>
            <span className="opacity-70">PRIME: {systemMode.toUpperCase()}</span>
          </div>
        </footer>
      </main>
    </>
  );
}
