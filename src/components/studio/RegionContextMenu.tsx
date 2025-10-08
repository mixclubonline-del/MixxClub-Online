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
  Wand2
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
}

export const RegionContextMenu = ({
  children,
  onSplit,
  onCopy,
  onDuplicate,
  onDelete,
  onFadeIn,
  onFadeOut,
  onNormalize,
}: RegionContextMenuProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={onSplit}>
          <Scissors className="mr-2 h-4 w-4" />
          <span>Split at Playhead</span>
          <span className="ml-auto text-xs text-muted-foreground">S</span>
        </ContextMenuItem>
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
        <ContextMenuSeparator />
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
        <ContextMenuItem onClick={onNormalize}>
          <Wand2 className="mr-2 h-4 w-4" />
          <span>Normalize</span>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onDelete} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
          <span className="ml-auto text-xs">⌫</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
