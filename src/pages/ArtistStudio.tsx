"use client";

import { useState, useEffect, useMemo, useCallback, Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import { useAIStudioStore } from "@/stores/aiStudioStore";
import { StudioTransport } from "@/components/studio/StudioTransport";
import { AudioFileImporter } from "@/components/studio/AudioFileImporter";
import { AudioSettingsButton } from "@/components/studio/AudioSettingsButton";
import { ShortcutsPanel } from "@/components/studio/ShortcutsPanel";
import { BatchProcessingMenu } from "@/components/studio/BatchProcessingMenu";
import { GrooveTemplates } from "@/components/studio/GrooveTemplates";
import { AutomationRecordingControls } from "@/components/studio/AutomationRecordingControls";
import { PluginPreviewControl } from "@/components/plugins/PluginPreviewControl";
import { ArrangementWindow } from "@/components/daw/ArrangementWindow";
import { MiniMixerBar } from "@/components/daw/MiniMixerBar";
import { audioEngine } from "@/services/audioEngine";
import { useStudioPlayback } from "@/hooks/useStudioPlayback";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

import {
  Mic,
  Keyboard,
  Save,
  Send,
  CheckCircle2,
  MessageSquarePlus,
  AlertTriangle,
  PanelRightClose,
  PanelRightOpen,
  Bot,
  Activity,
  Sparkles,
  SlidersHorizontal,
  Info,
  Clock,
  User,
  FileAudio2,
} from "lucide-react";

/** =========================
 *  Types & helpers
 *  ========================= */
type UserRole = "artist" | "engineer";

type ProjectRow = {
  id: string;
  title: string | null;
  artist_name: string | null;
  bpm: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  review_status?: "pending" | "approved" | "revisions_requested" | null;
  review_notes?: string | null;
  session_state?: any | null; // JSON of tracks/tempo/etc
};

type ReviewAction = "approve" | "request_revisions" | "send_notes";

async function getSupabaseClient() {
  // Safely obtain a Supabase client without hard-crashing if the import path differs.
  try {
    const mod = await import("@/integrations/supabase/client");
    // Common patterns: default export or named
    // @ts-ignore
    return mod.default ?? mod.supabase ?? mod.client ?? mod;
  } catch {
    return null;
  }
}

function hsl(h: number, s: number, l: number) {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

/** =========================
 *  PrimeBot Dock (Right Side)
 *  ========================= */
function usePrimeBotSuggestions() {
  // Lightweight “AI” suggestions based on store state
  const tracks = useAIStudioStore((s) => s.tracks);
  const tempo = useAIStudioStore((s) => s.tempo);
  const isPlaying = useAIStudioStore((s) => s.isPlaying);

  // Derive some surface insights (you’ll replace with your real Mixx Intelligence Core later)
  const suggestions = useMemo(() => {
    const total = tracks.length;
    const hasVocals = tracks.some((t: any) => /vox|vocal/i.test(t?.name ?? ""));
    const has808 = tracks.some((t: any) => /(808|sub)/i.test(t?.name ?? ""));
    const anyClipping = tracks.some((t: any) => (t?.meter?.peak ?? -12) > -1);

    const out: Array<{ title: string; detail: string }> = [];

    out.push({
      title: "Gain staging sanity check",
      detail: "Target -18 dBFS RMS per track pre-FX. Keep peaks under -6 dBFS at the master before limiting.",
    });

    if (hasVocals) {
      out.push({
        title: "Vocal forward mix",
        detail:
          "Try gentle 2–3 dB @ ~3 kHz presence boost, de-ess @ 6–8 kHz, and plate reverb 1.2–1.8s with pre-delay 20–40 ms.",
      });
    }

    if (has808) {
      out.push({
        title: "808 + kick relationship",
        detail: "Sidechain 808 to kick with 2–4 dB gain reduction, fast attack (2–10 ms), medium release (60–120 ms).",
      });
    }

    out.push({
      title: "Tempo-synced delay ideas",
      detail: `At ${tempo} BPM, try dotted-8th throws on ad-libs; low-pass at 6–8 kHz for modern glue.`,
    });

    if (anyClipping) {
      out.push({
        title: "Headroom warning",
        detail: "Detected peaks near 0 dBFS. Pull track faders or trim clip gain to restore 6–8 dB of headroom.",
      });
    }

    if (isPlaying) {
      out.push({
        title: "Live A/B tip",
        detail: "Loop your hook and A/B the 2-bus chain (off/on) every 8 bars to avoid “loudness bias.”",
      });
    }

    return out;
  }, [tracks, tempo, isPlaying]);

  // Very basic “insights” skeleton—numbers you can swap for your real meters/analytics
  const insights = useMemo(() => {
    const total = tracks.length;
    const busPeaks = tracks.map((t: any) => t?.meter?.peak ?? -12);
    const maxPeak = busPeaks.length ? Math.max(...busPeaks) : -12;
    const stereoHints = total >= 4 ? "Consider mid/side widening on pads/FX only." : "Stereo OK.";
    return {
      totalTracks: total,
      maxPeak,
      stereoHints,
    };
  }, [tracks]);

  return { suggestions, insights };
}

function PrimeBotDock({
  open,
  onToggle,
  project,
  userRole,
}: {
  open: boolean;
  onToggle: () => void;
  project: ProjectRow | null;
  userRole: UserRole;
}) {
  const [tab, setTab] = useState<"chat" | "suggestions" | "insights">("chat");
  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content:
        "PrimeBot online. Ask me anything about balance, EQ, delays, or export prep. I’m synced to your session context.",
    },
  ]);

  const tracks = useAIStudioStore((s) => s.tracks);
  const tempo = useAIStudioStore((s) => s.tempo);
  const currentTime = useAIStudioStore((s) => s.currentTime);

  const { suggestions, insights } = usePrimeBotSuggestions();

  const handleSend = useCallback(() => {
    if (!chatInput.trim()) return;
    // Local echo
    setChatLog((prev) => [...prev, { role: "user", content: chatInput }]);

    // Extremely simple heuristic “assistant” reply; in prod, call your LLM
    const reply =
      chatInput.toLowerCase().includes("vocal") || chatInput.toLowerCase().includes("vox")
        ? `Try subtractive EQ at 200–400 Hz to reduce muddiness, add 2–3 dB at 3–5 kHz for clarity, then gentle de-ess around 6–8 kHz. Sync a 1/4-note delay with a low-pass at 7 kHz. (BPM: ${tempo})`
        : `Context read: ${tracks.length} tracks, tempo ${tempo} BPM, at ${currentTime.toFixed(
            2,
          )}s. Suggest A/B testing your 2-bus chain every 8 bars and leave ~6 dB headroom pre-limiter.`;

    setChatLog((prev) => [...prev, { role: "assistant", content: reply }]);
    setChatInput("");
  }, [chatInput, currentTime, tempo, tracks.length]);

  return (
    <div
      style={{
        position: "relative",
        width: open ? 360 : 44,
        transition: "width 180ms ease",
        borderLeft: `1px solid ${hsl(220, 20, 22)}`,
        background: `linear-gradient(180deg, ${hsl(220, 20, 12)} 0%, ${hsl(220, 20, 10)} 100%)`,
        boxShadow: "inset 0 1px 2px rgba(255,255,255,0.04), inset 0 -1px 3px rgba(0,0,0,0.35)",
        overflow: "hidden",
      }}
    >
      {/* Toggle Handle */}
      <button
        onClick={onToggle}
        title={open ? "Close PrimeBot" : "Open PrimeBot"}
        className="absolute -left-4 top-4 rounded-md p-1"
        style={{
          background: hsl(220, 20, 18),
          border: `1px solid ${hsl(220, 20, 28)}`,
          boxShadow: "0 4px 10px rgba(0,0,0,0.35)",
        }}
      >
        {open ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
      </button>

      {!open ? (
        <div className="h-full flex flex-col items-center justify-start pt-4 gap-3">
          <Bot className="opacity-80" />
        </div>
      ) : (
        <div className="h-full flex flex-col">
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{
              borderBottom: `1px solid ${hsl(220, 20, 22)}`,
              background: hsl(220, 20, 14),
            }}
          >
            <div className="flex items-center gap-2">
              <Bot size={18} />
              <div className="font-semibold">PrimeBot</div>
              <Badge
                variant="outline"
                style={{
                  borderColor: hsl(180, 100, 42),
                  color: hsl(180, 100, 50),
                }}
              >
                Online
              </Badge>
            </div>
            <div className="text-xs opacity-70">{userRole === "engineer" ? "Engineer" : "Artist"}</div>
          </div>

          {/* Tabs */}
          <div className="px-3 py-2 flex gap-2" style={{ borderBottom: `1px solid ${hsl(220, 20, 22)}` }}>
            <Button
              size="sm"
              variant={tab === "chat" ? "default" : "outline"}
              onClick={() => setTab("chat")}
              className="gap-1"
            >
              <MessageSquarePlus size={14} />
              Chat
            </Button>
            <Button
              size="sm"
              variant={tab === "suggestions" ? "default" : "outline"}
              onClick={() => setTab("suggestions")}
              className="gap-1"
            >
              <Sparkles size={14} />
              Suggestions
            </Button>
            <Button
              size="sm"
              variant={tab === "insights" ? "default" : "outline"}
              onClick={() => setTab("insights")}
              className="gap-1"
            >
              <Activity size={14} />
              Insights
            </Button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-auto p-3">
            {tab === "chat" && (
              <div className="flex flex-col gap-2">
                {project && (
                  <div className="text-xs opacity-70 mb-1 flex items-center gap-2">
                    <Info size={14} />
                    <span>
                      Project: <strong>{project.title ?? "Untitled"}</strong> • Artist:{" "}
                      <strong>{project.artist_name ?? "Unknown"}</strong> • BPM: <strong>{project.bpm ?? "—"}</strong>
                    </span>
                  </div>
                )}
                <div
                  className="rounded-md p-2"
                  style={{
                    background: hsl(220, 20, 14),
                    border: `1px solid ${hsl(220, 20, 22)}`,
                  }}
                >
                  {chatLog.map((m, i) => (
                    <div
                      key={i}
                      className="text-sm mb-2"
                      style={{ color: m.role === "assistant" ? hsl(180, 100, 80) : "#E6E6E6" }}
                    >
                      <strong style={{ opacity: 0.7 }}>{m.role === "assistant" ? "PrimeBot" : "You"}:</strong>{" "}
                      {m.content}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask PrimeBot… (e.g., “How do I make the vocal pop?”)"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
                  <Button onClick={handleSend}>
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            )}

            {tab === "suggestions" && (
              <div className="flex flex-col gap-3">
                {suggestions.map((s, idx) => (
                  <Card
                    key={idx}
                    className="p-3"
                    style={{
                      background: hsl(220, 20, 14),
                      borderColor: hsl(220, 20, 24),
                    }}
                  >
                    <div className="font-medium flex items-center gap-2">
                      <SlidersHorizontal size={16} />
                      {s.title}
                    </div>
                    <div className="text-sm opacity-80 mt-1">{s.detail}</div>
                  </Card>
                ))}
                <div className="text-xs opacity-70 flex items-center gap-1">
                  <AlertTriangle size={12} /> Tips adapt as you tweak the mix.
                </div>
              </div>
            )}

            {tab === "insights" && (
              <div className="flex flex-col gap-3">
                <Card className="p-3" style={{ background: hsl(220, 20, 14), borderColor: hsl(220, 20, 24) }}>
                  <div className="font-medium flex items-center gap-2">
                    <FileAudio2 size={16} />
                    Session Overview
                  </div>
                  <div className="text-sm opacity-80 mt-1">
                    Tracks: <strong>{insights.totalTracks}</strong>
                    <br />
                    Max Peak (track): <strong>{insights.maxPeak.toFixed(1)} dBFS</strong>
                    <br />
                    Stereo Hint: <strong>{insights.stereoHints}</strong>
                  </div>
                </Card>
                <Card className="p-3" style={{ background: hsl(220, 20, 14), borderColor: hsl(220, 20, 24) }}>
                  <div className="font-medium flex items-center gap-2">
                    <Sparkles size={16} />
                    Quick Master Bus Checklist
                  </div>
                  <ul className="text-sm opacity-80 mt-1 list-disc pl-5">
                    <li>HPF mud on non-bass elements (~20–40 Hz).</li>
                    <li>Glue comp: 1–2 dB GR, slow attack, auto release.</li>
                    <li>Limiter last. Aim integrated loudness to target platform.</li>
                  </ul>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** =========================
 *  Engineer CRM Panels
 *  ========================= */
function EngineerReviewToolbar({ onAction, saving }: { onAction: (action: ReviewAction) => void; saving: boolean }) {
  return (
    <div className="flex gap-2">
      <Button disabled={saving} onClick={() => onAction("approve")} className="gap-2">
        <CheckCircle2 size={16} />
        Approve Mix
      </Button>
      <Button disabled={saving} onClick={() => onAction("send_notes")} variant="outline" className="gap-2">
        <MessageSquarePlus size={16} />
        Send Notes
      </Button>
      <Button disabled={saving} onClick={() => onAction("request_revisions")} variant="destructive" className="gap-2">
        <AlertTriangle size={16} />
        Request Revisions
      </Button>
    </div>
  );
}

function ClientInfoPanel({ project }: { project: ProjectRow | null }) {
  return (
    <Card
      className="p-3"
      style={{
        background: hsl(220, 20, 14),
        borderColor: hsl(220, 20, 24),
      }}
    >
      <div className="font-medium flex items-center gap-2 mb-2">
        <User size={16} />
        Client Info
      </div>
      <div className="text-sm opacity-85">
        <div>
          <span className="opacity-70">Artist:</span> <strong>{project?.artist_name ?? "Unknown"}</strong>
        </div>
        <div>
          <span className="opacity-70">Project:</span> <strong>{project?.title ?? "Untitled"}</strong>
        </div>
        <div className="flex items-center gap-2 opacity-80 mt-1">
          <Clock size={14} />
          <span>
            Updated: <strong>{project?.updated_at ? new Date(project.updated_at).toLocaleString() : "—"}</strong>
          </span>
        </div>
        <div className="mt-2">
          <span className="opacity-70">BPM:</span> <strong>{project?.bpm ?? "—"}</strong>
        </div>
        <div className="mt-2">
          <span className="opacity-70">Review:</span>{" "}
          <Badge variant="outline">{project?.review_status ?? "pending"}</Badge>
        </div>
      </div>
    </Card>
  );
}

/** =========================
 *  Main ProStudio
 *  ========================= */
interface ProStudioProps {
  userRole?: UserRole;
  /** Optional: pass a projectId to auto-load/save Supabase row */
  projectId?: string;
}

const ProStudio = ({ userRole = "artist", projectId }: ProStudioProps) => {
  const [shortcutsPanelOpen, setShortcutsPanelOpen] = useState(false);
  const [primeDockOpen, setPrimeDockOpen] = useState(true);

  // Store state
  const tracks = useAIStudioStore((state) => state.tracks);
  const currentTime = useAIStudioStore((state) => state.currentTime);
  const duration = useAIStudioStore((state) => state.duration);
  const isPlaying = useAIStudioStore((state) => state.isPlaying);
  const tempo = useAIStudioStore((state) => state.tempo);
  const isRecording = useAIStudioStore((state) => state.isRecording);

  // Actions
  const setCurrentTime = useAIStudioStore((state) => state.setCurrentTime);
  const setRecording = useAIStudioStore((state) => state.setRecording);

  // Playback hook
  const { updateTrackParams } = useStudioPlayback();

  // Keyboard shortcuts
  useKeyboardShortcuts();

  // Supabase project integration
  const [project, setProject] = useState<ProjectRow | null>(null);
  const [loadingProject, setLoadingProject] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");

  // Derive session state for save
  const sessionState = useMemo(
    () => ({
      tempo,
      currentTime,
      tracks: tracks?.map((t: any) => ({
        id: t?.id,
        name: t?.name,
        gain: t?.gain,
        pan: t?.pan,
        plugins: t?.plugins ?? [],
        meter: t?.meter ?? null,
      })),
      updatedAt: Date.now(),
    }),
    [tempo, currentTime, tracks],
  );

  // Update audio engine when track params change
  useEffect(() => {
    tracks.forEach((track: any) => {
      updateTrackParams(track);
    });
  }, [tracks, updateTrackParams]);

  // Initialize audio engine
  useEffect(() => {
    audioEngine.resume();
  }, []);

  // Handle '?' key to show shortcuts panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShortcutsPanelOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Load project from Supabase
  useEffect(() => {
    let mounted = true;
    if (!projectId) return;
    (async () => {
      setLoadingProject(true);
      const supabase = await getSupabaseClient();
      if (!supabase) {
        console.warn("Supabase not available; skipping project load.");
        setLoadingProject(false);
        return;
      }
      const { data, error } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
      if (error) console.error(error);
      if (mounted) setProject(data ?? null);
      setLoadingProject(false);
    })();
    return () => {
      mounted = false;
    };
  }, [projectId]);

  // Save session to Supabase
  const handleSaveSession = useCallback(async () => {
    setSaving(true);
    const supabase = await getSupabaseClient();
    if (!supabase || !projectId) {
      alert("Supabase or projectId not available.");
      setSaving(false);
      return;
    }
    const { data, error } = await supabase
      .from("projects")
      .update({
        session_state: sessionState,
        bpm: tempo ?? project?.bpm ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)
      .select()
      .maybeSingle();

    if (error) {
      console.error(error);
      alert("Failed to save session.");
    } else {
      setProject((p) => (p ? { ...p, ...data } : data));
    }
    setSaving(false);
  }, [projectId, sessionState, tempo, project]);

  // Send to MixxPort (stub: mark updated & pretend an upload pipeline)
  const handleSendToMixxPort = useCallback(async () => {
    const supabase = await getSupabaseClient();
    if (!supabase || !projectId) {
      alert("Supabase or projectId not available.");
      return;
    }
    // You can replace this with storage upload or RPC to your pipeline.
    const { error } = await supabase
      .from("projects")
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    if (error) {
      console.error(error);
      alert("Failed to send to MixxPort.");
    } else {
      alert("Session queued for MixxPort transfer ✅");
    }
  }, [projectId]);

  // Engineer review actions
  const handleReviewAction = useCallback(
    async (action: ReviewAction) => {
      setSaving(true);
      const supabase = await getSupabaseClient();
      if (!supabase || !projectId) {
        alert("Supabase or projectId not available.");
        setSaving(false);
        return;
      }

      let nextStatus: ProjectRow["review_status"] = "pending";
      if (action === "approve") nextStatus = "approved";
      if (action === "request_revisions") nextStatus = "revisions_requested";

      const nextNotes =
        action === "send_notes" ? notesDraft.trim() || "(No additional notes)" : (project?.review_notes ?? null);

      const { data, error } = await supabase
        .from("projects")
        .update({
          review_status: nextStatus,
          review_notes: nextNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId)
        .select()
        .maybeSingle();

      if (error) {
        console.error(error);
        alert("Failed to update review status.");
      } else {
        setProject((p) => (p ? { ...p, ...data } : data));
        if (action === "send_notes") setNotesDraft("");
      }
      setSaving(false);
    },
    [projectId, project?.review_notes, notesDraft],
  );

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden" style={{ background: hsl(220, 20, 10) }}>
      {/* Top Transport / Tools */}
      <div
        className="border-b px-6 py-4"
        style={{
          background: `linear-gradient(135deg, ${hsl(220, 20, 14)} 0%, ${hsl(
            220,
            20,
            12,
          )} 50%, ${hsl(220, 20, 11)} 100%)`,
          borderColor: hsl(220, 20, 22),
          boxShadow:
            "inset 0 1px 2px rgba(255,255,255,0.05), inset 0 -1px 3px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.4)",
        }}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Left: Transport */}
          <div className="flex items-center gap-6">
            <StudioTransport />

            <div className="w-px h-10 bg-[hsl(220,20%,28%)]" />

            {/* BPM Display */}
            <div
              className="px-4 py-2 rounded-lg font-mono font-bold"
              style={{
                background: hsl(220, 20, 16),
                color: hsl(180, 100, 50),
              }}
            >
              <div className="text-xs opacity-60 mb-0.5">BPM</div>
              <div className="text-2xl">{tempo}</div>
            </div>

            {/* Session Info */}
            <div className="flex items-center gap-3 text-xs" style={{ color: hsl(220, 20, 60) }}>
              <span>{tracks.length} tracks</span>
              <span>•</span>
              <span>{audioEngine.getLatency().toFixed(1)}ms</span>
              {projectId && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {loadingProject ? "Loading…" : "Ready"}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right: Tools & Actions */}
          <div className="flex items-center gap-2">
            <BatchProcessingMenu />
            <GrooveTemplates />
            <AutomationRecordingControls />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShortcutsPanelOpen(true)}
              className="gap-2"
              title="Keyboard Shortcuts"
            >
              <Keyboard className="w-4 h-4" />
            </Button>
            <AudioFileImporter />
            <AudioSettingsButton />

            {/* Save / MixxPort */}
            {projectId && (
              <Fragment>
                <Button
                  size="sm"
                  onClick={handleSaveSession}
                  disabled={saving}
                  className="gap-2"
                  title="Save Session to Supabase"
                >
                  <Save size={16} />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSendToMixxPort}
                  className="gap-2"
                  title="Send to MixxPort"
                >
                  <Send size={16} />
                  MixxPort
                </Button>
              </Fragment>
            )}

            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              onClick={() => setRecording(!isRecording)}
              className="gap-2"
              title="Record"
            >
              <Mic className="w-4 h-4" />
              {isRecording ? "Recording" : "Record"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Area: Arrangement + (Engineer CRM header) */}
      {userRole === "engineer" && (
        <div className="px-6 py-3 flex items-start gap-6" style={{ borderBottom: `1px solid ${hsl(220, 20, 22)}` }}>
          <div className="flex-1">
            <EngineerReviewToolbar onAction={handleReviewAction} saving={saving} />
            {/* Optional notes draft line when sending notes */}
            <div className="mt-2 flex items-center gap-2">
              <Textarea
                placeholder="Write client notes or revision requests…"
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
              />
              <Button
                variant="outline"
                onClick={() => handleReviewAction("send_notes")}
                disabled={saving || !notesDraft.trim()}
                className="gap-2"
                title="Send Notes"
              >
                <MessageSquarePlus size={16} />
                Send Notes
              </Button>
            </div>
          </div>
          <div style={{ width: 320, flex: "0 0 auto" }}>
            <ClientInfoPanel project={project} />
          </div>
        </div>
      )}

      {/* Studio + PrimeBot Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center: Arrangement + Mixer */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ArrangementWindow
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            onTimeChange={setCurrentTime}
          />
          <MiniMixerBar />
        </div>

        {/* Right: PrimeBot Dock */}
        <PrimeBotDock
          open={primeDockOpen}
          onToggle={() => setPrimeDockOpen((s) => !s)}
          project={project}
          userRole={userRole}
        />
      </div>

      {/* Plugin Preview Control */}
      <PluginPreviewControl />

      {/* Shortcuts Panel */}
      <ShortcutsPanel isOpen={shortcutsPanelOpen} onClose={() => setShortcutsPanelOpen(false)} />
    </div>
  );
};

export default ProStudio;
