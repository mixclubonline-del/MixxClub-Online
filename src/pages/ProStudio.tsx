import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { WaveformTimeline } from '@/components/studio/WaveformTimeline';
import { StudioTransport } from '@/components/studio/StudioTransport';
import { RecordingControls } from '@/components/studio/RecordingControls';
import { AudioFileImporter } from '@/components/studio/AudioFileImporter';
import { AudioSettingsButton } from '@/components/studio/AudioSettingsButton';
import { ChannelStrip } from '@/components/studio/ChannelStrip';
import { MasterChannelStrip } from '@/components/studio/MasterChannelStrip';
import { BusGroupPanel } from '@/components/studio/BusGroupPanel';
import { VCAGroupPanel } from '@/components/studio/VCAGroupPanel';
import { AutomationLane, AutomationPoint } from '@/components/studio/AutomationLane';
import { ShortcutsPanel } from '@/components/studio/ShortcutsPanel';
import { BatchProcessingMenu } from '@/components/studio/BatchProcessingMenu';
import { audioEngine } from '@/services/audioEngine';
import { useStudioPlayback } from '@/hooks/useStudioPlayback';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Music2, Settings, Layers, Mic, Sliders, Keyboard } from 'lucide-react';
import Navigation from '@/components/Navigation';

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
  userRole?: 'artist' | 'engineer';
}

const ProStudio = ({ userRole = 'artist' }: ProStudioProps) => {
  const [activeView, setActiveView] = useState<'timeline' | 'mixer' | 'automation'>('timeline');
  const [shortcutsPanelOpen, setShortcutsPanelOpen] = useState(false);
  
  // Store state
  const tracks = useAIStudioStore((state) => state.tracks);
  const currentTime = useAIStudioStore((state) => state.currentTime);
  const duration = useAIStudioStore((state) => state.duration);
  const isPlaying = useAIStudioStore((state) => state.isPlaying);
  const tempo = useAIStudioStore((state) => state.tempo);
  const selectedTrackId = useAIStudioStore((state) => state.selectedTrackId);
  const isRecording = useAIStudioStore((state) => state.isRecording);
  const masterVolume = useAIStudioStore((state) => state.masterVolume);
  const masterPeakLevel = useAIStudioStore((state) => state.masterPeakLevel);
  
  // Actions
  const setCurrentTime = useAIStudioStore((state) => state.setCurrentTime);
  const updateTrack = useAIStudioStore((state) => state.updateTrack);
  const setSelectedTrack = useAIStudioStore((state) => state.setSelectedTrack);
  const removeTrack = useAIStudioStore((state) => state.removeTrack);
  const addTrackEffect = useAIStudioStore((state) => state.addTrackEffect);
  const updateTrackSend = useAIStudioStore((state) => state.updateTrackSend);
  const setMasterVolume = useAIStudioStore((state) => state.setMasterVolume);
  const addEffect = useAIStudioStore((state) => state.addEffect);
  const effects = useAIStudioStore((state) => state.effects);
  
  // Playback hook
  const { updateTrackParams } = useStudioPlayback();
  const [recordArmedTracks, setRecordArmedTracks] = useState<Set<string>>(new Set());
  
  // Keyboard shortcuts
  useKeyboardShortcuts();
  
  // Recording state
  const [metronomeEnabled, setMetronomeEnabled] = useState(false);
  const [countInBars, setCountInBars] = useState(1);
  const [inputMonitoring, setInputMonitoring] = useState(false);
  const [punchInEnabled, setPunchInEnabled] = useState(false);
  const setRecording = useAIStudioStore((state) => state.setRecording);
  
  // Automation state
  const [automationLanes, setAutomationLanes] = useState<Array<{
    id: string;
    trackId: string;
    parameter: string;
    points: AutomationPoint[];
  }>>([]);
  
  const handleAddAutomationLane = (trackId: string) => {
    setAutomationLanes([
      ...automationLanes,
      {
        id: `auto-${Date.now()}`,
        trackId,
        parameter: 'volume',
        points: [],
      },
    ]);
  };
  
  // Update audio engine when track params change
  useEffect(() => {
    tracks.forEach(track => {
      updateTrackParams(track);
    });
  }, [tracks, updateTrackParams]);
  
  // Initialize audio engine
  useEffect(() => {
    audioEngine.resume();
  }, []);

  const handleTrackUpdate = (trackId: string, updates: Partial<typeof tracks[0]>) => {
    updateTrack(trackId, updates);
  };

  const handleToggleRecordArm = (trackId: string) => {
    setRecordArmedTracks(prev => {
      const next = new Set(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      return next;
    });
  };

  // Handle '?' key to show shortcuts panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShortcutsPanelOpen(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(220,20%,14%)] flex flex-col">
      <Navigation />
      
      {/* Studio Header - Simplified */}
      <div 
        className="border-b px-6 py-3"
        style={{
          background: 'var(--panel-gradient)',
          borderColor: 'hsl(220, 14%, 28%)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Music2 className="w-5 h-5 text-[hsl(var(--studio-accent))]" />
            <h1 className="text-lg font-semibold text-[hsl(var(--studio-text))]">
              Professional Studio
            </h1>
            {userRole && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {userRole}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <BatchProcessingMenu />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShortcutsPanelOpen(true)}
              className="gap-2"
            >
              <Keyboard className="w-4 h-4" />
            </Button>
            <AudioFileImporter />
            <AudioSettingsButton />
          </div>
        </div>
      </div>

      {/* Transport Bar - Compact */}
      <div 
        className="border-b px-6 py-2"
        style={{
          background: 'hsl(220, 18%, 16%)',
          borderColor: 'hsl(220, 14%, 28%)',
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <StudioTransport />
            
            <div className="w-px h-8 bg-[hsl(220,14%,28%)]" />
            
            <div className="flex items-center gap-3 text-[10px] font-mono text-[hsl(var(--studio-text-dim))]">
              <span>{tempo} BPM</span>
              <span>•</span>
              <span>{audioEngine.getLatency().toFixed(1)}ms</span>
              <span>•</span>
              <span>{tracks.length} tracks</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={isRecording ? 'destructive' : 'ghost'}
              size="sm"
              onClick={() => setRecording(!isRecording)}
              className="h-7"
            >
              <Mic className="w-3 h-3 mr-1" />
              {isRecording ? 'Recording' : 'Record'}
            </Button>
            
            {(isRecording || metronomeEnabled || recordArmedTracks.size > 0) && (
              <RecordingControls
                isRecording={isRecording}
                onRecordToggle={() => setRecording(!isRecording)}
                tempo={tempo}
                metronomeEnabled={metronomeEnabled}
                onMetronomeToggle={() => setMetronomeEnabled(!metronomeEnabled)}
                countInBars={countInBars}
                onCountInChange={setCountInBars}
                inputMonitoring={inputMonitoring}
                onInputMonitoringToggle={() => setInputMonitoring(!inputMonitoring)}
                punchInEnabled={punchInEnabled}
                onPunchInToggle={() => setPunchInEnabled(!punchInEnabled)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="flex-1 flex flex-col">
          {/* View Tabs */}
          <div 
            className="border-b px-6"
            style={{
              background: 'hsl(220, 18%, 16%)',
              borderColor: 'hsl(220, 14%, 28%)',
            }}
          >
            <TabsList className="bg-transparent">
              <TabsTrigger value="timeline" className="gap-2">
                <Layers className="w-4 h-4" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="mixer" className="gap-2">
                <Settings className="w-4 h-4" />
                Mixer
              </TabsTrigger>
              <TabsTrigger value="automation" className="gap-2">
                <Sliders className="w-4 h-4" />
                Automation
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Timeline View */}
          <TabsContent value="timeline" className="flex-1 m-0 overflow-hidden">
            {tracks.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <Card className="p-8 text-center max-w-md">
                  <Music2 className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--studio-accent))]" />
                  <h3 className="text-lg font-semibold mb-2">No Tracks Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Import audio files to get started with real waveform analysis and sample-accurate playback
                  </p>
                  <AudioFileImporter />
                </Card>
              </div>
            ) : (
              <WaveformTimeline
                tracks={tracks}
                currentTime={currentTime}
                duration={duration}
                isPlaying={isPlaying}
                onTimeChange={setCurrentTime}
                onTrackUpdate={handleTrackUpdate}
                recordArmedTracks={recordArmedTracks}
                onToggleRecordArm={handleToggleRecordArm}
                onOpenTrackEffects={(trackId) => setSelectedTrack(trackId)}
                onDeleteTrack={removeTrack}
              />
            )}
          </TabsContent>

          {/* Mixer View */}
          <TabsContent value="mixer" className="flex-1 m-0 overflow-hidden">
            <div className="h-full overflow-x-auto">
              <div className="flex gap-2 p-4 h-full">
                {tracks.length === 0 ? (
                  <div className="flex items-center justify-center flex-1">
                    <Card className="p-8 text-center max-w-md">
                      <Settings className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--studio-accent))]" />
                      <h3 className="text-lg font-semibold mb-2">No Tracks in Mixer</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Import audio files to see channel strips with VU meters and effects
                      </p>
                      <AudioFileImporter />
                    </Card>
                  </div>
                ) : (
                  <>
                    {tracks.map((track) => (
                      <ChannelStrip
                        key={track.id}
                        track={track}
                        isSelected={selectedTrackId === track.id}
                        onSelect={() => setSelectedTrack(track.id)}
                        onVolumeChange={(volume) => handleTrackUpdate(track.id, { volume })}
                        onPanChange={(pan) => handleTrackUpdate(track.id, { pan })}
                        onMuteToggle={() => handleTrackUpdate(track.id, { mute: !track.mute })}
                        onSoloToggle={() => handleTrackUpdate(track.id, { solo: !track.solo })}
                        onAddTrackEffect={addTrackEffect}
                        onUpdateTrackSend={updateTrackSend}
                      />
                    ))}
                    
                    {/* Master Channel Strip */}
                    <div className="ml-4 border-l-2 pl-4" style={{ borderColor: 'hsl(var(--studio-accent) / 0.3)' }}>
                      <MasterChannelStrip
                        volume={masterVolume}
                        peakLevel={masterPeakLevel}
                        onVolumeChange={setMasterVolume}
                        effects={effects}
                        onAddEffect={addEffect}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
          {/* Automation View */}
          <TabsContent value="automation" className="flex-1 m-0 overflow-hidden flex">
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Automation lanes */}
              <div className="flex-1 overflow-y-auto">
                {automationLanes.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <Card className="p-8 text-center max-w-md">
                      <Sliders className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--studio-accent))]" />
                      <h3 className="text-lg font-semibold mb-2">No Automation Yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Add automation lanes to draw parameter changes over time
                      </p>
                    </Card>
                  </div>
                ) : (
                  <div>
                    {automationLanes.map((lane) => {
                      const track = tracks.find(t => t.id === lane.trackId);
                      if (!track) return null;
                      
                      return (
                        <AutomationLane
                          key={lane.id}
                          trackId={lane.trackId}
                          trackName={track.name}
                          parameter={lane.parameter}
                          points={lane.points}
                          duration={duration}
                          pixelsPerSecond={100}
                          onAddPoint={(point) => {
                            setAutomationLanes(lanes =>
                              lanes.map(l =>
                                l.id === lane.id
                                  ? { ...l, points: [...l.points, point] }
                                  : l
                              )
                            );
                          }}
                          onUpdatePoint={(index, point) => {
                            setAutomationLanes(lanes =>
                              lanes.map(l =>
                                l.id === lane.id
                                  ? { ...l, points: l.points.map((p, i) => i === index ? point : p) }
                                  : l
                              )
                            );
                          }}
                          onDeletePoint={(index) => {
                            setAutomationLanes(lanes =>
                              lanes.map(l =>
                                l.id === lane.id
                                  ? { ...l, points: l.points.filter((_, i) => i !== index) }
                                  : l
                              )
                            );
                          }}
                          onChangeParameter={(parameter) => {
                            setAutomationLanes(lanes =>
                              lanes.map(l =>
                                l.id === lane.id ? { ...l, parameter } : l
                              )
                            );
                          }}
                          onDelete={() => {
                            setAutomationLanes(lanes => lanes.filter(l => l.id !== lane.id));
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Automation sidebar */}
            <div
              className="w-80 border-l overflow-y-auto p-4 space-y-4"
              style={{
                background: 'hsl(220, 18%, 16%)',
                borderColor: 'hsl(220, 14%, 28%)',
              }}
            >
              <div>
                <h3 className="text-sm font-semibold text-[hsl(var(--studio-text))] mb-3">
                  Add Automation
                </h3>
                <div className="space-y-2">
                  {tracks.map((track) => (
                    <Button
                      key={track.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddAutomationLane(track.id)}
                      className="w-full justify-start"
                    >
                      <div
                        className="w-2 h-2 rounded-full mr-2"
                        style={{ background: track.color || 'hsl(210, 100%, 55%)' }}
                      />
                      {track.name}
                    </Button>
                  ))}
                </div>
              </div>

              <BusGroupPanel tracks={tracks} />
              <VCAGroupPanel tracks={tracks} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Status Bar - Minimal */}
      <div 
        className="border-t px-6 py-1.5"
        style={{
          background: 'hsl(220, 18%, 16%)',
          borderColor: 'hsl(220, 14%, 28%)',
        }}
      >
        <div className="flex items-center gap-3 text-[10px] text-[hsl(var(--studio-text-dim))]">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            Audio
          </div>
          {isRecording && (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
              REC
            </div>
          )}
          {isPlaying && (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              Playing
            </div>
          )}
        </div>
      </div>

      {/* Shortcuts Panel */}
      <ShortcutsPanel
        isOpen={shortcutsPanelOpen}
        onClose={() => setShortcutsPanelOpen(false)}
      />
    </div>
  );
};

export default ProStudio;
