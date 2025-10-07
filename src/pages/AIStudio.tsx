import React, { useRef, useState } from "react";
import { Helmet } from 'react-helmet-async';
import GlobalHeader from "@/components/GlobalHeader";
import { usePrime } from "@/contexts/PrimeContext";
import { useToast } from "@/hooks/use-toast";

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
  const [mix, setMix] = useState({ vocal: 65, drums: 55, bass: 58, keys: 48, width: 40, glue: 30 });
  const [master, setMaster] = useState({ loudness: 65, clarity: 55, tone: 50 });
  const [uploadName, setUploadName] = useState<string | null>(null);

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

        {/* Panels */}
        <section className="max-w-6xl mx-auto px-6 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Mixer */}
          <Panel title="AI Mixer">
            <div className="grid grid-cols-2 gap-4">
              <Range label="Vocals" value={mix.vocal} onChange={(v) => setMix((m) => ({ ...m, vocal: v }))} />
              <Range label="Drums" value={mix.drums} onChange={(v) => setMix((m) => ({ ...m, drums: v }))} />
              <Range label="Bass" value={mix.bass} onChange={(v) => setMix((m) => ({ ...m, bass: v }))} />
              <Range label="Keys/Synths" value={mix.keys} onChange={(v) => setMix((m) => ({ ...m, keys: v }))} />
              <Range label="Stereo Width" value={mix.width} onChange={(v) => setMix((m) => ({ ...m, width: v }))} />
              <Range label="Glue (Bus Comp)" value={mix.glue} onChange={(v) => setMix((m) => ({ ...m, glue: v }))} />
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              Prime Suggestion: raise **Vocals** +4 dB @ 3 kHz, reduce **Bass** -2 dB @ 120 Hz.
            </div>
          </Panel>

          {/* Mastering Chain */}
          <Panel title="AI Mastering Chain">
            <div className="h-24 w-full rounded-lg bg-[hsl(var(--card)/0.8)] border border-[hsl(var(--border)/0.5)] relative overflow-hidden">
              {/* faux waveform */}
              <div className="absolute inset-0 flex items-end gap-[6px] px-3">
                {Array.from({ length: 80 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[3px] bg-[hsl(var(--primary))] animate-audio-wave"
                    style={{ height: `${20 + ((i * 13) % 60)}%`, animationDelay: `${(i % 12) * 0.05}s` }}
                  />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <Range label="Loudness" value={master.loudness} onChange={(v) => setMaster((m) => ({ ...m, loudness: v }))} />
              <Range label="Clarity" value={master.clarity} onChange={(v) => setMaster((m) => ({ ...m, clarity: v }))} />
              <Range label="Tone Match" value={master.tone} onChange={(v) => setMaster((m) => ({ ...m, tone: v }))} />
            </div>
            <div className="mt-3 flex gap-3">
              <button
                onClick={() => speak("Prime: A/B preview engaged.")}
                className="px-4 py-2 rounded-md bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.6)] hover:bg-[hsl(var(--card)/0.9)] transition text-sm"
              >
                A/B Preview
              </button>
              <button
                onClick={() => speak("Prime: Mastered preview rendered.")}
                className="px-4 py-2 rounded-md bg-gradient-primary hover:bg-gradient-primary-hover transition text-sm"
              >
                Render Preview
              </button>
            </div>
          </Panel>

          {/* Prime Insights */}
          <Panel title="Prime Insights">
            <div className="text-sm text-[hsl(var(--foreground)/0.9)] leading-relaxed">
              <p>• Vocal clarity target: +2.5 dB @ 3.2 kHz (Q 1.1)</p>
              <p>• Transient control: fast attack on drum bus (3–5 ms)</p>
              <p>• Stereo width: +8 % above 8 kHz, keep mono below 120 Hz</p>
              <p className="mt-2 text-muted-foreground">
                Tip: drag "Glue" to 35–45 % for tighter chorus sections.
              </p>
            </div>
          </Panel>

          {/* Custom Plugin Rack */}
          <Panel title="Custom Plugin Rack">
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { name: "Vocal Cleanser", tag: "De-ess / De-noise" },
                { name: "Analog Glue", tag: "Bus Comp" },
                { name: "Air EQ", tag: "+10 kHz sheen" },
                { name: "Tape Color", tag: "Sat / Warmth" },
                { name: "Perfect Reverb", tag: "Plate/Hall" },
                { name: "Wide Stereo", tag: "M/S width" },
              ].map((p) => (
                <button
                  key={p.name}
                  onClick={() => speak(`Prime: Loaded "${p.name}" to the chain.`)}
                  className="bloom-hover rounded-xl p-4 text-left bg-[hsl(var(--card)/0.7)] border border-[hsl(var(--border)/0.5)]"
                >
                  <div className="text-sm font-semibold">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground">{p.tag}</div>
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => speak("Prime: Saved preset to your library.")}
                className="px-4 py-2 rounded-md bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.6)] hover:bg-[hsl(var(--card)/0.9)] transition text-sm"
              >
                Save Preset
              </button>
              <button
                onClick={() => speak("Prime: Exporting settings for MixxPort.")}
                className="px-4 py-2 rounded-md bg-gradient-ai-intelligence text-foreground hover:shadow-[var(--shadow-glow-blue)] transition text-sm"
              >
                Export to MixxPort
              </button>
            </div>
          </Panel>
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
