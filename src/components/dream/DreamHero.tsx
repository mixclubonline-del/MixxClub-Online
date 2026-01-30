import { motion } from 'framer-motion';
import { Sparkles, ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ModeSelector } from './ModeSelector';
import { DreamChamberGuide } from './DreamChamberGuide';
import type { DreamMode, DreamEngineCapabilities } from '@/hooks/useDreamEngine';

interface DreamHeroProps {
  mode: DreamMode;
  onModeChange: (mode: DreamMode) => void;
  capabilities: DreamEngineCapabilities;
  liveAssetCount: number;
  generationState: 'idle' | 'generating' | 'success' | 'error';
}

export function DreamHero({ 
  mode, 
  onModeChange, 
  capabilities, 
  liveAssetCount,
  generationState 
}: DreamHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card/50 to-card/30 backdrop-blur border border-border/50 p-6 md:p-8">
      {/* Ambient background glow */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 30% 50%, hsl(270 75% 55% / 0.3) 0%, transparent 60%)'
        }}
      />
      
      <div className="relative z-10">
        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
          {/* Title section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">Dream Chamber</h1>
            </div>
            <p className="text-muted-foreground max-w-md">
              Where the city's visions are born. Generate images, videos, and audio for every district.
            </p>
          </motion.div>

          {/* Stats & Mode selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-start md:items-end gap-3"
          >
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 border-primary/30">
                <ImageIcon className="w-3 h-3 mr-1" />
                {liveAssetCount} live assets
              </Badge>
            </div>
            
            <ModeSelector
              mode={mode}
              onChange={onModeChange}
              capabilities={capabilities}
            />
          </motion.div>
        </div>

        {/* Prime Guide */}
        <DreamChamberGuide state={generationState} />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: `hsl(270 75% 55% / ${Math.random() * 0.3 + 0.1})`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: Math.random() * 4 + 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  );
}
