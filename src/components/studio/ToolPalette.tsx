import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MousePointer2, Scissors, Link, Waves, Volume2, Move } from 'lucide-react';
import { useToolStore, ToolMode } from '@/stores/toolStore';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

export const ToolPalette = () => {
  const { currentTool, setTool } = useToolStore();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch(e.key.toLowerCase()) {
        case 'escape':
          setTool('pointer');
          break;
        case 't':
          setTool('trim');
          break;
        case 's':
          setTool('scissor');
          break;
        case 'g':
          setTool('glue');
          break;
        case 'f':
          setTool('fade');
          break;
        case 'm':
          setTool('mute');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setTool]);

  const tools: Array<{ mode: ToolMode; icon: any; label: string; shortcut: string }> = [
    { mode: 'pointer', icon: MousePointer2, label: 'Pointer Tool', shortcut: 'ESC' },
    { mode: 'trim', icon: Move, label: 'Trim Tool', shortcut: 'T' },
    { mode: 'scissor', icon: Scissors, label: 'Scissor Tool', shortcut: 'S' },
    { mode: 'glue', icon: Link, label: 'Glue Tool', shortcut: 'G' },
    { mode: 'fade', icon: Waves, label: 'Fade Tool', shortcut: 'F' },
    { mode: 'mute', icon: Volume2, label: 'Mute Tool', shortcut: 'M' },
  ];

  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-[hsl(220,18%,18%)] border-b border-[hsl(220,14%,28%)]">
      <span className="text-[10px] text-[hsl(var(--studio-text-dim))] mr-2">Tools:</span>
      <TooltipProvider delayDuration={300}>
        {tools.map(({ mode, icon: Icon, label, shortcut }) => (
          <Tooltip key={mode}>
            <TooltipTrigger asChild>
              <Button
                variant={currentTool === mode ? "default" : "ghost"}
                size="sm"
                onClick={() => setTool(mode)}
                className={cn(
                  "h-7 w-7 p-0",
                  currentTool === mode && "bg-[hsl(var(--studio-accent))] hover:bg-[hsl(var(--studio-accent))]"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{label} ({shortcut})</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
};
