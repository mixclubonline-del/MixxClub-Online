import React from 'react';
import { motion } from 'framer-motion';
import { X, Minimize2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MixxclubLogo } from '@/components/brand/MixxclubLogo';
import { SpatialBackground } from '@/components/background/SpatialBackground';

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
        className="relative rounded-2xl overflow-hidden"
        style={{ width, height: height + 60 }}
        onClick={(e) => e.stopPropagation()}
        drag
        dragMomentum={false}
      >
        {/* Outer glow */}
        <div 
          className="absolute inset-0 rounded-2xl blur-xl opacity-50"
          style={{
            background: 'linear-gradient(135deg, rgba(255,112,208,0.3), rgba(197,163,255,0.2), rgba(112,230,255,0.3))',
          }}
        />

        {/* Main container with gradient border */}
        <div className="relative h-full rounded-2xl p-[1px]" style={{
          background: 'linear-gradient(135deg, #FF70D0 0%, #C5A3FF 50%, #70E6FF 100%)',
        }}>
          {/* Spatial Background for plugin */}
          <SpatialBackground intensity="low" className="rounded-2xl" />
          
          {/* Glass background */}
          <div className="relative z-10 h-full rounded-2xl bg-gradient-to-br from-mixx-navy/95 via-mixx-navy-deep/98 to-mixx-navy/95 backdrop-blur-xl flex flex-col">
            
            {/* Header with gradient background */}
            <div 
              className="relative z-20 flex items-center justify-between px-6 py-4 border-b"
              style={{
                background: 'linear-gradient(135deg, rgba(255,112,208,0.1), rgba(197,163,255,0.08), rgba(112,230,255,0.1))',
                borderColor: 'rgba(197,163,255,0.2)',
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{
                    background: 'linear-gradient(135deg, #FF70D0, #70E6FF)',
                    boxShadow: '0 0 12px rgba(197,163,255,0.8)',
                  }}
                />
                <div>
                  <h3 className="font-bold text-lg text-white">{title}</h3>
                  <p className="text-[11px] text-mixx-cyan uppercase tracking-widest font-medium">{category}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/10">
                  <Settings className="h-4 w-4 text-mixx-cyan" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/10">
                  <Minimize2 className="h-4 w-4 text-mixx-lavender" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/10" onClick={onClose}>
                  <X className="h-4 w-4 text-mixx-pink" />
                </Button>
              </div>
            </div>
            
            {/* Content */}
            <div className="relative z-20 flex-1 overflow-auto p-6">
              {children}
            </div>
            
            {/* Footer with Mixxclub logo */}
            <div 
              className="relative z-20 flex items-center justify-center py-3 border-t"
              style={{
                borderColor: 'rgba(197,163,255,0.2)',
                background: 'linear-gradient(135deg, rgba(10,14,26,0.8), rgba(26,31,53,0.8))',
              }}
            >
              <MixxclubLogo variant="symbol-only" size="xs" animated={false} />
            </div>
            
            {/* Ambient glow effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 blur-[100px] opacity-20"
                style={{
                  background: 'radial-gradient(circle, rgba(197,163,255,0.5), transparent)',
                }}
              />
              <div 
                className="absolute bottom-0 right-0 w-1/3 h-1/3 blur-[80px] opacity-15"
                style={{
                  background: 'radial-gradient(circle, rgba(112,230,255,0.5), transparent)',
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
