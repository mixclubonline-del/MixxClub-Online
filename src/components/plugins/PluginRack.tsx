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
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground uppercase tracking-wider mb-3">
        Active Plugins ({openPlugins.length})
      </div>
      <AnimatePresence>
        {openPlugins.map((pluginId, index) => (
          <motion.div
            key={pluginId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-white/5 to-white/10 
              border border-white/10 group hover:border-primary/30 transition-all cursor-pointer"
            onClick={() => onOpenPlugin(pluginId)}
          >
            <div className="text-2xl">{PLUGIN_ICONS[pluginId] || '🔌'}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{PLUGIN_NAMES[pluginId] || pluginId}</div>
              <div className="text-xs text-muted-foreground">Slot {index + 1}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary shadow-glow" />
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemovePlugin(pluginId);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
