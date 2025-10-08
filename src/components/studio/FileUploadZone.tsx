import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload } from 'lucide-react';
import { useAIStudioStore, AudioRegion } from '@/stores/aiStudioStore';
import { generateWaveformPeaks } from '@/lib/waveform-renderer';
import { toast } from 'sonner';

interface FileUploadZoneProps {
  open: boolean;
  onClose: () => void;
}

export const FileUploadZone = ({ open, onClose }: FileUploadZoneProps) => {
  const { addTrack, addRegion, setDuration } = useAIStudioStore();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      if (!file.type.startsWith('audio/')) {
        toast.error(`${file.name} is not an audio file`);
        continue;
      }

      try {
        // Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        
        // Decode audio
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Generate waveform peaks
        const waveformData = generateWaveformPeaks(audioBuffer, 2000);
        
        // Create track
        const trackId = `track-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const newTrack = {
          id: trackId,
          name: file.name.replace(/\.[^/.]+$/, ''),
          type: 'other' as const,
          volume: 0.8,
          pan: 0,
          mute: false,
          solo: false,
          audioBuffer,
          waveformData,
          peakLevel: 0,
          rmsLevel: 0,
          regions: [],
          effects: [],
          sends: {},
          color: 'hsl(200, 70%, 50%)',
        };
        
        addTrack(newTrack);

        // Create a region for the full audio
        const region: AudioRegion = {
          id: `region-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          trackId,
          startTime: 0,
          duration: audioBuffer.duration,
          sourceStartOffset: 0,
          fadeIn: { duration: 0.01, curve: 'linear' },
          fadeOut: { duration: 0.01, curve: 'linear' },
          gain: 1,
          color: newTrack.color,
        };
        
        addRegion(trackId, region);
        
        // Update session duration if needed
        const currentDuration = useAIStudioStore.getState().duration;
        if (audioBuffer.duration > currentDuration) {
          setDuration(audioBuffer.duration);
        }
        
        toast.success(`Loaded ${file.name}`);
        
      } catch (error) {
        console.error('Error loading audio file:', error);
        toast.error(`Failed to load ${file.name}`);
      }
    }
    
    onClose();
  }, [addTrack, addRegion, setDuration, onClose]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac'],
    },
    multiple: true,
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Audio Files</DialogTitle>
        </DialogHeader>
        
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            transition-colors
            ${isDragActive 
              ? 'border-primary bg-primary/10' 
              : 'border-border hover:border-primary/50'
            }
          `}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-sm text-primary font-medium">Drop audio files here...</p>
          ) : (
            <>
              <p className="text-sm font-medium mb-1">
                Drag & drop audio files here
              </p>
              <p className="text-xs text-muted-foreground">
                or click to browse (MP3, WAV, OGG, M4A, FLAC)
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
