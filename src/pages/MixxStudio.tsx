import { useState } from 'react';
import { StudioStateProvider } from '@/context/StudioStateContext';
import StudioInteractiveOverlay from '@/components/overlays/StudioInteractiveOverlay_liveSync';
import { StudioMenuBar } from '@/components/studio/StudioMenuBar';
import { StudioNavigation } from '@/components/studio/StudioNavigation';
import { StudioWaveformStrip } from '@/components/studio/StudioWaveformStrip';
import { StudioAIMixer } from '@/components/studio/StudioAIMixer';
import { StudioMixxPort } from '@/components/studio/StudioMixxPort';
import { StudioPrimeBot } from '@/components/studio/StudioPrimeBot';
import { StudioMixerConsole } from '@/components/studio/StudioMixerConsole';

const MixxStudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <StudioStateProvider>
      <div className="relative w-full h-screen bg-[#0a0e1a] overflow-hidden">
        {/* Navigation */}
        <StudioNavigation />

        {/* Transport Controls */}
        <StudioMenuBar isPlaying={isPlaying} onTogglePlay={handleTogglePlay} />

        {/* Waveform Strip */}
        <StudioWaveformStrip isPlaying={isPlaying} />

        {/* Main Studio Components */}
        <StudioAIMixer />
        <StudioMixxPort isPlaying={isPlaying} />
        <StudioPrimeBot />

        {/* Mixer Console */}
        <StudioMixerConsole />

        {/* Interactive Overlay (from your file) */}
        <StudioInteractiveOverlay />
      </div>
    </StudioStateProvider>
  );
};

export default MixxStudio;
