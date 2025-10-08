import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square } from 'lucide-react';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { toast } from 'sonner';

interface RecordButtonProps {
  trackId: string;
}

export const RecordButton = ({ trackId }: RecordButtonProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const { updateTrack, addRegion } = useAIStudioStore();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const arrayBuffer = await blob.arrayBuffer();
        
        // Decode audio
        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Update track with recorded audio
        updateTrack(trackId, { audioBuffer });
        
        // Create region for recorded audio
        const region = {
          id: `region-${Date.now()}`,
          trackId,
          startTime: 0,
          duration: audioBuffer.duration,
          sourceStartOffset: 0,
          fadeIn: { duration: 0.01, curve: 'linear' as const },
          fadeOut: { duration: 0.01, curve: 'linear' as const },
          gain: 1,
        };
        
        addRegion(trackId, region);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        toast.success('Recording saved!');
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.success('Recording started');
      
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  return (
    <Button
      size="sm"
      variant={isRecording ? 'destructive' : 'outline'}
      onClick={isRecording ? stopRecording : startRecording}
      className="gap-2"
    >
      {isRecording ? (
        <>
          <Square className="w-3 h-3" />
          Stop
        </>
      ) : (
        <>
          <Mic className="w-3 h-3" />
          Rec
        </>
      )}
    </Button>
  );
};
