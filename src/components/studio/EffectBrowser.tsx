import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EffectUnit } from '@/stores/aiStudioStore';

interface EffectBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEffect: (effectType: EffectUnit['type']) => void;
  trackId: string;
}

interface EffectTemplate {
  type: EffectUnit['type'];
  name: string;
  category: 'Dynamics' | 'EQ' | 'Spatial' | 'Modulation' | 'Utility';
  description: string;
  icon: string;
}

const effectTemplates: EffectTemplate[] = [
  { type: 'eq', name: 'Parametric EQ', category: 'EQ', description: '4-band parametric equalizer', icon: '🎚️' },
  { type: 'compressor', name: 'Compressor', category: 'Dynamics', description: 'VCA-style dynamic range control', icon: '⚡' },
  { type: 'limiter', name: 'Limiter', category: 'Dynamics', description: 'Brickwall peak limiter', icon: '🔒' },
  { type: 'reverb', name: 'Reverb', category: 'Spatial', description: 'Algorithmic room reverb', icon: '🌊' },
  { type: 'delay', name: 'Delay', category: 'Spatial', description: 'Stereo delay with feedback', icon: '⏱️' },
  { type: 'saturator', name: 'Saturator', category: 'Utility', description: 'Harmonic saturation', icon: '🔥' },
];

export const EffectBrowser = ({ isOpen, onClose, onSelectEffect, trackId }: EffectBrowserProps) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(effectTemplates.map(e => e.category)));

  const filteredEffects = effectTemplates.filter(effect => {
    const matchesSearch = effect.name.toLowerCase().includes(search.toLowerCase()) ||
                         effect.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || effect.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectEffect = (effectType: EffectUnit['type']) => {
    onSelectEffect(effectType);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Insert Effect
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search effects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category filters */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                !selectedCategory
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card hover:bg-accent'
              )}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card hover:bg-accent'
                )}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Effect grid */}
          <ScrollArea className="h-96">
            <div className="grid grid-cols-2 gap-3 pr-4">
              {filteredEffects.map(effect => (
                <button
                  key={effect.type}
                  onClick={() => handleSelectEffect(effect.type)}
                  className={cn(
                    'p-4 rounded-lg text-left transition-all',
                    'bg-card hover:bg-accent border border-border',
                    'hover:shadow-lg hover:scale-[1.02]'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{effect.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{effect.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {effect.description}
                      </p>
                      <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary">
                        {effect.category}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
