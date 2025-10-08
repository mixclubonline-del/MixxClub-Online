import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { StudioStateProvider } from '@/context/StudioStateContext';
import StudioInteractiveOverlay from '@/components/overlays/StudioInteractiveOverlay_liveSync';
import { StudioMenuBar } from '@/components/studio/StudioMenuBar';
import { StudioNavigation } from '@/components/studio/StudioNavigation';
import { StudioTimeline } from '@/components/studio/StudioTimeline';
import { StudioAIMixer } from '@/components/studio/StudioAIMixer';
import { StudioMixxPort } from '@/components/studio/StudioMixxPort';
import { StudioPrimeBot } from '@/components/studio/StudioPrimeBot';
import { StudioMixerConsole } from '@/components/studio/StudioMixerConsole';
import { TrackListPanel } from '@/components/studio/TrackListPanel';
import { DropZoneOverlay } from '@/components/studio/DropZoneOverlay';
import AudioImportDialog from '@/components/AudioImportDialog';
import { useAIStudioStore, Track, AudioRegion } from '@/stores/aiStudioStore';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { loadAudioFromSupabase, getAudioUrl, buildWaveformPeaks } from '@/utils/audioLoader';
import { Play, Pause, Square, Beaker } from 'lucide-react';

const MixxStudio = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Zustand Store
  const { 
    tracks, 
    isPlaying, 
    isRecording,
    currentTime,
    duration,
    tempo,
    masterVolume,
    addTrack,
    updateTrack,
    addRegion,
    setPlaying,
    setRecording,
    setCurrentTime,
    setDuration,
    updateMasterLevels
  } = useAIStudioStore();
  
  // Local State
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showDropZone, setShowDropZone] = useState(false);
  
  // Audio Engine Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferCacheRef = useRef<Map<string, AudioBuffer>>(new Map());
  const playbackSourcesRef = useRef<Map<string, AudioBufferSourceNode>>(new Map());
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Initialize Audio Context
  useEffect(() => {
    const initAudio = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('MixxStudio: Audio Context initialized');
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
        toast({
          title: "Audio Error",
          description: "Failed to initialize audio system",
          variant: "destructive"
        });
      }
    };
    
    initAudio();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      playbackSourcesRef.current.forEach(source => {
        try { source.stop(); } catch (e) {}
      });
      playbackSourcesRef.current.clear();
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [toast]);

  // Add Track
  const handleAddTrack = (type: Track['type'] = 'other') => {
    const trackColors = {
      vocal: 'hsl(280, 70%, 75%)',
      drums: 'hsl(0, 70%, 65%)',
      bass: 'hsl(220, 100%, 70%)',
      guitar: 'hsl(30, 70%, 65%)',
      keys: 'hsl(40, 80%, 70%)',
      other: 'hsl(262, 83%, 58%)'
    };

    const newTrack: Track = {
      id: `track-${Date.now()}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${tracks.length + 1}`,
      type,
      color: trackColors[type],
      volume: 0.8,
      pan: 0,
      mute: false,
      solo: false,
      peakLevel: 0,
      rmsLevel: 0,
      regions: [],
      effects: [],
      sends: {}
    };

    addTrack(newTrack);
    
    toast({
      title: "Track Added",
      description: `${newTrack.name} created successfully`,
    });
  };

  // Start Recording
  const handleStartRecording = async (trackId: string) => {
    if (!audioContextRef.current) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        
        // Decode audio to get duration and waveform
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
        const waveformPeaks = buildWaveformPeaks(audioBuffer, 200);
        
        const newRegion: AudioRegion = {
          id: `region-${Date.now()}`,
          trackId,
          startTime: currentTime,
          duration: audioBuffer.duration,
          sourceStartOffset: 0,
          fadeIn: { duration: 0.1, curve: 'linear' },
          fadeOut: { duration: 0.1, curve: 'linear' },
          gain: 1
        };

        // Update track with audio buffer and waveform
        updateTrack(trackId, { 
          audioBuffer,
          waveformData: waveformPeaks 
        });
        
        addRegion(trackId, newRegion);
        setRecording(false);

        toast({
          title: "Recording Complete",
          description: "Audio recorded successfully!",
        });
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecording(true);
      updateTrack(trackId, { /* isRecording: true - not in Track interface */ });

    } catch (error) {
      console.error('Recording failed:', error);
      toast({
        title: "Recording Error",
        description: "Failed to access microphone",
        variant: "destructive"
      });
    }
  };

  // Stop Recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  // Play Audio Region
  const playAudioRegion = async (region: AudioRegion, trackVolume: number = 0.8, trackMute: boolean = false) => {
    if (!audioContextRef.current || trackMute) return;

    try {
      // Find the track containing this region
      const track = tracks.find(t => t.regions.some(r => r.id === region.id));
      if (!track || !track.audioBuffer) return;

      const audioBuffer = track.audioBuffer;
      const source = audioContextRef.current.createBufferSource();
      const gainNode = audioContextRef.current.createGain();
      
      source.buffer = audioBuffer;
      gainNode.gain.value = region.gain * trackVolume * masterVolume;
      
      source.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      // Start playback from current time position
      const startOffset = Math.max(0, currentTime - region.startTime);
      const duration = Math.max(0, region.duration - startOffset);
      
      if (startOffset < audioBuffer.duration && duration > 0) {
        source.start(0, startOffset, duration);
        playbackSourcesRef.current.set(region.id, source);
        
        source.onended = () => {
          playbackSourcesRef.current.delete(region.id);
        };
      }
    } catch (error) {
      console.error('Error playing audio region:', error);
    }
  };

  // Update Playback Time
  const updatePlaybackTime = () => {
    if (isPlaying && audioContextRef.current) {
      const elapsed = audioContextRef.current.currentTime - startTimeRef.current + pauseTimeRef.current;
      setCurrentTime(elapsed);
      
      // Simulate meter levels
      const basePeak = 0.6 + Math.sin(elapsed * 200) * 0.2 + Math.random() * 0.1;
      updateMasterLevels(Math.min(0.95, basePeak));
      
      // Check if reached end
      if (elapsed >= duration) {
        handleStop();
        return;
      }
      
      animationFrameRef.current = requestAnimationFrame(updatePlaybackTime);
    }
  };

  // Toggle Play/Pause
  const handleTogglePlay = async () => {
    if (!audioContextRef.current) {
      toast({
        title: "Audio Error",
        description: "Audio system not initialized",
        variant: "destructive"
      });
      return;
    }

    if (isPlaying) {
      // Pause
      setPlaying(false);
      pauseTimeRef.current = currentTime;
      
      playbackSourcesRef.current.forEach(source => {
        try { source.stop(); } catch (e) {}
      });
      playbackSourcesRef.current.clear();
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    } else {
      // Play
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      setPlaying(true);
      startTimeRef.current = audioContextRef.current.currentTime;
      
      // Play all audio regions that should be playing
      tracks.forEach(track => {
        const shouldPlay = track.solo || (!tracks.some(t => t.solo) && !track.mute);
        
        if (shouldPlay && !track.mute) {
          track.regions.forEach(region => {
            if (currentTime >= region.startTime && currentTime < region.startTime + region.duration) {
              playAudioRegion(region, track.volume, track.mute);
            }
          });
        }
      });
      
      updatePlaybackTime();
    }
  };

  // Stop
  const handleStop = () => {
    setPlaying(false);
    setCurrentTime(0);
    pauseTimeRef.current = 0;
    
    playbackSourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    playbackSourcesRef.current.clear();
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  // Handle Imported Audio
  const handleImportedAudio = async (importedFile: any) => {
    if (!audioContextRef.current) return;

    try {
      // Load audio file
      let audioBuffer: AudioBuffer;
      
      if (importedFile.blob) {
        const arrayBuffer = await importedFile.blob.arrayBuffer();
        audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      } else if (importedFile.url) {
        const response = await fetch(importedFile.url);
        const arrayBuffer = await response.arrayBuffer();
        audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      } else {
        throw new Error('No audio source available');
      }

      // Generate waveform peaks
      const waveformPeaks = buildWaveformPeaks(audioBuffer, 200);

      // Create new track
      const newTrack: Track = {
        id: `track-${Date.now()}`,
        name: importedFile.fileName,
        type: 'other',
        color: 'hsl(42, 100%, 70%)',
        volume: 0.8,
        pan: 0,
        mute: false,
        solo: false,
        audioBuffer,
        waveformData: waveformPeaks,
        peakLevel: 0,
        rmsLevel: 0,
        regions: [],
        effects: [],
        sends: {}
      };

      addTrack(newTrack);

      // Add region
      const newRegion: AudioRegion = {
        id: `region-${Date.now()}`,
        trackId: newTrack.id,
        startTime: 0,
        duration: audioBuffer.duration,
        sourceStartOffset: 0,
        fadeIn: { duration: 0.1, curve: 'linear' },
        fadeOut: { duration: 0.1, curve: 'linear' },
        gain: 1
      };

      addRegion(newTrack.id, newRegion);

      // Update session duration
      if (audioBuffer.duration > duration) {
        setDuration(audioBuffer.duration);
      }

      setShowImportDialog(false);

      toast({
        title: "Track Added",
        description: `${importedFile.fileName} imported successfully`,
      });
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Error",
        description: "Failed to import audio file",
        variant: "destructive"
      });
    }
  };

  // Handle Drop Zone Files
  const handleFilesDropped = async (files: FileList) => {
    for (const file of Array.from(files)) {
      // Simulate import
      handleImportedAudio({
        fileName: file.name,
        blob: file
      });
    }
    setShowDropZone(false);
  };

  return (
    <StudioStateProvider>
      <div className="relative w-full h-screen bg-[#0a0e1a] overflow-hidden flex">
        {/* Track List Panel (Left Sidebar) */}
        <TrackListPanel 
          onAddTrack={handleAddTrack}
          onImportAudio={() => setShowImportDialog(true)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Navigation */}
          <StudioNavigation />

          {/* Enhanced Transport Controls */}
          <div className="bg-gradient-to-r from-card/40 to-card/20 border-b border-white/10 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant={isPlaying ? "default" : "outline"}
                size="sm"
                onClick={handleTogglePlay}
                className="gap-2"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleStop}
                className="gap-2"
              >
                <Square className="w-4 h-4" />
                Stop
              </Button>
              
              {/* Tempo Display */}
              <div className="text-sm font-mono bg-primary/10 text-primary px-3 py-1 rounded border border-primary/20">
                {tempo} BPM
              </div>

              {/* Time Display */}
              <div className="text-sm font-mono bg-muted/30 px-3 py-1 rounded">
                {Math.floor(currentTime / 60).toString().padStart(2, '0')}:
                {Math.floor(currentTime % 60).toString().padStart(2, '0')}.
                {Math.floor((currentTime % 1) * 100).toString().padStart(2, '0')}
              </div>
            </div>

            {/* Open Lab Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/hybrid-daw')}
              className="gap-2 text-muted-foreground hover:text-primary"
            >
              <Beaker className="w-4 h-4" />
              Open Lab (HybridDAW)
            </Button>
          </div>

          {/* Timeline with Real Waveforms */}
          <div className="flex-1 overflow-hidden">
            <StudioTimeline />
          </div>

          {/* Main Studio Components */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
            <StudioAIMixer />
            <StudioMixxPort isPlaying={isPlaying} />
            <StudioPrimeBot />
          </div>

          {/* Mixer Console */}
          <StudioMixerConsole />

          {/* Interactive Overlay */}
          <StudioInteractiveOverlay />
        </div>

        {/* Import Dialog */}
        {showImportDialog && (
          <AudioImportDialog
            sessionId={user?.id || 'standalone'}
            onImportComplete={handleImportedAudio}
            onClose={() => setShowImportDialog(false)}
          />
        )}

        {/* Drop Zone Overlay */}
        {showDropZone && (
          <DropZoneOverlay 
            onFilesDropped={handleFilesDropped}
            onClose={() => setShowDropZone(false)}
          />
        )}
      </div>
    </StudioStateProvider>
  );
};

export default MixxStudio;
