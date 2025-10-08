import React from 'react';
import { motion } from 'framer-motion';
import { X, Minimize2, Maximize2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PluginWindowProps {
  title: string;
  category: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
  height?: number;
}

export const PluginWindow: React.FC<PluginWindowProps> = ({
  title,
  category,
  isOpen,
  onClose,
  children,
  width = 600,
  height = 400,
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        className="relative rounded-2xl overflow-hidden"
        style={{ 
          width, 
          height,
          background: 'linear-gradient(135deg, hsl(235 45% 10% / 0.95), hsl(235 45% 12% / 0.90))',
          backdropFilter: 'blur(24px) saturate(150%)',
          border: '1px solid hsl(185 100% 50% / 0.2)',
          boxShadow: '0 16px 64px hsl(270 100% 70% / 0.25), inset 0 1px 2px hsl(0 0% 100% / 0.08)'
        }}
        onClick={(e) => e.stopPropagation()}
        drag
        dragMomentum={false}
      >
        {/* Header with glassmorphic effect */}
        <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 
          bg-gradient-to-r from-[hsl(235_45%_12%)] to-[hsl(235_45%_10%)]">
          <div className="flex items-center gap-3">
            <div className="text-xl font-bold bg-gradient-to-r from-[hsl(185_100%_50%)] to-[hsl(270_100%_70%)] 
              bg-clip-text text-transparent drop-shadow-[0_0_20px_hsl(185_100%_50%/0.3)]">
              {title}
            </div>
            <div className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-[hsl(270_100%_70%/0.2)] to-[hsl(185_100%_50%/0.2)] 
              border border-[hsl(270_100%_70%/0.3)] text-[hsl(270_100%_75%)] font-medium">
              {category}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-all
              hover:shadow-[0_0_16px_hsl(185_100%_50%/0.3)]">
              <Settings className="w-4 h-4 text-muted-foreground hover:text-[hsl(185_100%_50%)]" />
            </button>
            <button className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-all
              hover:shadow-[0_0_16px_hsl(185_100%_50%/0.3)]">
              <Minimize2 className="w-4 h-4 text-muted-foreground hover:text-[hsl(185_100%_50%)]" />
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-destructive/20 flex items-center justify-center 
              transition-all hover:shadow-[0_0_16px_hsl(0_70%_50%/0.4)]">
              <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 h-[calc(100%-64px)] overflow-auto">
          {children}
        </div>
        
        {/* Ambient glow effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-[hsl(270_100%_70%/0.1)] blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-[hsl(185_100%_50%/0.08)] blur-[120px]" />
        </div>
      </motion.div>
    </motion.div>
  );
};
