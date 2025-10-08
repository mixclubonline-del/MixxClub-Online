import { Volume2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

export const StudioMixerConsole = () => {
  const ChannelStrip = ({ label, isMaster = false }: { label: string; isMaster?: boolean }) => (
    <div className={`flex flex-col items-center gap-2 ${isMaster ? 'border-l border-border/50 pl-4 ml-4' : ''}`}>
      <div className="flex flex-col items-center gap-4 h-48">
        <Slider
          orientation="vertical"
          defaultValue={[75]}
          className="h-32"
        />
        <div className="w-12 h-3 rounded-full bg-green-500/30 border border-green-500/50" />
      </div>
      <span className="text-xs font-medium">{label}</span>
      {isMaster && <Volume2 className="h-4 w-4 text-primary" />}
    </div>
  );

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-background/60 backdrop-blur-md rounded-lg border border-border/50 px-8 py-4">
      <div className="flex items-end gap-6">
        <ChannelStrip label="Drums" />
        <ChannelStrip label="Bass" />
        <ChannelStrip label="Keys" />
        <ChannelStrip label="Vocals" />
        <ChannelStrip label="FX" />
        <ChannelStrip label="Master" isMaster />
      </div>
    </div>
  );
};
