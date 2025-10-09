import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward,
  Circle,
  Scissors,
  Copy,
  Save,
  FolderOpen,
  Undo,
  Redo,
  Settings
} from 'lucide-react';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { toast } from 'sonner';

export const DAWToolbar = () => {
  const isPlaying = useAIStudioStore((state) => state.isPlaying);
  const setPlaying = useAIStudioStore((state) => state.setPlaying);

  const handleSave = () => toast.success('Project saved');
  const handleOpen = () => toast.info('Open project');
  const handleUndo = () => toast.info('Undo');
  const handleRedo = () => toast.info('Redo');
  const handleStop = () => {
    setPlaying(false);
    toast.info('Stopped');
  };
  const togglePlayback = () => setPlaying(!isPlaying);

  return (
    <div className="flex items-center gap-2 bg-card border-b px-4 py-2">
      {/* File Operations */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleOpen}>
          <FolderOpen className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSave}>
          <Save className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Edit Operations */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleUndo}>
          <Undo className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRedo}>
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Transport Controls */}
      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={handleStop}
        >
          <SkipBack className="w-4 h-4" />
        </Button>
        
        <Button 
          variant={isPlaying ? "default" : "ghost"}
          size="icon" 
          className="h-9 w-9"
          onClick={togglePlayback}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={handleStop}
        >
          <Square className="w-4 h-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
        >
          <SkipForward className="w-4 h-4" />
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-destructive"
        >
          <Circle className="w-4 h-4 fill-current" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Tool Operations */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Scissors className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Copy className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1" />

      {/* Settings */}
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Settings className="w-4 h-4" />
      </Button>
    </div>
  );
};
