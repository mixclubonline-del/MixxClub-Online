import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Scissors, 
  Copy, 
  Clipboard, 
  TrendingUp, 
  TrendingDown, 
  Maximize, 
  Split,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAIStudioStore, AudioRegion } from '@/stores/aiStudioStore';

interface WaveformEditorProps {
  regionId: string;
  trackId: string;
}

export const WaveformEditor = ({ regionId, trackId }: WaveformEditorProps) => {
  const [clipboard, setClipboard] = useState<AudioRegion | null>(null);
  const updateRegion = useAIStudioStore((state) => state.updateRegion);
  const removeRegion = useAIStudioStore((state) => state.removeRegion);
  const duplicateRegion = useAIStudioStore((state) => state.duplicateRegion);
  const reverseRegion = useAIStudioStore((state) => state.reverseRegion);
  const tracks = useAIStudioStore((state) => state.tracks);

  const track = tracks.find(t => t.id === trackId);
  const region = track?.regions.find(r => r.id === regionId);

  if (!region) return null;

  const handleCut = () => {
    setClipboard({ ...region });
    removeRegion(regionId);
    toast.success('Region cut to clipboard');
  };

  const handleCopy = () => {
    setClipboard({ ...region });
    toast.success('Region copied to clipboard');
  };

  const handlePaste = () => {
    if (!clipboard) {
      toast.error('Clipboard is empty');
      return;
    }
    
    duplicateRegion(regionId);
    toast.success('Region pasted');
  };

  const handleFadeIn = () => {
    const currentDuration = region.fadeIn?.duration || 0;
    updateRegion(regionId, {
      fadeIn: {
        duration: currentDuration > 0 ? 0 : 0.5,
        curve: 'exponential',
      },
    });
    toast.success(currentDuration > 0 ? 'Fade in removed' : 'Fade in applied');
  };

  const handleFadeOut = () => {
    const currentDuration = region.fadeOut?.duration || 0;
    updateRegion(regionId, {
      fadeOut: {
        duration: currentDuration > 0 ? 0 : 0.5,
        curve: 'exponential',
      },
    });
    toast.success(currentDuration > 0 ? 'Fade out removed' : 'Fade out applied');
  };

  const handleNormalize = () => {
    updateRegion(regionId, {
      gain: 1.0,
    });
    toast.success('Region normalized');
  };

  const handleReverse = () => {
    reverseRegion(regionId);
    toast.success('Region reversed');
  };

  const handleDelete = () => {
    removeRegion(regionId);
    toast.success('Region deleted');
  };

  return (
    <div 
      className="flex items-center gap-1 p-2 rounded-lg border"
      style={{
        background: 'linear-gradient(135deg, hsl(220, 20%, 16%) 0%, hsl(220, 20%, 14%) 100%)',
        borderColor: 'hsl(220, 20%, 24%)',
      }}
    >
      {/* Edit Tools */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleCut}
          title="Cut (Ctrl+X)"
        >
          <Scissors className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleCopy}
          title="Copy (Ctrl+C)"
        >
          <Copy className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handlePaste}
          disabled={!clipboard}
          title="Paste (Ctrl+V)"
        >
          <Clipboard className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Fade Tools */}
      <div className="flex items-center gap-1">
        <Button
          variant={(region.fadeIn?.duration || 0) > 0 ? "default" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={handleFadeIn}
          title="Fade In"
        >
          <TrendingUp className="w-4 h-4" />
        </Button>
        <Button
          variant={(region.fadeOut?.duration || 0) > 0 ? "default" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={handleFadeOut}
          title="Fade Out"
        >
          <TrendingDown className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Processing Tools */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleNormalize}
          title="Normalize"
        >
          <Maximize className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleReverse}
          title="Reverse"
        >
          <Split className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Delete */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:bg-destructive/10"
        onClick={handleDelete}
        title="Delete (Del)"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};
