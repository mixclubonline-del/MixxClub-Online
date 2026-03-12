import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CheckSquare, XSquare, Download, Trash2, AlertTriangle } from 'lucide-react';
import { exportToCSV } from '@/utils/csvExport';
import { useBulkActions } from '@/hooks/useBulkActions';

interface BulkOperationsProps {
  table: string;
  selectedIds: Set<string>;
  clearSelection: () => void;
  data?: any[];
  actions?: BulkAction[];
  onComplete?: () => void;
}

interface BulkAction {
  label: string;
  icon: React.ReactNode;
  updateData: Record<string, unknown>;
  destructive?: boolean;
  confirmMessage?: string;
}

export const BulkOperations: React.FC<BulkOperationsProps> = ({
  table, selectedIds, clearSelection, data = [], actions = [], onComplete,
}) => {
  const { executeBatch, progress } = useBulkActions();
  const [confirmAction, setConfirmAction] = useState<BulkAction | null>(null);

  if (selectedIds.size === 0) return null;

  const ids = Array.from(selectedIds);

  const handleAction = async (action: BulkAction) => {
    if (action.destructive) {
      setConfirmAction(action);
      return;
    }
    await executeBatch(table, ids, action.updateData, 'records');
    onComplete?.();
  };

  const confirmAndExecute = async () => {
    if (!confirmAction) return;
    await executeBatch(table, ids, confirmAction.updateData, 'records');
    setConfirmAction(null);
    onComplete?.();
  };

  const handleExport = () => {
    const selectedData = data.filter((row: any) => selectedIds.has(row.id));
    if (selectedData.length > 0) {
      exportToCSV(selectedData, `${table}-export`);
    }
  };

  const progressPercent = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;

  return (
    <>
      <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
        <Badge variant="secondary" className="shrink-0">
          {selectedIds.size} selected
        </Badge>

        <div className="flex items-center gap-1.5 flex-wrap flex-1">
          {actions.map((action, i) => (
            <Button
              key={i}
              variant={action.destructive ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => handleAction(action)}
              disabled={progress.isRunning}
            >
              {action.icon}
              <span className="ml-1">{action.label}</span>
            </Button>
          ))}

          <Button variant="outline" size="sm" onClick={handleExport} disabled={progress.isRunning}>
            <Download className="h-3.5 w-3.5" />
            <span className="ml-1">Export CSV</span>
          </Button>
        </div>

        <Button variant="ghost" size="sm" onClick={clearSelection}>
          <XSquare className="h-3.5 w-3.5" />
        </Button>
      </div>

      {progress.isRunning && (
        <div className="mt-2">
          <Progress value={progressPercent} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            Processing {progress.completed}/{progress.total}...
          </p>
        </div>
      )}

      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Bulk Action
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.confirmMessage || `This will affect ${selectedIds.size} records. This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAndExecute} className="bg-destructive text-destructive-foreground">
              Confirm ({selectedIds.size} items)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// Pre-built action sets for common admin operations
export const PROJECT_BULK_ACTIONS: BulkAction[] = [
  {
    label: 'Approve',
    icon: <CheckSquare className="h-3.5 w-3.5" />,
    updateData: { status: 'approved' },
  },
  {
    label: 'Reject',
    icon: <XSquare className="h-3.5 w-3.5" />,
    updateData: { status: 'rejected' },
    destructive: true,
    confirmMessage: 'Are you sure you want to reject the selected projects?',
  },
];

export const USER_BULK_ACTIONS: BulkAction[] = [
  {
    label: 'Activate',
    icon: <CheckSquare className="h-3.5 w-3.5" />,
    updateData: { is_active: true },
  },
  {
    label: 'Deactivate',
    icon: <XSquare className="h-3.5 w-3.5" />,
    updateData: { is_active: false },
    destructive: true,
    confirmMessage: 'Are you sure you want to deactivate the selected users?',
  },
];
