import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { 
  Scissors, 
  Copy, 
  Clipboard, 
  Files, 
  Trash2,
  TrendingUp,
  TrendingDown,
  Wand2,
  RotateCcw,
  Move,
  Slice,
  Link,
  Volume2,
  Activity,
  MinusCircle,
} from "lucide-react";

interface RegionContextMenuProps {
  children: React.ReactNode;
  onSplit: () => void;
  onCopy: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onFadeIn: () => void;
  onFadeOut: () => void;
  onNormalize: () => void;
  onReverse?: () => void;
  onTrimStart?: () => void;
  onTrimEnd?: () => void;
  onSlip?: () => void;
  onConsolidate?: () => void;
  onDetectTempo?: () => void;
  onStripSilence?: () => void;
}

/**
 * Enhanced Region Context Menu with Week 2 operations
 * - Trim start/end (non-destructive edge trimming)
 * - Slip audio (region stays, audio moves)
 * - Reverse
 * - Plus existing operations
 */
export const RegionContextMenu = ({
  children,
  onSplit,
  onCopy,
  onDuplicate,
  onDelete,
  onFadeIn,
  onFadeOut,
  onNormalize,
  onReverse,
  onTrimStart,
  onTrimEnd,
  onSlip,
  onConsolidate,
  onDetectTempo,
  onStripSilence,
}: RegionContextMenuProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        {/* Editing Operations */}
        <ContextMenuItem onClick={onSplit}>
          <Scissors className="mr-2 h-4 w-4" />
          <span>Split at Playhead</span>
          <span className="ml-auto text-xs text-muted-foreground">S</span>
        </ContextMenuItem>
        
        {onTrimStart && (
          <ContextMenuItem onClick={onTrimStart}>
            <Slice className="mr-2 h-4 w-4" />
            <span>Trim Start to Playhead</span>
            <span className="ml-auto text-xs text-muted-foreground">[</span>
          </ContextMenuItem>
        )}
        
        {onTrimEnd && (
          <ContextMenuItem onClick={onTrimEnd}>
            <Slice className="mr-2 h-4 w-4 rotate-180" />
            <span>Trim End to Playhead</span>
            <span className="ml-auto text-xs text-muted-foreground">]</span>
          </ContextMenuItem>
        )}
        
        {onSlip && (
          <ContextMenuItem onClick={onSlip}>
            <Move className="mr-2 h-4 w-4" />
            <span>Slip Audio...</span>
            <span className="ml-auto text-xs text-muted-foreground">Alt+Drag</span>
          </ContextMenuItem>
        )}

        <ContextMenuSeparator />

        {/* Copy/Duplicate */}
        <ContextMenuItem onClick={onCopy}>
          <Copy className="mr-2 h-4 w-4" />
          <span>Copy</span>
          <span className="ml-auto text-xs text-muted-foreground">⌘C</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={onDuplicate}>
          <Files className="mr-2 h-4 w-4" />
          <span>Duplicate</span>
          <span className="ml-auto text-xs text-muted-foreground">⌘D</span>
        </ContextMenuItem>
        
        {onConsolidate && (
          <ContextMenuItem onClick={onConsolidate}>
            <Link className="mr-2 h-4 w-4" />
            <span>Consolidate</span>
          </ContextMenuItem>
        )}

        <ContextMenuSeparator />

        {/* Audio Processing */}
        {onReverse && (
          <ContextMenuItem onClick={onReverse}>
            <RotateCcw className="mr-2 h-4 w-4" />
            <span>Reverse</span>
            <span className="ml-auto text-xs text-muted-foreground">R</span>
          </ContextMenuItem>
        )}
        
        <ContextMenuItem onClick={onNormalize}>
          <Volume2 className="mr-2 h-4 w-4" />
          <span>Normalize</span>
          <span className="ml-auto text-xs text-muted-foreground">N</span>
        </ContextMenuItem>
        
        {onDetectTempo && (
          <ContextMenuItem onClick={onDetectTempo}>
            <Activity className="mr-2 h-4 w-4" />
            <span>Detect Tempo</span>
          </ContextMenuItem>
        )}
        
        {onStripSilence && (
          <ContextMenuItem onClick={onStripSilence}>
            <MinusCircle className="mr-2 h-4 w-4" />
            <span>Strip Silence</span>
          </ContextMenuItem>
        )}

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Wand2 className="mr-2 h-4 w-4" />
            <span>Fades</span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={onFadeIn}>
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>Add Fade In</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={onFadeOut}>
              <TrendingDown className="mr-2 h-4 w-4" />
              <span>Add Fade Out</span>
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />
        
        {/* Delete */}
        <ContextMenuItem onClick={onDelete} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
          <span className="ml-auto text-xs">⌫</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
