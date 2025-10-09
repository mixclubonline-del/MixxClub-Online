import { ReactNode } from 'react';

interface DAWLayoutProps {
  children: ReactNode;
}

export const DAWLayout = ({ children }: DAWLayoutProps) => {
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden relative">
      {/* Futuristic background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(225,50%,5%)] via-[hsl(235,45%,8%)] to-[hsl(225,50%,5%)]" />
      <div className="absolute inset-0 opacity-30" 
        style={{ 
          backgroundImage: `radial-gradient(circle at 20% 50%, hsl(270 100% 70% / 0.15) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, hsl(185 100% 50% / 0.1) 0%, transparent 50%)` 
        }} 
      />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {children}
      </div>
    </div>
  );
};
