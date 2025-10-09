import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Save,
  FolderOpen,
  Undo2,
  Redo2,
  Scissors,
  Copy,
  Settings,
  Sparkles,
  Wand2,
  Cloud,
  Sliders,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAIStudioStore } from '@/stores/aiStudioStore';

interface DAWTopToolbarProps {
  onToggleMixer: () => void;
  onOpenAIMixing: () => void;
  onOpenStemSeparation: () => void;
  onOpenCloudManager: () => void;
  showMixer: boolean;
}

export const DAWTopToolbar = ({
  onToggleMixer,
  onOpenAIMixing,
  onOpenStemSeparation,
  onOpenCloudManager,
  showMixer,
}: DAWTopToolbarProps) => {
  const { toast } = useToast();

  return (
    <div className="h-12 bg-card border-b border-border flex items-center px-2 gap-1">
      {/* File Operations */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onOpenCloudManager}>
          <FolderOpen className="w-4 h-4 mr-1" />
          Open
        </Button>
        <Button variant="ghost" size="sm" onClick={onOpenCloudManager}>
          <Save className="w-4 h-4 mr-1" />
          Save
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Edit Operations */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => toast({ title: "Undo" })}>
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => toast({ title: "Redo" })}>
          <Redo2 className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Tools */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm">
          <Scissors className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Copy className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* AI Tools */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenStemSeparation}
          className="text-primary"
        >
          <Wand2 className="w-4 h-4 mr-1" />
          Stem Separation
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenAIMixing}
          className="text-primary"
        >
          <Sparkles className="w-4 h-4 mr-1" />
          AI Mix Assistant
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* View */}
      <div className="flex items-center gap-1">
        <Button
          variant={showMixer ? "secondary" : "ghost"}
          size="sm"
          onClick={onToggleMixer}
        >
          <Sliders className="w-4 h-4 mr-1" />
          Mixer
        </Button>
      </div>

      <div className="flex-1" />

      {/* Right Side - Cloud & Settings */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onOpenCloudManager}>
          <Cloud className="w-4 h-4 mr-1" />
          Cloud
        </Button>
        <Button variant="ghost" size="sm">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
