import React, { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  History, 
  Undo2, 
  Redo2, 
  Save, 
  Flag, 
  Clock, 
  User, 
  Trash2,
  ChevronDown,
  ChevronUp,
  Download,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { VersionSnapshot } from '@/hooks/useVersionHistory';
import { cn } from '@/lib/utils';

interface VersionHistoryPanelProps {
  snapshots: VersionSnapshot[];
  currentIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  isSaving: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onGoToSnapshot: (id: string) => void;
  onCreateCheckpoint: (name: string, description?: string) => void;
  onDeleteSnapshot: (id: string) => void;
  onExport: () => void;
  currentState: any;
}

export const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({
  snapshots,
  currentIndex,
  canUndo,
  canRedo,
  isSaving,
  onUndo,
  onRedo,
  onGoToSnapshot,
  onCreateCheckpoint,
  onDeleteSnapshot,
  onExport,
  currentState
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [checkpointName, setCheckpointName] = useState('');
  const [showCreateCheckpoint, setShowCreateCheckpoint] = useState(false);

  const getTypeIcon = (type: VersionSnapshot['type']) => {
    switch (type) {
      case 'checkpoint':
        return <Flag className="h-3 w-3 text-amber-500" />;
      case 'manual':
        return <Save className="h-3 w-3 text-primary" />;
      case 'auto':
        return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getTypeBadge = (type: VersionSnapshot['type']) => {
    switch (type) {
      case 'checkpoint':
        return <Badge variant="outline" className="text-amber-500 border-amber-500/50 text-xs">Checkpoint</Badge>;
      case 'manual':
        return <Badge variant="outline" className="text-primary border-primary/50 text-xs">Saved</Badge>;
      case 'auto':
        return <Badge variant="secondary" className="text-xs">Auto</Badge>;
    }
  };

  const handleCreateCheckpoint = () => {
    if (checkpointName.trim()) {
      onCreateCheckpoint(checkpointName.trim());
      setCheckpointName('');
      setShowCreateCheckpoint(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Version History</span>
          {isSaving && (
            <Badge variant="secondary" className="text-xs animate-pulse">
              Saving...
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onUndo}
                  disabled={!canUndo}
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onRedo}
                  disabled={!canRedo}
                >
                  <Redo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Actions */}
          <div className="p-2 border-b border-border flex gap-2">
            {showCreateCheckpoint ? (
              <div className="flex gap-2 flex-1">
                <Input
                  placeholder="Checkpoint name..."
                  value={checkpointName}
                  onChange={(e) => setCheckpointName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateCheckpoint()}
                  className="h-8 text-sm"
                  autoFocus
                />
                <Button size="sm" className="h-8" onClick={handleCreateCheckpoint}>
                  Save
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8"
                  onClick={() => {
                    setShowCreateCheckpoint(false);
                    setCheckpointName('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 flex-1"
                  onClick={() => setShowCreateCheckpoint(true)}
                >
                  <Flag className="h-3 w-3 mr-1" />
                  Create Checkpoint
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-8" onClick={onExport}>
                        <Download className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Export History</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
          </div>

          {/* Snapshots List */}
          <ScrollArea className="h-64">
            {snapshots.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No history yet. Changes will be saved automatically.
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {[...snapshots].reverse().map((snapshot, idx) => {
                  const actualIndex = snapshots.length - 1 - idx;
                  const isCurrent = actualIndex === currentIndex;

                  return (
                    <div
                      key={snapshot.id}
                      className={cn(
                        "group flex items-start gap-2 p-2 rounded-md transition-colors cursor-pointer",
                        isCurrent 
                          ? "bg-primary/10 border border-primary/30" 
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => onGoToSnapshot(snapshot.id)}
                    >
                      <div className="mt-0.5">
                        {getTypeIcon(snapshot.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-sm font-medium truncate",
                            isCurrent && "text-primary"
                          )}>
                            {snapshot.label}
                          </span>
                          {getTypeBadge(snapshot.type)}
                          {isCurrent && (
                            <Badge className="text-xs">Current</Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <User className="h-3 w-3" />
                          <span>{snapshot.userName}</span>
                          <span>•</span>
                          <span title={format(snapshot.timestamp, 'PPpp')}>
                            {formatDistanceToNow(snapshot.timestamp, { addSuffix: true })}
                          </span>
                        </div>

                        {snapshot.description && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {snapshot.description}
                          </p>
                        )}
                      </div>

                      {!isCurrent && snapshot.type !== 'auto' && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onGoToSnapshot(snapshot.id);
                                  }}
                                >
                                  <RotateCcw className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Restore this version</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-destructive hover:text-destructive"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Version?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete "{snapshot.label}". This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onDeleteSnapshot(snapshot.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Footer Stats */}
          <div className="p-2 border-t border-border bg-muted/30 text-xs text-muted-foreground flex justify-between">
            <span>{snapshots.length} versions</span>
            <span>
              {snapshots.filter(s => s.type === 'checkpoint').length} checkpoints
            </span>
          </div>
        </>
      )}
    </div>
  );
};
