import { useState } from 'react';
import { Card } from '@/components/ui/card';

interface Plugin {
  id: string;
  name: string;
  description: string;
  colors: string[];
  icon: string;
}

const plugins: Plugin[] = [
  {
    id: 'mixvocal',
    name: 'MixVocal',
    description: 'Vocal Enhancer',
    colors: ["#A7B7FF", "#C5A3FF", "#FF70D0"],
    icon: '🎤'
  },
  {
    id: 'mixeq',
    name: 'MixEQ',
    description: 'Frequency Shaper',
    colors: ["#70E6FF", "#AEE3FF", "#C5A3FF"],
    icon: '🎚️'
  },
  {
    id: 'mixglue',
    name: 'MixGlue',
    description: 'Bus Compressor',
    colors: ["#FF70D0", "#B68CFF", "#C5A3FF"],
    icon: '🔗'
  },
  {
    id: 'mixreverb',
    name: 'MixReverb',
    description: 'Atmos Designer',
    colors: ["#70E6FF", "#C5A3FF", "#A7B7FF"],
    icon: '🌊'
  },
  {
    id: 'mixdelay',
    name: 'MixDelay',
    description: 'Echo Machine',
    colors: ["#FF70D0", "#FF8AE5", "#C5A3FF"],
    icon: '⏱️'
  },
  {
    id: 'xcciter',
    name: 'Xcciter',
    description: 'Harmonic Enhancer',
    colors: ["#C5A3FF", "#FF70D0", "#70E6FF"],
    icon: '✨'
  },
  {
    id: 'mixxport',
    name: 'MixxPort',
    description: 'Session Transport',
    colors: ["#70E6FF", "#C5A3FF", "#FF70D0"],
    icon: '🚀'
  }
];

interface PluginRackProps {
  onPluginSelect?: (plugin: Plugin) => void;
}

export const PluginRack = ({ onPluginSelect }: PluginRackProps) => {
  const [selectedPlugin, setSelectedPlugin] = useState<string | null>(null);

  const handlePluginClick = (plugin: Plugin) => {
    setSelectedPlugin(plugin.id);
    onPluginSelect?.(plugin);
    setTimeout(() => setSelectedPlugin(null), 2200);
  };

  return (
    <div className="flex flex-wrap justify-center gap-8 py-8">
      {plugins.map((plugin) => (
        <Card
          key={plugin.id}
          className={`
            relative cursor-pointer overflow-hidden
            bg-gradient-to-br from-purple-950/40 to-indigo-950/30
            border border-purple-500/20
            rounded-2xl p-6 w-[200px] h-[180px]
            transition-all duration-300 ease-out
            hover:scale-105 hover:-translate-y-2
            hover:shadow-[0_0_40px_rgba(255,110,255,0.4)]
            ${selectedPlugin === plugin.id ? 'scale-105 -translate-y-2 shadow-[0_0_40px_rgba(255,110,255,0.6)]' : ''}
          `}
          onClick={() => handlePluginClick(plugin)}
        >
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div 
              className="text-6xl filter drop-shadow-[0_0_20px_rgba(197,163,255,0.6)]"
              style={{
                background: `linear-gradient(135deg, ${plugin.colors[0]}, ${plugin.colors[1]}, ${plugin.colors[2]})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              {plugin.icon}
            </div>
            <div className="text-center">
              <h3 
                className="font-semibold text-lg mb-1"
                style={{
                  background: `linear-gradient(135deg, ${plugin.colors[0]}, ${plugin.colors[2]})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {plugin.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {plugin.description}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
