import { ReactNode } from 'react';
import rsdChamberBg from '@/assets/rsd-chamber.jpg';
import { ChamberAmbience } from './ChamberAmbience';

interface RSDChamberPortalProps {
  children: ReactNode;
  isPlaying?: boolean;
  isRecording?: boolean;
}

export const RSDChamberPortal = ({ 
  children, 
  isPlaying = false,
  isRecording = false 
}: RSDChamberPortalProps) => {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Studio Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${rsdChamberBg})` }}
      />
      
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/70 to-background/50" />
      
      {/* Ambient glow based on state */}
      <div 
        className={`absolute inset-0 transition-opacity duration-700 ${
          isPlaying ? 'opacity-30' : 'opacity-0'
        }`}
        style={{
          background: 'radial-gradient(ellipse at 50% 80%, hsl(var(--primary) / 0.2) 0%, transparent 60%)'
        }}
      />
      
      {/* Recording indicator glow */}
      <div 
        className={`absolute inset-0 transition-opacity duration-300 ${
          isRecording ? 'opacity-40 animate-pulse' : 'opacity-0'
        }`}
        style={{
          background: 'radial-gradient(ellipse at 50% 80%, hsl(0 70% 50% / 0.3) 0%, transparent 50%)'
        }}
      />
      
      {/* Chamber ambience particles */}
      <ChamberAmbience isPlaying={isPlaying} />
      
      {/* Content layer */}
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};
