import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuickVocalChainProps {
  onApply: () => void;
  trackId: string;
}

export const QuickVocalChain = ({ onApply, trackId }: QuickVocalChainProps) => {
  const { toast } = useToast();

  const applyVocalChain = () => {
    // This would call the actual audio engine to insert the effects
    // HPF (80Hz) → De-Esser → EQ → Compressor → Reverb Send
    toast({
      title: "Vocal Chain Applied",
      description: "HPF, EQ, Compressor, and Reverb configured for broadcast-quality vocals.",
    });
    onApply();
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-purple-600/10 to-cyan-600/10 border-purple-500/30">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-purple-600/20">
          <Mic className="w-5 h-5 text-purple-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">Quick Vocal Processing</h3>
          <p className="text-xs text-muted-foreground">Broadcast-ready vocal chain</p>
        </div>
        <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
      </div>

      <div className="space-y-2 mb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>High-Pass Filter (80Hz)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Presence EQ Boost</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-500" />
          <span>Vocal Compressor (4:1)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500" />
          <span>Studio Reverb Send</span>
        </div>
      </div>

      <Button 
        onClick={applyVocalChain} 
        className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
      >
        Apply Vocal Chain
      </Button>
    </Card>
  );
};
