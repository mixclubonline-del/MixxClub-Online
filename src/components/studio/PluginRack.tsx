import { useState } from 'react';
import { usePluginStore } from '@/stores/pluginStore';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';

const PLUGIN_CATEGORIES = {
  essential: [
    { id: 'mixx-port', name: 'Port', icon: '🎵', desc: 'Audio Import' },
    { id: 'mixx-eq', name: 'EQ', icon: '🎛️', desc: '6-Band EQ' },
    { id: 'mixx-comp', name: 'Comp', icon: '📊', desc: 'Compressor' },
  ],
  effects: [
    { id: 'mixx-reverb', name: 'Reverb', icon: '🌊', desc: 'Space FX' },
    { id: 'mixx-delay', name: 'Delay', icon: '⏱️', desc: 'Echo FX' },
    { id: 'mixx-fx', name: 'FX', icon: '✨', desc: 'Modulation' },
  ],
  vocal: [
    { id: 'mixx-voice', name: 'Voice', icon: '🎤', desc: 'Vocal AI' },
  ],
  mastering: [
    { id: 'mixx-clip', name: 'Clip', icon: '⚡', desc: 'Limiter' },
    { id: 'mixx-vintage', name: 'Vintage', icon: '📻', desc: 'Analog' },
    { id: 'mixx-master', name: 'Master', icon: '🎚️', desc: 'Chain' },
  ],
};

export const PluginRack = () => {
  const { openPlugin } = usePluginStore();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['essential', 'effects'])
  );

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="w-64 border-r border-[hsl(var(--studio-border))] bg-[hsl(var(--studio-panel))] flex flex-col">
      <div className="p-3 border-b border-[hsl(var(--studio-border))]">
        <h3 className="text-xs font-mono uppercase tracking-wider text-[hsl(var(--studio-text))]">
          Plugin Rack
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {Object.entries(PLUGIN_CATEGORIES).map(([category, plugins]) => {
          const isExpanded = expandedCategories.has(category);
          
          return (
            <div key={category} className="space-y-1">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-2 rounded hover:bg-[hsl(var(--studio-panel-raised))] transition"
              >
                <span className="text-xs font-medium text-[hsl(var(--studio-text))] uppercase tracking-wide">
                  {category}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-3 h-3 text-[hsl(var(--studio-text-dim))]" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-[hsl(var(--studio-text-dim))]" />
                )}
              </button>

              {isExpanded && (
                <div className="space-y-1 pl-2">
                  {plugins.map((plugin) => (
                    <button
                      key={plugin.id}
                      onClick={() => openPlugin(plugin.id)}
                      className="w-full p-2 rounded bg-[hsl(var(--studio-black))] border border-[hsl(var(--studio-border))] hover:border-[hsl(var(--studio-accent))] transition text-left group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{plugin.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-[hsl(var(--studio-text))] font-medium">
                            {plugin.name}
                          </p>
                          <p className="text-[9px] text-[hsl(var(--studio-text-dim))]">
                            {plugin.desc}
                          </p>
                        </div>
                        <Plus className="w-3 h-3 text-[hsl(var(--studio-text-dim))] opacity-0 group-hover:opacity-100 transition" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};