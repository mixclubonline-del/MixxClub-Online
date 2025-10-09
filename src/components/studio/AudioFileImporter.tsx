import { useState, useRef } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAIStudioStore, Track, AudioRegion } from '@/stores/aiStudioStore';
import { WaveformGenerator } from '@/services/waveformGenerator';

/**
 * Import audio files and generate real waveforms
 */
export const AudioFileImporter = () => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const addTrack = useAIStudioStore((state) => state.addTrack);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Decode audio and generate waveform
      const audioContext = new AudioContext();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Generate real waveform data from audio buffer
      const waveformData = WaveformGenerator.generateFromBuffer(audioBuffer, {
        width: 800, // High detail for studio
        normalize: true,
      });

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
        audioBuffer,
        waveformData: waveformData.peaks, // Real waveform peaks
        peakLevel: 0,
        rmsLevel: 0,
        regions: [newRegion],
        effects: [],
        sends: {},
      };

      addTrack(newTrack);

      toast({
        title: 'Track Imported',
        description: `${file.name} loaded with real waveform data`,
      });

      audioContext.close();
    } catch (error) {
      console.error('Error importing audio:', error);
      toast({
        title: 'Import Failed',
        description: 'Failed to import audio file',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
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
        accept="audio/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        id="audio-file-input"
        disabled={isUploading}
      />
      <Button
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
      >
        {isUploading ? (
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
