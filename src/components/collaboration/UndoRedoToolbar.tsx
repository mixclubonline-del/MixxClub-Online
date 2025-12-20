import React, { useEffect } from 'react';
import { Undo2, Redo2, Save, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface UndoRedoToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  isSaving: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onOpenHistory: () => void;
  snapshotCount: number;
  className?: string;
}

export const UndoRedoToolbar: React.FC<UndoRedoToolbarProps> = ({
  canUndo,
  canRedo,
  isSaving,
  onUndo,
  onRedo,
  onSave,
  onOpenHistory,
  snapshotCount,
  className
}) => {
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        if (canUndo) onUndo();
      }
      
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        if (canRedo) onRedo();
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        if (canRedo) onRedo();
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, onUndo, onRedo, onSave]);

  return (
    <TooltipProvider>
      <div className={cn(
        "flex items-center gap-1 bg-card/80 backdrop-blur-sm border border-border rounded-lg p-1",
        className
      )}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onUndo}
              disabled={!canUndo}
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center gap-2">
              <span>Undo</span>
              <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Ctrl+Z</kbd>
            </div>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onRedo}
              disabled={!canRedo}
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center gap-2">
              <span>Redo</span>
              <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Ctrl+Y</kbd>
            </div>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", isSaving && "animate-pulse")}
              onClick={onSave}
            >
              <Save className={cn("h-4 w-4", isSaving && "text-primary")} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center gap-2">
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
              <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Ctrl+S</kbd>
            </div>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5"
              onClick={onOpenHistory}
            >
              <History className="h-4 w-4" />
              {snapshotCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {snapshotCount}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>View Version History</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};
