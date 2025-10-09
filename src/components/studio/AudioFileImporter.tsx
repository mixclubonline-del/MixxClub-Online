import { useState, useRef } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAIStudioStore, Track, AudioRegion } from '@/stores/aiStudioStore';
import { WaveformGenerator } from '@/services/waveformGenerator';

/**
 * Import audio files and generate real waveforms (in-memory for Phase 1)
 * No database dependency - pure client-side audio processing
 */
export const AudioFileImporter = () => {
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const addTrack = useAIStudioStore((state) => state.addTrack);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    try {
      console.log('[AudioImporter] Starting import:', file.name);
      
      // Decode audio and generate waveform
      const audioContext = new AudioContext();
      const arrayBuffer = await file.arrayBuffer();
      
      console.log('[AudioImporter] Decoding audio...');
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      console.log('[AudioImporter] Audio decoded:', {
        duration: audioBuffer.duration,
        sampleRate: audioBuffer.sampleRate,
        channels: audioBuffer.numberOfChannels,
      });

      // Generate real waveform data from audio buffer
      console.log('[AudioImporter] Generating waveform...');
      const waveformData = WaveformGenerator.generateFromBuffer(audioBuffer, {
        width: 800, // High detail for studio
        normalize: true,
      });
      console.log('[AudioImporter] Waveform generated:', waveformData.peaks.length, 'peaks');

      // Create track with real audio data and waveform
      const trackId = `track-${Date.now()}`;
      const newRegion: AudioRegion = {
        id: `region-${Date.now()}`,
        trackId,
        startTime: 0,
        duration: audioBuffer.duration,
        sourceStartOffset: 0,
        fadeIn: { duration: 0, curve: 'linear' },
        fadeOut: { duration: 0, curve: 'linear' },
        gain: 1.0,
      };

      const newTrack: Track = {
        id: trackId,
        name: file.name.replace(/\.[^/.]+$/, ''),
        type: 'other',
        volume: 0.8,
        pan: 0,
        mute: false,
        solo: false,
        audioBuffer, // Store AudioBuffer in memory
        waveformData: waveformData.peaks, // Real waveform peaks (Float32Array)
        peakLevel: 0,
        rmsLevel: 0,
        regions: [newRegion],
        effects: [],
        sends: {},
      };

      console.log('[AudioImporter] Adding track to store:', trackId);
      addTrack(newTrack);

      toast({
        title: 'Track Imported Successfully!',
        description: `${file.name} ready with real waveform data`,
      });

      audioContext.close();
    } catch (error) {
      console.error('[AudioImporter] Error importing audio:', error);
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Failed to import audio file',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.wav,.mp3,.ogg,.flac,.m4a"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        id="audio-file-input"
        disabled={isImporting}
      />
      <Button
        disabled={isImporting}
        onClick={() => fileInputRef.current?.click()}
      >
        {isImporting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Importing...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Import Audio
          </>
        )}
      </Button>
    </div>
  );
};
