import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Sliders, Waves, Sparkles, Mic, Zap, Disc, Brain, Music, Eye } from 'lucide-react';
import { usePluginStore } from '@/stores/pluginStore';
import { usePluginPreviewStore } from '@/stores/pluginPreviewStore';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { audioEngine } from '@/services/audioEngine';
import { toast } from 'sonner';

interface PluginBrowserProps {
  onPluginSelect: (pluginType: string) => void;
}

const AVAILABLE_PLUGINS = [
  {
    id: 'mixx-port',
    name: 'MixxPort',
    category: 'Utility',
    icon: Plus,
    description: 'Upload & analyze audio with AI',
    color: 'from-blue-500/20 to-blue-600/20',
  },
  {
    id: 'mixx-eq',
    name: 'MixxEQ',
    category: 'EQ',
    icon: Sliders,
    description: '6-band parametric EQ with spectrum',
    color: 'from-green-500/20 to-green-600/20',
  },
  {
    id: 'mixx-comp',
    name: 'MixxComp',
    category: 'Dynamics',
    icon: Waves,
    description: 'Dynamics processor & compressor',
    color: 'from-purple-500/20 to-purple-600/20',
  },
  {
    id: 'mixx-reverb',
    name: 'MixxReverb',
    category: 'Spatial',
    icon: Sparkles,
    description: 'Convolution & algorithmic reverb',
    color: 'from-cyan-500/20 to-cyan-600/20',
  },
  {
    id: 'mixx-delay',
    name: 'MixxDelay',
    category: 'Spatial',
    icon: Waves,
    description: 'BPM-synced delay with ping-pong',
    color: 'from-indigo-500/20 to-indigo-600/20',
  },
  {
    id: 'mixx-master',
    name: 'MixxMaster',
    category: 'Mastering',
    icon: Zap,
    description: 'Complete mastering chain & LUFS',
    color: 'from-orange-500/20 to-orange-600/20',
  },
  {
    id: 'mixx-voice',
    name: 'MixxVoice',
    category: 'Voice',
    icon: Mic,
    description: 'AI vocal coach & pitch correction',
    color: 'from-pink-500/20 to-pink-600/20',
  },
  {
    id: 'mixxtune',
    name: 'MixxTune',
    category: 'Voice',
    icon: Music,
    description: 'Pro auto-tune & pitch correction',
    color: 'from-purple-500/20 to-purple-600/20',
  },
  {
    id: 'mixx-clip',
    name: 'MixxClip',
    category: 'Dynamics',
    icon: Zap,
    description: 'Limiter & clipper with car thump',
    color: 'from-red-500/20 to-red-600/20',
  },
  {
    id: 'mixx-fx',
    name: 'MixxFX',
    category: 'Creative',
    icon: Sparkles,
    description: 'Multi-effects & modulation',
    color: 'from-violet-500/20 to-violet-600/20',
  },
  {
    id: 'mixx-vintage',
    name: 'MixxVintage',
    category: 'Creative',
    icon: Disc,
    description: 'Tape & vinyl emulation',
    color: 'from-amber-500/20 to-amber-600/20',
  },
  {
    id: 'prime-bot',
    name: 'PrimeBot 4.0',
    category: 'AI',
    icon: Brain,
    description: 'AI mixing & mastering assistant',
    color: 'from-primary/20 to-primary/30',
  },
];

export const PluginBrowser: React.FC<PluginBrowserProps> = ({ onPluginSelect }) => {
  const categories = ['All', 'Utility', 'EQ', 'Dynamics', 'Spatial', 'Mastering', 'Voice', 'Creative', 'AI'];
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const { startPreview } = usePluginPreviewStore();
  const selectedTrackId = useAIStudioStore((state) => state.selectedTrackId);

  const filteredPlugins = selectedCategory === 'All' 
    ? AVAILABLE_PLUGINS 
    : AVAILABLE_PLUGINS.filter(p => p.category === selectedCategory);

  const getEffectType = (pluginId: string): 'eq' | 'compressor' | 'reverb' | 'delay' | 'saturator' | 'limiter' => {
    if (pluginId.includes('eq')) return 'eq';
    if (pluginId.includes('comp')) return 'compressor';
    if (pluginId.includes('reverb')) return 'reverb';
    if (pluginId.includes('delay')) return 'delay';
    if (pluginId.includes('saturator') || pluginId.includes('glue')) return 'saturator';
    return 'limiter';
  };

  const handlePreview = (plugin: typeof AVAILABLE_PLUGINS[0], e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!selectedTrackId) {
      toast.error('Please select a track first');
      return;
    }

    const effectType = getEffectType(plugin.id);
    audioEngine.startPluginPreview(selectedTrackId, effectType);
    startPreview(plugin.id, plugin.name, selectedTrackId, effectType);
    toast.success(`Previewing ${plugin.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
            className="whitespace-nowrap"
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Plugin Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlugins.map(plugin => {
          const Icon = plugin.icon;
          return (
            <motion.div
              key={plugin.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`p-4 bg-gradient-to-br ${plugin.color} border-white/10 
                  hover:border-primary/30 transition-all group relative`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-3 rounded-lg bg-white/5 group-hover:bg-white/10 transition-all">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1">{plugin.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{plugin.description}</p>
                    <span className="text-[10px] uppercase tracking-wider text-primary">
                      {plugin.category}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={(e) => handlePreview(plugin, e)}
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-2 text-xs"
                  >
                    <Eye className="w-3 h-3" />
                    Preview
                  </Button>
                  <Button
                    onClick={() => onPluginSelect(plugin.id)}
                    size="sm"
                    className="flex-1 gap-2 text-xs"
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
