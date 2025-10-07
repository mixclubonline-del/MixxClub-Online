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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        className="relative rounded-xl overflow-hidden shadow-2xl"
        style={{ width, height }}
        onClick={(e) => e.stopPropagation()}
        drag
        dragMomentum={false}
      >
        {/* Glass background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/80 to-black/90 backdrop-blur-xl border border-white/10" />
        
        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary shadow-glow" />
            <div>
              <h3 className="font-semibold text-sm text-foreground">{title}</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{category}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" className="h-7 w-7">
              <Settings className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7">
              <Minimize2 className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onClose}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 h-[calc(100%-52px)] overflow-auto p-6">
          {children}
        </div>
        
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 bg-primary/10 blur-[100px]" />
        </div>
      </motion.div>
    </motion.div>
  );
};
