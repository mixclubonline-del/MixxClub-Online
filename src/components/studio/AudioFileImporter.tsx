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
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('[AudioImporter] 🎵 Starting import:', file.name);
      console.log('[AudioImporter] File size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      
      // Decode audio and generate waveform
      const audioContext = new AudioContext();
      const arrayBuffer = await file.arrayBuffer();
      
      console.log('[AudioImporter] 🔊 Decoding audio...');
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      console.log('[AudioImporter] ✅ Audio decoded:', {
        duration: audioBuffer.duration.toFixed(2) + 's',
        sampleRate: audioBuffer.sampleRate + 'Hz',
        channels: audioBuffer.numberOfChannels,
        length: audioBuffer.length + ' samples',
      });

      // Generate multi-resolution waveform data using client-side generation
      console.log('[AudioImporter] 📊 Generating multi-resolution waveform...');
      const waveformData = WaveformGenerator.generateMultiResolution(audioBuffer);
      console.log('[AudioImporter] ✅ Waveform generated:', {
        peaks: waveformData.peaks.length,
        multiResolution: !!waveformData.multiResolution,
        low: waveformData.multiResolution?.low.length,
        medium: waveformData.multiResolution?.medium.length,
        high: waveformData.multiResolution?.high.length,
      });

      // Create track with real audio data and waveform
      const trackId = `track-${Date.now()}`;
      const newRegion: AudioRegion = {
        id: `region-${Date.now()}`,
        trackId,
        startTime: 0,
        duration: audioBuffer.duration,
        audioBuffer, // Attach buffer to region for scheduler
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
        waveformData: waveformData, // Multi-resolution waveform data
        peakLevel: 0,
        rmsLevel: 0,
        regions: [newRegion],
        effects: [],
        sends: {},
      };

      // Validation checks
      if (!newTrack.audioBuffer) {
        throw new Error('Track missing audioBuffer!');
      }
      if (!newTrack.waveformData) {
        throw new Error('Track missing waveformData!');
      }
      if (!newTrack.regions || newTrack.regions.length === 0) {
        throw new Error('Track missing regions!');
      }

      console.log('[AudioImporter] ✅ Track validated:', {
        id: trackId,
        name: newTrack.name,
        hasBuffer: !!newTrack.audioBuffer,
        waveformData: typeof newTrack.waveformData,
        regionCount: newTrack.regions.length,
      });

      console.log('[AudioImporter] 📤 Adding track to store...');
      addTrack(newTrack);
      console.log('[AudioImporter] ✅ Track added to store successfully');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      toast({
        title: '✅ Track Imported!',
        description: `${file.name} • ${audioBuffer.duration.toFixed(1)}s • Multi-resolution waveform`,
      });

      audioContext.close();
    } catch (error) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('[AudioImporter] ❌ Error importing audio:', error);
      console.error('[AudioImporter] Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      toast({
        title: '❌ Import Failed',
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
