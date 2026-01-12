import { ReactNode } from 'react';

interface ConsoleOverlayProps {
  children: ReactNode;
  isPlaying?: boolean;
}

export const ConsoleOverlay = ({ children, isPlaying = false }: ConsoleOverlayProps) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden px-4 pb-4">
      {/* Glass console surface */}
      <div 
        className={`
          flex-1 flex flex-col overflow-hidden
          bg-background/60 backdrop-blur-xl
          border border-border/40
          rounded-2xl
          shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]
          transition-all duration-500
          ${isPlaying ? 'border-primary/30 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_40px_hsl(var(--primary)/0.1)]' : ''}
        `}
        style={{
          perspective: '1000px',
        }}
      >
        {/* Console content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
        
        {/* Bottom reflection edge */}
        <div 
          className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
          style={{ marginTop: 'auto' }}
        />
      </div>
    </div>
  );
};
