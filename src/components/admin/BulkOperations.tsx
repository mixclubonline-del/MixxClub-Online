import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, Trash2, Edit, ChevronDown, X } from 'lucide-react';
import { toast } from 'sonner';

interface BulkOperationsProps<T> {
  selectedItems: T[];
  onClearSelection: () => void;
  onDelete?: (items: T[]) => Promise<void>;
  onExport?: (items: T[]) => void;
  onBulkEdit?: (items: T[]) => void;
  totalItems?: number;
}

export function BulkOperations<T extends { id: string }>({
  selectedItems,
  onClearSelection,
  onDelete,
  onExport,
  onBulkEdit,
  totalItems,
}: BulkOperationsProps<T>) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedItems.length} item(s)? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await onDelete(selectedItems);
      toast.success(`Successfully deleted ${selectedItems.length} item(s)`);
      onClearSelection();
    } catch (error) {
      toast.error('Failed to delete items');
      console.error('Bulk delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = () => {
    if (!onExport) return;
    onExport(selectedItems);
    toast.success(`Exported ${selectedItems.length} item(s)`);
  };

  if (selectedItems.length === 0) return null;

  return (
    <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
      <div className="flex items-center gap-2">
        <Checkbox checked disabled />
        <span className="text-sm font-medium">
          {selectedItems.length} selected
          {totalItems && ` of ${totalItems}`}
        </span>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}

        {onBulkEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkEdit(selectedItems)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}

        {onDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
