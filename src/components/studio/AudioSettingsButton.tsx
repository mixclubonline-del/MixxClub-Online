import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AudioSettings, AudioSettingsState } from '@/components/daw/AudioSettings';
import { audioEngine } from '@/services/audioEngine';
import { useToast } from '@/hooks/use-toast';

/**
 * Button to open audio settings dialog
 */
export const AudioSettingsButton = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const [currentSettings, setCurrentSettings] = useState<AudioSettingsState>({
    sampleRate: 48000,
    bufferSize: 512,
    latencyCompensation: true,
    autoLatencyDetection: true,
    manualLatencyMs: 0,
  });

  const handleApply = (settings: AudioSettingsState) => {
    // Apply settings to audio engine
    audioEngine.setSampleRate(settings.sampleRate);
    audioEngine.setBufferSize(settings.bufferSize);
    audioEngine.setLatencyCompensation(settings.latencyCompensation);
    
    setCurrentSettings(settings);
    
    toast({
      title: 'Audio Settings Applied',
      description: `Sample Rate: ${settings.sampleRate / 1000}kHz, Buffer: ${settings.bufferSize} samples`,
    });
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Settings className="w-4 h-4" />
        Audio Settings
      </Button>
      
      <AudioSettings
        open={open}
        onOpenChange={setOpen}
        currentSettings={currentSettings}
        onApply={handleApply}
      />
    </>
  );
};
