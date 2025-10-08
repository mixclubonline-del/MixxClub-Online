import { useEffect } from 'react';
import { StudioStateProvider } from '@/context/StudioStateContext';
import StudioInteractiveOverlay from '@/components/overlays/StudioInteractiveOverlay_liveSync';
import { StudioMenuBar } from '@/components/studio/StudioMenuBar';
import { StudioNavigation } from '@/components/studio/StudioNavigation';
import { StudioTimeline } from '@/components/studio/StudioTimeline';
import { StudioAIMixer } from '@/components/studio/StudioAIMixer';
import { StudioMixxPort } from '@/components/studio/StudioMixxPort';
import { StudioPrimeBot } from '@/components/studio/StudioPrimeBot';
import { StudioMixerConsole } from '@/components/studio/StudioMixerConsole';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { useTransportEngine } from '@/hooks/useTransportEngine';

const MixxStudio = () => {
  const { isPlaying, setPlaying } = useAIStudioStore();
  const { isInitialized } = useAudioEngine();
  
  // Initialize transport engine for playback sync
  useTransportEngine();

  const handleTogglePlay = () => {
    setPlaying(!isPlaying);
  };

  useEffect(() => {
    console.log('MixxStudio initialized - Audio Engine Ready:', isInitialized);
  }, [isInitialized]);

  return (
    <StudioStateProvider>
      <div className="relative w-full h-screen bg-[#0a0e1a] overflow-hidden flex flex-col">
        {/* Navigation */}
        <StudioNavigation />

        {/* Transport Controls */}
        <StudioMenuBar isPlaying={isPlaying} onTogglePlay={handleTogglePlay} />

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
    </StudioStateProvider>
  );
};

export default MixxStudio;
