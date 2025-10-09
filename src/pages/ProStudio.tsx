import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { WaveformTimeline } from '@/components/studio/WaveformTimeline';
import { StudioTransport } from '@/components/studio/StudioTransport';
import { AudioFileImporter } from '@/components/studio/AudioFileImporter';
import { AudioSettingsButton } from '@/components/studio/AudioSettingsButton';
import { ChannelStrip } from '@/components/studio/ChannelStrip';
import { MasterChannelStrip } from '@/components/studio/MasterChannelStrip';
import { audioEngine } from '@/services/audioEngine';
import { useStudioPlayback } from '@/hooks/useStudioPlayback';
import { Music2, Settings, Layers } from 'lucide-react';
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
  const [activeView, setActiveView] = useState<'timeline' | 'mixer'>('timeline');
  
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

  return (
    <div className="min-h-screen bg-[hsl(220,20%,14%)] flex flex-col">
      <Navigation />
      
      {/* Studio Header */}
      <div 
        className="border-b px-6 py-4"
        style={{
          background: 'var(--panel-gradient)',
          borderColor: 'hsl(220, 14%, 28%)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Music2 className="w-6 h-6 text-[hsl(var(--studio-accent))]" />
            <div>
              <h1 className="text-xl font-bold text-[hsl(var(--studio-text))]">
                Professional Studio {userRole === 'engineer' ? '(Engineer)' : '(Artist)'}
              </h1>
              <p className="text-xs text-[hsl(var(--studio-text-dim))]">
                Real Waveforms • Sample-Accurate Playback • Professional Tools
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <AudioFileImporter />
            <AudioSettingsButton />
          </div>
        </div>
      </div>

      {/* Transport Controls */}
      <div 
        className="border-b px-6 py-3"
        style={{
          background: 'hsl(220, 18%, 16%)',
          borderColor: 'hsl(220, 14%, 28%)',
        }}
      >
        <div className="flex items-center justify-between">
          <StudioTransport />
          
          <div className="flex items-center gap-4">
            <div className="text-xs font-mono text-[hsl(var(--studio-text-dim))]">
              {tempo} BPM
            </div>
            <div className="text-xs font-mono text-[hsl(var(--studio-text-dim))]">
              Latency: {audioEngine.getLatency().toFixed(1)}ms
            </div>
            <div className="text-xs font-mono text-[hsl(var(--studio-text-dim))]">
              {tracks.length} tracks
            </div>
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
        </Tabs>
      </div>

      {/* Status Bar */}
      <div 
        className="border-t px-6 py-2"
        style={{
          background: 'hsl(220, 18%, 16%)',
          borderColor: 'hsl(220, 14%, 28%)',
        }}
      >
        <div className="flex items-center justify-between text-xs text-[hsl(var(--studio-text-dim))]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Audio Engine Ready
            </div>
            {isRecording && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                Recording
              </div>
            )}
          </div>
          
          <div>
            Phase 1 Complete: Real Waveforms • Sample-Accurate Timing • Latency Compensation
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProStudio;
