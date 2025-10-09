import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { Mic, Keyboard } from "lucide-react";

/**
 * Professional Studio with Phase 1 Complete:
 * - Real waveform generation and rendering
 * - Sample-accurate playback with audioEngine
 * - Latency compensation
 * - Professional transport controls
 * - Track management with real audio data
 * - Unified studio for both Artist and Engineer CRMs
 */
interface ProStudioProps {
  userRole?: "artist" | "engineer";
}

const ProStudio = ({ userRole = "artist" }: ProStudioProps) => {
  const [shortcutsPanelOpen, setShortcutsPanelOpen] = useState(false);

  // Store state
  const tracks = useAIStudioStore((state) => state.tracks);
  const currentTime = useAIStudioStore((state) => state.currentTime);
  const duration = useAIStudioStore((state) => state.duration);
  const isPlaying = useAIStudioStore((state) => state.isPlaying);
  const bpm = useAIStudioStore((state) => state.bpm);
  const isRecording = useAIStudioStore((state) => state.isRecording);

  // Actions
  const setCurrentTime = useAIStudioStore((state) => state.setCurrentTime);
  const setRecording = useAIStudioStore((state) => state.setRecording);

  // Playback hook
  const { updateTrackParams } = useStudioPlayback();

  // Keyboard shortcuts
  useKeyboardShortcuts();

  // Update audio engine when track params change
  useEffect(() => {
    tracks.forEach((track) => {
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

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "hsl(220, 20%, 10%)" }}>
      {/* Enhanced Transport Bar with Spatial Depth */}
      <div
        className="border-b px-6 py-4"
        style={{
          background: "linear-gradient(135deg, hsl(220, 20%, 14%) 0%, hsl(220, 20%, 12%) 50%, hsl(220, 20%, 11%) 100%)",
          borderColor: "hsl(220, 20%, 22%)",
          boxShadow:
            "inset 0 1px 2px rgba(255,255,255,0.05), inset 0 -1px 3px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.4)",
        }}
      >
        <div className="flex items-center justify-between">
          {/* Left: Transport Controls */}
          <div className="flex items-center gap-6">
            <StudioTransport />

            <div className="w-px h-10 bg-[hsl(220,20%,28%)]" />

            {/* BPM Display */}
            <div
              className="px-4 py-2 rounded-lg font-mono font-bold"
              style={{
                background: "hsl(220, 20%, 16%)",
                color: "hsl(180, 100%, 50%)",
              }}
            >
              <div className="text-xs opacity-60 mb-0.5">BPM</div>
              <div className="text-2xl">{bpm}</div>
            </div>

            {/* Session Info */}
            <div className="flex items-center gap-3 text-xs" style={{ color: "hsl(220, 20%, 60%)" }}>
              <span>{tracks.length} tracks</span>
              <span>•</span>
              <span>{audioEngine.getLatency().toFixed(1)}ms</span>
            </div>
          </div>

          {/* Right: Tools and Settings */}
          <div className="flex items-center gap-2">
            <BatchProcessingMenu />
            <GrooveTemplates />
            <AutomationRecordingControls />
            <Button variant="ghost" size="sm" onClick={() => setShortcutsPanelOpen(true)} className="gap-2">
              <Keyboard className="w-4 h-4" />
            </Button>
            <AudioFileImporter />
            <AudioSettingsButton />

            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              onClick={() => setRecording(!isRecording)}
              className="gap-2"
            >
              <Mic className="w-4 h-4" />
              {isRecording ? "Recording" : "Record"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Arrangement Window */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ArrangementWindow
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          onTimeChange={setCurrentTime}
        />

        {/* Mini Mixer Bar */}
        <MiniMixerBar />
      </div>

      {/* Plugin Preview Control */}
      <PluginPreviewControl />

      {/* Shortcuts Panel */}
      <ShortcutsPanel isOpen={shortcutsPanelOpen} onClose={() => setShortcutsPanelOpen(false)} />
    </div>
  );
};

export default ProStudio;
