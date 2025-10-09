import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PluginRackProps {
  openPlugins: string[];
  onRemovePlugin: (id: string) => void;
  onOpenPlugin: (id: string) => void;
}

const PLUGIN_ICONS: Record<string, string> = {
  'mixx-port': '📁',
  'mixx-eq': '🎚️',
  'mixx-comp': '📊',
  'mixx-reverb': '✨',
  'mixx-delay': '⏱️',
  'mixx-master': '⚡',
  'mixx-voice': '🎤',
  'mixx-clip': '🔥',
  'mixx-fx': '🎨',
  'mixx-vintage': '📻',
  'prime-bot': '🤖',
};

const PLUGIN_NAMES: Record<string, string> = {
  'mixx-port': 'MixxPort',
  'mixx-eq': 'MixxEQ',
  'mixx-comp': 'MixxComp',
  'mixx-reverb': 'MixxReverb',
  'mixx-delay': 'MixxDelay',
  'mixx-master': 'MixxMaster',
  'mixx-voice': 'MixxVoice',
  'mixx-clip': 'MixxClip',
  'mixx-fx': 'MixxFX',
  'mixx-vintage': 'MixxVintage',
  'prime-bot': 'PrimeBot 4.0',
};

export const PluginRack: React.FC<PluginRackProps> = ({ 
  openPlugins, 
  onRemovePlugin,
  onOpenPlugin 
}) => {
  if (openPlugins.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 rounded-lg border border-dashed border-white/10 bg-white/5">
        <p className="text-sm text-muted-foreground">No plugins loaded</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-mixx-cyan uppercase tracking-widest mb-3 font-bold">
        Active Plugins ({openPlugins.length})
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence>
          {openPlugins.map((pluginId, index) => (
            <motion.div
              key={pluginId}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className="relative group cursor-pointer"
              onClick={() => onOpenPlugin(pluginId)}
            >
              {/* Gradient border container */}
              <div 
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-sm"
                style={{
                  background: 'linear-gradient(135deg, #FF70D0, #C5A3FF, #70E6FF)',
                }}
              />
              
              {/* Card content */}
              <div className="relative flex flex-col items-center gap-3 p-4 rounded-xl bg-mixx-navy border border-mixx-lavender/20 
                group-hover:border-mixx-lavender/50 transition-all">
                <div className="text-3xl">{PLUGIN_ICONS[pluginId] || '🔌'}</div>
                <div className="text-center">
                  <div className="text-sm font-bold text-white">{PLUGIN_NAMES[pluginId] || pluginId}</div>
                  <div className="text-xs text-mixx-cyan">Slot {index + 1}</div>
                </div>
                
                {/* Status indicator */}
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{
                    background: 'linear-gradient(135deg, #FF70D0, #70E6FF)',
                    boxShadow: '0 0 8px rgba(197,163,255,0.8)'
                  }}
                />
                
                {/* Remove button */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity 
                    hover:bg-red-500/20 hover:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemovePlugin(pluginId);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
